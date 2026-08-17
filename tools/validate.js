/*
 * tools/validate.js — data integrity check for the word bank.
 * Run with:  node tools/validate.js
 *
 * Checks that every word points at a real paradigm and a real ṣarf ṣaghīr cell,
 * that every answer id exists in the option group it is asked from, and that
 * every question the app can generate is answerable.
 */
import { createRequire } from 'node:module';

/* the src/ files are plain browser scripts that attach to globalThis */
const require = createRequire(import.meta.url);

require('../src/taxonomy.js');
require('../src/paradigms.js');
require('../src/words.js');
require('../src/reference.js');
require('../src/conjugation.js');
require('../src/sentences.js');
require('../src/generator.js');
require('../src/tables.js');
require('../src/store.js');
require('../src/engine.js');
require('../src/custom.js');

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

/* ---- sentences ---- */
const wordIds = new Set(MP.words.map((w) => w.id));
Object.keys(MP.sentences).forEach((id) => {
  const s = MP.sentences[id];
  if (!wordIds.has(id)) fail(`sentence for unknown word "${id}"`);
  if (!s.ar || !s.en) fail(`sentence ${id}: missing ar/en`);
  const gaps = s.ar.split('{}').length - 1;
  if (gaps !== 1) fail(`sentence ${id}: expected exactly one {} gap, found ${gaps}`);
  const withoutGap = s.ar.replace('{}', '');
  if (/[a-zA-Z]/.test(withoutGap)) fail(`sentence ${id}: Latin letters in the Arabic`);
  if (withoutGap.trim().length < 8) warn(`sentence ${id}: very short`);
});
const covered = MP.words.filter((w) => MP.sentences[w.id]).length;

/* ---- conjugation tables ---- */
const C = MP.conjugation;
C.conjugatable().forEach((pid) => {
  const t = C.tableFor(pid);
  if (t.madi.length !== 14) fail(`conjugation ${pid}: māḍī has ${t.madi.length} forms, expected 14`);
  if (t.mudari.length !== 14) fail(`conjugation ${pid}: muḍāriʿ has ${t.mudari.length} forms, expected 14`);
  if (t.amr && t.amr.length !== 6) fail(`conjugation ${pid}: amr has ${t.amr.length} forms, expected 6`);
  t.madi.concat(t.mudari, t.amr || []).forEach((f) => {
    if (!f || !/^[؀-ۿ]+$/.test(f)) fail(`conjugation ${pid}: bad form "${f}"`);
  });
  /* the 3ms forms must match the paradigm they came from */
  const p = MP.paradigms[pid];
  if (E.normalizeArabic(t.madi[0]) !== E.normalizeArabic(p.madi)) {
    fail(`conjugation ${pid}: first māḍī form does not match the paradigm`);
  }
  if (E.normalizeArabic(t.mudari[0]) !== E.normalizeArabic(p.mudari)) {
    fail(`conjugation ${pid}: first muḍāriʿ form does not match the paradigm`);
  }
});

/* ---- every mode must produce answerable questions ---- */
['analysis', 'production', 'conjugation', 'sentences'].forEach((mode) => {
  const settings = Object.assign({}, MP.store.DEFAULT_SETTINGS, { mode, focus: null });
  const pool = E.poolFor(mode, 'all');
  if (pool.length < 10) fail(`mode "${mode}" only has ${pool.length} items`);
  pool.forEach((item) => {
    const steps = E.buildSteps(item, settings);
    if (!steps.length) fail(`mode "${mode}": item ${item.id} generates no question`);
    steps.forEach((s) => {
      if (!E.hintFor(s)) fail(`mode "${mode}": no hint for step "${s.id}"`);
      if (s.kind === 'text' && !s.check(s.answer)) {
        fail(`mode "${mode}": ${item.id} rejects its own answer "${s.answer}"`);
      }
      if (s.kind === 'cloze') {
        if (s.choices.length !== 4) fail(`cloze ${item.id}: ${s.choices.length} choices, expected 4`);
        if (!s.choices.some((c) => c.id === s.answer)) fail(`cloze ${item.id}: answer missing from choices`);
        const ids = s.choices.map((c) => c.id);
        if (new Set(ids).size !== ids.length) fail(`cloze ${item.id}: duplicate choices`);
      }
      if (s.kind === 'radicals') {
        s.answer.forEach((letter) => {
          if (s.keypad.indexOf(letter) === -1) fail(`radicals ${item.id}: "${letter}" missing from the keypad`);
        });
        if (s.slots.length !== s.answer.length) fail(`radicals ${item.id}: slot count does not match the root`);
      }
    });
  });
});

