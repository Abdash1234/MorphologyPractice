/*
 * generator.js — build a ṣarf ṣaghīr from a root and a bāb.
 *
 * Every pattern here is the plain, mechanical one: the root letters dropped
 * into فعل. That is exactly right for a sound root, and it is the right
 * starting point for a weak one — but a weak root will shift (قَوَلَ is really
 * قَالَ), so the editor flags those and asks you to correct the cells by hand.
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});

  const A = 'َ';  // fatḥah
  const I = 'ِ';  // kasrah
  const U = 'ُ';  // ḍammah
  const O = 'ْ';  // sukūn
  const W = 'ّ';  // shaddah
  const AN = 'ًا'; // fatḥatān + the alif it sits on
  const UN = 'ٌ'; // ḍammatān

  const WEAK = ['و', 'ي'];
  const HAMZAH = ['ء', 'أ', 'إ', 'ؤ', 'ئ', 'آ'];

  /* the two stem vowels of each of the six gates: [māḍī, muḍāriʿ] */
  const GATE_VOWELS = {
    nasara: [A, U],
    daraba: [A, I],
    fataha: [A, A],
    alima: [I, A],
    karuma: [U, U],
    hasiba: [I, I]
  };

  /* Work out ṣaḥīḥ/muʿtall and the sub-category straight from the letters. */
  function analyseRoot(letters) {
    const n = letters.length;
    const weakAt = letters.map((l, i) => (WEAK.indexOf(l) !== -1 ? i : -1)).filter((i) => i !== -1);
    const hamzahAt = letters.map((l, i) => (HAMZAH.indexOf(l) !== -1 ? i : -1)).filter((i) => i !== -1);
    const doubled = n === 3 && letters[1] === letters[2];

    const out = {
      letters: n === 4 ? 'rubai' : 'thulathi',
      soundness: weakAt.length ? 'mutal' : 'sahih',
      subtype: 'salim',
      mahmuzPosition: null,
      warnings: []
    };

    if (weakAt.length >= 2 && n === 3) {
      out.subtype = weakAt.indexOf(1) !== -1 && weakAt.indexOf(2) !== -1 ? 'lafifMaqrun' : 'lafifMafruq';
    } else if (weakAt.length === 1 && n === 3) {
      out.subtype = ['mithal', 'ajwaf', 'naqis'][weakAt[0]];
    } else if (weakAt.length) {
      out.soundness = 'mutal';
      out.subtype = 'ajwaf';
      out.warnings.push('A weak letter in a four-letter root — check the category by hand.');
    } else if (doubled) {
      out.subtype = 'mudaaf';
    } else if (hamzahAt.length) {
      out.subtype = 'mahmuz';
      out.mahmuzPosition = ['fa', 'ayn', 'lam'][hamzahAt[0]] || 'fa';
    }

    if (out.soundness === 'mutal') {
      out.warnings.push('This root is muʿtall: the generated forms are the raw pattern, so the cells where the weak letter shifts or drops need correcting by hand.');
    } else if (out.subtype === 'mudaaf') {
      out.warnings.push('This root is muḍāʿaf: the generated forms keep the two letters apart (مَدَدَ rather than مَدَّ). Merge them by hand.');
    } else if (out.subtype === 'mahmuz') {
      out.warnings.push('This root is mahmūz: check the seat of the hamzah in each cell (ـأ ـؤ ـئ).');
    }
    return out;
  }

  /* A shaddah typed before its vowel renders the same but compares unequal —
     NFC puts every cell into the one canonical order. */
  function normalizeCells(cells) {
    Object.keys(cells).forEach((k) => {
      if (typeof cells[k] === 'string') cells[k] = cells[k].normalize('NFC');
    });
    return cells;
  }

  /* Every pattern, written as a function of the root letters. */
  function build(baabId, root) {
    const f = root[0];
    const a = root[1];
    const l = root[2];
    const l2 = root[3];
    const X = MP.NOT_USED;

    if (GATE_VOWELS[baabId]) {
      const [v1, v2] = GATE_VOWELS[baabId];
      const amrVowel = v2 === U ? U : I;
      const zarfVowel = v2 === I ? I : A;
      const lazim = baabId === 'karuma';
      return {
        madi: f + A + a + v1 + l + A,
        mudari: 'يَ' + f + O + a + v2 + l + U,
        masdar: f + A + a + O + l + AN,
        madiMajhul: lazim ? X : f + U + a + I + l + A,
        mudariMajhul: lazim ? X : 'يُ' + f + O + a + A + l + U,
        ismFail: lazim ? f + A + a + I + 'ي' + l + UN : f + A + 'ا' + a + I + l + UN,
        ismMaful: lazim ? X : 'مَ' + f + O + a + U + 'و' + l + UN,
        amr: 'ا' + amrVowel + f + O + a + v2 + l + O,
        nahi: 'لَا تَ' + f + O + a + v2 + l + O,
        zarf: 'مَ' + f + O + a + zarfVowel + l + UN,
        aalah: lazim ? X : 'مِ' + f + O + a + A + l + UN
      };
    }

    const P = {
      II: {
        madi: f + A + a + W + A + l + A,
        mudari: 'يُ' + f + A + a + W + I + l + U,
        masdar: 'تَ' + f + O + a + I + 'ي' + l + AN,
        madiMajhul: f + U + a + W + I + l + A,
        mudariMajhul: 'يُ' + f + A + a + W + A + l + U,
        ismFail: 'مُ' + f + A + a + W + I + l + UN,
        ismMaful: 'مُ' + f + A + a + W + A + l + UN,
        amr: f + A + a + W + I + l + O,
        nahi: 'لَا تُ' + f + A + a + W + I + l + O
      },
      III: {
        madi: f + A + 'ا' + a + A + l + A,
        mudari: 'يُ' + f + A + 'ا' + a + I + l + U,
        masdar: 'مُ' + f + A + 'ا' + a + A + l + 'َةً',
        madiMajhul: f + U + 'و' + a + I + l + A,
        mudariMajhul: 'يُ' + f + A + 'ا' + a + A + l + U,
        ismFail: 'مُ' + f + A + 'ا' + a + I + l + UN,
        ismMaful: 'مُ' + f + A + 'ا' + a + A + l + UN,
        amr: f + A + 'ا' + a + I + l + O,
        nahi: 'لَا تُ' + f + A + 'ا' + a + I + l + O
      },
      IV: {
        madi: 'أَ' + f + O + a + A + l + A,
        mudari: 'يُ' + f + O + a + I + l + U,
        masdar: 'إِ' + f + O + a + A + 'ا' + l + AN,
        madiMajhul: 'أُ' + f + O + a + I + l + A,
        mudariMajhul: 'يُ' + f + O + a + A + l + U,
        ismFail: 'مُ' + f + O + a + I + l + UN,
        ismMaful: 'مُ' + f + O + a + A + l + UN,
        amr: 'أَ' + f + O + a + I + l + O,
        nahi: 'لَا تُ' + f + O + a + I + l + O
      },
      V: {
        madi: 'تَ' + f + A + a + W + A + l + A,
        mudari: 'يَتَ' + f + A + a + W + A + l + U,
        masdar: 'تَ' + f + A + a + W + U + l + AN,
        madiMajhul: 'تُ' + f + U + a + W + I + l + A,
        mudariMajhul: 'يُتَ' + f + A + a + W + A + l + U,
        ismFail: 'مُتَ' + f + A + a + W + I + l + UN,
        ismMaful: 'مُتَ' + f + A + a + W + A + l + UN,
        amr: 'تَ' + f + A + a + W + A + l + O,
        nahi: 'لَا تَتَ' + f + A + a + W + A + l + O
      },
      VI: {
        madi: 'تَ' + f + A + 'ا' + a + A + l + A,
        mudari: 'يَتَ' + f + A + 'ا' + a + A + l + U,
        masdar: 'تَ' + f + A + 'ا' + a + U + l + AN,
        madiMajhul: 'تُ' + f + U + 'و' + a + I + l + A,
        mudariMajhul: 'يُتَ' + f + A + 'ا' + a + A + l + U,
        ismFail: 'مُتَ' + f + A + 'ا' + a + I + l + UN,
        ismMaful: 'مُتَ' + f + A + 'ا' + a + A + l + UN,
        amr: 'تَ' + f + A + 'ا' + a + A + l + O,
        nahi: 'لَا تَتَ' + f + A + 'ا' + a + A + l + O
      },
      VII: {
        madi: 'اِنْ' + f + A + a + A + l + A,
        mudari: 'يَنْ' + f + A + a + I + l + U,
        masdar: 'اِنْ' + f + I + a + A + 'ا' + l + AN,
        madiMajhul: X,
        mudariMajhul: X,
        ismFail: 'مُنْ' + f + A + a + I + l + UN,
        ismMaful: X,
        amr: 'اِنْ' + f + A + a + I + l + O,
        nahi: 'لَا تَنْ' + f + A + a + I + l + O
      },
      VIII: {
        madi: 'اِ' + f + O + 'تَ' + a + A + l + A,
        mudari: 'يَ' + f + O + 'تَ' + a + I + l + U,
        masdar: 'اِ' + f + O + 'تِ' + a + A + 'ا' + l + AN,
        madiMajhul: 'اُ' + f + O + 'تُ' + a + I + l + A,
        mudariMajhul: 'يُ' + f + O + 'تَ' + a + A + l + U,
        ismFail: 'مُ' + f + O + 'تَ' + a + I + l + UN,
        ismMaful: 'مُ' + f + O + 'تَ' + a + A + l + UN,
        amr: 'اِ' + f + O + 'تَ' + a + I + l + O,
        nahi: 'لَا تَ' + f + O + 'تَ' + a + I + l + O
      },
      IX: {
        madi: 'اِ' + f + O + a + A + l + W + A,
        mudari: 'يَ' + f + O + a + A + l + W + U,
        masdar: 'اِ' + f + O + a + I + l + A + 'ا' + l + AN,
        madiMajhul: X,
        mudariMajhul: X,
        ismFail: 'مُ' + f + O + a + A + l + W + UN,
        ismMaful: X,
        amr: 'اِ' + f + O + a + A + l + W + A,
        nahi: 'لَا تَ' + f + O + a + A + l + W + A
      },
      X: {
        madi: 'اِسْتَ' + f + O + a + A + l + A,
        mudari: 'يَسْتَ' + f + O + a + I + l + U,
        masdar: 'اِسْتِ' + f + O + a + A + 'ا' + l + AN,
        madiMajhul: 'اُسْتُ' + f + O + a + I + l + A,
        mudariMajhul: 'يُسْتَ' + f + O + a + A + l + U,
        ismFail: 'مُسْتَ' + f + O + a + I + l + UN,
        ismMaful: 'مُسْتَ' + f + O + a + A + l + UN,
        amr: 'اِسْتَ' + f + O + a + I + l + O,
        nahi: 'لَا تَسْتَ' + f + O + a + I + l + O
      },
      falala: {
        madi: f + A + a + O + l + A + l2 + A,
        mudari: 'يُ' + f + A + a + O + l + I + l2 + U,
        masdar: f + A + a + O + l + A + l2 + 'َةً',
        madiMajhul: f + U + a + O + l + I + l2 + A,
        mudariMajhul: 'يُ' + f + A + a + O + l + A + l2 + U,
        ismFail: 'مُ' + f + A + a + O + l + I + l2 + UN,
        ismMaful: 'مُ' + f + A + a + O + l + A + l2 + UN,
        amr: f + A + a + O + l + I + l2 + O,
        nahi: 'لَا تُ' + f + A + a + O + l + I + l2 + O
      },
      ifanlala: {
        madi: 'اِ' + f + O + a + A + 'نْ' + l + A + l2 + A,
        mudari: 'يَ' + f + O + a + A + 'نْ' + l + I + l2 + U,
        masdar: 'اِ' + f + O + a + I + 'نْ' + l + A + 'ا' + l2 + AN,
        madiMajhul: X,
        mudariMajhul: X,
        ismFail: 'مُ' + f + O + a + A + 'نْ' + l + I + l2 + UN,
        ismMaful: X,
        amr: 'اِ' + f + O + a + A + 'نْ' + l + I + l2 + O,
        nahi: 'لَا تَ' + f + O + a + A + 'نْ' + l + I + l2 + O
      },
      ifalalla: {
        madi: 'اِ' + f + O + a + A + l + A + l2 + W + A,
        mudari: 'يَ' + f + O + a + A + l + I + l2 + W + U,
        masdar: 'اِ' + f + O + a + I + l + O + l2 + A + 'ا' + l2 + AN,
        madiMajhul: X,
        mudariMajhul: X,
        ismFail: 'مُ' + f + O + a + A + l + I + l2 + W + UN,
        ismMaful: X,
        amr: 'اِ' + f + O + a + A + l + I + l2 + W + A,
        nahi: 'لَا تَ' + f + O + a + A + l + I + l2 + W + A
      },
      tafalala: {
        madi: 'تَ' + f + A + a + O + l + A + l2 + A,
        mudari: 'يَتَ' + f + A + a + O + l + A + l2 + U,
        masdar: 'تَ' + f + A + a + O + l + U + l2 + AN,
        madiMajhul: X,
        mudariMajhul: X,
        ismFail: 'مُتَ' + f + A + a + O + l + I + l2 + UN,
        ismMaful: X,
        amr: 'تَ' + f + A + a + O + l + A + l2 + O,
        nahi: 'لَا تَتَ' + f + A + a + O + l + A + l2 + O
      }
    };

    const cells = P[baabId];
    if (!cells) return null;
    /* the ẓarf and the ālah only come from the bare triliteral */
    return normalizeCells(Object.assign({ zarf: X, aalah: X }, cells));
  }

  /*
   * Full draft paradigm for the editor: the cells, plus the structural
   * classification worked out from the letters, plus any warnings.
   */
  function draftParadigm(rootLetters, baabId, meaning) {
    const letters = rootLetters.filter(Boolean);
    const info = analyseRoot(letters);
    const cells = build(baabId, letters);
    if (!cells) return null;

    const expected = GATE_VOWELS[baabId] || baabId === 'falala' || baabId === 'tafalala';
    const isRubaiBaab = baabId === 'falala' || baabId === 'tafalala';
    if (isRubaiBaab && letters.length !== 4) {
      info.warnings.push('That bāb needs four root letters.');
    }
    if (!isRubaiBaab && letters.length !== 3) {
      info.warnings.push('That bāb needs three root letters.');
    }

    return Object.assign({
      root: letters.join(' '),
      baabId: baabId,
      meaning: meaning || '',
      letters: isRubaiBaab ? 'rubai' : info.letters,
      augmentation: GATE_VOWELS[baabId] || baabId === 'falala' ? 'mujarrad' : 'mazeed',
      soundness: info.soundness,
      subtype: info.subtype,
      mahmuzPosition: info.mahmuzPosition,
      warnings: info.warnings,
      generated: !!expected
    }, cells);
  }

  MP.generator = { draftParadigm, analyseRoot, build, GATE_VOWELS };
})(typeof window !== 'undefined' ? window : globalThis);
