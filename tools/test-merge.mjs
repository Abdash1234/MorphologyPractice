/*
 * tools/test-merge.mjs — tests for the sync merge rules.
 * Run with:  node --test tools/test-merge.mjs
 *
 * These are the two-device situations that would otherwise only show up as
 * "my phone forgot yesterday's review".
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeProgress, mergeContent, mergeDocument, TOMBSTONE_TTL } from '../shared/merge.js';

const DAY = 24 * 60 * 60 * 1000;
const t0 = 1_700_000_000_000;

/* ---------------------------------------------------------------- */
/* progress                                                          */
/* ---------------------------------------------------------------- */

test('the more recent review decides the schedule', () => {
  const phone = { words: { 'nsr-madi-3ms': { box: 3, due: t0 + 4 * DAY, last: t0, seen: 4, correct: 20, wrong: 1 } } };
  const laptop = { words: { 'nsr-madi-3ms': { box: 1, due: t0 + DAY, last: t0 + 60_000, seen: 5, correct: 22, wrong: 3 } } };

  const merged = mergeProgress(phone, laptop);
  const w = merged.words['nsr-madi-3ms'];
  assert.equal(w.box, 1, 'the laptop reviewed a minute later, so its box wins');
  assert.equal(w.due, t0 + DAY);
  assert.equal(w.last, t0 + 60_000);
});

test('a demotion is respected even when the other side has a higher box', () => {
  const older = { words: { x: { box: 5, due: t0 + 16 * DAY, last: t0 } } };
  const newerMistake = { words: { x: { box: 0, due: t0 + DAY, last: t0 + DAY } } };
  assert.equal(mergeProgress(older, newerMistake).words.x.box, 0);
});

test('counters take the maximum, so a retried push cannot inflate them', () => {
  const a = { words: { x: { seen: 3, correct: 10, wrong: 2, last: t0 } } };
  const twice = mergeProgress(a, mergeProgress(a, a));
  assert.deepEqual(
    { seen: twice.words.x.seen, correct: twice.words.x.correct, wrong: twice.words.x.wrong },
    { seen: 3, correct: 10, wrong: 2 }
  );
});

test('words seen on only one device survive the merge', () => {
  const phone = { words: { a: { box: 1, last: t0 } } };
  const laptop = { words: { b: { box: 2, last: t0 } } };
  const merged = mergeProgress(phone, laptop);
  assert.deepEqual(Object.keys(merged.words).sort(), ['a', 'b']);
});

test('per-step accuracy and session totals merge without going backwards', () => {
  const a = { steps: { baab: { correct: 8, total: 10 } }, answered: 40, correct: 30, sessions: 4 };
  const b = { steps: { baab: { correct: 5, total: 12 }, voice: { correct: 3, total: 3 } }, answered: 55, correct: 28, sessions: 6 };
  const merged = mergeProgress(a, b);
  assert.deepEqual(merged.steps.baab, { correct: 8, total: 12 });
  assert.deepEqual(merged.steps.voice, { correct: 3, total: 3 });
  assert.equal(merged.answered, 55);
  assert.equal(merged.sessions, 6);
});

test('settings come from the side that saved last', () => {
  const a = { settings: { deckId: 'mine', length: 5 }, updatedAt: t0 };
  const b = { settings: { deckId: 'all', length: 20 }, updatedAt: t0 + 1000 };
  assert.equal(mergeProgress(a, b).settings.deckId, 'all');
  assert.equal(mergeProgress(b, a).settings.deckId, 'all', 'merge order must not change the outcome');
});

test('empty, missing and malformed documents are survivable', () => {
  assert.deepEqual(mergeProgress(null, null).words, {});
  assert.deepEqual(mergeProgress(undefined, { words: { a: { box: 1 } } }).words.a.box, 1);
  assert.deepEqual(mergeProgress('nonsense', 42).words, {});
});

test('merging is order-independent for the schedule', () => {
  const a = { words: { x: { box: 2, due: t0 + 2 * DAY, last: t0 + 5000, seen: 2, correct: 9, wrong: 0 } } };
  const b = { words: { x: { box: 4, due: t0 + 8 * DAY, last: t0 + 9000, seen: 3, correct: 11, wrong: 2 } } };
  assert.deepEqual(mergeProgress(a, b), mergeProgress(b, a));
});

/* ---------------------------------------------------------------- */
/* custom content                                                    */
/* ---------------------------------------------------------------- */

const rootA = { root: 'ف ه م', baabId: 'alima', meaning: 'to understand', madi: 'فَهِمَ', updatedAt: t0 };