/* ---- the pattern generator must reproduce the hand-written paradigms ---- */
const genCells = ['madi', 'mudari', 'madiMajhul', 'mudariMajhul', 'ismFail', 'ismMaful', 'amr', 'nahi'];
let genChecked = 0;
Object.keys(MP.paradigms).forEach((id) => {
  const p = MP.paradigms[id];
  const draft = MP.generator.draftParadigm(p.root.split(' '), p.baabId, p.meaning);
  if (!draft) {
    fail(`generator has no pattern for bāb "${p.baabId}" (${id})`);
    return;
  }
  /* the classification is derived from the letters, so it must always agree */
  const info = MP.generator.analyseRoot(p.root.split(' '));
  if (info.soundness !== p.soundness || info.subtype !== p.subtype) {
    fail(`generator classifies ${id} (${p.root}) as ${info.soundness}/${info.subtype}, data says ${p.soundness}/${p.subtype}`);
  }
  /* the forms themselves are only predictable for a sound root */
  if (p.subtype !== 'salim') return;
  genChecked++;
  genCells.forEach((c) => {
    if (p[c] === MP.NOT_USED || draft[c] === MP.NOT_USED) return;
    if (draft[c].normalize('NFC') !== p[c].normalize('NFC')) {
      fail(`generator ${id}: ${c} → "${draft[c]}" but the bank has "${p[c]}"`);
    }
  });
  if (p.augmentation === 'mazeed' && p.masdar.indexOf(' ') === -1) {
    if (draft.masdar.normalize('NFC') !== p.masdar.normalize('NFC')) {
      fail(`generator ${id}: maṣdar → "${draft.masdar}" but the bank has "${p.masdar}"`);
    }
  }
});

/* ---- the in-app editor: a generated root and a word off it must survive ---- */
(function checkEditorRoundTrip() {
  const draft = MP.generator.draftParadigm(['ف', 'ه', 'م'], 'alima', 'to understand');
  delete draft.warnings;
  delete draft.generated;
  const saved = MP.custom.saveParadigm(draft);
  if (!saved.ok) {
    fail('editor: a generated root fails its own checks — ' + saved.errors.join('; '));
    return;
  }
  const word = {
    w: MP.paradigms[saved.id].ismFail, en: 'one who understands', type: 'ism',
    ismType: 'ismFail', gender: 'mudhakkar', number: 'mufrad', p: saved.id, slot: 'ismFail'
  };
  const savedWord = MP.custom.saveWord(word, { ar: 'هَذَا رَجُلٌ فَاهِمٌ.', en: 'This is a man who understands.' });
  if (!savedWord.ok) {
    fail('editor: a valid word fails its own checks — ' + savedWord.errors.join('; '));
    return;
  }
  const live = MP.words.find((w) => w.id === savedWord.id);
  if (!live) fail('editor: a saved word is not merged into the bank');
  else {
    const steps = E.buildSteps(live, MP.store.DEFAULT_SETTINGS);
    if (!steps.length) fail('editor: a saved word generates no questions');
    steps.forEach((s) => {
      if (!E.hintFor(s)) fail(`editor: saved word has a step with no hint ("${s.id}")`);
      if (s.kind === 'choice' && !E.optionsFor(s).some((o) => o.id === s.answer)) {
        fail(`editor: saved word step "${s.id}" has an answer outside its options`);
      }
      if (s.kind === 'text' && !s.check(s.answer)) fail('editor: saved word rejects its own answer');
    });
    if (E.tagsOf(live).indexOf('mine') === -1) fail('editor: saved word is not tagged into the "mine" deck');
  }
  /* a deliberately broken word must be refused */
  const bad = MP.custom.checkWord({ w: '', en: '', type: 'fil' });
  if (!bad.length) fail('editor: checkWord accepts an empty word');

  /* and the export must import back to the same thing */
  const json = MP.custom.exportJSON();
  const before = MP.custom.count();
  MP.custom.save({ paradigms: {}, words: [], sentences: {} });
  const back = MP.custom.importJSON(json, 'merge');
  const after = MP.custom.count();
  if (!back.ok) fail('editor: exported JSON will not import — ' + back.errors.join('; '));
  if (after.words !== before.words || after.roots !== before.roots) {
    fail(`editor: export/import lost data (${before.words}w/${before.roots}r → ${after.words}w/${after.roots}r)`);
  }
  MP.custom.save({ paradigms: {}, words: [], sentences: {} });  // leave no trace
})();

