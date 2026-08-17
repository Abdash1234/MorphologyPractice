/*
 * dictionary.js — every word in the app, gathered as a catalogue.
 *
 * The practice bank is inflected: نَصَرَ، نَصَرُوا، نَصَرَتْ and يَنْصُرُ are four
 * separate entries there, because each is a different question. A dictionary
 * is the other view of the same material — one row per lexical entry, with
 * its principal parts side by side.
 *
 * So a row is built per paradigm, not per word: the paradigm already holds the
 * māḍī, muḍāriʿ, maṣdar and amr of one root in one bāb, which is exactly what
 * a dictionary entry is. Words that come from no paradigm — jāmid nouns,
 * elatives, particles — get a row of their own with dashes in the verb
 * columns, so "every word in the app" really does mean every word.
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});

  const LATIN_MARKS = /[̀-̣̱ͯʿʼ]/g;

  function normLatin(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(LATIN_MARKS, '')
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const normAr = (s) => MP.engine.normalizeArabic(s || '');

  const cell = (v) => (typeof v === 'string' && v && v !== MP.NOT_USED ? v : MP.NOT_USED);

  /* Which of the catalogue's groups an entry belongs to. */
  function groupOf(p) {
    if (!p) return 'jamid';
    if (p.letters === 'rubai') return 'rubai';
    return p.augmentation === 'mujarrad' ? 'mujarrad' : 'mazeed';
  }

  const GROUPS = [
    { id: 'all', name: 'Everything' },
    { id: 'mujarrad', name: 'Thulāthī mujarrad' },
    { id: 'mazeed', name: 'Mazīd fīh' },
    { id: 'rubai', name: 'Rubāʿī' },
    { id: 'jamid', name: 'Not from a verb' }
  ];

  const SOUNDNESS = [
    { id: 'all', name: 'Sound or weak' },
    { id: 'sahih', name: 'Ṣaḥīḥ' },
    { id: 'mutal', name: 'Muʿtall' }
  ];

  /*
   * One row per paradigm, then one per word that has no paradigm behind it.
   * Rebuilt on each call so anything the user has added shows up straight away.
   */
  function entries() {
    const rows = [];

    /* the practice words that hang off each paradigm, gathered once — they
       carry the transliterations and glosses the paradigm itself has none of,
       and folding them in is what makes "nasara" or "they helped" find the
       entry as readily as نصر does */
    const members = {};
    MP.words.forEach((w) => {
      if (!w.p) return;
      (members[w.p] = members[w.p] || []).push(w);
    });

    Object.keys(MP.paradigms).forEach((id) => {
      const p = MP.paradigms[id];
      const mine = members[id] || [];
      rows.push({
        memberText: mine.map((w) => normLatin(w.tr) + ' ' + normLatin(w.en)).join(' '),
        memberArabic: mine.map((w) => normAr(w.w)).join(' '),
        id: 'p:' + id,
        kind: 'paradigm',
        headword: p.madi && p.madi !== MP.NOT_USED ? p.madi : p.mudari,
        en: p.meaning || '',
        root: p.root || '',
        madi: cell(p.madi),
        mudari: cell(p.mudari),
        masdar: cell(p.masdar),
        amr: cell(p.amr),
        baabId: p.baabId,
        baabAr: babLabel(p, 'ar'),
        baabEn: babLabel(p, 'en'),
        group: groupOf(p),
        soundness: p.soundness || 'sahih',
        subtype: p.subtype || '',
        custom: !!p.custom,
        /* how many of the practice words hang off this entry */
        forms: mine.length,
        baabTr: babLabel(p, 'tr')
      });
    });

    MP.words.filter((w) => !w.p).forEach((w) => {
      rows.push({
        id: 'w:' + w.id,
        kind: 'word',
        headword: w.w,
        en: w.en || '',
        tr: w.tr || '',
        root: w.root || '',
        madi: MP.NOT_USED,
        mudari: MP.NOT_USED,
        masdar: MP.NOT_USED,
        amr: MP.NOT_USED,
        baabAr: '',
        baabEn: kindName(w),
        group: 'jamid',
        soundness: 'all',
        subtype: '',
        custom: !!w.custom,
        forms: 1
      });
    });

    rows.forEach((r) => {
      r.search = [
        normAr(r.headword), normAr(r.madi), normAr(r.mudari), normAr(r.masdar),
        normAr(r.amr), normAr(r.root), r.memberArabic,
        normLatin(r.en), normLatin(r.tr), normLatin(r.baabEn), normLatin(r.baabTr),
        normLatin(r.subtype), r.memberText
      ].filter(Boolean).join(' ');
    });

    /* dictionary order: by root, the way a lexicon is arranged */
    rows.sort((a, b) => (a.root || '').localeCompare(b.root || '', 'ar') ||
      (a.headword || '').localeCompare(b.headword || '', 'ar'));
    return rows;
  }

  function babLabel(p, which) {
    const o = MP.taxonomy.option(MP.engine.baabGroupId(p), p.baabId);
    if (!o) return p.baabId || '';
    return o[which] || '';
  }

  function kindName(w) {
    if (w.type === 'harf') return 'Particle';
    const o = w.ismType ? MP.taxonomy.option('ismType', w.ismType) : null;
    return o ? o.en : 'Noun';
  }

  /* Apply the search box and the two filters. */
  function filter(rows, q, group, soundness) {
    const terms = String(q || '').trim();
    const ar = normAr(terms);
    const latin = normLatin(terms);
    return rows.filter((r) => {
      if (group && group !== 'all' && r.group !== group) return false;
      if (soundness && soundness !== 'all' && r.soundness !== soundness) return false;
      if (!terms) return true;
      if (ar && r.search.indexOf(ar) !== -1) return true;
      if (latin && r.search.indexOf(latin) !== -1) return true;
      return false;
    });
  }

  MP.dictionary = { entries, filter, GROUPS, SOUNDNESS };
})(typeof window !== 'undefined' ? window : globalThis);
