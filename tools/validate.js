/*
 * tools/validate.js — data integrity check for the word bank.
 * Run with:  node tools/validate.js
 *
 * Checks that every word points at a real paradigm and a real ṣarf ṣaghīr cell,
 * that every answer id exists in the option group it is asked from, and that
 * every question the app can generate is answerable.
 */
'use strict';

require('../src/taxonomy.js');
require('../src/paradigms.js');
require('../src/words.js');
require('../src/reference.js');
require('../src/store.js');
require('../src/engine.js');

const MP = globalThis.MP;
const T = MP.taxonomy;
const E = MP.engine;

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

/* ---- paradigms ---- */
const slotIds = T.sarfSlots.map((s) => s.id);
Object.keys(MP.paradigms).forEach((id) => {
  const p = MP.paradigms[id];
  ['letters', 'augmentation', 'soundness', 'subtype'].forEach((k) => {
    if (!p[k]) fail(`paradigm ${id}: missing structural field "${k}"`);
  });
  slotIds.forEach((s) => {
    if (typeof p[s] !== 'string') fail(`paradigm ${id}: missing cell "${s}"`);
  });
  const group = E.baabGroupId(p);
  if (!T.option(group, p.baabId)) fail(`paradigm ${id}: bāb "${p.baabId}" is not in group ${group}`);
  if (!T.option('soundness', p.soundness)) fail(`paradigm ${id}: bad soundness "${p.soundness}"`);
  const subGroup = p.soundness === 'sahih' ? 'sahihType' : 'mutalType';
  if (!T.option(subGroup, p.subtype)) fail(`paradigm ${id}: sub-type "${p.subtype}" is not in ${subGroup}`);
  if (p.subtype === 'mahmuz' && !p.mahmuzPosition) warn(`paradigm ${id}: mahmūz with no hamzah position`);
  if (!/^[؀-ۿ ]+$/.test(p.root)) fail(`paradigm ${id}: root "${p.root}" is not spaced Arabic letters`);
  const rootLen = p.root.trim().split(/\s+/).length;
  const expected = p.letters === 'thulathi' ? 3 : 4;
  if (rootLen !== expected) fail(`paradigm ${id}: root has ${rootLen} letters but is marked ${p.letters}`);
});

/* ---- words ---- */
const seen = new Set();
const HARAKA = /[ً-ْ]/;

MP.words.forEach((w) => {
  if (seen.has(w.id)) fail(`duplicate word id "${w.id}"`);
  seen.add(w.id);

  if (!w.w) fail(`word ${w.id}: no Arabic`);
  if (!HARAKA.test(w.w)) warn(`word ${w.id} (${w.w}): no ḥarakāt — is that intended?`);
  if (!w.en) fail(`word ${w.id}: no translation`);
  if (!T.option('wordType', w.type)) fail(`word ${w.id}: bad type "${w.type}"`);

  const p = E.paradigmOf(w);
  if (w.p && !p) fail(`word ${w.id}: paradigm "${w.p}" does not exist`);
  if (w.slot) {
    if (!p) fail(`word ${w.id}: has a slot but no paradigm`);
    else if (slotIds.indexOf(w.slot) === -1) fail(`word ${w.id}: unknown slot "${w.slot}"`);
    else if (p[w.slot] === MP.NOT_USED) fail(`word ${w.id}: slot "${w.slot}" is marked unused in ${w.p}`);
  }
  if (!E.rootOf(w) && w.type !== 'harf') warn(`word ${w.id}: no root available`);

  if (w.type === 'fil') {
    if (!T.option('tense', w.tense)) fail(`word ${w.id}: bad tense "${w.tense}"`);
    if (w.tense === 'mudari' && !T.option('mood', w.mood)) fail(`word ${w.id}: muḍāriʿ with bad mood "${w.mood}"`);
    if (w.tense !== 'mudari' && w.mood) warn(`word ${w.id}: mood set on a non-muḍāriʿ verb`);
    ['voice:voice', 'pol:polarity', 'person:person', 'number:number'].forEach((pair) => {
      const [field, group] = pair.split(':');
      if (!T.option(group, w[field])) fail(`word ${w.id}: bad ${field} "${w[field]}"`);
    });
    if (w.gender !== 'any' && !T.option('gender', w.gender)) fail(`word ${w.id}: bad gender "${w.gender}"`);
    if (w.voice === 'majhul' && p && p.madiMajhul === MP.NOT_USED) {
      fail(`word ${w.id}: passive verb but ${w.p} has no passive`);
    }
  }

  if (w.type === 'ism') {
    if (!T.option('ismType', w.ismType)) fail(`word ${w.id}: bad ismType "${w.ismType}"`);
    if (!T.option('gender', w.gender)) fail(`word ${w.id}: bad gender "${w.gender}"`);
    if (!T.option('number', w.number)) fail(`word ${w.id}: bad number "${w.number}"`);
  }

  /* every generated question must have an answer that exists in its group */
  const settings = MP.store.DEFAULT_SETTINGS;
  const steps = E.buildSteps(w, settings);
  if (!steps.length) fail(`word ${w.id}: generates no questions`);
  steps.forEach((s) => {
    if (s.kind === 'choice') {
      const opts = E.optionsFor(s);
      if (!opts.length) fail(`word ${w.id}: step "${s.id}" has no options (group ${s.groupId})`);
      if (!opts.some((o) => o.id === s.answer)) {
        fail(`word ${w.id}: step "${s.id}" answer "${s.answer}" not in group "${s.groupId}"`);
      }
    }
    if (s.kind === 'text' && !s.check(s.answer)) fail(`word ${w.id}: root check rejects its own answer`);
    if (s.kind === 'sarf' && s.paradigm[s.answer] === MP.NOT_USED) fail(`word ${w.id}: ṣarf answer points at an unused cell`);
  });
});

