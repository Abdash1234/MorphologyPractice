/*
 * words.js — the practice bank.
 *
 * Fields:
 *   id      unique key (used for the per-word progress record)
 *   w       the word itself, fully vowelled
 *   tr      transliteration
 *   en      translation
 *   p       paradigm id (see paradigms.js) — the ṣarf ṣaghīr this word sits in
 *   slot    which cell of that ṣarf ṣaghīr the word is (null = not a cell of it)
 *   type    ism | fil | harf
 *
 *   verbs   tense, mood (muḍāriʿ only), voice, pol, person, gender, number
 *   nouns   ismType, gender, number
 *
 *   gender: 'any' is used for the 1st person, where the form does not show it —
 *           the app skips the gender question for those.
 *   root    only needed when there is no paradigm (p: null)
 *   starter true = part of the gentle twenty-word starter deck
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});

  /* helper: build a verb entry with the usual defaults */
  function v(o) {
    return Object.assign(
      { type: 'fil', voice: 'malum', pol: 'muthbat', gender: 'mudhakkar', number: 'mufrad' },
      o
    );
  }
  function n(o) {
    return Object.assign({ type: 'ism', gender: 'mudhakkar', number: 'mufrad' }, o);
  }
  /* a particle: no root, no paradigm, classified by what it governs */
  function h(o) {
    return Object.assign({ type: 'harf', p: null }, o);
  }

  const words = [
    /* ============ ن ص ر — bāb naṣara, the standard model ============ */
    v({ id: 'nsr-madi-3ms', w: 'نَصَرَ', tr: 'naṣara', en: 'he helped', p: 'nsr-I', slot: 'madi',
        tense: 'madi', person: 'ghaib', starter: true }),
    v({ id: 'nsr-madi-3mp', w: 'نَصَرُوا', tr: 'naṣarū', en: 'they (m.) helped', p: 'nsr-I', slot: 'madi',
        tense: 'madi', person: 'ghaib', number: 'jam', starter: true }),
    v({ id: 'nsr-madi-3fs', w: 'نَصَرَتْ', tr: 'naṣarat', en: 'she helped', p: 'nsr-I', slot: 'madi',
        tense: 'madi', person: 'ghaib', gender: 'muannath', starter: true }),
    v({ id: 'nsr-madi-3fd', w: 'نَصَرَتَا', tr: 'naṣaratā', en: 'the two of them (f.) helped', p: 'nsr-I', slot: 'madi',
        tense: 'madi', person: 'ghaib', gender: 'muannath', number: 'muthanna' }),
    v({ id: 'nsr-madi-1s', w: 'نَصَرْتُ', tr: 'naṣartu', en: 'I helped', p: 'nsr-I', slot: 'madi',
        tense: 'madi', person: 'mutakallim', gender: 'any' }),
    v({ id: 'nsr-mud-3ms', w: 'يَنْصُرُ', tr: 'yanṣuru', en: 'he helps / will help', p: 'nsr-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib', starter: true }),
    v({ id: 'nsr-mud-3mp', w: 'يَنْصُرُونَ', tr: 'yanṣurūna', en: 'they (m.) help', p: 'nsr-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib', number: 'jam', starter: true }),
    v({ id: 'nsr-mud-2fs', w: 'تَنْصُرِينَ', tr: 'tanṣurīna', en: 'you (f.) help', p: 'nsr-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'mukhatab', gender: 'muannath' }),
    v({ id: 'nsr-mud-1p', w: 'نَنْصُرُ', tr: 'nanṣuru', en: 'we help', p: 'nsr-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'mutakallim', gender: 'any', number: 'jam' }),
    v({ id: 'nsr-mansub', w: 'لَنْ يَنْصُرَ', tr: 'lan yanṣura', en: 'he will never help', p: 'nsr-I', slot: 'mudari',
        tense: 'mudari', mood: 'mansub', pol: 'manfi', person: 'ghaib',
        note: 'لَنْ puts the muḍāriʿ into naṣb — fatḥah on the last letter — and negates it for the future.' }),
    v({ id: 'nsr-majzum', w: 'لَمْ يَنْصُرْ', tr: 'lam yanṣur', en: 'he did not help', p: 'nsr-I', slot: 'mudari',
        tense: 'mudari', mood: 'majzum', pol: 'manfi', person: 'ghaib',
        note: 'لَمْ makes the muḍāriʿ majzūm and flips its meaning to the past.' }),
    v({ id: 'nsr-muakkad', w: 'لَيَنْصُرَنَّ', tr: 'la-yanṣuranna', en: 'he will surely help', p: 'nsr-I', slot: 'mudari',
        tense: 'mudari', mood: 'muakkad', person: 'ghaib',
        note: 'The heavy nūn al-tawkīd (ـَنَّ) with the lām of the oath: emphatic.' }),
    v({ id: 'nsr-amr', w: 'اُنْصُرْ', tr: 'unṣur', en: 'help! (to one man)', p: 'nsr-I', slot: 'amr',
        tense: 'amr', person: 'mukhatab', starter: true }),
    v({ id: 'nsr-nahi', w: 'لَا تَنْصُرْ', tr: 'lā tanṣur', en: 'do not help!', p: 'nsr-I', slot: 'nahi',
        tense: 'mudari', mood: 'majzum', pol: 'manfi', person: 'mukhatab',
        note: 'The nahy is a muḍāriʿ made majzūm by لَا الناهية — not an independent tense.' }),
    v({ id: 'nsr-majhul-madi', w: 'نُصِرَ', tr: 'nuṣira', en: 'he was helped', p: 'nsr-I', slot: 'madiMajhul',
        tense: 'madi', voice: 'majhul', person: 'ghaib', starter: true }),
    v({ id: 'nsr-majhul-mud', w: 'يُنْصَرُ', tr: 'yunṣaru', en: 'he is helped', p: 'nsr-I', slot: 'mudariMajhul',
        tense: 'mudari', mood: 'marfu', voice: 'majhul', person: 'ghaib' }),
    n({ id: 'nsr-fail', w: 'نَاصِرٌ', tr: 'nāṣir', en: 'a helper', p: 'nsr-I', slot: 'ismFail',
        ismType: 'ismFail', starter: true }),
    n({ id: 'nsr-maful', w: 'مَنْصُورٌ', tr: 'manṣūr', en: 'one who is helped', p: 'nsr-I', slot: 'ismMaful',
        ismType: 'ismMaful', starter: true }),
    n({ id: 'nsr-masdar', w: 'نَصْرًا', tr: 'naṣran', en: 'helping, victory', p: 'nsr-I', slot: 'masdar',
        ismType: 'masdar' }),

    /* ============ ك ت ب ============ */
    v({ id: 'ktb-madi-3ms', w: 'كَتَبَ', tr: 'kataba', en: 'he wrote', p: 'ktb-I', slot: 'madi',
        tense: 'madi', person: 'ghaib', starter: true }),
    v({ id: 'ktb-madi-2mp', w: 'كَتَبْتُمْ', tr: 'katabtum', en: 'you (m. pl.) wrote', p: 'ktb-I', slot: 'madi',
        tense: 'madi', person: 'mukhatab', number: 'jam' }),
    v({ id: 'ktb-mud-3ms', w: 'يَكْتُبُ', tr: 'yaktubu', en: 'he writes', p: 'ktb-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib', starter: true }),
    v({ id: 'ktb-mud-1s', w: 'أَكْتُبُ', tr: 'aktubu', en: 'I write', p: 'ktb-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'mutakallim', gender: 'any' }),
    v({ id: 'ktb-amr', w: 'اُكْتُبْ', tr: 'uktub', en: 'write!', p: 'ktb-I', slot: 'amr',
        tense: 'amr', person: 'mukhatab' }),
    v({ id: 'ktb-majhul', w: 'كُتِبَ', tr: 'kutiba', en: 'it was written / prescribed', p: 'ktb-I', slot: 'madiMajhul',
        tense: 'madi', voice: 'majhul', person: 'ghaib' }),
    n({ id: 'ktb-fail', w: 'كَاتِبٌ', tr: 'kātib', en: 'a writer', p: 'ktb-I', slot: 'ismFail',
        ismType: 'ismFail', starter: true }),
    n({ id: 'ktb-maful', w: 'مَكْتُوبٌ', tr: 'maktūb', en: 'written, a letter', p: 'ktb-I', slot: 'ismMaful',
        ismType: 'ismMaful' }),
    n({ id: 'ktb-zarf', w: 'مَكْتَبٌ', tr: 'maktab', en: 'a desk, an office', p: 'ktb-I', slot: 'zarf',
        ismType: 'ismZarf', starter: true,
        note: 'مَفْعَل — the place where the action happens.' }),
    n({ id: 'ktb-masdar', w: 'كِتَابَةً', tr: 'kitābatan', en: 'writing', p: 'ktb-I', slot: 'masdar',
        ismType: 'masdar', gender: 'muannath' }),

    /* ============ ض ر ب / ج ل س — bāb ḍaraba ============ */
    v({ id: 'drb-madi', w: 'ضَرَبَ', tr: 'ḍaraba', en: 'he struck', p: 'drb-I', slot: 'madi',
        tense: 'madi', person: 'ghaib', starter: true }),
    v({ id: 'drb-mud-dual', w: 'يَضْرِبَانِ', tr: 'yaḍribāni', en: 'the two of them (m.) strike', p: 'drb-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib', number: 'muthanna' }),
    v({ id: 'drb-amr', w: 'اِضْرِبْ', tr: 'iḍrib', en: 'strike!', p: 'drb-I', slot: 'amr',
        tense: 'amr', person: 'mukhatab' }),
    v({ id: 'drb-majhul', w: 'ضُرِبَ', tr: 'ḍuriba', en: 'he was struck', p: 'drb-I', slot: 'madiMajhul',
        tense: 'madi', voice: 'majhul', person: 'ghaib' }),
    n({ id: 'drb-aalah', w: 'مِضْرَبٌ', tr: 'miḍrab', en: 'a bat, a racket', p: 'drb-I', slot: 'aalah',
        ismType: 'ismAalah', note: 'مِفْعَل with a kasrah on the mīm — the tool of the action.' }),
    v({ id: 'jls-madi-1p', w: 'جَلَسْنَا', tr: 'jalasnā', en: 'we sat', p: 'jls-I', slot: 'madi',
        tense: 'madi', person: 'mutakallim', gender: 'any', number: 'jam' }),
    v({ id: 'jls-mud', w: 'يَجْلِسُ', tr: 'yajlisu', en: 'he sits', p: 'jls-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib' }),
    n({ id: 'jls-zarf', w: 'مَجْلِسٌ', tr: 'majlis', en: 'a sitting place, a council', p: 'jls-I', slot: 'zarf',
        ismType: 'ismZarf', note: 'مَفْعِل — the muḍāriʿ has a kasrah, so the ẓarf takes one too.' }),

    /* ============ ف ت ح / ذ ه ب — bāb fataḥa ============ */
    v({ id: 'fth-madi', w: 'فَتَحَ', tr: 'fataḥa', en: 'he opened', p: 'fth-I', slot: 'madi',
        tense: 'madi', person: 'ghaib', starter: true }),
    v({ id: 'fth-majhul-mud', w: 'يُفْتَحُ', tr: 'yuftaḥu', en: 'it is opened', p: 'fth-I', slot: 'mudariMajhul',
        tense: 'mudari', mood: 'marfu', voice: 'majhul', person: 'ghaib' }),
    v({ id: 'fth-amr-pl', w: 'اِفْتَحُوا', tr: 'iftaḥū', en: 'open! (to a group of men)', p: 'fth-I', slot: 'amr',
        tense: 'amr', person: 'mukhatab', number: 'jam' }),
    n({ id: 'fth-aalah', w: 'مِفْتَاحٌ', tr: 'miftāḥ', en: 'a key', p: 'fth-I', slot: 'aalah',
        ismType: 'ismAalah', starter: true, note: 'مِفْعَال — one of the three ism al-ālah patterns.' }),
    n({ id: 'fth-maful', w: 'مَفْتُوحٌ', tr: 'maftūḥ', en: 'opened', p: 'fth-I', slot: 'ismMaful',
        ismType: 'ismMaful' }),
    v({ id: 'dhhb-madi-3fs', w: 'ذَهَبَتْ', tr: 'dhahabat', en: 'she went', p: 'dhhb-I', slot: 'madi',
        tense: 'madi', person: 'ghaib', gender: 'muannath' }),
    v({ id: 'dhhb-mud-3fp', w: 'يَذْهَبْنَ', tr: 'yadhhabna', en: 'they (f.) go', p: 'dhhb-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib', gender: 'muannath', number: 'jam',
        note: 'The نَ here is nūn al-niswah — a pronoun, so the verb is mabnī, not muʿrab.' }),
    n({ id: 'dhhb-zarf', w: 'مَذْهَبٌ', tr: 'madhhab', en: 'a way of going, a school of thought', p: 'dhhb-I', slot: 'zarf',
        ismType: 'ismZarf' }),

    /* ============ ع ل م / س م ع — bāb ʿalima ============ */
    v({ id: 'alm-madi', w: 'عَلِمَ', tr: 'ʿalima', en: 'he knew', p: 'alm-I', slot: 'madi',
        tense: 'madi', person: 'ghaib', starter: true }),
    v({ id: 'alm-mud-2mp', w: 'تَعْلَمُونَ', tr: 'taʿlamūna', en: 'you (m. pl.) know', p: 'alm-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'mukhatab', number: 'jam' }),
    n({ id: 'alm-fail', w: 'عَالِمٌ', tr: 'ʿālim', en: 'a scholar, one who knows', p: 'alm-I', slot: 'ismFail',
        ismType: 'ismFail', starter: true }),
    n({ id: 'alm-maful', w: 'مَعْلُومٌ', tr: 'maʿlūm', en: 'known', p: 'alm-I', slot: 'ismMaful',
        ismType: 'ismMaful' }),
    n({ id: 'alm-masdar', w: 'عِلْمًا', tr: 'ʿilman', en: 'knowledge', p: 'alm-I', slot: 'masdar',
        ismType: 'masdar' }),
    v({ id: 'sma-madi-1p', w: 'سَمِعْنَا', tr: 'samiʿnā', en: 'we heard', p: 'sma-I', slot: 'madi',
        tense: 'madi', person: 'mutakallim', gender: 'any', number: 'jam' }),
    v({ id: 'sma-amr', w: 'اِسْمَعْ', tr: 'ismaʿ', en: 'listen!', p: 'sma-I', slot: 'amr',
        tense: 'amr', person: 'mukhatab' }),
    n({ id: 'sma-fail', w: 'سَامِعٌ', tr: 'sāmiʿ', en: 'a listener', p: 'sma-I', slot: 'ismFail',
        ismType: 'ismFail' }),

    /* ============ ك ر م / ح س ب ============ */
    v({ id: 'krm-madi', w: 'كَرُمَ', tr: 'karuma', en: 'he was noble / generous', p: 'krm-I', slot: 'madi',
        tense: 'madi', person: 'ghaib',
        note: 'Bāb karuma is always lāzim (intransitive), so it has no majhūl and no ism al-mafʿūl.' }),
    n({ id: 'krm-sifah', w: 'كَرِيمٌ', tr: 'karīm', en: 'noble, generous', p: 'krm-I', slot: 'ismFail',
        ismType: 'sifah', starter: true,
        note: 'From bāb karuma the quality is settled and permanent, so it comes as a ṣifah mushabbahah (فَعِيل) rather than a plain ism al-fāʿil.' }),
    v({ id: 'hsb-mud', w: 'يَحْسِبُ', tr: 'yaḥsibu', en: 'he reckons, he thinks', p: 'hsb-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib',
        note: 'Kasrah in both the māḍī and the muḍāriʿ — the rare sixth bāb.' }),
    n({ id: 'hsb-maful', w: 'مَحْسُوبٌ', tr: 'maḥsūb', en: 'counted, reckoned', p: 'hsb-I', slot: 'ismMaful',
        ismType: 'ismMaful' }),

    /* ============ muḍāʿaf ============ */
    v({ id: 'mdd-madi', w: 'مَدَّ', tr: 'madda', en: 'he stretched out', p: 'mdd-I', slot: 'madi',
        tense: 'madi', person: 'ghaib', starter: true,
        note: 'م د د — the ʿayn and the lām are the same letter, merged into a shaddah.' }),
    v({ id: 'mdd-mud', w: 'يَمُدُّ', tr: 'yamuddu', en: 'he stretches out', p: 'mdd-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib' }),
    v({ id: 'rdd-mud-3mp', w: 'يَرُدُّونَ', tr: 'yaruddūna', en: 'they (m.) give back', p: 'rdd-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib', number: 'jam' }),
    n({ id: 'rdd-maful', w: 'مَرْدُودٌ', tr: 'mardūd', en: 'rejected, returned', p: 'rdd-I', slot: 'ismMaful',
        ismType: 'ismMaful' }),
    v({ id: 'rdd-nahi', w: 'لَا تَرُدَّ', tr: 'lā tarudda', en: 'do not turn (it) away', p: 'rdd-I', slot: 'nahi',
        tense: 'mudari', mood: 'majzum', pol: 'manfi', person: 'mukhatab',
        note: 'The jazm is there, but a doubled verb takes a fatḥah for ease instead of a sukūn.' }),

    /* ============ mahmūz ============ */
    v({ id: 'akhdh-madi', w: 'أَخَذَ', tr: 'akhadha', en: 'he took', p: 'akhdh-I', slot: 'madi',
        tense: 'madi', person: 'ghaib', starter: true }),
    v({ id: 'akhdh-amr', w: 'خُذْ', tr: 'khudh', en: 'take!', p: 'akhdh-I', slot: 'amr',
        tense: 'amr', person: 'mukhatab',
        note: 'The root hamzah is dropped in the amr — خُذْ، كُلْ، مُرْ are the three famous ones.' }),
    n({ id: 'akhdh-maful', w: 'مَأْخُوذٌ', tr: 'maʾkhūdh', en: 'taken', p: 'akhdh-I', slot: 'ismMaful',
        ismType: 'ismMaful' }),

    /* the other two of the three imperatives that lose their hamzah */
    v({ id: 'akl-madi', w: 'أَكَلَ', tr: 'akala', en: 'he ate', p: 'akl-I', slot: 'madi',
        tense: 'madi', person: 'ghaib', starter: true }),
    v({ id: 'akl-mud', w: 'يَأْكُلُ', tr: 'yaʾkulu', en: 'he eats', p: 'akl-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib',
        note: 'The hamzah is still there in the muḍāriʿ, sākinah: يَأْكُلُ. It is only the amr that loses it.' }),
    v({ id: 'akl-amr', w: 'كُلْ', tr: 'kul', en: 'eat!', p: 'akl-I', slot: 'amr',
        tense: 'amr', person: 'mukhatab', starter: true,
        note: 'The pattern gives اُأْكُلْ — a hamzat al-waṣl with a sākinah hamzah behind it, too heavy to say — so both go and كُلْ is what is left. Only كُلْ، خُذْ، مُرْ do this.' }),
    n({ id: 'akl-maful', w: 'مَأْكُولٌ', tr: 'maʾkūl', en: 'eaten', p: 'akl-I', slot: 'ismMaful',
        ismType: 'ismMaful' }),
    v({ id: 'amr-madi', w: 'أَمَرَ', tr: 'amara', en: 'he commanded', p: 'amr-I', slot: 'madi',
        tense: 'madi', person: 'ghaib' }),
    v({ id: 'amr-amr', w: 'مُرْ', tr: 'mur', en: 'command!', p: 'amr-I', slot: 'amr',
        tense: 'amr', person: 'mukhatab',
        note: 'The third of the three. After a وَ or فَ the hamzah often comes back — وَأْمُرْ بِالمَعْرُوفِ.' }),
    v({ id: 'sal-madi', w: 'سَأَلَ', tr: 'saʾala', en: 'he asked', p: 'sal-I', slot: 'madi',
        tense: 'madi', person: 'ghaib' }),
    v({ id: 'sal-mud-3mp', w: 'يَسْأَلُونَ', tr: 'yasʾalūna', en: 'they (m.) ask', p: 'sal-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib', number: 'jam' }),
    v({ id: 'qra-amr', w: 'اِقْرَأْ', tr: 'iqraʾ', en: 'read! recite!', p: 'qra-I', slot: 'amr',
        tense: 'amr', person: 'mukhatab', starter: true }),
    v({ id: 'qra-majhul', w: 'قُرِئَ', tr: 'quriʾa', en: 'it was recited', p: 'qra-I', slot: 'madiMajhul',
        tense: 'madi', voice: 'majhul', person: 'ghaib' }),
    n({ id: 'qra-fail', w: 'قَارِئٌ', tr: 'qāriʾ', en: 'a reader, a reciter', p: 'qra-I', slot: 'ismFail',
        ismType: 'ismFail' }),
    n({ id: 'qra-masdar', w: 'قِرَاءَةً', tr: 'qirāʾatan', en: 'reading, recitation', p: 'qra-I', slot: 'masdar',
        ismType: 'masdar', gender: 'muannath' }),

    /* ============ mithāl ============ */
    v({ id: 'wad-madi', w: 'وَعَدَ', tr: 'waʿada', en: 'he promised', p: 'wad-I', slot: 'madi',
        tense: 'madi', person: 'ghaib', starter: true }),
    v({ id: 'wad-mud', w: 'يَعِدُ', tr: 'yaʿidu', en: 'he promises', p: 'wad-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib',
        note: 'A mithāl wāwī drops its و in the muḍāriʿ: وَعَدَ ← يَعِدُ.' }),
    v({ id: 'wad-amr', w: 'عِدْ', tr: 'ʿid', en: 'promise!', p: 'wad-I', slot: 'amr',
        tense: 'amr', person: 'mukhatab' }),
    n({ id: 'wad-zarf', w: 'مَوْعِدٌ', tr: 'mawʿid', en: 'an appointed time or place', p: 'wad-I', slot: 'zarf',
        ismType: 'ismZarf' }),
    v({ id: 'wsl-mud', w: 'يَصِلُ', tr: 'yaṣilu', en: 'he arrives', p: 'wsl-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib' }),
    v({ id: 'wsl-madi-3fs', w: 'وَصَلَتْ', tr: 'waṣalat', en: 'she arrived', p: 'wsl-I', slot: 'madi',
        tense: 'madi', person: 'ghaib', gender: 'muannath' }),

    /* ============ ajwaf ============ */
    v({ id: 'qwl-madi', w: 'قَالَ', tr: 'qāla', en: 'he said', p: 'qwl-I', slot: 'madi',
        tense: 'madi', person: 'ghaib', starter: true,
        note: 'ق و ل — the wāw in the middle has turned into an alif.' }),
    v({ id: 'qwl-mud', w: 'يَقُولُ', tr: 'yaqūlu', en: 'he says', p: 'qwl-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib', starter: true }),
    v({ id: 'qwl-majhul', w: 'قِيلَ', tr: 'qīla', en: 'it was said', p: 'qwl-I', slot: 'madiMajhul',
        tense: 'madi', voice: 'majhul', person: 'ghaib' }),
    v({ id: 'qwl-amr', w: 'قُلْ', tr: 'qul', en: 'say!', p: 'qwl-I', slot: 'amr',
        tense: 'amr', person: 'mukhatab', starter: true }),
    n({ id: 'qwl-fail', w: 'قَائِلٌ', tr: 'qāʾil', en: 'a speaker, one who says', p: 'qwl-I', slot: 'ismFail',
        ismType: 'ismFail' }),
    v({ id: 'bya-madi', w: 'بَاعَ', tr: 'bāʿa', en: 'he sold', p: 'bya-I', slot: 'madi',
        tense: 'madi', person: 'ghaib' }),
    v({ id: 'bya-mud', w: 'يَبِيعُ', tr: 'yabīʿu', en: 'he sells', p: 'bya-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib' }),
    v({ id: 'bya-amr', w: 'بِعْ', tr: 'biʿ', en: 'sell!', p: 'bya-I', slot: 'amr',
        tense: 'amr', person: 'mukhatab' }),
    n({ id: 'bya-fail', w: 'بَائِعٌ', tr: 'bāʾiʿ', en: 'a seller', p: 'bya-I', slot: 'ismFail',
        ismType: 'ismFail' }),
    v({ id: 'khwf-mud-3mp', w: 'يَخَافُونَ', tr: 'yakhāfūna', en: 'they (m.) fear', p: 'khwf-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib', number: 'jam' }),
    v({ id: 'khwf-amr', w: 'خَفْ', tr: 'khaf', en: 'fear!', p: 'khwf-I', slot: 'amr',
        tense: 'amr', person: 'mukhatab' }),

    /* ============ nāqiṣ ============ */
    v({ id: 'daw-madi', w: 'دَعَا', tr: 'daʿā', en: 'he called, he supplicated', p: 'daw-I', slot: 'madi',
        tense: 'madi', person: 'ghaib', starter: true }),
    v({ id: 'daw-mud', w: 'يَدْعُو', tr: 'yadʿū', en: 'he calls', p: 'daw-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib' }),
    v({ id: 'daw-amr', w: 'اُدْعُ', tr: 'udʿu', en: 'call! supplicate!', p: 'daw-I', slot: 'amr',
        tense: 'amr', person: 'mukhatab',
        note: 'A nāqiṣ verb drops its weak final letter in the amr and the jazm.' }),
    n({ id: 'daw-masdar', w: 'دُعَاءً', tr: 'duʿāʾan', en: 'supplication', p: 'daw-I', slot: 'masdar',
        ismType: 'masdar' }),
    v({ id: 'rmy-madi', w: 'رَمَى', tr: 'ramā', en: 'he threw', p: 'rmy-I', slot: 'madi',
        tense: 'madi', person: 'ghaib' }),
    v({ id: 'rmy-mud', w: 'يَرْمِي', tr: 'yarmī', en: 'he throws', p: 'rmy-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib' }),
    n({ id: 'rmy-maful', w: 'مَرْمِيٌّ', tr: 'marmiyy', en: 'thrown', p: 'rmy-I', slot: 'ismMaful',
        ismType: 'ismMaful' }),
    v({ id: 'nsy-madi', w: 'نَسِيَ', tr: 'nasiya', en: 'he forgot', p: 'nsy-I', slot: 'madi',
        tense: 'madi', person: 'ghaib' }),
    v({ id: 'nsy-nahi', w: 'لَا تَنْسَ', tr: 'lā tansa', en: 'do not forget!', p: 'nsy-I', slot: 'nahi',
        tense: 'mudari', mood: 'majzum', pol: 'manfi', person: 'mukhatab' }),

    /* ============ lafīf ============ */
    v({ id: 'wqy-madi', w: 'وَقَى', tr: 'waqā', en: 'he guarded, he protected', p: 'wqy-I', slot: 'madi',
        tense: 'madi', person: 'ghaib',
        note: 'و ق ي — weak first letter and weak last letter, with a sound letter between them: lafīf mafrūq.' }),
    v({ id: 'wqy-amr', w: 'قِ', tr: 'qi', en: 'guard! protect!', p: 'wqy-I', slot: 'amr',
        tense: 'amr', person: 'mukhatab',
        note: 'Both weak letters fall away and a single letter is left — the shortest imperative in Arabic.' }),
    v({ id: 'twy-madi', w: 'طَوَى', tr: 'ṭawā', en: 'he folded', p: 'twy-I', slot: 'madi',
        tense: 'madi', person: 'ghaib',
        note: 'ط و ي — the two weak letters sit side by side: lafīf maqrūn.' }),
    v({ id: 'twy-mud', w: 'يَطْوِي', tr: 'yaṭwī', en: 'he folds', p: 'twy-I', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib' }),
    n({ id: 'twy-maful', w: 'مَطْوِيٌّ', tr: 'maṭwiyy', en: 'folded', p: 'twy-I', slot: 'ismMaful',
        ismType: 'ismMaful' }),

    /* ============ Form II ============ */
    v({ id: 'alm2-madi', w: 'عَلَّمَ', tr: 'ʿallama', en: 'he taught', p: 'alm-II', slot: 'madi',
        tense: 'madi', person: 'ghaib', starter: true,
        note: 'The shaddah on the ʿayn is the added letter — bāb al-tafʿīl makes a lāzim verb transitive.' }),
    v({ id: 'alm2-mud', w: 'يُعَلِّمُ', tr: 'yuʿallimu', en: 'he teaches', p: 'alm-II', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib' }),
    n({ id: 'alm2-fail', w: 'مُعَلِّمٌ', tr: 'muʿallim', en: 'a teacher', p: 'alm-II', slot: 'ismFail',
        ismType: 'ismFail', starter: true,
        note: 'Every mazīd fīh ism al-fāʿil is its muḍāriʿ with مُـ in place of the tense letter and a kasrah before the last letter.' }),
    n({ id: 'alm2-maful', w: 'مُعَلَّمٌ', tr: 'muʿallam', en: 'one who is taught', p: 'alm-II', slot: 'ismMaful',
        ismType: 'ismMaful' }),
    n({ id: 'alm2-masdar', w: 'تَعْلِيمًا', tr: 'taʿlīman', en: 'teaching', p: 'alm-II', slot: 'masdar',
        ismType: 'masdar' }),
    n({ id: 'nzl2-masdar', w: 'تَنْزِيلًا', tr: 'tanzīlan', en: 'a sending down, revelation', p: 'nzl-II', slot: 'masdar',
        ismType: 'masdar' }),
    v({ id: 'nzl2-madi', w: 'نَزَّلَ', tr: 'nazzala', en: 'he sent down', p: 'nzl-II', slot: 'madi',
        tense: 'madi', person: 'ghaib' }),

    /* ============ Form III ============ */
    v({ id: 'jhd3-madi', w: 'جَاهَدَ', tr: 'jāhada', en: 'he strove', p: 'jhd-III', slot: 'madi',
        tense: 'madi', person: 'ghaib' }),
    v({ id: 'jhd3-mud-3mp', w: 'يُجَاهِدُونَ', tr: 'yujāhidūna', en: 'they (m.) strive', p: 'jhd-III', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib', number: 'jam' }),
    n({ id: 'jhd3-fail', w: 'مُجَاهِدٌ', tr: 'mujāhid', en: 'one who strives', p: 'jhd-III', slot: 'ismFail',
        ismType: 'ismFail', starter: true }),
    n({ id: 'ktb3-masdar', w: 'مُكَاتَبَةً', tr: 'mukātabatan', en: 'corresponding with someone', p: 'ktb-III', slot: 'masdar',
        ismType: 'masdar', gender: 'muannath',
        note: 'Bāb al-mufāʿalah carries the sense of doing the action with another party.' }),

    /* ============ Form IV ============ */
    v({ id: 'slm4-madi', w: 'أَسْلَمَ', tr: 'aslama', en: 'he submitted, he became Muslim', p: 'slm-IV', slot: 'madi',
        tense: 'madi', person: 'ghaib', starter: true }),
    v({ id: 'slm4-mud', w: 'يُسْلِمُ', tr: 'yuslimu', en: 'he submits', p: 'slm-IV', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib' }),
    n({ id: 'slm4-fail', w: 'مُسْلِمٌ', tr: 'muslim', en: 'one who submits, a Muslim', p: 'slm-IV', slot: 'ismFail',
        ismType: 'ismFail', starter: true }),
    n({ id: 'slm4-fail-pl', w: 'مُسْلِمُونَ', tr: 'muslimūna', en: 'Muslims', p: 'slm-IV', slot: 'ismFail',
        ismType: 'ismFail', number: 'jam',
        note: 'The ṣarf ṣaghīr lists the singular مُسْلِمٌ; this is its sound masculine plural.' }),
    n({ id: 'slm4-masdar', w: 'إِسْلَامًا', tr: 'islāman', en: 'submission, Islam', p: 'slm-IV', slot: 'masdar',
        ismType: 'masdar' }),
    v({ id: 'krm4-madi', w: 'أَكْرَمَ', tr: 'akrama', en: 'he honoured', p: 'krm-IV', slot: 'madi',
        tense: 'madi', person: 'ghaib' }),
    n({ id: 'krm4-maful', w: 'مُكْرَمٌ', tr: 'mukram', en: 'one who is honoured', p: 'krm-IV', slot: 'ismMaful',
        ismType: 'ismMaful',
        note: 'Mazīd ism al-mafʿūl differs from the fāʿil by one vowel: fatḥah before the last letter, not kasrah.' }),
    v({ id: 'krm4-amr', w: 'أَكْرِمْ', tr: 'akrim', en: 'honour!', p: 'krm-IV', slot: 'amr',
        tense: 'amr', person: 'mukhatab' }),

    /* ============ Form V / VI ============ */
    v({ id: 'alm5-madi', w: 'تَعَلَّمَ', tr: 'taʿallama', en: 'he learned', p: 'alm-V', slot: 'madi',
        tense: 'madi', person: 'ghaib', starter: true }),
    v({ id: 'alm5-mud', w: 'يَتَعَلَّمُ', tr: 'yataʿallamu', en: 'he learns', p: 'alm-V', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib' }),
    n({ id: 'alm5-fail', w: 'مُتَعَلِّمٌ', tr: 'mutaʿallim', en: 'a learner', p: 'alm-V', slot: 'ismFail',
        ismType: 'ismFail' }),
    v({ id: 'qbl5-amr', w: 'تَقَبَّلْ', tr: 'taqabbal', en: 'accept!', p: 'qbl-V', slot: 'amr',
        tense: 'amr', person: 'mukhatab' }),
    v({ id: 'awn6-madi', w: 'تَعَاوَنَ', tr: 'taʿāwana', en: 'he cooperated', p: 'awn-VI', slot: 'madi',
        tense: 'madi', person: 'ghaib' }),
    v({ id: 'awn6-amr-pl', w: 'تَعَاوَنُوا', tr: 'taʿāwanū', en: 'cooperate! (to a group)', p: 'awn-VI', slot: 'amr',
        tense: 'amr', person: 'mukhatab', number: 'jam' }),

    /* ============ Form VII / VIII / IX / X ============ */
    v({ id: 'ksr7-madi', w: 'اِنْكَسَرَ', tr: 'inkasara', en: 'it was broken, it broke', p: 'ksr-VII', slot: 'madi',
        tense: 'madi', person: 'ghaib' }),
    v({ id: 'ksr7-mud', w: 'يَنْكَسِرُ', tr: 'yankasiru', en: 'it breaks', p: 'ksr-VII', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib',
        note: 'Bāb al-infiʿāl is always lāzim — it carries the effect, so it has no majhūl.' }),
    v({ id: 'jma8-madi', w: 'اِجْتَمَعَ', tr: 'ijtamaʿa', en: 'they gathered together', p: 'jma-VIII', slot: 'madi',
        tense: 'madi', person: 'ghaib' }),
    v({ id: 'jma8-mud-3mp', w: 'يَجْتَمِعُونَ', tr: 'yajtamiʿūna', en: 'they (m.) gather', p: 'jma-VIII', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib', number: 'jam' }),
    n({ id: 'jma8-masdar', w: 'اِجْتِمَاعًا', tr: 'ijtimāʿan', en: 'a gathering, a meeting', p: 'jma-VIII', slot: 'masdar',
        ismType: 'masdar' }),
    n({ id: 'jhd8-fail', w: 'مُجْتَهِدٌ', tr: 'mujtahid', en: 'one who exerts himself, diligent', p: 'jhd-VIII', slot: 'ismFail',
        ismType: 'ismFail', starter: true }),
    v({ id: 'hmr9-madi', w: 'اِحْمَرَّ', tr: 'iḥmarra', en: 'it turned red', p: 'hmr-IX', slot: 'madi',
        tense: 'madi', person: 'ghaib',
        note: 'Bāb al-ifʿilāl is reserved for colours and physical defects.' }),
    v({ id: 'hmr9-mud', w: 'يَحْمَرُّ', tr: 'yaḥmarru', en: 'it turns red', p: 'hmr-IX', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib' }),
    v({ id: 'ghfr10-madi', w: 'اِسْتَغْفَرَ', tr: 'istaghfara', en: 'he sought forgiveness', p: 'ghfr-X', slot: 'madi',
        tense: 'madi', person: 'ghaib', starter: true }),
    v({ id: 'ghfr10-amr', w: 'اِسْتَغْفِرْ', tr: 'istaghfir', en: 'seek forgiveness!', p: 'ghfr-X', slot: 'amr',
        tense: 'amr', person: 'mukhatab' }),
    n({ id: 'ghfr10-masdar', w: 'اِسْتِغْفَارًا', tr: 'istighfāran', en: 'seeking forgiveness', p: 'ghfr-X', slot: 'masdar',
        ismType: 'masdar' }),
    n({ id: 'ghfr10-fail', w: 'مُسْتَغْفِرٌ', tr: 'mustaghfir', en: 'one who seeks forgiveness', p: 'ghfr-X', slot: 'ismFail',
        ismType: 'ismFail' }),
    v({ id: 'khrj10-mud-3mp', w: 'يَسْتَخْرِجُونَ', tr: 'yastakhrijūna', en: 'they (m.) extract', p: 'khrj-X', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib', number: 'jam' }),
    v({ id: 'khrj10-majhul', w: 'اُسْتُخْرِجَ', tr: 'ustukhrija', en: 'it was extracted', p: 'khrj-X', slot: 'madiMajhul',
        tense: 'madi', voice: 'majhul', person: 'ghaib' }),

    /* ============ rubāʿī ============ */
    v({ id: 'dhrj-madi', w: 'دَحْرَجَ', tr: 'daḥraja', en: 'he rolled (something) along', p: 'dhrj-Q', slot: 'madi',
        tense: 'madi', person: 'ghaib', starter: true,
        note: 'Four root letters with nothing added — rubāʿī mujarrad, bāb faʿlala.' }),
    v({ id: 'dhrj-mud', w: 'يُدَحْرِجُ', tr: 'yudaḥriju', en: 'he rolls (something) along', p: 'dhrj-Q', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib' }),
    n({ id: 'dhrj-masdar', w: 'دَحْرَجَةً', tr: 'daḥrajatan', en: 'rolling something along', p: 'dhrj-Q', slot: 'masdar',
        ismType: 'masdar', gender: 'muannath' }),
    v({ id: 'trjm-madi', w: 'تَرْجَمَ', tr: 'tarjama', en: 'he translated', p: 'trjm-Q', slot: 'madi',
        tense: 'madi', person: 'ghaib',
        note: 'The تـ here is a root letter, not an addition — check the root before judging.' }),
    n({ id: 'trjm-fail', w: 'مُتَرْجِمٌ', tr: 'mutarjim', en: 'a translator', p: 'trjm-Q', slot: 'ismFail',
        ismType: 'ismFail' }),
    v({ id: 'dhrj2-madi', w: 'تَدَحْرَجَ', tr: 'tadaḥraja', en: 'it rolled along', p: 'dhrj-QII', slot: 'madi',
        tense: 'madi', person: 'ghaib',
        note: 'Here the تـ is an addition on top of دَحْرَجَ — rubāʿī mazīd fīh.' }),
    v({ id: 'dhrj2-mud', w: 'يَتَدَحْرَجُ', tr: 'yatadaḥraju', en: 'it rolls along', p: 'dhrj-QII', slot: 'mudari',
        tense: 'mudari', mood: 'marfu', person: 'ghaib' }),
    v({ id: 'qshr-madi', w: 'اِقْشَعَرَّ', tr: 'iqshaʿarra', en: 'it shuddered, it got goosebumps', p: 'qshr-QIV', slot: 'madi',
        tense: 'madi', person: 'ghaib' }),

    /* ============ plurals: the sound feminine and the broken ============ */
    n({ id: 'slm4-fail-fpl', w: 'مُسْلِمَاتٌ', tr: 'muslimāt', en: 'Muslim women', p: 'slm-IV', slot: 'ismFail',
        ismType: 'ismFail', gender: 'muannath', number: 'jam',
        note: 'The sound feminine plural ـَاتٌ. Its manṣūb and majrūr both take a kasrah — مُسْلِمَاتٍ — never a fatḥah.' }),
    n({ id: 'alm2-fail-fpl', w: 'مُعَلِّمَاتٌ', tr: 'muʿallimāt', en: 'female teachers', p: 'alm-II', slot: 'ismFail',
        ismType: 'ismFail', gender: 'muannath', number: 'jam' }),
    n({ id: 'alm-fail-pl', w: 'عُلَمَاءُ', tr: 'ʿulamāʾ', en: 'scholars', p: 'alm-I', slot: 'ismFail',
        ismType: 'ismFail', number: 'jam',
        note: 'A broken plural of عَالِمٌ — the word is rebuilt rather than given an ending. Pattern فُعَلَاء, which is also a diptote: no tanwīn, and a fatḥah in place of the kasrah in jarr.' }),
    n({ id: 'jamid-rijal', w: 'رِجَالٌ', tr: 'rijāl', en: 'men', p: null, root: 'ر ج ل',
        ismType: 'jamid', number: 'jam',
        note: 'Broken plural of رَجُلٌ, on the pattern فِعَال.' }),

    /* ============ nouns with no verbal paradigm ============ */
    n({ id: 'jamid-rajul', w: 'رَجُلٌ', tr: 'rajul', en: 'a man', p: null, root: 'ر ج ل',
        ismType: 'jamid', starter: true,
        note: 'A jāmid noun: it is not derived from any verb, so it has no ṣarf ṣaghīr.' }),
    n({ id: 'jamid-bayt', w: 'بَيْتٌ', tr: 'bayt', en: 'a house', p: null, root: 'ب ي ت',
        ismType: 'jamid' }),
    n({ id: 'jamid-shams', w: 'شَمْسٌ', tr: 'shams', en: 'the sun', p: null, root: 'ش م س',
        ismType: 'jamid', gender: 'muannath' }),
    n({ id: 'tafdil-akbar', w: 'أَكْبَرُ', tr: 'akbar', en: 'greater, greatest', p: null, root: 'ك ب ر',
        ismType: 'ismTafdil', starter: true,
        note: 'Pattern أَفْعَل — comparative and superlative both.' }),
    n({ id: 'tafdil-ahsan', w: 'أَحْسَنُ', tr: 'aḥsan', en: 'better, best', p: null, root: 'ح س ن',
        ismType: 'ismTafdil' }),
    n({ id: 'sifah-hasan', w: 'حَسَنٌ', tr: 'ḥasan', en: 'good, handsome', p: null, root: 'ح س ن',
        ismType: 'sifah',
        note: 'A settled quality rather than a passing action — ṣifah mushabbahah.' }),
    n({ id: 'sifah-shujaa', w: 'شُجَاعٌ', tr: 'shujāʿ', en: 'brave', p: null, root: 'ش ج ع',
        ismType: 'sifah' }),

    /* ============ ḥurūf, grouped by what they govern ============
     *
     * A particle is not taken apart the way a verb or a noun is — it has no
     * root and no pattern. What is worth knowing is its ʿamal: what it does to
     * the word after it. So each one carries a harfType, and that is the
     * question the drill asks.
     *
     * Particles whose form is shared between two categories are deliberately
     * left out of the bank and covered on the reference page instead: حَتَّى is
     * jārrah before a noun and nāṣibah before a verb, لِ is all three
     * depending on what follows, and لَا negates or prohibits. Shown on their
     * own with no context, they have no single right answer, so drilling them
     * would be teaching a coin toss.
     */
    h({ id: 'harf-min', w: 'مِنْ', tr: 'min', en: 'from', harfType: 'jarr', starter: true,
        note: 'Ḥarf al-jarr — it gives no complete meaning until it is joined to a noun.' }),
    h({ id: 'harf-fi', w: 'فِي', tr: 'fī', en: 'in', harfType: 'jarr', starter: true }),
    h({ id: 'harf-ila', w: 'إِلَى', tr: 'ilā', en: 'to, towards', harfType: 'jarr' }),
    h({ id: 'harf-an-prep', w: 'عَنْ', tr: 'ʿan', en: 'away from, about', harfType: 'jarr' }),
    h({ id: 'harf-ala', w: 'عَلَى', tr: 'ʿalā', en: 'on, upon', harfType: 'jarr' }),
    h({ id: 'harf-bi', w: 'بِ', tr: 'bi', en: 'with, by, in', harfType: 'jarr',
        note: 'Attaches to the front of the noun it governs: بِسْمِ اللهِ.' }),
    h({ id: 'harf-ka', w: 'كَ', tr: 'ka', en: 'like, as', harfType: 'jarr' }),
    h({ id: 'harf-mundhu', w: 'مُنْذُ', tr: 'mundhu', en: 'since', harfType: 'jarr' }),
    h({ id: 'harf-rubba', w: 'رُبَّ', tr: 'rubba', en: 'many a, how often', harfType: 'jarr' }),

    h({ id: 'harf-an', w: 'أَنْ', tr: 'an', en: 'that (+ subjunctive)', harfType: 'nasb',
        note: 'أَنْ with a sukūn takes the subjunctive; أَنَّ with a shaddah is one of inna’s sisters.' }),
    h({ id: 'harf-lan', w: 'لَنْ', tr: 'lan', en: 'will never', harfType: 'nasb', starter: true,
        note: 'Ḥarf al-naṣb — it makes the muḍāriʿ manṣūb and negates the future.' }),
    h({ id: 'harf-kay', w: 'كَيْ', tr: 'kay', en: 'in order that', harfType: 'nasb' }),
    h({ id: 'harf-idhan', w: 'إِذَنْ', tr: 'idhan', en: 'in that case, then', harfType: 'nasb' }),

    h({ id: 'harf-lam', w: 'لَمْ', tr: 'lam', en: 'did not', harfType: 'jazm', starter: true,
        note: 'Ḥarf al-jazm — it makes the muḍāriʿ majzūm and turns it into the past.' }),
    h({ id: 'harf-lamma', w: 'لَمَّا', tr: 'lammā', en: 'not yet', harfType: 'jazm' }),
    h({ id: 'harf-in', w: 'إِنْ', tr: 'in', en: 'if (conditional)', harfType: 'jazm',
        note: 'إِنْ with a sukūn is the conditional and takes the jussive — twice over, in the condition and the answer.' }),

    h({ id: 'harf-inna', w: 'إِنَّ', tr: 'inna', en: 'indeed, verily', harfType: 'mushabbahah', starter: true,
        note: 'Its noun goes into naṣb and its predicate stays in rafʿ: إِنَّ اللهَ غَفُورٌ.' }),
    h({ id: 'harf-anna', w: 'أَنَّ', tr: 'anna', en: 'that', harfType: 'mushabbahah' }),
    h({ id: 'harf-kaanna', w: 'كَأَنَّ', tr: 'kaʾanna', en: 'as though', harfType: 'mushabbahah' }),
    h({ id: 'harf-lakinna', w: 'لَكِنَّ', tr: 'lākinna', en: 'but, however', harfType: 'mushabbahah' }),
    h({ id: 'harf-layta', w: 'لَيْتَ', tr: 'layta', en: 'if only, would that', harfType: 'mushabbahah' }),
    h({ id: 'harf-laalla', w: 'لَعَلَّ', tr: 'laʿalla', en: 'perhaps, so that', harfType: 'mushabbahah' }),

    h({ id: 'harf-wa', w: 'وَ', tr: 'wa', en: 'and', harfType: 'atf', starter: true }),
    h({ id: 'harf-fa', w: 'فَ', tr: 'fa', en: 'so, and then', harfType: 'atf',
        note: 'Like وَ but it puts the two in order — one thing straight after the other.' }),
    h({ id: 'harf-thumma', w: 'ثُمَّ', tr: 'thumma', en: 'then, afterwards', harfType: 'atf' }),
    h({ id: 'harf-aw', w: 'أَوْ', tr: 'aw', en: 'or', harfType: 'atf' }),
    h({ id: 'harf-bal', w: 'بَلْ', tr: 'bal', en: 'rather, on the contrary', harfType: 'atf' }),
    h({ id: 'harf-am', w: 'أَمْ', tr: 'am', en: 'or (in a question)', harfType: 'atf' }),

    h({ id: 'harf-ya', w: 'يَا', tr: 'yā', en: 'O! (calling someone)', harfType: 'nida', starter: true }),

    h({ id: 'harf-qad', w: 'قَدْ', tr: 'qad', en: 'indeed, already', harfType: 'muhmal', starter: true,
        note: 'With the māḍī it means the thing certainly happened; with the muḍāriʿ it weakens to "sometimes". It changes nothing in the iʿrāb.' }),
    h({ id: 'harf-sawfa', w: 'سَوْفَ', tr: 'sawfa', en: 'shall, will', harfType: 'muhmal',
        note: 'Pushes the muḍāriʿ into the future without touching its ending.' }),
    h({ id: 'harf-hal', w: 'هَلْ', tr: 'hal', en: 'is/does…? (question particle)', harfType: 'muhmal' }),
    h({ id: 'harf-naam', w: 'نَعَمْ', tr: 'naʿam', en: 'yes', harfType: 'muhmal' }),
    h({ id: 'harf-bala', w: 'بَلَى', tr: 'balā', en: 'yes indeed (answering a negative)', harfType: 'muhmal',
        note: 'Used only to contradict a negative question — أَلَسْتُ بِرَبِّكُمْ؟ قَالُوا بَلَى.' })
  ];

  MP.words = words;
})(typeof window !== 'undefined' ? window : globalThis);
