/*
 * conjugation.js — the ṣarf kabīr: all fourteen persons of a verb.
 *
 * Regular verbs (sālim, mahmūz and mithāl) are built from the two forms we
 * already store in the paradigm — the māḍī and muḍāriʿ of the 3rd person
 * masculine singular — because their endings never disturb the stem.
 *
 * Ajwaf, nāqiṣ and muḍāʿaf verbs change their stem as they conjugate
 * (قَالَ → قُلْتُ، رَمَى → رَمَوْا، مَدَّ → مَدَدْتُ), so those tables are written
 * out by hand rather than generated.
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});

  /* the fourteen persons, in the order they are recited */
  const PRONOUNS = [
    { id: 'p1', ar: 'هُوَ', en: 'he', person: 'ghaib', gender: 'mudhakkar', number: 'mufrad' },
    { id: 'p2', ar: 'هُمَا', en: 'they two (m.)', person: 'ghaib', gender: 'mudhakkar', number: 'muthanna' },
    { id: 'p3', ar: 'هُمْ', en: 'they (m.)', person: 'ghaib', gender: 'mudhakkar', number: 'jam' },
    { id: 'p4', ar: 'هِيَ', en: 'she', person: 'ghaib', gender: 'muannath', number: 'mufrad' },
    { id: 'p5', ar: 'هُمَا', en: 'they two (f.)', person: 'ghaib', gender: 'muannath', number: 'muthanna' },
    { id: 'p6', ar: 'هُنَّ', en: 'they (f.)', person: 'ghaib', gender: 'muannath', number: 'jam' },
    { id: 'p7', ar: 'أَنْتَ', en: 'you (m.)', person: 'mukhatab', gender: 'mudhakkar', number: 'mufrad' },
    { id: 'p8', ar: 'أَنْتُمَا', en: 'you two (m.)', person: 'mukhatab', gender: 'mudhakkar', number: 'muthanna' },
    { id: 'p9', ar: 'أَنْتُمْ', en: 'you (m. pl.)', person: 'mukhatab', gender: 'mudhakkar', number: 'jam' },
    { id: 'p10', ar: 'أَنْتِ', en: 'you (f.)', person: 'mukhatab', gender: 'muannath', number: 'mufrad' },
    { id: 'p11', ar: 'أَنْتُمَا', en: 'you two (f.)', person: 'mukhatab', gender: 'muannath', number: 'muthanna' },
    { id: 'p12', ar: 'أَنْتُنَّ', en: 'you (f. pl.)', person: 'mukhatab', gender: 'muannath', number: 'jam' },
    { id: 'p13', ar: 'أَنَا', en: 'I', person: 'mutakallim', gender: 'any', number: 'mufrad' },
    { id: 'p14', ar: 'نَحْنُ', en: 'we', person: 'mutakallim', gender: 'any', number: 'jam' }
  ];

  /* the amr only exists for the six 2nd-person slots */
  const AMR_PRONOUNS = [PRONOUNS[6], PRONOUNS[7], PRONOUNS[8], PRONOUNS[9], PRONOUNS[10], PRONOUNS[11]];

  const HARAKA_END = /[ً-ْ]+$/;
  const trimVowel = (s) => s.replace(HARAKA_END, '');

  /* أَ + أْ collapses into آ:  يَأْخُذُ → آخُذُ */
  const fixHamzah = (s) => s.replace(/^أ[َُِ]أْ/, 'آ');

  function swapPrefix(mudariStem, letter) {
    return fixHamzah(letter + mudariStem.slice(1));
  }

  /* Only verbs whose stem survives its endings can be generated. */
  function isRegular(p) {
    if (!p || p.madi === MP.NOT_USED || p.mudari === MP.NOT_USED) return false;
    if (['salim', 'mahmuz', 'mithal'].indexOf(p.subtype) === -1) return false;
    if (/ّ[ً-ْ]?$/.test(p.madi)) return false; // ends in a shaddah: اِحْمَرَّ
    return true;
  }

  function generate(p) {
    const m = trimVowel(p.madi);      // نَصَر
    const y = trimVowel(p.mudari);    // يَنْصُر
    const t = swapPrefix(y, 'ت');
    const madi = [
      m + 'َ', m + 'َا', m + 'ُوا',
      m + 'َتْ', m + 'َتَا', m + 'ْنَ',
      m + 'ْتَ', m + 'ْتُمَا', m + 'ْتُمْ',
      m + 'ْتِ', m + 'ْتُمَا', m + 'ْتُنَّ',
      m + 'ْتُ', m + 'ْنَا'
    ];
    const mudari = [
      y + 'ُ', y + 'َانِ', y + 'ُونَ',
      t + 'ُ', t + 'َانِ', y + 'ْنَ',
      t + 'ُ', t + 'َانِ', t + 'ُونَ',
      t + 'ِينَ', t + 'َانِ', t + 'ْنَ',
      swapPrefix(y, 'أ') + 'ُ', swapPrefix(y, 'ن') + 'ُ'
    ];
    let amr = null;
    if (p.amr && p.amr !== MP.NOT_USED) {
      const a = trimVowel(p.amr);
      amr = [a + 'ْ', a + 'َا', a + 'ُوا', a + 'ِي', a + 'َا', a + 'ْنَ'];
    }
    return { madi: madi, mudari: mudari, amr: amr, source: 'generated' };
  }

  /*
   * Hand-written tables for the categories whose stems shift.
   * Order matches PRONOUNS above.
   */
  const authored = {
    'qwl-I': {
      madi: ['قَالَ', 'قَالَا', 'قَالُوا', 'قَالَتْ', 'قَالَتَا', 'قُلْنَ',
        'قُلْتَ', 'قُلْتُمَا', 'قُلْتُمْ', 'قُلْتِ', 'قُلْتُمَا', 'قُلْتُنَّ', 'قُلْتُ', 'قُلْنَا'],
      mudari: ['يَقُولُ', 'يَقُولَانِ', 'يَقُولُونَ', 'تَقُولُ', 'تَقُولَانِ', 'يَقُلْنَ',
        'تَقُولُ', 'تَقُولَانِ', 'تَقُولُونَ', 'تَقُولِينَ', 'تَقُولَانِ', 'تَقُلْنَ', 'أَقُولُ', 'نَقُولُ'],
      amr: ['قُلْ', 'قُولَا', 'قُولُوا', 'قُولِي', 'قُولَا', 'قُلْنَ'],
      source: 'authored',
      note: 'Ajwaf: the middle wāw drops whenever a sukūn would fall on it — قُلْتُ، قُلْنَ.'
    },
    'bya-I': {
      madi: ['بَاعَ', 'بَاعَا', 'بَاعُوا', 'بَاعَتْ', 'بَاعَتَا', 'بِعْنَ',
        'بِعْتَ', 'بِعْتُمَا', 'بِعْتُمْ', 'بِعْتِ', 'بِعْتُمَا', 'بِعْتُنَّ', 'بِعْتُ', 'بِعْنَا'],
      mudari: ['يَبِيعُ', 'يَبِيعَانِ', 'يَبِيعُونَ', 'تَبِيعُ', 'تَبِيعَانِ', 'يَبِعْنَ',
        'تَبِيعُ', 'تَبِيعَانِ', 'تَبِيعُونَ', 'تَبِيعِينَ', 'تَبِيعَانِ', 'تَبِعْنَ', 'أَبِيعُ', 'نَبِيعُ'],
      amr: ['بِعْ', 'بِيعَا', 'بِيعُوا', 'بِيعِي', 'بِيعَا', 'بِعْنَ'],
      source: 'authored',
      note: 'Ajwaf yāʾī: the stem vowel goes to a kasrah when the weak letter drops — بِعْتُ.'
    },
    'rmy-I': {
      madi: ['رَمَى', 'رَمَيَا', 'رَمَوْا', 'رَمَتْ', 'رَمَتَا', 'رَمَيْنَ',
        'رَمَيْتَ', 'رَمَيْتُمَا', 'رَمَيْتُمْ', 'رَمَيْتِ', 'رَمَيْتُمَا', 'رَمَيْتُنَّ', 'رَمَيْتُ', 'رَمَيْنَا'],
      mudari: ['يَرْمِي', 'يَرْمِيَانِ', 'يَرْمُونَ', 'تَرْمِي', 'تَرْمِيَانِ', 'يَرْمِينَ',
        'تَرْمِي', 'تَرْمِيَانِ', 'تَرْمُونَ', 'تَرْمِينَ', 'تَرْمِيَانِ', 'تَرْمِينَ', 'أَرْمِي', 'نَرْمِي'],
      amr: ['اِرْمِ', 'اِرْمِيَا', 'اِرْمُوا', 'اِرْمِي', 'اِرْمِيَا', 'اِرْمِينَ'],
      source: 'authored',
      note: 'Nāqiṣ yāʾī: the final yāʾ disappears before the wāw of the plural — يَرْمُونَ, رَمَوْا.'
    },
    'daw-I': {
      madi: ['دَعَا', 'دَعَوَا', 'دَعَوْا', 'دَعَتْ', 'دَعَتَا', 'دَعَوْنَ',
        'دَعَوْتَ', 'دَعَوْتُمَا', 'دَعَوْتُمْ', 'دَعَوْتِ', 'دَعَوْتُمَا', 'دَعَوْتُنَّ', 'دَعَوْتُ', 'دَعَوْنَا'],
      mudari: ['يَدْعُو', 'يَدْعُوَانِ', 'يَدْعُونَ', 'تَدْعُو', 'تَدْعُوَانِ', 'يَدْعُونَ',
        'تَدْعُو', 'تَدْعُوَانِ', 'تَدْعُونَ', 'تَدْعِينَ', 'تَدْعُوَانِ', 'تَدْعُونَ', 'أَدْعُو', 'نَدْعُو'],
      amr: ['اُدْعُ', 'اُدْعُوَا', 'اُدْعُوا', 'اُدْعِي', 'اُدْعُوَا', 'اُدْعُونَ'],
      source: 'authored',
      note: 'Nāqiṣ wāwī: يَدْعُونَ is both "they (m.) call" and "they (f.) call" — only the ʿirāb tells them apart.'
    },
    'mdd-I': {
      madi: ['مَدَّ', 'مَدَّا', 'مَدُّوا', 'مَدَّتْ', 'مَدَّتَا', 'مَدَدْنَ',
        'مَدَدْتَ', 'مَدَدْتُمَا', 'مَدَدْتُمْ', 'مَدَدْتِ', 'مَدَدْتُمَا', 'مَدَدْتُنَّ', 'مَدَدْتُ', 'مَدَدْنَا'],
      mudari: ['يَمُدُّ', 'يَمُدَّانِ', 'يَمُدُّونَ', 'تَمُدُّ', 'تَمُدَّانِ', 'يَمْدُدْنَ',
        'تَمُدُّ', 'تَمُدَّانِ', 'تَمُدُّونَ', 'تَمُدِّينَ', 'تَمُدَّانِ', 'تَمْدُدْنَ', 'أَمُدُّ', 'نَمُدُّ'],
      amr: ['مُدَّ', 'مُدَّا', 'مُدُّوا', 'مُدِّي', 'مُدَّا', 'اُمْدُدْنَ'],
      source: 'authored',
      note: 'Muḍāʿaf: the two letters separate again whenever a sukūn lands on the second — مَدَدْتُ، اُمْدُدْنَ.'
    },
    'nsy-I': {
      madi: ['نَسِيَ', 'نَسِيَا', 'نَسُوا', 'نَسِيَتْ', 'نَسِيَتَا', 'نَسِينَ',
        'نَسِيتَ', 'نَسِيتُمَا', 'نَسِيتُمْ', 'نَسِيتِ', 'نَسِيتُمَا', 'نَسِيتُنَّ', 'نَسِيتُ', 'نَسِينَا'],
      mudari: ['يَنْسَى', 'يَنْسَيَانِ', 'يَنْسَوْنَ', 'تَنْسَى', 'تَنْسَيَانِ', 'يَنْسَيْنَ',
        'تَنْسَى', 'تَنْسَيَانِ', 'تَنْسَوْنَ', 'تَنْسَيْنَ', 'تَنْسَيَانِ', 'تَنْسَيْنَ', 'أَنْسَى', 'نَنْسَى'],
      amr: ['اِنْسَ', 'اِنْسَيَا', 'اِنْسَوْا', 'اِنْسَيْ', 'اِنْسَيَا', 'اِنْسَيْنَ'],
      source: 'authored',
      note: 'Nāqiṣ ending in an alif maqṣūrah: the alif turns back into a yāʾ before most endings.'
    }
  };

  const cache = {};

  /* the full table for a paradigm, or null if we cannot vouch for one */
  function tableFor(paradigmId) {
    if (cache[paradigmId] !== undefined) return cache[paradigmId];
    const p = MP.paradigms[paradigmId];
    let table = null;
    if (authored[paradigmId]) table = Object.assign({ paradigm: p }, authored[paradigmId]);
    else if (isRegular(p)) table = Object.assign({ paradigm: p }, generate(p));
    cache[paradigmId] = table;
    return table;
  }

  function conjugatable() {
    return Object.keys(MP.paradigms).filter((id) => tableFor(id) !== null);
  }

  MP.conjugation = { PRONOUNS, AMR_PRONOUNS, tableFor, conjugatable, isRegular };
})(typeof window !== 'undefined' ? window : globalThis);
