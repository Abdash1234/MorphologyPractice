/*
 * GET  /api/sync   -> both documents as the server holds them
 * POST /api/sync   -> push both documents; the server merges and returns the
 *                     merged result, which the client adopts
 *
 * Whole-document sync: the two documents are tens of kilobytes, so there is no
 * need for a delta protocol. The merge rules live in shared/merge.js.
 */
import { json, fail, parseJson, authenticate, readDoc, writeDoc } from '../../shared/api.js';
import { mergeDocument, DOCUMENTS } from '../../shared/merge.js';

export async function onRequestGet({ request, env }) {
  const device = await authenticate(request, env);
  if (!device) return fail(401, 'Sign in first.');

  const docs = {};
  for (const name of DOCUMENTS) {
    const stored = await readDoc(env, name);
    docs[name] = { rev: stored.rev, body: stored.body, updatedAt: stored.updatedAt };
  }
  return json({ docs, serverTime: Date.now() });
}

export async function onRequestPost({ request, env }) {
  const device = await authenticate(request, env);
  if (!device) return fail(401, 'Sign in first.');

  const body = await parseJson(request);
  if (!body) return fail(400, 'Send the documents as JSON.');

  const now = Date.now();
  const docs = {};

  for (const name of DOCUMENTS) {
    const incoming = body[name];
    const stored = await readDoc(env, name);

    /* nothing pushed for this document: hand back what the server has */
    if (incoming === undefined || incoming === null) {
      docs[name] = { rev: stored.rev, body: stored.body, updatedAt: stored.updatedAt };
      continue;
    }
    if (typeof incoming !== 'object') return fail(400, `"${name}" must be an object.`);

    let merged;
    try {
      merged = mergeDocument(name, incoming, stored.body, now);
    } catch (e) {
      return fail(400, e.message);
    }

    const rev = stored.rev + 1;
    try {
      await writeDoc(env, name, merged, rev, now);
    } catch (e) {
      return fail(413, e.message);
    }
    docs[name] = { rev, body: merged, updatedAt: now };
  }

  return json({ docs, serverTime: now, device: device.id });
}
