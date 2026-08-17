/*
 * tables.js — one full page per bāb.
 *
 * Each page lays out everything that bāb produces — māḍī and muḍāriʿ, the
 * three iʿrāb states of the muḍāriʿ plus the emphatic, the passives, the amr
 * and nahy, and all the derived nouns — with every line labelled for what it
 * is. Two columns: the bare pattern on فعل, and a real verb beside it.
 *
 * The moods are derived from the muḍāriʿ rather than stored, because they are
 * mechanical: drop the ḍammah for a fatḥah (naṣb), for a sukūn (jazm), or add
 * the nūn of emphasis. Form IX ends in a shaddah and does not follow that, so
 * it is written out.
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});
  const A = 'َ';
  const O = 'ْ';
  const U = 'ُ';
  const X = '—';

  /* Every page: the pattern to build, and a real verb to put beside it. */
  const FORMS = [
    { id: 'nasara', group: 'Thulāthī mujarrad', label: 'Bāb 1 — naṣara', example: 'nsr-I' },
    { id: 'daraba', group: 'Thulāthī mujarrad', label: 'Bāb 2 — ḍaraba', example: 'drb-I' },
    { id: 'fataha', group: 'Thulāthī mujarrad', label: 'Bāb 3 — fataḥa', example: 'fth-I' },
    { id: 'alima', group: 'Thulāthī mujarrad', label: 'Bāb 4 — ʿalima', example: 'alm-I' },
    { id: 'karuma', group: 'Thulāthī mujarrad', label: 'Bāb 5 — karuma', example: 'krm-I' },
    { id: 'hasiba', group: 'Thulāthī mujarrad', label: 'Bāb 6 — ḥasiba', example: 'hsb-I' },
    { id: 'II', group: 'Mazīd fīh', label: 'Form II — faʿʿala', example: 'alm-II' },
    { id: 'III', group: 'Mazīd fīh', label: 'Form III — fāʿala', example: 'jhd-III' },
    { id: 'IV', group: 'Mazīd fīh', label: 'Form IV — afʿala', example: 'slm-IV' },
    { id: 'V', group: 'Mazīd fīh', label: 'Form V — tafaʿʿala', example: 'alm-V' },
    { id: 'VI', group: 'Mazīd fīh', label: 'Form VI — tafāʿala', example: 'awn-VI' },
    { id: 'VII', group: 'Mazīd fīh', label: 'Form VII — infaʿala', example: 'ksr-VII' },
    { id: 'VIII', group: 'Mazīd fīh', label: 'Form VIII — iftaʿala', example: 'jma-VIII' },
    { id: 'IX', group: 'Mazīd fīh', label: 'Form IX — ifʿalla', example: 'hmr-IX' },
    { id: 'X', group: 'Mazīd fīh', label: 'Form X — istafʿala', example: 'ghfr-X' },
    { id: 'falala', group: 'Rubāʿī', label: 'Rubāʿī — faʿlala', example: 'dhrj-Q', pattern: ['ف', 'ع', 'ل', 'ل'] },
    { id: 'tafalala', group: 'Rubāʿī', label: 'Rubāʿī — tafaʿlala', example: 'dhrj-QII', pattern: ['ف', 'ع', 'ل', 'ل'] }
  ];

  /* Form IX doubles its last letter, so its moods are written out. */
  const IRREGULAR_MOODS = {
    IX: {
      pattern: { mansub: 'يَفْعَلَّ', majzum: 'يَفْعَلِلْ / يَفْعَلَّ', muakkad: 'يَفْعَلَّنَّ' },
      'hmr-IX': { mansub: 'يَحْمَرَّ', majzum: 'يَحْمَرِرْ / يَحْمَرَّ', muakkad: 'يَحْمَرَّنَّ' }
    }
  };

  function moodsOf(mudari, formId, key) {
    const odd = IRREGULAR_MOODS[formId] && IRREGULAR_MOODS[formId][key];
    if (odd) return odd;
    if (typeof mudari !== 'string' || mudari.slice(-1) !== U) {
      return { mansub: X, majzum: X, muakkad: X };
    }
    const stem = mudari.slice(0, -1);
    return { mansub: stem + A, majzum: stem + O, muakkad: stem + A + 'نَّ' };
  }

  /*
   * The page for one bāb: groups of labelled rows, each row carrying the
   * pattern form and the same cell from a real verb.
   */
  function pageFor(formId) {
    const form = FORMS.find((f) => f.id === formId);
    if (!form) return null;

    const patternRoot = form.pattern || ['ف', 'ع', 'ل'];
    const pattern = MP.generator.build(form.id, patternRoot);
    const example = MP.paradigms[form.example];
    if (!pattern || !example) return null;

    const pMoods = moodsOf(pattern.mudari, form.id, 'pattern');
    const eMoods = moodsOf(example.mudari, form.id, form.example);

    const row = (ar, en, p, e, note) => ({ ar: ar, en: en, pattern: p || X, example: e || X, note: note });

    const groups = [
      {
        title: 'الماضي',
        titleEn: 'The past',
        rows: [
          row('مَاضٍ مَعْلُوم', 'perfect, active', pattern.madi, example.madi),
          row('مَاضٍ مَجْهُول', 'perfect, passive', pattern.madiMajhul, example.madiMajhul,
            'ḍammah on the first letter, kasrah before the last')
        ]
      },
      {
        title: 'المضارع',
        titleEn: 'The present — one stem, four endings',
        rows: [
          row('مَرْفُوع', 'indicative — the default', pattern.mudari, example.mudari, 'ḍammah on the end'),
          row('مَنْصُوب', 'subjunctive — after أَنْ، لَنْ، كَيْ', pMoods.mansub, eMoods.mansub, 'fatḥah on the end'),
          row('مَجْزُوم', 'jussive — after لَمْ، لَا الناهية', pMoods.majzum, eMoods.majzum, 'sukūn on the end'),
          row('مُؤَكَّد', 'emphatic — with nūn al-tawkīd', pMoods.muakkad, eMoods.muakkad),
          row('مُضَارِع مَجْهُول', 'present, passive', pattern.mudariMajhul, example.mudariMajhul,
            'ḍammah on the tense letter, fatḥah before the last')
        ]
      },
      {
        title: 'الأمر والنهي',
        titleEn: 'Command and prohibition',
        rows: [
          row('أَمْر', 'imperative', pattern.amr, example.amr),
          row('نَهْي', 'prohibition — لَا + jussive', pattern.nahi, example.nahi)
        ]
      },
      {
        title: 'المُشْتَقَّات',
        titleEn: 'What the bāb derives',
        rows: [
          row('المَصْدَر', 'verbal noun', pattern.masdar, example.masdar),
          row('اِسْم الفَاعِل', 'active participle — the doer', pattern.ismFail, example.ismFail),
          row('اِسْم المَفْعُول', 'passive participle — the one acted upon', pattern.ismMaful, example.ismMaful),
          row('اِسْم الظَّرْف', 'noun of place or time', pattern.zarf, example.zarf),
          row('اِسْم الآلَة', 'noun of instrument', pattern.aalah, example.aalah)
        ]
      }
    ];

    return {
      id: form.id,
      label: form.label,
      group: form.group,
      headline: pattern.madi + ' ' + pattern.mudari,
      example: example,
      exampleHeadline: example.madi + ' ' + example.mudari,
      meaning: example.meaning,
      root: example.root,
      groups: groups
    };
  }

  MP.tables = { FORMS, pageFor, moodsOf };
})(typeof window !== 'undefined' ? window : globalThis);
