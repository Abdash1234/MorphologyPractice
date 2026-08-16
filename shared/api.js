/*
 * shared/api.js — helpers shared by the Pages Functions.
 *
 * Lives outside functions/ so it is never itself routable.
 */

export const MAX_DOC_BYTES = 1_000_000;      // a runaway client shouldn't fill D1
export const LOGIN_WINDOW_MS = 60 * 60 * 1000;
export const LOGIN_MAX_ATTEMPTS = 10;
export const PBKDF2_ITERATIONS = 100_000;

export function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: Object.assign(
      {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      },
      extra
    )
  });
}

export const fail = (status, message) => json({ error: message }, status);

/* ---------------------------------------------------------------- */
/* crypto                                                            */
/* ---------------------------------------------------------------- */

const enc = new TextEncoder();

function toBase64(bytes) {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
}

function fromBase64(text) {
  const raw = atob(text);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function pbkdf2(passphrase, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    256
  );
  return new Uint8Array(bits);
}

/* compare without leaking where the difference is */
function sameBytes(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/* stored form: pbkdf2$<iterations>$<saltB64>$<hashB64> */
export async function makePassphraseHash(passphrase, iterations = PBKDF2_ITERATIONS) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const derived = await pbkdf2(passphrase, salt, iterations);
  return `pbkdf2$${iterations}$${toBase64(salt)}$${toBase64(derived)}`;
}

export async function verifyPassphrase(passphrase, stored) {
  if (typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = parseInt(parts[1], 10);
  if (!iterations || iterations < 1000) return false;
  try {
    const derived = await pbkdf2(passphrase, fromBase64(parts[2]), iterations);
    return sameBytes(derived, fromBase64(parts[3]));
  } catch (e) {
    return false;
  }
}

/* ---------------------------------------------------------------- */
/* auth                                                              */
/* ---------------------------------------------------------------- */

/* Returns the device row for a valid bearer token, or null. */
export async function authenticate(request, env) {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  const hash = await sha256Hex(match[1]);
  const device = await env.DB.prepare(
    'SELECT id, label, created_at, last_seen FROM devices WHERE token_hash = ?'
  ).bind(hash).first();
  if (!device) return null;

  /* best-effort: a failed touch must not fail the request */
  try {
    await env.DB.prepare('UPDATE devices SET last_seen = ? WHERE id = ?').bind(Date.now(), device.id).run();
  } catch (e) { /* ignore */ }
  return device;
}

export function clientIp(request) {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
}

/* ---------------------------------------------------------------- */
/* documents                                                         */
/* ---------------------------------------------------------------- */

export async function readDoc(env, name) {
  const row = await env.DB.prepare('SELECT body, rev, updated_at FROM docs WHERE name = ?').bind(name).first();
  if (!row) return { body: null, rev: 0, updatedAt: 0 };
  let body = null;
  try {
    body = JSON.parse(row.body);
  } catch (e) {
    body = null;
  }
  return { body, rev: row.rev, updatedAt: row.updated_at };
}

export async function writeDoc(env, name, body, rev, now) {
  const text = JSON.stringify(body);
  if (text.length > MAX_DOC_BYTES) throw new Error(`document "${name}" is too large`);
  await env.DB.prepare(
    `INSERT INTO docs (name, body, rev, updated_at) VALUES (?1, ?2, ?3, ?4)
     ON CONFLICT(name) DO UPDATE SET body = ?2, rev = ?3, updated_at = ?4`
  ).bind(name, text, rev, now).run();
  return { rev, updatedAt: now };
}

export async function parseJson(request) {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? body : null;
  } catch (e) {
    return null;
  }
}