test('the newer edit of a word wins', () => {
  const phone = { words: [{ id: 'my:a', w: 'فَاهِمٌ', en: 'first go', updatedAt: t0 }] };
  const laptop = { words: [{ id: 'my:a', w: 'فَاهِمٌ', en: 'corrected', updatedAt: t0 + 5000 }] };
  const merged = mergeContent(phone, laptop, t0 + 10_000);
  assert.equal(merged.words.length, 1);
  assert.equal(merged.words[0].en, 'corrected');
});

test('a delete on one device is not resurrected by the other', () => {
  const phone = { words: [], tombstones: { 'my:a': t0 + 5000 } };
  const laptop = { words: [{ id: 'my:a', w: 'فَاهِمٌ', en: 'still here', updatedAt: t0 }] };
  const merged = mergeContent(phone, laptop, t0 + 10_000);
  assert.equal(merged.words.length, 0, 'the delete came after the edit, so it stands');
});

test('an edit made after a delete brings the word back', () => {
  const phone = { words: [], tombstones: { 'my:a': t0 } };
  const laptop = { words: [{ id: 'my:a', w: 'فَاهِمٌ', en: 'rewritten later', updatedAt: t0 + 9000 }] };
  const merged = mergeContent(phone, laptop, t0 + 10_000);
  assert.equal(merged.words.length, 1);
  assert.equal(merged.words[0].en, 'rewritten later');
});

test('tombstones older than the retention window are dropped', () => {
  const merged = mergeContent(
    { tombstones: { old: t0 - TOMBSTONE_TTL - DAY, recent: t0 - DAY } },
    {},
    t0
  );
  assert.deepEqual(Object.keys(merged.tombstones), ['recent']);
});

test('roots, words and sentences all merge together', () => {
  const phone = {
    paradigms: { 'my:fhm': rootA },
    words: [{ id: 'my:w1', w: 'فَاهِمٌ', p: 'my:fhm', updatedAt: t0 }],
    sentences: { 'my:w1': { ar: 'هَذَا {} لِلدَّرْسِ.', en: 'This one understands the lesson.', updatedAt: t0 } }
  };
  const laptop = { paradigms: {}, words: [{ id: 'my:w2', w: 'مَفْهُومٌ', p: 'my:fhm', updatedAt: t0 + 1 }] };
  const merged = mergeContent(phone, laptop, t0 + 10_000);
  assert.deepEqual(Object.keys(merged.paradigms), ['my:fhm']);
  assert.deepEqual(merged.words.map((w) => w.id).sort(), ['my:w1', 'my:w2']);
  assert.ok(merged.sentences['my:w1']);
});

test('deleting a root takes its words and their sentences with it', () => {
  const phone = {
    paradigms: {},
    words: [],
    tombstones: { 'my:fhm': t0 + 5000 }
  };
  const laptop = {
    paradigms: { 'my:fhm': rootA },
    words: [{ id: 'my:w1', w: 'فَاهِمٌ', p: 'my:fhm', updatedAt: t0 }],
    sentences: { 'my:w1': { ar: 'هَذَا {}.', en: 'This one.', updatedAt: t0 } }
  };
  const merged = mergeContent(phone, laptop, t0 + 10_000);
  assert.deepEqual(merged.paradigms, {}, 'the root is gone');
  assert.deepEqual(merged.words, [], 'so are the words built on it');
  assert.deepEqual(merged.sentences, {}, 'and their sentences');
});

test('words pointing at a built-in root are untouched by that rule', () => {
  const merged = mergeContent(
    { words: [{ id: 'my:w', w: 'كَاتِبٌ', p: 'ktb-I', updatedAt: t0 }] },
    {},
    t0
  );
  assert.equal(merged.words.length, 1);
});

test('content merging is order-independent', () => {
  const a = { words: [{ id: 'x', en: 'a', updatedAt: t0 + 1 }], tombstones: { y: t0 } };
  const b = { words: [{ id: 'x', en: 'b', updatedAt: t0 }, { id: 'y', en: 'y', updatedAt: t0 - 1 }] };
  assert.deepEqual(mergeContent(a, b, t0 + 5), mergeContent(b, a, t0 + 5));
});

test('a record with no timestamp never beats one that has a real edit', () => {
  const stamped = { words: [{ id: 'x', en: 'edited', updatedAt: t0 }] };
  const unstamped = { words: [{ id: 'x', en: 'imported without a stamp' }] };
  assert.equal(mergeContent(stamped, unstamped, t0 + 1).words[0].en, 'edited');
});

/* ---------------------------------------------------------------- */

test('mergeDocument dispatches by name and refuses anything else', () => {
  assert.ok(mergeDocument('progress', {}, {}, t0).words);
  assert.ok(mergeDocument('content', {}, {}, t0).paradigms);
  assert.throws(() => mergeDocument('nope', {}, {}, t0), /unknown document/);
});
