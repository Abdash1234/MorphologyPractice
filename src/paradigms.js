/*
 * paradigms.js — the ṣarf ṣaghīr table for every root/bāb used in the bank.
 *
 * Each entry holds the eleven cells recited in the ṣarf ṣaghīr:
 *   نَصَرَ يَنْصُرُ نَصْرًا، نُصِرَ يُنْصَرُ، فَهُوَ نَاصِرٌ وَذَاكَ مَنْصُورٌ،
 *   اُنْصُرْ، لَا تَنْصُرْ، مَنْصَرٌ، مِنْصَرٌ
 *
 * '—' means the cell is not used for that verb (an intransitive verb has no
 * passive or ism al-mafʿūl, most verbs have no ism al-ālah, and so on).
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});
  const X = '—';

  const paradigms = {
    /* ===================== thulāthī mujarrad ===================== */
    'nsr-I': {
      root: 'ن ص ر', baabId: 'nasara', meaning: 'to help',
      madi: 'نَصَرَ', mudari: 'يَنْصُرُ', masdar: 'نَصْرًا',
      madiMajhul: 'نُصِرَ', mudariMajhul: 'يُنْصَرُ',
      ismFail: 'نَاصِرٌ', ismMaful: 'مَنْصُورٌ',
      amr: 'اُنْصُرْ', nahi: 'لَا تَنْصُرْ', zarf: 'مَنْصَرٌ', aalah: 'مِنْصَرٌ'
    },
    'ktb-I': {
      root: 'ك ت ب', baabId: 'nasara', meaning: 'to write',
      madi: 'كَتَبَ', mudari: 'يَكْتُبُ', masdar: 'كِتَابَةً',
      madiMajhul: 'كُتِبَ', mudariMajhul: 'يُكْتَبُ',
      ismFail: 'كَاتِبٌ', ismMaful: 'مَكْتُوبٌ',
      amr: 'اُكْتُبْ', nahi: 'لَا تَكْتُبْ', zarf: 'مَكْتَبٌ', aalah: X
    },
    'drb-I': {
      root: 'ض ر ب', baabId: 'daraba', meaning: 'to strike',
      madi: 'ضَرَبَ', mudari: 'يَضْرِبُ', masdar: 'ضَرْبًا',
      madiMajhul: 'ضُرِبَ', mudariMajhul: 'يُضْرَبُ',
      ismFail: 'ضَارِبٌ', ismMaful: 'مَضْرُوبٌ',
      amr: 'اِضْرِبْ', nahi: 'لَا تَضْرِبْ', zarf: 'مَضْرِبٌ', aalah: 'مِضْرَبٌ'
    },
    'jls-I': {
      root: 'ج ل س', baabId: 'daraba', meaning: 'to sit',
      madi: 'جَلَسَ', mudari: 'يَجْلِسُ', masdar: 'جُلُوسًا',
      madiMajhul: X, mudariMajhul: X,
      ismFail: 'جَالِسٌ', ismMaful: X,
      amr: 'اِجْلِسْ', nahi: 'لَا تَجْلِسْ', zarf: 'مَجْلِسٌ', aalah: X
    },
    'fth-I': {
      root: 'ف ت ح', baabId: 'fataha', meaning: 'to open',
      madi: 'فَتَحَ', mudari: 'يَفْتَحُ', masdar: 'فَتْحًا',
      madiMajhul: 'فُتِحَ', mudariMajhul: 'يُفْتَحُ',
      ismFail: 'فَاتِحٌ', ismMaful: 'مَفْتُوحٌ',
      amr: 'اِفْتَحْ', nahi: 'لَا تَفْتَحْ', zarf: 'مَفْتَحٌ', aalah: 'مِفْتَاحٌ'
    },
    'dhhb-I': {
      root: 'ذ ه ب', baabId: 'fataha', meaning: 'to go',
      madi: 'ذَهَبَ', mudari: 'يَذْهَبُ', masdar: 'ذَهَابًا',
      madiMajhul: X, mudariMajhul: X,
      ismFail: 'ذَاهِبٌ', ismMaful: X,
      amr: 'اِذْهَبْ', nahi: 'لَا تَذْهَبْ', zarf: 'مَذْهَبٌ', aalah: X
    },
    'alm-I': {
      root: 'ع ل م', baabId: 'alima', meaning: 'to know',
      madi: 'عَلِمَ', mudari: 'يَعْلَمُ', masdar: 'عِلْمًا',
      madiMajhul: 'عُلِمَ', mudariMajhul: 'يُعْلَمُ',
      ismFail: 'عَالِمٌ', ismMaful: 'مَعْلُومٌ',
      amr: 'اِعْلَمْ', nahi: 'لَا تَعْلَمْ', zarf: 'مَعْلَمٌ', aalah: X
    },
    'sma-I': {
      root: 'س م ع', baabId: 'alima', meaning: 'to hear',
      madi: 'سَمِعَ', mudari: 'يَسْمَعُ', masdar: 'سَمْعًا',
      madiMajhul: 'سُمِعَ', mudariMajhul: 'يُسْمَعُ',
      ismFail: 'سَامِعٌ', ismMaful: 'مَسْمُوعٌ',
      amr: 'اِسْمَعْ', nahi: 'لَا تَسْمَعْ', zarf: 'مَسْمَعٌ', aalah: 'مِسْمَعٌ'
    },
    'krm-I': {
      root: 'ك ر م', baabId: 'karuma', meaning: 'to be noble',
      madi: 'كَرُمَ', mudari: 'يَكْرُمُ', masdar: 'كَرَمًا',
      madiMajhul: X, mudariMajhul: X,
      ismFail: 'كَرِيمٌ', ismMaful: X,
      amr: 'اُكْرُمْ', nahi: 'لَا تَكْرُمْ', zarf: 'مَكْرَمٌ', aalah: X
    },
    'hsb-I': {
      root: 'ح س ب', baabId: 'hasiba', meaning: 'to reckon, to think',
      madi: 'حَسِبَ', mudari: 'يَحْسِبُ', masdar: 'حِسْبَانًا',
      madiMajhul: 'حُسِبَ', mudariMajhul: 'يُحْسَبُ',
      ismFail: 'حَاسِبٌ', ismMaful: 'مَحْسُوبٌ',
      amr: 'اِحْسِبْ', nahi: 'لَا تَحْسِبْ', zarf: 'مَحْسِبٌ', aalah: X
    },

    /* ===================== ṣaḥīḥ: muḍāʿaf & mahmūz ===================== */
    'mdd-I': {
      root: 'م د د', baabId: 'nasara', meaning: 'to stretch out, extend',
      madi: 'مَدَّ', mudari: 'يَمُدُّ', masdar: 'مَدًّا',
      madiMajhul: 'مُدَّ', mudariMajhul: 'يُمَدُّ',
      ismFail: 'مَادٌّ', ismMaful: 'مَمْدُودٌ',
      amr: 'مُدَّ', nahi: 'لَا تَمُدَّ', zarf: 'مَمَدٌّ', aalah: X
    },
    'rdd-I': {
      root: 'ر د د', baabId: 'nasara', meaning: 'to return, give back',
      madi: 'رَدَّ', mudari: 'يَرُدُّ', masdar: 'رَدًّا',
      madiMajhul: 'رُدَّ', mudariMajhul: 'يُرَدُّ',
      ismFail: 'رَادٌّ', ismMaful: 'مَرْدُودٌ',
      amr: 'رُدَّ', nahi: 'لَا تَرُدَّ', zarf: 'مَرَدٌّ', aalah: X
    },
    'akhdh-I': {
      root: 'أ خ ذ', baabId: 'nasara', meaning: 'to take',
      madi: 'أَخَذَ', mudari: 'يَأْخُذُ', masdar: 'أَخْذًا',
      madiMajhul: 'أُخِذَ', mudariMajhul: 'يُؤْخَذُ',
      ismFail: 'آخِذٌ', ismMaful: 'مَأْخُوذٌ',
      amr: 'خُذْ', nahi: 'لَا تَأْخُذْ', zarf: 'مَأْخَذٌ', aalah: X
    },
    'sal-I': {
      root: 'س أ ل', baabId: 'fataha', meaning: 'to ask',
      madi: 'سَأَلَ', mudari: 'يَسْأَلُ', masdar: 'سُؤَالًا',
      madiMajhul: 'سُئِلَ', mudariMajhul: 'يُسْأَلُ',
      ismFail: 'سَائِلٌ', ismMaful: 'مَسْؤُولٌ',
      amr: 'اِسْأَلْ', nahi: 'لَا تَسْأَلْ', zarf: X, aalah: X
    },
    'qra-I': {
      root: 'ق ر أ', baabId: 'fataha', meaning: 'to read, recite',
      madi: 'قَرَأَ', mudari: 'يَقْرَأُ', masdar: 'قِرَاءَةً',
      madiMajhul: 'قُرِئَ', mudariMajhul: 'يُقْرَأُ',
      ismFail: 'قَارِئٌ', ismMaful: 'مَقْرُوءٌ',
      amr: 'اِقْرَأْ', nahi: 'لَا تَقْرَأْ', zarf: 'مَقْرَأٌ', aalah: X
    },

    /* ===================== muʿtall ===================== */
    'wad-I': {
      root: 'و ع د', baabId: 'daraba', meaning: 'to promise',
      madi: 'وَعَدَ', mudari: 'يَعِدُ', masdar: 'وَعْدًا',
      madiMajhul: 'وُعِدَ', mudariMajhul: 'يُوعَدُ',
      ismFail: 'وَاعِدٌ', ismMaful: 'مَوْعُودٌ',
      amr: 'عِدْ', nahi: 'لَا تَعِدْ', zarf: 'مَوْعِدٌ', aalah: X
    },
    'wsl-I': {
      root: 'و ص ل', baabId: 'daraba', meaning: 'to arrive, reach',
      madi: 'وَصَلَ', mudari: 'يَصِلُ', masdar: 'وُصُولًا',
      madiMajhul: 'وُصِلَ', mudariMajhul: 'يُوصَلُ',
      ismFail: 'وَاصِلٌ', ismMaful: 'مَوْصُولٌ',
      amr: 'صِلْ', nahi: 'لَا تَصِلْ', zarf: 'مَوْصِلٌ', aalah: X
    },
    'qwl-I': {
      root: 'ق و ل', baabId: 'nasara', meaning: 'to say',
      madi: 'قَالَ', mudari: 'يَقُولُ', masdar: 'قَوْلًا',
      madiMajhul: 'قِيلَ', mudariMajhul: 'يُقَالُ',
      ismFail: 'قَائِلٌ', ismMaful: 'مَقُولٌ',
      amr: 'قُلْ', nahi: 'لَا تَقُلْ', zarf: 'مَقَالٌ', aalah: 'مِقْوَلٌ'
    },
    'bya-I': {
      root: 'ب ي ع', baabId: 'daraba', meaning: 'to sell',
      madi: 'بَاعَ', mudari: 'يَبِيعُ', masdar: 'بَيْعًا',
      madiMajhul: 'بِيعَ', mudariMajhul: 'يُبَاعُ',
      ismFail: 'بَائِعٌ', ismMaful: 'مَبِيعٌ',
      amr: 'بِعْ', nahi: 'لَا تَبِعْ', zarf: 'مَبَاعٌ', aalah: X
    },
    'khwf-I': {
      root: 'خ و ف', baabId: 'alima', meaning: 'to fear',
      madi: 'خَافَ', mudari: 'يَخَافُ', masdar: 'خَوْفًا',
      madiMajhul: X, mudariMajhul: X,
      ismFail: 'خَائِفٌ', ismMaful: 'مَخُوفٌ',
      amr: 'خَفْ', nahi: 'لَا تَخَفْ', zarf: 'مَخَافَةٌ', aalah: X
    },
    'daw-I': {
      root: 'د ع و', baabId: 'nasara', meaning: 'to call, supplicate',
      madi: 'دَعَا', mudari: 'يَدْعُو', masdar: 'دُعَاءً',
      madiMajhul: 'دُعِيَ', mudariMajhul: 'يُدْعَى',
      ismFail: 'دَاعٍ', ismMaful: 'مَدْعُوٌّ',
      amr: 'اُدْعُ', nahi: 'لَا تَدْعُ', zarf: 'مَدْعًى', aalah: X
    },
    'rmy-I': {
      root: 'ر م ي', baabId: 'daraba', meaning: 'to throw',
      madi: 'رَمَى', mudari: 'يَرْمِي', masdar: 'رَمْيًا',
      madiMajhul: 'رُمِيَ', mudariMajhul: 'يُرْمَى',
      ismFail: 'رَامٍ', ismMaful: 'مَرْمِيٌّ',
      amr: 'اِرْمِ', nahi: 'لَا تَرْمِ', zarf: 'مَرْمًى', aalah: X
    },
    'nsy-I': {
      root: 'ن س ي', baabId: 'alima', meaning: 'to forget',
      madi: 'نَسِيَ', mudari: 'يَنْسَى', masdar: 'نِسْيَانًا',
      madiMajhul: 'نُسِيَ', mudariMajhul: 'يُنْسَى',
      ismFail: 'نَاسٍ', ismMaful: 'مَنْسِيٌّ',
      amr: 'اِنْسَ', nahi: 'لَا تَنْسَ', zarf: 'مَنْسًى', aalah: X
    },
    'wqy-I': {
      root: 'و ق ي', baabId: 'daraba', meaning: 'to guard, protect',
      madi: 'وَقَى', mudari: 'يَقِي', masdar: 'وِقَايَةً',
      madiMajhul: 'وُقِيَ', mudariMajhul: 'يُوقَى',
      ismFail: 'وَاقٍ', ismMaful: 'مَوْقِيٌّ',
      amr: 'قِ', nahi: 'لَا تَقِ', zarf: X, aalah: X
    },
    'twy-I': {
      root: 'ط و ي', baabId: 'daraba', meaning: 'to fold, roll up',
      madi: 'طَوَى', mudari: 'يَطْوِي', masdar: 'طَيًّا',
      madiMajhul: 'طُوِيَ', mudariMajhul: 'يُطْوَى',
      ismFail: 'طَاوٍ', ismMaful: 'مَطْوِيٌّ',
      amr: 'اِطْوِ', nahi: 'لَا تَطْوِ', zarf: 'مَطْوًى', aalah: X
    },

    /* ===================== thulāthī mazīd fīh ===================== */
    'alm-II': {
      root: 'ع ل م', baabId: 'II', meaning: 'to teach',
      madi: 'عَلَّمَ', mudari: 'يُعَلِّمُ', masdar: 'تَعْلِيمًا',
      madiMajhul: 'عُلِّمَ', mudariMajhul: 'يُعَلَّمُ',
      ismFail: 'مُعَلِّمٌ', ismMaful: 'مُعَلَّمٌ',
      amr: 'عَلِّمْ', nahi: 'لَا تُعَلِّمْ', zarf: X, aalah: X
    },
    'nzl-II': {
      root: 'ن ز ل', baabId: 'II', meaning: 'to send down',
      madi: 'نَزَّلَ', mudari: 'يُنَزِّلُ', masdar: 'تَنْزِيلًا',
      madiMajhul: 'نُزِّلَ', mudariMajhul: 'يُنَزَّلُ',
      ismFail: 'مُنَزِّلٌ', ismMaful: 'مُنَزَّلٌ',
      amr: 'نَزِّلْ', nahi: 'لَا تُنَزِّلْ', zarf: X, aalah: X
    },
    'jhd-III': {
      root: 'ج ه د', baabId: 'III', meaning: 'to strive, struggle',
      madi: 'جَاهَدَ', mudari: 'يُجَاهِدُ', masdar: 'مُجَاهَدَةً وَجِهَادًا',
      madiMajhul: 'جُوهِدَ', mudariMajhul: 'يُجَاهَدُ',
      ismFail: 'مُجَاهِدٌ', ismMaful: 'مُجَاهَدٌ',
      amr: 'جَاهِدْ', nahi: 'لَا تُجَاهِدْ', zarf: X, aalah: X
    },
    'ktb-III': {
      root: 'ك ت ب', baabId: 'III', meaning: 'to correspond with',
      madi: 'كَاتَبَ', mudari: 'يُكَاتِبُ', masdar: 'مُكَاتَبَةً وَكِتَابًا',
      madiMajhul: 'كُوتِبَ', mudariMajhul: 'يُكَاتَبُ',
      ismFail: 'مُكَاتِبٌ', ismMaful: 'مُكَاتَبٌ',
      amr: 'كَاتِبْ', nahi: 'لَا تُكَاتِبْ', zarf: X, aalah: X
    },
    'slm-IV': {
      root: 'س ل م', baabId: 'IV', meaning: 'to submit, become Muslim',
      madi: 'أَسْلَمَ', mudari: 'يُسْلِمُ', masdar: 'إِسْلَامًا',
      madiMajhul: 'أُسْلِمَ', mudariMajhul: 'يُسْلَمُ',
      ismFail: 'مُسْلِمٌ', ismMaful: 'مُسْلَمٌ',
      amr: 'أَسْلِمْ', nahi: 'لَا تُسْلِمْ', zarf: X, aalah: X
    },
    'krm-IV': {
      root: 'ك ر م', baabId: 'IV', meaning: 'to honour, treat generously',
      madi: 'أَكْرَمَ', mudari: 'يُكْرِمُ', masdar: 'إِكْرَامًا',
      madiMajhul: 'أُكْرِمَ', mudariMajhul: 'يُكْرَمُ',
      ismFail: 'مُكْرِمٌ', ismMaful: 'مُكْرَمٌ',
      amr: 'أَكْرِمْ', nahi: 'لَا تُكْرِمْ', zarf: X, aalah: X
    },
    'alm-V': {
      root: 'ع ل م', baabId: 'V', meaning: 'to learn',
      madi: 'تَعَلَّمَ', mudari: 'يَتَعَلَّمُ', masdar: 'تَعَلُّمًا',
      madiMajhul: 'تُعُلِّمَ', mudariMajhul: 'يُتَعَلَّمُ',
      ismFail: 'مُتَعَلِّمٌ', ismMaful: 'مُتَعَلَّمٌ',
      amr: 'تَعَلَّمْ', nahi: 'لَا تَتَعَلَّمْ', zarf: X, aalah: X
    },
    'qbl-V': {
      root: 'ق ب ل', baabId: 'V', meaning: 'to accept',
      madi: 'تَقَبَّلَ', mudari: 'يَتَقَبَّلُ', masdar: 'تَقَبُّلًا',
      madiMajhul: 'تُقُبِّلَ', mudariMajhul: 'يُتَقَبَّلُ',
      ismFail: 'مُتَقَبِّلٌ', ismMaful: 'مُتَقَبَّلٌ',
      amr: 'تَقَبَّلْ', nahi: 'لَا تَتَقَبَّلْ', zarf: X, aalah: X
    },
    'awn-VI': {
      root: 'ع و ن', baabId: 'VI', meaning: 'to cooperate',
      madi: 'تَعَاوَنَ', mudari: 'يَتَعَاوَنُ', masdar: 'تَعَاوُنًا',
      madiMajhul: X, mudariMajhul: X,
      ismFail: 'مُتَعَاوِنٌ', ismMaful: X,
      amr: 'تَعَاوَنْ', nahi: 'لَا تَتَعَاوَنْ', zarf: X, aalah: X
    },
    'ksr-VII': {
      root: 'ك س ر', baabId: 'VII', meaning: 'to be broken',
      madi: 'اِنْكَسَرَ', mudari: 'يَنْكَسِرُ', masdar: 'اِنْكِسَارًا',
      madiMajhul: X, mudariMajhul: X,
      ismFail: 'مُنْكَسِرٌ', ismMaful: X,
      amr: 'اِنْكَسِرْ', nahi: 'لَا تَنْكَسِرْ', zarf: X, aalah: X
    },
    'jma-VIII': {
      root: 'ج م ع', baabId: 'VIII', meaning: 'to gather, assemble',
      madi: 'اِجْتَمَعَ', mudari: 'يَجْتَمِعُ', masdar: 'اِجْتِمَاعًا',
      madiMajhul: X, mudariMajhul: X,
      ismFail: 'مُجْتَمِعٌ', ismMaful: X,
      amr: 'اِجْتَمِعْ', nahi: 'لَا تَجْتَمِعْ', zarf: 'مُجْتَمَعٌ', aalah: X
    },
    'jhd-VIII': {
      root: 'ج ه د', baabId: 'VIII', meaning: 'to exert oneself',
      madi: 'اِجْتَهَدَ', mudari: 'يَجْتَهِدُ', masdar: 'اِجْتِهَادًا',
      madiMajhul: X, mudariMajhul: X,
      ismFail: 'مُجْتَهِدٌ', ismMaful: X,
      amr: 'اِجْتَهِدْ', nahi: 'لَا تَجْتَهِدْ', zarf: X, aalah: X
    },
    'hmr-IX': {
      root: 'ح م ر', baabId: 'IX', meaning: 'to become red',
      madi: 'اِحْمَرَّ', mudari: 'يَحْمَرُّ', masdar: 'اِحْمِرَارًا',
      madiMajhul: X, mudariMajhul: X,
      ismFail: 'مُحْمَرٌّ', ismMaful: X,
      amr: 'اِحْمَرَّ', nahi: 'لَا تَحْمَرَّ', zarf: X, aalah: X
    },
    'ghfr-X': {
      root: 'غ ف ر', baabId: 'X', meaning: 'to seek forgiveness',
      madi: 'اِسْتَغْفَرَ', mudari: 'يَسْتَغْفِرُ', masdar: 'اِسْتِغْفَارًا',
      madiMajhul: 'اُسْتُغْفِرَ', mudariMajhul: 'يُسْتَغْفَرُ',
      ismFail: 'مُسْتَغْفِرٌ', ismMaful: 'مُسْتَغْفَرٌ',
      amr: 'اِسْتَغْفِرْ', nahi: 'لَا تَسْتَغْفِرْ', zarf: X, aalah: X
    },
    'khrj-X': {
      root: 'خ ر ج', baabId: 'X', meaning: 'to extract',
      madi: 'اِسْتَخْرَجَ', mudari: 'يَسْتَخْرِجُ', masdar: 'اِسْتِخْرَاجًا',
      madiMajhul: 'اُسْتُخْرِجَ', mudariMajhul: 'يُسْتَخْرَجُ',
      ismFail: 'مُسْتَخْرِجٌ', ismMaful: 'مُسْتَخْرَجٌ',
      amr: 'اِسْتَخْرِجْ', nahi: 'لَا تَسْتَخْرِجْ', zarf: X, aalah: X
    },

    /* ===================== rubāʿī ===================== */
    'dhrj-Q': {
      root: 'د ح ر ج', baabId: 'falala', meaning: 'to roll something along',
      madi: 'دَحْرَجَ', mudari: 'يُدَحْرِجُ', masdar: 'دَحْرَجَةً',
      madiMajhul: 'دُحْرِجَ', mudariMajhul: 'يُدَحْرَجُ',
      ismFail: 'مُدَحْرِجٌ', ismMaful: 'مُدَحْرَجٌ',
      amr: 'دَحْرِجْ', nahi: 'لَا تُدَحْرِجْ', zarf: X, aalah: X
    },
    'trjm-Q': {
      root: 'ت ر ج م', baabId: 'falala', meaning: 'to translate',
      madi: 'تَرْجَمَ', mudari: 'يُتَرْجِمُ', masdar: 'تَرْجَمَةً',
      madiMajhul: 'تُرْجِمَ', mudariMajhul: 'يُتَرْجَمُ',
      ismFail: 'مُتَرْجِمٌ', ismMaful: 'مُتَرْجَمٌ',
      amr: 'تَرْجِمْ', nahi: 'لَا تُتَرْجِمْ', zarf: X, aalah: X
    },
    'dhrj-QII': {
      root: 'د ح ر ج', baabId: 'tafalala', meaning: 'to roll along (by itself)',
      madi: 'تَدَحْرَجَ', mudari: 'يَتَدَحْرَجُ', masdar: 'تَدَحْرُجًا',
      madiMajhul: X, mudariMajhul: X,
      ismFail: 'مُتَدَحْرِجٌ', ismMaful: X,
      amr: 'تَدَحْرَجْ', nahi: 'لَا تَتَدَحْرَجْ', zarf: X, aalah: X
    },
    'qshr-QIV': {
      root: 'ق ش ع ر', baabId: 'ifalalla', meaning: 'to shudder, get goosebumps',
      madi: 'اِقْشَعَرَّ', mudari: 'يَقْشَعِرُّ', masdar: 'اِقْشِعْرَارًا',
      madiMajhul: X, mudariMajhul: X,
      ismFail: 'مُقْشَعِرٌّ', ismMaful: X,
      amr: 'اِقْشَعِرَّ', nahi: 'لَا تَقْشَعِرَّ', zarf: X, aalah: X
    }
  };

  /*
   * The structural facts that belong to the root + bāb rather than to any one
   * word built from it:
   *   [ letters, augmentation, soundness, sub-type, (hamzah position) ]
   */
  const structures = {
    'nsr-I': ['thulathi', 'mujarrad', 'sahih', 'salim'],
    'ktb-I': ['thulathi', 'mujarrad', 'sahih', 'salim'],
    'drb-I': ['thulathi', 'mujarrad', 'sahih', 'salim'],
    'jls-I': ['thulathi', 'mujarrad', 'sahih', 'salim'],
    'fth-I': ['thulathi', 'mujarrad', 'sahih', 'salim'],
    'dhhb-I': ['thulathi', 'mujarrad', 'sahih', 'salim'],
    'alm-I': ['thulathi', 'mujarrad', 'sahih', 'salim'],
    'sma-I': ['thulathi', 'mujarrad', 'sahih', 'salim'],
    'krm-I': ['thulathi', 'mujarrad', 'sahih', 'salim'],
    'hsb-I': ['thulathi', 'mujarrad', 'sahih', 'salim'],

    'mdd-I': ['thulathi', 'mujarrad', 'sahih', 'mudaaf'],
    'rdd-I': ['thulathi', 'mujarrad', 'sahih', 'mudaaf'],
    'akhdh-I': ['thulathi', 'mujarrad', 'sahih', 'mahmuz', 'fa'],
    'sal-I': ['thulathi', 'mujarrad', 'sahih', 'mahmuz', 'ayn'],
    'qra-I': ['thulathi', 'mujarrad', 'sahih', 'mahmuz', 'lam'],

    'wad-I': ['thulathi', 'mujarrad', 'mutal', 'mithal'],
    'wsl-I': ['thulathi', 'mujarrad', 'mutal', 'mithal'],
    'qwl-I': ['thulathi', 'mujarrad', 'mutal', 'ajwaf'],
    'bya-I': ['thulathi', 'mujarrad', 'mutal', 'ajwaf'],
    'khwf-I': ['thulathi', 'mujarrad', 'mutal', 'ajwaf'],
    'daw-I': ['thulathi', 'mujarrad', 'mutal', 'naqis'],
    'rmy-I': ['thulathi', 'mujarrad', 'mutal', 'naqis'],
    'nsy-I': ['thulathi', 'mujarrad', 'mutal', 'naqis'],
    'wqy-I': ['thulathi', 'mujarrad', 'mutal', 'lafifMafruq'],
    'twy-I': ['thulathi', 'mujarrad', 'mutal', 'lafifMaqrun'],

    'alm-II': ['thulathi', 'mazeed', 'sahih', 'salim'],
    'nzl-II': ['thulathi', 'mazeed', 'sahih', 'salim'],
    'jhd-III': ['thulathi', 'mazeed', 'sahih', 'salim'],
    'ktb-III': ['thulathi', 'mazeed', 'sahih', 'salim'],
    'slm-IV': ['thulathi', 'mazeed', 'sahih', 'salim'],
    'krm-IV': ['thulathi', 'mazeed', 'sahih', 'salim'],
    'alm-V': ['thulathi', 'mazeed', 'sahih', 'salim'],
    'qbl-V': ['thulathi', 'mazeed', 'sahih', 'salim'],
    'awn-VI': ['thulathi', 'mazeed', 'mutal', 'ajwaf'],
    'ksr-VII': ['thulathi', 'mazeed', 'sahih', 'salim'],
    'jma-VIII': ['thulathi', 'mazeed', 'sahih', 'salim'],
    'jhd-VIII': ['thulathi', 'mazeed', 'sahih', 'salim'],
    'hmr-IX': ['thulathi', 'mazeed', 'sahih', 'salim'],
    'ghfr-X': ['thulathi', 'mazeed', 'sahih', 'salim'],
    'khrj-X': ['thulathi', 'mazeed', 'sahih', 'salim'],

    'dhrj-Q': ['rubai', 'mujarrad', 'sahih', 'salim'],
    'trjm-Q': ['rubai', 'mujarrad', 'sahih', 'salim'],
    'dhrj-QII': ['rubai', 'mazeed', 'sahih', 'salim'],
    'qshr-QIV': ['rubai', 'mazeed', 'sahih', 'salim']
  };

  Object.keys(paradigms).forEach(function (id) {
    const s = structures[id];
    if (!s) return;
    const p = paradigms[id];
    p.id = id;
    p.letters = s[0];
    p.augmentation = s[1];
    p.soundness = s[2];
    p.subtype = s[3];
    if (s[4]) p.mahmuzPosition = s[4];
  });

  MP.paradigms = paradigms;
  MP.NOT_USED = X;
})(typeof window !== 'undefined' ? window : globalThis);