/* ---- reference content ---- */
MP.reference.sections.forEach((sec) => {
  if (!sec.id || !sec.name || !sec.intro) fail(`reference section ${sec.id}: missing id/name/intro`);
  /* two tabs build themselves from data rather than from cards */
  const selfBuilding = sec.kind === 'conjugator' || sec.kind === 'formtables';
  if (!sec.cards.length && !selfBuilding) fail(`reference section ${sec.id}: no cards`);
  if (sec.kind === 'conjugator' && !MP.conjugation.conjugatable().length) {
    fail('the conjugator tab has no verbs to show');
  }
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

/* ---- one page per bāb ---- */
MP.tables.FORMS.forEach((f) => {
  const page = MP.tables.pageFor(f.id);
  if (!page) {
    fail(`form table "${f.id}" does not build`);
    return;
  }
  if (!MP.paradigms[f.example]) fail(`form table "${f.id}": example paradigm "${f.example}" is missing`);
  page.groups.forEach((g) => {
    if (!g.rows.length) fail(`form table "${f.id}": group "${g.titleEn}" is empty`);
    g.rows.forEach((r) => {
      if (!r.ar || !r.en) fail(`form table "${f.id}": a row has no label`);
      [r.pattern, r.example].forEach((cell) => {
        if (typeof cell !== 'string' || !cell.trim()) fail(`form table "${f.id}": empty cell on "${r.en}"`);
        if (cell !== MP.NOT_USED && !/[؀-ۿ]/.test(cell)) {
          fail(`form table "${f.id}": "${r.en}" is not Arabic — "${cell}"`);
        }
      });
    });
  });
  /* the māḍī and muḍāriʿ shown must be the real verb's, not something derived */
  const ex = MP.paradigms[f.example];
  const madiRow = page.groups[0].rows[0];
  const mudariRow = page.groups[1].rows[0];
  if (madiRow.example !== ex.madi) fail(`form table "${f.id}": māḍī does not match the paradigm`);
  if (mudariRow.example !== ex.mudari) fail(`form table "${f.id}": muḍāriʿ does not match the paradigm`);
});

/* ---- decks ---- */
T.decks.forEach((d) => {
  if (d.id === 'mine') return;   // filled only by the in-app editor
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
console.log('form tables: ' + MP.tables.FORMS.length + ' pages');
console.log('generator checked against ' + genChecked + ' sound paradigms');
console.log('sentences: ' + Object.keys(MP.sentences).length + ' (' + covered + ' words covered)   conjugation tables: ' + C.conjugatable().length);
console.log('decks:', T.decks.map((d) => `${d.id}=${E.deckWords(d.id).length}`).join('  '));

warnings.forEach((w) => console.log('warn: ' + w));
if (errors.length) {
  errors.forEach((e) => console.error('FAIL: ' + e));
  console.error(`\n${errors.length} error(s)`);
  process.exit(1);
}
console.log(`\nOK — no errors${warnings.length ? `, ${warnings.length} warning(s)` : ''}`);
