/*
 * taxonomy.js — the classification chart, encoded.
 *
 * Every option group below matches a branch of the Morphology Word Analysis
 * Chart, plus the extra branches asked for: thulāthī/rubāʿī, mujarrad/mazīd
 * fīh (with the bāb / form), and ṣaḥīḥ/muʿtall with their sub-categories.
 *
 * Each option: { id, ar (Arabic term), en (English), tr (transliteration),
 *                hint (one line shown after the answer is revealed) }
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});

  const groups = {
    /* ---- page 1 of the chart: the big three ---- */
    wordType: [
      { id: 'ism', ar: 'اِسْم', tr: 'ism', en: 'Noun', hint: 'A word carrying meaning in itself, not tied to a tense.' },
      { id: 'fil', ar: 'فِعْل', tr: 'fiʿl', en: 'Verb', hint: 'A word carrying meaning tied to one of the three tenses.' },
      { id: 'harf', ar: 'حَرْف', tr: 'ḥarf', en: 'Particle', hint: 'A word with no complete meaning until joined to something else.' }
    ],

    tense: [
      { id: 'madi', ar: 'مَاضِي', tr: 'māḍī', en: 'Perfect', hint: 'Action already completed — past tense.' },
      { id: 'mudari', ar: 'مُضَارِع', tr: 'muḍāriʿ', en: 'Imperfect', hint: 'Present/future — begins with one of أ ن ي ت.' },
      { id: 'amr', ar: 'أَمْر', tr: 'amr', en: 'Imperative', hint: 'A command addressed to the 2nd person.' }
    ],

    mood: [
      { id: 'marfu', ar: 'مَرْفُوع', tr: 'marfūʿ', en: 'Indicative', hint: 'Default muḍāriʿ — ḍammah on the end, or the نَ of the five verbs intact.' },
      { id: 'mansub', ar: 'مَنْصُوب', tr: 'manṣūb', en: 'Subjunctive', hint: 'After أَنْ لَنْ كَيْ إِذَنْ etc. — fatḥah on the end, نَ dropped.' },
      { id: 'majzum', ar: 'مَجْزُوم', tr: 'majzūm', en: 'Jussive', hint: 'After لَمْ لَمَّا لَا الناهية لِ الأمر — sukūn on the end, نَ dropped.' },
      { id: 'muakkad', ar: 'مُؤَكَّد', tr: 'muʾakkad', en: 'Emphatic', hint: 'Carries the نُون التوكيد (ـَنَّ / ـَنْ).' }
    ],

    voice: [
      { id: 'malum', ar: 'مَعْلُوم', tr: 'maʿlūm', en: 'Active', hint: 'The doer is named — the fāʿil is present.' },
      { id: 'majhul', ar: 'مَجْهُول', tr: 'majhūl', en: 'Passive', hint: 'The doer is dropped; māḍī is ḍamma-then-kasra (نُصِرَ), muḍāriʿ ḍamma-then-fatḥa (يُنْصَرُ).' }
    ],

    polarity: [
      { id: 'muthbat', ar: 'مُثْبَت', tr: 'muthbat', en: 'Assertive', hint: 'No negating particle attached.' },
      { id: 'manfi', ar: 'مَنْفِي', tr: 'manfī', en: 'Negative', hint: 'Negated by مَا لَمْ لَنْ لَا etc.' }
    ],

    person: [
      { id: 'ghaib', ar: 'غَائِب', tr: 'ghāʾib', en: '3rd person', hint: 'The one spoken about — muḍāriʿ takes يـ (or تـ for feminine).' },
      { id: 'mukhatab', ar: 'مُخَاطَب', tr: 'mukhāṭab', en: '2nd person', hint: 'The one spoken to — muḍāriʿ takes تـ.' },
      { id: 'mutakallim', ar: 'مُتَكَلِّم', tr: 'mutakallim', en: '1st person', hint: 'The speaker — muḍāriʿ takes أ (singular) or نـ (plural).' }
    ],

    gender: [
      { id: 'mudhakkar', ar: 'مُذَكَّر', tr: 'mudhakkar', en: 'Masculine', hint: 'Masculine.' },
      { id: 'muannath', ar: 'مُؤَنَّث', tr: 'muʾannath', en: 'Feminine', hint: 'Feminine — often marked by تـ / ـَتْ / ـْنَ.' }
    ],

    number: [
      { id: 'mufrad', ar: 'مُفْرَد', tr: 'mufrad', en: 'Singular', hint: 'One.' },
      { id: 'muthanna', ar: 'مُثَنَّى', tr: 'muthannā', en: 'Dual', hint: 'Two — marked by ـَا / ـَانِ / ـَيْنِ.' },
      { id: 'jam', ar: 'جَمْع', tr: 'jamʿ', en: 'Plural', hint: 'Three or more — ـُوا / ـُونَ / ـْنَ.' }
    ],

    /* ---- page 2 of the chart: derived nouns ---- */
    ismType: [
      { id: 'masdar', ar: 'مَصْدَر', tr: 'maṣdar', en: 'Verbal noun', hint: 'The bare action itself, with no doer and no time.' },
      { id: 'ismFail', ar: 'اِسْم الفَاعِل', tr: 'ism al-fāʿil', en: 'Active participle', hint: 'The doer of the action — فَاعِل from thulāthī, مُـ + muḍāriʿ stem from mazīd.' },
      { id: 'ismMaful', ar: 'اِسْم المَفْعُول', tr: 'ism al-mafʿūl', en: 'Passive participle', hint: 'The one the action falls upon — مَفْعُول from thulāthī.' },
      { id: 'sifah', ar: 'الصِّفَة المُشَبَّهَة', tr: 'ṣifah mushabbahah', en: 'Innate quality', hint: 'A permanent, settled quality rather than a passing action.' },
      { id: 'ismTafdil', ar: 'اِسْم التَّفْضِيل', tr: 'ism al-tafḍīl', en: 'Elative', hint: 'Comparative/superlative on the pattern أَفْعَل.' },
      { id: 'ismZarf', ar: 'اِسْم الظَّرْف', tr: 'ism al-ẓarf', en: 'Noun of time/place', hint: 'Where or when the action happens — مَفْعَل / مَفْعِل.' },
      { id: 'ismAalah', ar: 'اِسْم الآلَة', tr: 'ism al-ālah', en: 'Noun of instrument', hint: 'The tool used — مِفْعَل / مِفْعَال / مِفْعَلَة.' },
      { id: 'jamid', ar: 'اِسْم جَامِد', tr: 'ism jāmid', en: 'Non-derived noun', hint: 'Not derived from a verb — it stands on its own.' }
    ],

    /* ---- extra branch: root-letter count ---- */
    letters: [
      { id: 'thulathi', ar: 'ثُلَاثِي', tr: 'thulāthī', en: 'Triliteral', hint: 'Three root letters.' },
      { id: 'rubai', ar: 'رُبَاعِي', tr: 'rubāʿī', en: 'Quadriliteral', hint: 'Four root letters.' }
    ],

    /* ---- extra branch: bare vs augmented ---- */
    augmentation: [
      { id: 'mujarrad', ar: 'مُجَرَّد', tr: 'mujarrad', en: 'Simple / bare', hint: 'Every letter in the māḍī is a root letter — nothing added.' },
      { id: 'mazeed', ar: 'مَزِيد فِيه', tr: 'mazīd fīh', en: 'Derived / augmented', hint: 'One or more letters added on top of the root.' }
    ],

    /* ---- the abwāb: six of thulāthī mujarrad ---- */
    baabThulathiMujarrad: [
      { id: 'nasara', ar: 'نَصَرَ يَنْصُرُ', tr: 'naṣara–yanṣuru', en: 'Bāb 1', hint: 'Fatḥah on the ʿayn in the māḍī, ḍammah in the muḍāriʿ.' },
      { id: 'daraba', ar: 'ضَرَبَ يَضْرِبُ', tr: 'ḍaraba–yaḍribu', en: 'Bāb 2', hint: 'Fatḥah in the māḍī, kasrah in the muḍāriʿ.' },
      { id: 'fataha', ar: 'فَتَحَ يَفْتَحُ', tr: 'fataḥa–yaftaḥu', en: 'Bāb 3', hint: 'Fatḥah in both — normally needs a throat letter as the ʿayn or lām.' },
      { id: 'alima', ar: 'عَلِمَ يَعْلَمُ', tr: 'ʿalima–yaʿlamu', en: 'Bāb 4', hint: 'Kasrah in the māḍī, fatḥah in the muḍāriʿ.' },
      { id: 'karuma', ar: 'كَرُمَ يَكْرُمُ', tr: 'karuma–yakrumu', en: 'Bāb 5', hint: 'Ḍammah in both — always intransitive, a settled quality.' },
      { id: 'hasiba', ar: 'حَسِبَ يَحْسِبُ', tr: 'ḥasiba–yaḥsibu', en: 'Bāb 6', hint: 'Kasrah in both — the rarest bāb.' }
    ],

    /* ---- the abwāb: thulāthī mazīd fīh, forms II–X ---- */
    baabThulathiMazeed: [
      { id: 'II', ar: 'فَعَّلَ (التَّفْعِيل)', tr: 'faʿʿala', en: 'Form II', hint: 'ʿayn doubled — usually makes a verb transitive or intensive.' },
      { id: 'III', ar: 'فَاعَلَ (المُفَاعَلَة)', tr: 'fāʿala', en: 'Form III', hint: 'Alif after the fāʾ — doing the action with/to another party.' },
      { id: 'IV', ar: 'أَفْعَلَ (الإِفْعَال)', tr: 'afʿala', en: 'Form IV', hint: 'Hamzah prefixed — normally causative.' },
      { id: 'V', ar: 'تَفَعَّلَ (التَّفَعُّل)', tr: 'tafaʿʿala', en: 'Form V', hint: 'تـ on Form II — the effect returns to the doer.' },
      { id: 'VI', ar: 'تَفَاعَلَ (التَّفَاعُل)', tr: 'tafāʿala', en: 'Form VI', hint: 'تـ on Form III — two or more parties acting on each other.' },
      { id: 'VII', ar: 'اِنْفَعَلَ (الاِنْفِعَال)', tr: 'infaʿala', en: 'Form VII', hint: 'نـ prefixed — the effect of Form I happening to the subject.' },
      { id: 'VIII', ar: 'اِفْتَعَلَ (الاِفْتِعَال)', tr: 'iftaʿala', en: 'Form VIII', hint: 'تـ infixed after the fāʾ.' },
      { id: 'IX', ar: 'اِفْعَلَّ (الاِفْعِلَال)', tr: 'ifʿalla', en: 'Form IX', hint: 'lām doubled — colours and physical defects.' },
      { id: 'X', ar: 'اِسْتَفْعَلَ (الاِسْتِفْعَال)', tr: 'istafʿala', en: 'Form X', hint: 'اِسْتـ prefixed — seeking or considering something.' }
    ],

    /* ---- the abwāb: rubāʿī ---- */
    baabRubaiMujarrad: [
      { id: 'falala', ar: 'فَعْلَلَ (الفَعْلَلَة)', tr: 'faʿlala', en: 'Faʿlala', hint: 'The one bare quadriliteral pattern: دَحْرَجَ يُدَحْرِجُ.' }
    ],
    baabRubaiMazeed: [
      { id: 'tafalala', ar: 'تَفَعْلَلَ (التَّفَعْلُل)', tr: 'tafaʿlala', en: 'Tafaʿlala', hint: 'تـ on فَعْلَلَ: تَدَحْرَجَ يَتَدَحْرَجُ.' },
      { id: 'ifanlala', ar: 'اِفْعَنْلَلَ (الاِفْعِنْلَال)', tr: 'ifʿanlala', en: 'Ifʿanlala', hint: 'نـ infixed: اِحْرَنْجَمَ يَحْرَنْجِمُ.' },
      { id: 'ifalalla', ar: 'اِفْعَلَلَّ (الاِفْعِلْلَال)', tr: 'ifʿalalla', en: 'Ifʿalalla', hint: 'Final letter doubled: اِطْمَأَنَّ يَطْمَئِنُّ.' }
    ],

    /* ---- extra branch: soundness ---- */
    soundness: [
      { id: 'sahih', ar: 'صَحِيح', tr: 'ṣaḥīḥ', en: 'Sound', hint: 'No و ا ي among the root letters.' },
      { id: 'mutal', ar: 'مُعْتَلّ', tr: 'muʿtall', en: 'Weak', hint: 'At least one root letter is و or ي (a ḥarf ʿillah).' }
    ],

    sahihType: [
      { id: 'salim', ar: 'سَالِم', tr: 'sālim', en: 'Perfectly sound', hint: 'No weak letter, no hamzah, no doubling — the plain case.' },
      { id: 'mudaaf', ar: 'مُضَاعَف', tr: 'muḍāʿaf', en: 'Doubled', hint: 'The ʿayn and lām are the same letter: مَدَّ (م د د).' },
      { id: 'mahmuz', ar: 'مَهْمُوز', tr: 'mahmūz', en: 'Hamzated', hint: 'One of the root letters is a hamzah.' }
    ],

    /* which position the hamzah sits in — asked only for mahmūz */
    mahmuzPosition: [
      { id: 'fa', ar: 'مَهْمُوز الفَاء', tr: 'mahmūz al-fāʾ', en: 'Hamzah 1st', hint: 'The first root letter is a hamzah: أَخَذَ.' },
      { id: 'ayn', ar: 'مَهْمُوز العَيْن', tr: 'mahmūz al-ʿayn', en: 'Hamzah 2nd', hint: 'The middle root letter is a hamzah: سَأَلَ.' },
      { id: 'lam', ar: 'مَهْمُوز اللَّام', tr: 'mahmūz al-lām', en: 'Hamzah 3rd', hint: 'The last root letter is a hamzah: قَرَأَ.' }
    ],

    mutalType: [
      { id: 'mithal', ar: 'مِثَال', tr: 'mithāl', en: 'Weak 1st letter', hint: 'The fāʾ is و or ي: وَعَدَ يَعِدُ.' },
      { id: 'ajwaf', ar: 'أَجْوَف', tr: 'ajwaf', en: 'Weak 2nd letter', hint: 'The ʿayn is و or ي: قَالَ (ق و ل).' },
      { id: 'naqis', ar: 'نَاقِص', tr: 'nāqiṣ', en: 'Weak 3rd letter', hint: 'The lām is و or ي: رَمَى (ر م ي).' },
      { id: 'lafifMafruq', ar: 'لَفِيف مَفْرُوق', tr: 'lafīf mafrūq', en: 'Two weak, separated', hint: 'Fāʾ and lām are both weak, the ʿayn between them is sound: وَقَى (و ق ي).' },
      { id: 'lafifMaqrun', ar: 'لَفِيف مَقْرُون', tr: 'lafīf maqrūn', en: 'Two weak, joined', hint: 'ʿayn and lām are both weak, side by side: طَوَى (ط و ي).' }
    ]
  };

  /* The eleven cells of the ṣarf ṣaghīr, in the order they are recited. */
  const sarfSlots = [
    { id: 'madi', ar: 'الماضي المعروف', en: 'Perfect (active)' },
    { id: 'mudari', ar: 'المضارع المعروف', en: 'Imperfect (active)' },
    { id: 'masdar', ar: 'المصدر', en: 'Verbal noun' },
    { id: 'madiMajhul', ar: 'الماضي المجهول', en: 'Perfect (passive)' },
    { id: 'mudariMajhul', ar: 'المضارع المجهول', en: 'Imperfect (passive)' },
    { id: 'ismFail', ar: 'اسم الفاعل', en: 'Active participle' },
    { id: 'ismMaful', ar: 'اسم المفعول', en: 'Passive participle' },
    { id: 'amr', ar: 'الأمر', en: 'Imperative' },
    { id: 'nahi', ar: 'النهي', en: 'Prohibition' },
    { id: 'zarf', ar: 'اسم الظرف', en: 'Noun of time/place' },
    { id: 'aalah', ar: 'اسم الآلة', en: 'Noun of instrument' }
  ];

  /* Deck filters offered on the home screen. */
  const decks = [
    { id: 'due', name: 'Due for review', desc: 'Spaced repetition — what you are closest to forgetting.' },
    { id: 'all', name: 'Everything', desc: 'The whole bank, shuffled.' },
    { id: 'verbs', name: 'Verbs only', desc: 'Every kind of fiʿl.' },
    { id: 'nouns', name: 'Nouns only', desc: 'Derived and non-derived asmāʾ.' },
    { id: 'mujarrad', name: 'Thulāthī mujarrad', desc: 'The six abwāb.' },
    { id: 'mazeed', name: 'Mazīd fīh', desc: 'Forms II–X and the rubāʿī.' },
    { id: 'sahih', name: 'Ṣaḥīḥ', desc: 'Sālim, muḍāʿaf and mahmūz.' },
    { id: 'mutal', name: 'Muʿtall', desc: 'Mithāl, ajwaf, nāqiṣ, lafīf.' },
    { id: 'starter', name: 'Starter set', desc: 'The common core — begin here.' },
    { id: 'mine', name: 'My words', desc: 'Only the words you added yourself.' }
  ];

  function option(groupId, optionId) {
    const g = groups[groupId] || [];
    return g.find((o) => o.id === optionId) || null;
  }

  function label(groupId, optionId) {
    const o = option(groupId, optionId);
    return o ? o.ar + ' — ' + o.en : optionId;
  }

  MP.taxonomy = { groups, sarfSlots, decks, option, label };
})(typeof window !== 'undefined' ? window : globalThis);
