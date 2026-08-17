/*
 * ilal.js — the weak-letter rules as something you do, not something you read.
 *
 * Each item is one collision between a pattern and a weak letter: the raw form
 * the pattern would give, the form Arabic actually says, and which of the four
 * rules got you from one to the other. The drill asks for both — produce it,
 * then name what happened — because a learner who can say قُلْتُ but cannot say
 * why has memorised a table rather than learned a rule.
 *
 * Every item here applies exactly one rule. The two-step cases (يَخْوَفُ →
 * يَخَافُ, where the vowel moves back and the wāw then turns into an alif) are
 * deliberately left out: with a single-answer question they would be a coin
 * toss. They are covered on the Weak letter rules page instead.
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});

  const RULES = [
    { id: 'qalb', ar: 'إِعْلَال بِالقَلْب', tr: 'iʿlāl bi-l-qalb', en: 'Turned into another letter',
      hint: 'A wāw or yāʾ carrying a vowel, with a fatḥah in front of it, becomes an alif.' },
    { id: 'naql', ar: 'إِعْلَال بِالنَّقْل', tr: 'iʿlāl bi-l-naql', en: 'Vowel handed back',
      hint: 'The weak letter passes its vowel to the sākin letter before it and goes quiet itself.' },
    { id: 'hadhf', ar: 'إِعْلَال بِالحَذْف', tr: 'iʿlāl bi-l-ḥadhf', en: 'Letter dropped',
      hint: 'The weak letter is deleted — usually because two sukūns would have met.' },
    { id: 'idgham', ar: 'إِدْغَام', tr: 'idghām', en: 'Two letters merged',
      hint: 'Two identical letters run together under a shaddah rather than being said twice.' }
  ];

  /*
   * from  what the bare pattern gives, or the pieces being joined
   * to    what is actually said
   * rule  which of the four did it
   */
  const ITEMS = [
    /* ---- qalb: the weak letter becomes an alif ---- */
    { id: 'ilal-qwl-madi', from: 'قَوَلَ', to: 'قَالَ', rule: 'qalb', root: 'ق و ل', meaning: 'to say',
      why: 'The wāw carries a fatḥah and there is a fatḥah before it, so it turns into an alif.' },
    { id: 'ilal-bya-madi', from: 'بَيَعَ', to: 'بَاعَ', rule: 'qalb', root: 'ب ي ع', meaning: 'to sell',
      why: 'A yāʾ under the same two conditions becomes an alif just as a wāw does.' },
    { id: 'ilal-rmy-madi', from: 'رَمَيَ', to: 'رَمَى', rule: 'qalb', root: 'ر م ي', meaning: 'to throw',
      why: 'At the end of the word the alif is written as an alif maqṣūrah, ى, because the radical was a yāʾ.' },
    { id: 'ilal-daw-madi', from: 'دَعَوَ', to: 'دَعَا', rule: 'qalb', root: 'د ع و', meaning: 'to call',
      why: 'A final wāw becomes a plain alif — which is how you know دَعَا is د ع و and رَمَى is ر م ي.' },
    { id: 'ilal-qwm-madi', from: 'قَوَمَ', to: 'قَامَ', rule: 'qalb', root: 'ق و م', meaning: 'to stand' ,
      why: 'Same conditions again: vowelled wāw, fatḥah before it.' },

    /* ---- naql: the vowel moves back onto the sound letter ---- */
    { id: 'ilal-qwl-mud', from: 'يَقْوُلُ', to: 'يَقُولُ', rule: 'naql', root: 'ق و ل', meaning: 'he says',
      why: 'The wāw has a ḍammah and the ق before it has a sukūn. The ḍammah moves onto the ق and the wāw is left sākinah.' },
    { id: 'ilal-bya-mud', from: 'يَبْيِعُ', to: 'يَبِيعُ', rule: 'naql', root: 'ب ي ع', meaning: 'he sells',
      why: 'The kasrah moves back onto the ب and the yāʾ goes quiet.' },
    { id: 'ilal-qwm-mud', from: 'يَقْوُمُ', to: 'يَقُومُ', rule: 'naql', root: 'ق و م', meaning: 'he stands',
      why: 'A sukūn followed by a vowelled weak letter is heavy; moving the vowel one place left fixes it.' },
    { id: 'ilal-syr-mud', from: 'يَسْيِرُ', to: 'يَسِيرُ', rule: 'naql', root: 'س ي ر', meaning: 'he travels',
      why: 'The kasrah moves onto the س, and the sākinah yāʾ after a kasrah is simply a long ī.' },

    /* ---- hadhf: the weak letter drops ---- */
    { id: 'ilal-qwl-1s', from: 'قَالَ + تُ', to: 'قُلْتُ', rule: 'hadhf', root: 'ق و ل', meaning: 'I said',
      why: 'The ت brings a sukūn, and the alif is already sākinah. Two sukūns cannot meet, so the weak letter goes. The ḍammah left behind tells you it was a wāw.' },
    { id: 'ilal-bya-1s', from: 'بَاعَ + تُ', to: 'بِعْتُ', rule: 'hadhf', root: 'ب ي ع', meaning: 'I sold',
      why: 'The same collision, but the kasrah left behind tells you the radical was a yāʾ.' },
    { id: 'ilal-qwl-3fp', from: 'يَقُولُ + نَ', to: 'يَقُلْنَ', rule: 'hadhf', root: 'ق و ل', meaning: 'they (f.) say',
      why: 'The نَ of the feminine plural puts a sukūn on the لـ, which collides with the sākinah wāw.' },
    { id: 'ilal-qwl-jazm', from: 'لَمْ + يَقُولُ', to: 'لَمْ يَقُلْ', rule: 'hadhf', root: 'ق و ل', meaning: 'he did not say',
      why: 'The jazm puts a sukūn on the end, which collides with the wāw before it.' },
    { id: 'ilal-wad-mud', from: 'يَوْعِدُ', to: 'يَعِدُ', rule: 'hadhf', root: 'و ع د', meaning: 'he promises',
      why: 'A wāw at the front, caught between a fatḥah before it and a kasrah after it, drops in the muḍāriʿ. It comes back in the passive: يُوعَدُ.' },
    { id: 'ilal-wsl-mud', from: 'يَوْصِلُ', to: 'يَصِلُ', rule: 'hadhf', root: 'و ص ل', meaning: 'he arrives',
      why: 'The same mithāl rule. Note a yāʾ at the front does not drop: يَيْسِرُ keeps its yāʾ.' },
    { id: 'ilal-rmy-jazm', from: 'لَمْ + يَرْمِي', to: 'لَمْ يَرْمِ', rule: 'hadhf', root: 'ر م ي', meaning: 'he did not throw',
      why: 'A nāqiṣ verb in the jazm loses its last letter altogether rather than taking a sukūn. The kasrah is the only trace left.' },
    { id: 'ilal-daw-jazm', from: 'لَمْ + يَدْعُو', to: 'لَمْ يَدْعُ', rule: 'hadhf', root: 'د ع و', meaning: 'he did not call',
      why: 'Same rule, and the ḍammah left behind is what tells you the missing letter was a wāw.' },
    { id: 'ilal-rmy-3mp', from: 'يَرْمِيُ + ونَ', to: 'يَرْمُونَ', rule: 'hadhf', root: 'ر م ي', meaning: 'they (m.) throw',
      why: 'The yāʾ drops before the wāw of the plural, and the kasrah becomes a ḍammah to match it.' },

    /* ---- idgham: two identical letters run together ---- */
    { id: 'ilal-mdd-madi', from: 'مَدَدَ', to: 'مَدَّ', rule: 'idgham', root: 'م د د', meaning: 'to stretch out',
      why: 'The ʿayn and the lām are the same letter, so rather than saying it twice it is said once, long, under a shaddah.' },
    { id: 'ilal-rdd-madi', from: 'رَدَدَ', to: 'رَدَّ', rule: 'idgham', root: 'ر د د', meaning: 'to return',
      why: 'Every muḍāʿaf verb does this wherever it can.' },
    { id: 'ilal-mdd-mud', from: 'يَمْدُدُ', to: 'يَمُدُّ', rule: 'idgham', root: 'م د د', meaning: 'he stretches out',
      why: 'The vowel moves back off the first د so the two can meet, then they merge.' },
    { id: 'ilal-mdd-1s', from: 'مَدَّ + تُ', to: 'مَدَدْتُ', rule: 'idgham', root: 'م د د', meaning: 'I stretched out',
      why: 'Here the idghām is undone: the ending puts a sukūn on the second د, and a merged letter cannot carry one, so the two separate again.' }
  ];

  function items() {
    return ITEMS.map((it) => Object.assign({
      kind: 'ilal',
      w: it.from,
      sub: it.root + ' · ' + it.meaning
    }, it));
  }

  /* the rules double as the option group the drill offers */
  if (MP.taxonomy && MP.taxonomy.groups) MP.taxonomy.groups.ilalRule = RULES;

  MP.ilal = { RULES, items };
})(typeof window !== 'undefined' ? window : globalThis);