/* ---- every question the app can ask must have a "?" hint behind it ---- */
const stepsSeen = new Set();
MP.words.forEach((w) => {
  E.buildSteps(w, MP.store.DEFAULT_SETTINGS).forEach((s) => {
    stepsSeen.add(s.id + '|' + (s.groupId || ''));
    if (!E.hintFor(s)) fail(`no hint for step "${s.id}" (group ${s.groupId || '—'})`);
  });
});

/* ---- focus modes must each produce a usable session ---- */
['baab', 'voice', 'subtype', 'ismType', 'sarf', 'root', 'translation'].forEach((focus) => {
  const settings = Object.assign({}, MP.store.DEFAULT_SETTINGS, { focus });
  const n = MP.words.filter((w) => E.buildSteps(w, settings).length === 1).length;
  if (n < 5) fail(`focus mode "${focus}" only matches ${n} words`);
});

/* ---- reference content ---- */
MP.reference.sections.forEach((sec) => {
  if (!sec.id || !sec.name || !sec.intro) fail(`reference section ${sec.id}: missing id/name/intro`);
  if (!sec.cards.length) fail(`reference section ${sec.id}: no cards`);
  sec.cards.forEach((c) => {
    if (!c.ar || !c.title || !c.tag) fail(`reference card "${c.title || c.ar}": missing ar/title/tag`);
    (c.rows || []).forEach((r) => {
      if (!Array.isArray(r) || r.length !== 2) fail(`reference card "${c.title}": malformed row`);
    });
    (c.examples || []).forEach((x) => {
      if (!x.ar || !x.en) fail(`reference card "${c.title}": example missing ar/en`);
    });
  });
});

/* ---- decks ---- */
T.decks.forEach((d) => {
  const n = E.deckWords(d.id).length;
  if (!n) fail(`deck "${d.id}" is empty`);
  else if (n < 5) warn(`deck "${d.id}" only has ${n} words`);
});

/* ---- coverage report ---- */
const coverage = {};
MP.words.forEach((w) => {
  const p = E.paradigmOf(w);
  if (!p) return;
  const key = E.baabGroupId(p) + ':' + p.baabId;
  coverage[key] = (coverage[key] || 0) + 1;
});
const missingBaabs = [];
['baabThulathiMujarrad', 'baabThulathiMazeed', 'baabRubaiMujarrad', 'baabRubaiMazeed'].forEach((g) => {
  T.groups[g].forEach((o) => {
    if (!coverage[g + ':' + o.id]) missingBaabs.push(g + ':' + o.id);
  });
});
const subtypes = {};
MP.words.forEach((w) => {
  const p = E.paradigmOf(w);
  if (p) subtypes[p.subtype] = (subtypes[p.subtype] || 0) + 1;
});

console.log(`words: ${MP.words.length}   paradigms: ${Object.keys(MP.paradigms).length}`);
console.log('sub-type coverage:', subtypes);
if (missingBaabs.length) console.log('abwāb with no example word:', missingBaabs.join(', '));
console.log('decks:', T.decks.map((d) => `${d.id}=${E.deckWords(d.id).length}`).join('  '));

warnings.forEach((w) => console.log('warn: ' + w));
if (errors.length) {
  errors.forEach((e) => console.error('FAIL: ' + e));
  console.error(`\n${errors.length} error(s)`);
  process.exit(1);
}
console.log(`\nOK — no errors${warnings.length ? `, ${warnings.length} warning(s)` : ''}`);
