/*
 * shared/merge.js — how two devices' data is reconciled.
 *
 * Used by the server (Pages Functions) and exercised directly by
 * tools/test-merge.mjs. Pure functions, no I/O, no globals: two devices both
 * drilling the same words is the normal case, so this is the piece that has to
 * be right.
 *
 * The rules, stated once:
 *
 *   progress.words   box and due come from whichever side reviewed the word
 *                    last; counters take the maximum of the two sides.
 *                    Max rather than sum is deliberate — a retried push must
 *                    never inflate your history. Counters only drive the
 *                    "weakest first" ordering, so a small undercount when you
 *                    genuinely drill the same word on two devices is harmless,
 *                    where double counting would quietly skew the ordering.
 *
 *   content          last write wins per record, on an updatedAt the editor
 *                    stamps. A delete leaves a tombstone so that deleting on
 *                    the phone is not undone by the laptop's next push.
 *
 *   settings         last write wins over the whole object.
 */

const DAY = 24 * 60 * 60 * 1000;
export const TOMBSTONE_TTL = 90 * DAY;

const num = (v) => (typeof v === 'number' && isFinite(v) ? v : 0);
const maxOf = (a, b) => Math.max(num(a), num(b));
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/* ------------------------------------------------------------------ */
/* progress                                                            */
/* ------------------------------------------------------------------ */

export function emptyProgress() {
  return { words: {}, steps: {}, settings: null, answered: 0, correct: 0, sessions: 0, updatedAt: 0 };
}

function mergeWordRecord(a, b) {
  if (!a) return b;
  if (!b) return a;
  /* the more recent review is the truthful one for the schedule */
  const newer = num(a.last) >= num(b.last) ? a : b;
  const out = {
    seen: maxOf(a.seen, b.seen),
    correct: maxOf(a.correct, b.correct),
    wrong: maxOf(a.wrong, b.wrong),
    last: maxOf(a.last, b.last)
  };
  if (a.clean !== undefined || b.clean !== undefined) out.clean = maxOf(a.clean, b.clean);
  if (newer.box !== undefined) out.box = newer.box;
  if (newer.due !== undefined) out.due = newer.due;
  return out;
}

export function mergeProgress(local, remote) {
  const a = isObject(local) ? local : emptyProgress();
  const b = isObject(remote) ? remote : emptyProgress();
  const out = emptyProgress();

  const wordIds = new Set([...Object.keys(a.words || {}), ...Object.keys(b.words || {})]);
  wordIds.forEach((id) => {
    out.words[id] = mergeWordRecord((a.words || {})[id], (b.words || {})[id]);
  });

  const stepIds = new Set([...Object.keys(a.steps || {}), ...Object.keys(b.steps || {})]);
  stepIds.forEach((id) => {
    const x = (a.steps || {})[id] || {};
    const y = (b.steps || {})[id] || {};
    out.steps[id] = { correct: maxOf(x.correct, y.correct), total: maxOf(x.total, y.total) };
  });

  out.answered = maxOf(a.answered, b.answered);
  out.correct = maxOf(a.correct, b.correct);
  out.sessions = maxOf(a.sessions, b.sessions);
  out.updatedAt = maxOf(a.updatedAt, b.updatedAt);

  /* settings are a single blob: the side that saved them last wins */
  const aSettings = isObject(a.settings) ? a.settings : null;
  const bSettings = isObject(b.settings) ? b.settings : null;
  if (aSettings && bSettings) out.settings = num(a.updatedAt) >= num(b.updatedAt) ? aSettings : bSettings;
  else out.settings = aSettings || bSettings;

  return out;
}

/* ------------------------------------------------------------------ */
/* custom content                                                      */
/* ------------------------------------------------------------------ */

export function emptyContent() {
  return { paradigms: {}, words: [], sentences: {}, tombstones: {}, updatedAt: 0 };
}

function byId(list) {
  const map = {};
  (Array.isArray(list) ? list : []).forEach((item) => {
    if (item && item.id) map[item.id] = item;
  });
  return map;
}

/* newest wins; a record with no stamp loses to one that has a stamp */
function newerRecord(a, b) {
  if (!a) return b;
  if (!b) return a;
  return num(a.updatedAt) >= num(b.updatedAt) ? a : b;
}

function mergeRecordMaps(a, b, tombstones) {
  const out = {};
  const ids = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  ids.forEach((id) => {
    const winner = newerRecord((a || {})[id], (b || {})[id]);
    /* a delete only sticks if it happened after the surviving edit */
    const killedAt = num(tombstones[id]);
    if (killedAt && killedAt >= num(winner.updatedAt)) return;
    out[id] = winner;
  });
  return out;
}

export function mergeContent(local, remote, now) {
  const a = isObject(local) ? local : emptyContent();
  const b = isObject(remote) ? remote : emptyContent();
  const at = num(now) || Date.now();

  /* tombstones first — the merge of records depends on them */
  const tombstones = {};
  [a.tombstones || {}, b.tombstones || {}].forEach((set) => {
    Object.keys(set).forEach((id) => {
      tombstones[id] = maxOf(tombstones[id], set[id]);
    });
  });
  Object.keys(tombstones).forEach((id) => {
    if (at - tombstones[id] > TOMBSTONE_TTL) delete tombstones[id];
  });

  const paradigms = mergeRecordMaps(a.paradigms, b.paradigms, tombstones);
  const wordMap = mergeRecordMaps(byId(a.words), byId(b.words), tombstones);
  const sentences = mergeRecordMaps(a.sentences, b.sentences, tombstones);

  /* a word whose root has gone cannot survive either */
  Object.keys(wordMap).forEach((id) => {
    const w = wordMap[id];
    if (w.p && String(w.p).indexOf('my:') === 0 && !paradigms[w.p]) {
      delete wordMap[id];
      delete sentences[id];
    }
  });
  Object.keys(sentences).forEach((id) => {
    if (!wordMap[id]) delete sentences[id];
  });

  return {
    paradigms,
    words: Object.keys(wordMap).map((id) => wordMap[id]),
    sentences,
    tombstones,
    updatedAt: maxOf(a.updatedAt, b.updatedAt)
  };
}

/* Which document merger to use for a named document. */
export function mergeDocument(name, local, remote, now) {
  if (name === 'progress') return mergeProgress(local, remote);
  if (name === 'content') return mergeContent(local, remote, now);
  throw new Error('unknown document: ' + name);
}

export const DOCUMENTS = ['progress', 'content'];
