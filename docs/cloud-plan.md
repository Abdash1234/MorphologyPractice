# Going cloud — the plan

The app is local-first and will stay that way: everything works with no
network, and the cloud only carries your data between devices. This document is
the agreed design, so the work can be picked up in any order without
re-deciding anything.

**Decisions taken**

| Question | Answer |
| --- | --- |
| Audience | One person (me), several devices |
| Hosting & backend | Cloudflare Pages + Workers + D1 |
| Sign-in | A passphrase, exchanged once per device for a long-lived token |
| Phase 0 | Done — PWA, offline, installable |

---

## Phase 0 — PWA and static deploy (done)

- `sw.js` precaches the whole app shell (21 files, ~320KB). With the network
  cut, the home screen, every drill mode and the reference all still work.
- `manifest.webmanifest` + icons: installs to the home screen, opens without
  browser chrome, dark theme colour.
- `src/pwa.js` registers the worker over https/localhost only, so opening
  `index.html` off disk still behaves. When a new version is deployed it shows a
  "new version is ready — Reload" bar rather than swapping the app underneath
  you mid-session.
- `tools/bump-version.js` stamps the version and regenerates the precache list
  from what is actually on disk, so a new file can never be missed.
- `_headers` sets a strict CSP (`default-src 'self'`) and stops the origin
  caching the shell or the worker.

### Deploying it

Cloudflare Pages, no build step:

- **Dashboard:** Workers & Pages → Create → Pages → connect this repo. Build
  command: *(none)*. Output directory: `/`. Every push to the branch deploys.
- **Or from a terminal:** `npx wrangler pages deploy .`

Before each deploy: `node tools/bump-version.js && node tools/validate.js`.

---

## Phase 1 — accounts and sync (built)

**Status: written and tested locally, waiting on a Cloudflare account to go
live.** The API runs as Pages Functions on the same origin as the app, so there
is no CORS and no second service to deploy.

### Turning it on

```sh
npx wrangler d1 create sarf                       # paste the id into wrangler.toml
npm run db:remote                                 # apply schema.sql
node tools/make-passphrase.mjs "a long passphrase" # prints the hash
npx wrangler pages secret put PASSPHRASE_HASH     # paste it in
npm run deploy
```

Then open the app, put the passphrase into the **Sync** panel on the home
screen, and do the same on the second device.

Locally: `npm run db:local`, put `PASSPHRASE_HASH=…` in `.dev.vars`
(git-ignored), then `npm run dev:api` and `npm run test:api`.

### What was built

### Shape

The client keeps localStorage as the working copy. Two documents are synced:

| Document | Contents | Size today |
| --- | --- | --- |
| `progress` | per-word box, due date, counters, per-step accuracy, settings | ~15KB |
| `content` | custom roots, words and sentences from the in-app editor | grows with use |

At this size whole-document sync is fine — no per-record protocol, no
websockets, no background sync. Sync runs on app start, at the end of a
session, and on demand.

### Sign-in

A single passphrase, held as a Worker secret in hashed form. On a new device
you enter it once; the server hands back a random 32-byte device token which
the client stores and sends as `Authorization: Bearer …` from then on. Tokens
are stored server-side only as SHA-256 hashes, are listed in the app, and can
be revoked individually — so a lost phone costs you one token, not the
passphrase.

Login attempts are rate-limited per IP to keep the passphrase from being
guessable in practice.

### D1 schema

```sql
CREATE TABLE devices (
  id          TEXT PRIMARY KEY,      -- uuid
  token_hash  TEXT NOT NULL UNIQUE,  -- sha-256 of the bearer token
  label       TEXT,                  -- "phone", "laptop"
  created_at  INTEGER NOT NULL,
  last_seen   INTEGER
);

CREATE TABLE docs (
  name        TEXT PRIMARY KEY,      -- 'progress' | 'content'
  body        TEXT NOT NULL,         -- JSON
  rev         INTEGER NOT NULL,      -- bumped on every accepted write
  updated_at  INTEGER NOT NULL
);

CREATE TABLE login_attempts (
  ip          TEXT NOT NULL,
  at          INTEGER NOT NULL
);
```

No `user_id` column yet — it is one row per document because there is one user.
Adding multi-user later means adding `user_id` to both tables and a `users`
table; nothing else in the design changes.

### Endpoints

| Method | Path | Does |
| --- | --- | --- |
| POST | `/api/auth/login` | passphrase → `{ deviceId, token }` |
| GET | `/api/sync` | returns both documents with their revs |
| POST | `/api/sync` | pushes both documents, server merges, returns the merged result and new revs |
| GET | `/api/devices` | list devices, for revoking |
| DELETE | `/api/devices/:id` | revoke one |

Same origin as the app, so no CORS and the CSP stays `connect-src 'self'`.

### Merge rules — the part worth getting right

Two devices both reviewing the same words is the normal case, not the edge
case, so the server merges rather than overwrites.

**progress**, per word id:
- `box` and `due` come from whichever side has the newer `last` timestamp —
  the more recent review is the truthful one.
- `seen`, `correct`, `wrong` take the **maximum** of the two sides. This is
  deliberately conservative: a retried push cannot inflate your counters, at
  the cost of under-counting if you genuinely drill the same word on two
  devices at once. Counters are only used for the "weakest first" ordering, so
  a small undercount is harmless while double-counting would skew it.
- Per-step accuracy totals merge the same way.

**content**, per record (root, word, sentence):
- Last write wins, compared on a per-record `updated_at` that the editor sets.
- Deletes leave a tombstone `{ deleted: true, updated_at }` so a deletion made
  on the phone actually propagates to the laptop instead of being resurrected
  by the next push. Tombstones are dropped after 90 days.

**settings**: last write wins on the whole document.

The client keeps the last rev it saw. If the server's rev has moved on, the
client adopts the merged document the server returns — the server's merge is
always the tie-breaker, so the two devices converge rather than fighting.

### Client work

- `src/sync.js`: login, push/pull, merge-on-receive, "last synced" state.
- A **Cloud** panel on the home screen: sign in, sync now, last synced, list of
  devices, sign out.
- Sync failures are silent and retried — being offline is normal, not an error.

### Order of work

1. Worker skeleton + D1 migration + `wrangler.toml`, deployed and reachable.
2. Passphrase login and device tokens, with rate limiting.
3. `GET/POST /api/sync` with the merge rules above, plus tests for the merge
   function specifically (two-device scenarios, tombstones, clock skew).
4. `src/sync.js` and the Cloud panel.
5. A real two-device test: drill on one, sync, confirm the other picks up the
   schedule and the custom words.

---

## Phase 2 — before anyone else uses it

Only needed if this stops being a one-person app: `users` table and `user_id`
columns, magic-link email instead of a shared passphrase, per-user storage
quotas, and a size cap on documents.

## Phase 3 — shared decks

A public library of word sets, and a route for good submissions to be merged
into the shipped bank. Wants moderation, so it comes after Phase 2.

---

## Running costs

Everything above sits inside Cloudflare's free tier: Pages is unmetered for
static requests, Workers allows 100,000 requests a day, D1 gives 5GB of storage
and millions of row reads a day. Syncing two 15KB documents a few times a day
is nowhere near any of those. The only likely cost is a domain name, and the
`*.pages.dev` subdomain is free if you do not want one.
