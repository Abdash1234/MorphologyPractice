/*
 * POST /api/auth/login  { passphrase, label? }  ->  { deviceId, token }
 *
 * The passphrase is checked against a PBKDF2 hash held as a Pages secret; the
 * token that comes back is stored hashed, so the database never holds anything
 * that could be replayed. One token per device, revocable on its own.
 */
import {
  json, fail, parseJson, randomToken, sha256Hex, verifyPassphrase, clientIp,
  LOGIN_WINDOW_MS, LOGIN_MAX_ATTEMPTS
} from '../../../shared/api.js';

export async function onRequestPost({ request, env }) {
  if (!env.PASSPHRASE_HASH) return fail(503, 'The server has no passphrase configured yet.');

  const now = Date.now();
  const ip = clientIp(request);

  /* rate limit before doing any expensive hashing */
  const recent = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM login_attempts WHERE ip = ? AND at > ?'
  ).bind(ip, now - LOGIN_WINDOW_MS).first();
  if (recent && recent.n >= LOGIN_MAX_ATTEMPTS) {
    return fail(429, 'Too many attempts. Try again in an hour.');
  }
  await env.DB.prepare('INSERT INTO login_attempts (ip, at) VALUES (?, ?)').bind(ip, now).run();

  const body = await parseJson(request);
  if (!body || typeof body.passphrase !== 'string') return fail(400, 'Send a passphrase.');

  const ok = await verifyPassphrase(body.passphrase, env.PASSPHRASE_HASH);
  if (!ok) return fail(401, 'That passphrase is not right.');

  const token = randomToken();
  const id = crypto.randomUUID();
  const label = typeof body.label === 'string' && body.label.trim()
    ? body.label.trim().slice(0, 60)
    : 'a device';

  await env.DB.prepare(
    'INSERT INTO devices (id, token_hash, label, created_at, last_seen) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, await sha256Hex(token), label, now, now).run();

  /* a successful sign-in clears the failed-attempt history for this address */
  await env.DB.prepare('DELETE FROM login_attempts WHERE ip = ?').bind(ip).run();

  return json({ deviceId: id, token, label });
}
