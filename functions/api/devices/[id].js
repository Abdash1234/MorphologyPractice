/* DELETE /api/devices/:id — revoke one device's token. */
import { json, fail, authenticate } from '../../../shared/api.js';

export async function onRequestDelete({ request, env, params }) {
  const device = await authenticate(request, env);
  if (!device) return fail(401, 'Sign in first.');

  const id = params.id;
  const result = await env.DB.prepare('DELETE FROM devices WHERE id = ?').bind(id).run();
  const removed = result.meta && result.meta.changes ? result.meta.changes : 0;
  if (!removed) return fail(404, 'No such device.');

  return json({ removed: id, wasCurrent: id === device.id });
}
