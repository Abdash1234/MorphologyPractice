/*
 * tools/test-api.mjs — end-to-end tests against a running dev server.
 *
 *   npx wrangler d1 execute sarf --local --file=schema.sql
 *   node tools/make-passphrase.mjs "…" > .dev.vars   (as PASSPHRASE_HASH=…)
 *   npx wrangler pages dev . --port 8788
 *   node --test tools/test-api.mjs
 *
 * Set API_URL and API_PASSPHRASE to point it somewhere else.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.API_URL || 'http://127.0.0.1:8788';
const PASSPHRASE = process.env.API_PASSPHRASE || 'test passphrase for local dev';

async function api(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(BASE + path, {
    method,
    headers: Object.assign(
      { 'content-type': 'application/json' },
      token ? { authorization: 'Bearer ' + token } : {}
    ),
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let parsed = null;
  try {
    parsed = await response.json();
  } catch (e) { /* not json */ }
  return { status: response.status, body: parsed };
}

const signIn = async (label) => {
  const r = await api('/api/auth/login', { method: 'POST', body: { passphrase: PASSPHRASE, label } });
  assert.equal(r.status, 200, 'sign-in should succeed: ' + JSON.stringify(r.body));
  return r.body.token;
};

test('a wrong passphrase is refused', async () => {
  const r = await api('/api/auth/login', { method: 'POST', body: { passphrase: 'definitely not it' } });
  assert.equal(r.status, 401);
});

test('sync needs a token', async () => {
  assert.equal((await api('/api/sync')).status, 401);
  assert.equal((await api('/api/sync', { method: 'POST', body: {} })).status, 401);
  assert.equal((await api('/api/sync', { method: 'GET', token: 'made-up-token' })).status, 401);
});

test('two devices converge on the newer review and keep both words', async () => {
  const phone = await signIn('phone');
  const laptop = await signIn('laptop');
  const t = Date.now();

  const push1 = await api('/api/sync', {
    method: 'POST', token: phone,
    body: {
      progress: {
        words: { ['alpha-' + t]: { box: 3, due: t + 400000, last: t, seen: 2, correct: 8, wrong: 1 } },
        settings: { deckId: 'mine' },
        updatedAt: t
      },
      content: { paradigms: {}, words: [{ id: 'my:one', w: 'فَاهِمٌ', en: 'from the phone', updatedAt: t }], sentences: {}, tombstones: {} }
    }
  });
  assert.equal(push1.status, 200);
  const rev1 = push1.body.docs.progress.rev;
  assert.ok(rev1 >= 1, 'a write produces a revision');

  const push2 = await api('/api/sync', {
    method: 'POST', token: laptop,
    body: {
      progress: {
        words: {
          ['alpha-' + t]: { box: 0, due: t + 1000, last: t + 60000, seen: 3, correct: 9, wrong: 4 },
          ['beta-' + t]: { box: 1, due: t + 90000, last: t + 60000, seen: 1, correct: 2, wrong: 0 }
        },
        settings: { deckId: 'all' },
        updatedAt: t + 60000
      },
      content: { paradigms: {}, words: [{ id: 'my:two', w: 'مَفْهُومٌ', en: 'from the laptop', updatedAt: t + 60000 }], sentences: {}, tombstones: {} }
    }
  });
  assert.equal(push2.status, 200);
  assert.equal(push2.body.docs.progress.rev, rev1 + 1, 'each accepted write moves the revision on by one');

  const merged = push2.body.docs.progress.body;
  assert.equal(merged.words['alpha-' + t].box, 0, 'the later review (a slip) wins');
  assert.equal(merged.words['alpha-' + t].correct, 9, 'counters take the max');
  assert.equal(merged.words['alpha-' + t].wrong, 4);
  assert.ok(merged.words['beta-' + t], 'a word only the laptop knew is kept');
  assert.equal(merged.settings.deckId, 'all', 'settings come from the later save');

  /* the store is shared with whatever else has synced, so check for presence
     rather than for an exact list */
  const ids = push2.body.docs.content.body.words.map((w) => w.id);
  assert.ok(ids.includes('my:one'), 'the phone\'s word is still there');
  assert.ok(ids.includes('my:two'), 'the laptop\'s word was added, not substituted');

  /* the phone now pulls and sees everything */
  const pull = await api('/api/sync', { token: phone });
  assert.equal(pull.status, 200);
  assert.ok(pull.body.docs.progress.body.words['beta-' + t]);
  assert.ok(pull.body.docs.content.body.words.some((w) => w.id === 'my:one'));
  assert.ok(pull.body.docs.content.body.words.some((w) => w.id === 'my:two'));
  assert.equal(pull.body.docs.progress.rev, rev1 + 1, 'a read does not change the revision');
});

test('a delete on one device survives the other pushing the word back', async () => {
  const phone = await signIn('phone-2');
  const t = Date.now();

  await api('/api/sync', {
    method: 'POST', token: phone,
    body: { content: { paradigms: {}, words: [{ id: 'my:doomed', w: 'كَلِمَةٌ', en: 'to be deleted', updatedAt: t }], sentences: {}, tombstones: {} } }
  });

  const afterDelete = await api('/api/sync', {
    method: 'POST', token: phone,
    body: { content: { paradigms: {}, words: [], sentences: {}, tombstones: { 'my:doomed': t + 1000 } } }
  });
  assert.ok(!afterDelete.body.docs.content.body.words.some((w) => w.id === 'my:doomed'), 'delete applied');

  /* a stale device pushes the word again — it must stay deleted */
  const stale = await api('/api/sync', {
    method: 'POST', token: phone,
    body: { content: { paradigms: {}, words: [{ id: 'my:doomed', w: 'كَلِمَةٌ', en: 'stale copy', updatedAt: t }], sentences: {}, tombstones: {} } }
  });
  assert.ok(!stale.body.docs.content.body.words.some((w) => w.id === 'my:doomed'), 'stale push must not resurrect it');
});

test('a device can be listed and revoked, and its token then fails', async () => {
  const keep = await signIn('keeper');
  const doomed = await signIn('doomed-device');

  const list = await api('/api/devices', { token: keep });
  assert.equal(list.status, 200);
  const target = list.body.devices.find((d) => d.label === 'doomed-device');
  assert.ok(target, 'the new device shows in the list');

  const revoked = await api('/api/devices/' + target.id, { method: 'DELETE', token: keep });
  assert.equal(revoked.status, 200);

  assert.equal((await api('/api/sync', { token: doomed })).status, 401, 'revoked token no longer works');
  assert.equal((await api('/api/sync', { token: keep })).status, 200, 'the other device is unaffected');
});

test('rubbish input is rejected rather than stored', async () => {
  const token = await signIn('picky');
  assert.equal((await api('/api/sync', { method: 'POST', token, body: { progress: 'not an object' } })).status, 400);
  const r = await fetch(BASE + '/api/sync', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
    body: 'not json at all'
  });
  assert.equal(r.status, 400);
});

test('an unknown document name is ignored rather than stored', async () => {
  const token = await signIn('extra-keys');
  const r = await api('/api/sync', { method: 'POST', token, body: { nonsense: { a: 1 } } });
  assert.equal(r.status, 200);
  assert.deepEqual(Object.keys(r.body.docs).sort(), ['content', 'progress']);
});
