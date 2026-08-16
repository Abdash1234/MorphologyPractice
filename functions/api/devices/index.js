/* GET /api/devices — what is signed in, so anything stale can be revoked. */
import { json, fail, authenticate } from '../../../shared/api.js';

export async function onRequestGet({ request, env }) {
  const device = await authenticate(request, env);
  if (!device) return fail(401, 'Sign in first.');

  const { results } = await env.DB.prepare(
    'SELECT id, label, created_at, last_seen FROM devices ORDER BY last_seen DESC'
  ).all();

  return json({
    devices: (results || []).map((d) => ({
      id: d.id,
      label: d.label,
      createdAt: d.created_at,
      lastSeen: d.last_seen,
      current: d.id === device.id
    }))
  });
}
