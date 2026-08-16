/*
 * sentences.js — one short sentence per word, for the cloze drill and for
 * showing the word in use once the analysis is done.
 *
 * `{}` marks where the word itself sits: the drill blanks it out, and the
 * reveal puts it back. The sentence always uses the exact form of the word as
 * it appears in the bank, so the gap trains that form, not just the root.
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});

  const sentences = {
    /* ---- ن ص ر ---- */
    'nsr-madi-3ms': { ar: '{} اللَّهُ الْمُؤْمِنِينَ يَوْمَ بَدْرٍ.', en: 'Allah helped the believers on the day of Badr.' },
    'nsr-madi-3mp': { ar: '{} إِخْوَانَهُمْ فِي الشِّدَّةِ.', en: 'They helped their brothers in hardship.' },
    'nsr-madi-3fs': { ar: '{} الْأُمُّ وَلَدَهَا الصَّغِيرَ.', en: 'The mother helped her little son.' },
    'nsr-madi-1s': { ar: '{} صَدِيقِي فِي عَمَلِهِ.', en: 'I helped my friend with his work.' },
    'nsr-mud-3ms': { ar: 'اللَّهُ {} عِبَادَهُ الصَّابِرِينَ.', en: 'Allah helps His patient servants.' },
    'nsr-mud-3mp': { ar: 'الْجُنُودُ {} الْمَظْلُومِينَ.', en: 'The soldiers help the oppressed.' },
    'nsr-mud-1p': { ar: 'نَحْنُ {} الْفُقَرَاءَ بِأَمْوَالِنَا.', en: 'We help the poor with our wealth.' },
    'nsr-mansub': { ar: '{} الظَّالِمَ عَلَى ظُلْمِهِ.', en: 'He will never help the wrongdoer in his wrongdoing.' },
    'nsr-majzum': { ar: '{} أَحَدٌ أَخَاهُ فِي ذَلِكَ الْيَوْمِ.', en: 'No one helped his brother that day.' },
    'nsr-amr': { ar: '{} أَخَاكَ ظَالِمًا أَوْ مَظْلُومًا.', en: 'Help your brother, whether he is the wrongdoer or the wronged.' },
    'nsr-nahi': { ar: '{} الظَّالِمَ عَلَى ظُلْمِهِ.', en: 'Do not help the wrongdoer in his wrongdoing.' },
    'nsr-majhul-madi': { ar: '{} الْمُؤْمِنُ بِإِذْنِ اللَّهِ.', en: 'The believer was helped by Allah\'s leave.' },
    'nsr-fail': { ar: 'اللَّهُ {} لِلْمُؤْمِنِينَ.', en: 'Allah is a helper to the believers.' },
    'nsr-maful': { ar: 'الْمُؤْمِنُ {} بِإِذْنِ رَبِّهِ.', en: 'The believer is helped by his Lord\'s leave.' },
    'nsr-masdar': { ar: 'طَلَبْنَا {} مِنَ اللَّهِ وَحْدَهُ.', en: 'We sought help from Allah alone.' },

    /* ---- ك ت ب ---- */
    'ktb-madi-3ms': { ar: '{} الطَّالِبُ الدَّرْسَ فِي دَفْتَرِهِ.', en: 'The student wrote the lesson in his notebook.' },
    'ktb-madi-2mp': { ar: 'مَاذَا {} فِي الِامْتِحَانِ؟', en: 'What did you (pl.) write in the exam?' },
    'ktb-mud-3ms': { ar: '{} الْوَلَدُ رِسَالَةً إِلَى أَبِيهِ.', en: 'The boy is writing a letter to his father.' },
    'ktb-mud-1s': { ar: '{} اسْمِي عَلَى الْوَرَقَةِ.', en: 'I write my name on the paper.' },
    'ktb-amr': { ar: '{} اسْمَكَ هُنَا يَا وَلَدُ.', en: 'Write your name here, boy.' },
    'ktb-majhul': { ar: '{} عَلَيْكُمُ الصِّيَامُ.', en: 'Fasting has been prescribed for you.' },
    'ktb-fail': { ar: 'هَذَا {} مَشْهُورٌ فِي بَلَدِنَا.', en: 'This is a famous writer in our country.' },
    'ktb-maful': { ar: 'الدَّرْسُ {} فِي الْكِتَابِ.', en: 'The lesson is written in the book.' },
    'ktb-zarf': { ar: 'فِي الْغُرْفَةِ {} كَبِيرٌ.', en: 'In the room there is a large desk.' },
    'ktb-masdar': { ar: 'تَعَلَّمَ الْوَلَدُ {} وَقِرَاءَةً.', en: 'The boy learned writing and reading.' },

    /* ---- ض ر ب / ج ل س ---- */
    'drb-madi': { ar: '{} الرَّجُلُ الْبَابَ بِيَدِهِ.', en: 'The man struck the door with his hand.' },
    'drb-amr': { ar: '{} لَنَا مَثَلًا مِنَ الْقُرْآنِ.', en: 'Give us an example from the Qur\'an.' },
    'drb-majhul': { ar: '{} اللِّصُّ فِي السُّوقِ.', en: 'The thief was struck in the market.' },
    'drb-aalah': { ar: 'اشْتَرَى الْوَلَدُ {} جَدِيدًا.', en: 'The boy bought a new bat.' },
    'jls-madi-1p': { ar: '{} فِي الْمَسْجِدِ بَعْدَ الصَّلَاةِ.', en: 'We sat in the mosque after the prayer.' },
    'jls-mud': { ar: '{} الشَّيْخُ بَيْنَ تَلَامِيذِهِ.', en: 'The shaykh sits among his students.' },
    'jls-zarf': { ar: 'اجْتَمَعَ الْعُلَمَاءُ فِي {} كَبِيرٍ.', en: 'The scholars gathered in a large council.' },

    /* ---- ف ت ح / ذ ه ب ---- */
    'fth-madi': { ar: '{} الرَّجُلُ الْبَابَ لِلضَّيْفِ.', en: 'The man opened the door for the guest.' },
    'fth-majhul-mud': { ar: '{} الْمَسْجِدُ قَبْلَ الْفَجْرِ.', en: 'The mosque is opened before dawn.' },
    'fth-amr-pl': { ar: '{} كُتُبَكُمْ يَا طُلَّابُ.', en: 'Open your books, students.' },
    'fth-aalah': { ar: 'أَيْنَ {} الْبَيْتِ؟', en: 'Where is the key to the house?' },
    'fth-maful': { ar: 'الْبَابُ {} فَادْخُلْ.', en: 'The door is open, so come in.' },
    'dhhb-madi-3fs': { ar: '{} الْبِنْتُ إِلَى الْمَدْرَسَةِ.', en: 'The girl went to the school.' },
    'dhhb-zarf': { ar: 'لِكُلِّ عَالِمٍ {} فِي هَذِهِ الْمَسْأَلَةِ.', en: 'Every scholar has a position on this issue.' },

    /* ---- ع ل م / س م ع ---- */
    'alm-madi': { ar: '{} الرَّجُلُ الْحَقَّ فَاتَّبَعَهُ.', en: 'The man knew the truth and followed it.' },
    'alm-mud-2mp': { ar: 'هَلْ {} مَا فِي هَذَا الْكِتَابِ؟', en: 'Do you (pl.) know what is in this book?' },
    'alm-fail': { ar: 'سَأَلْتُ {} كَبِيرًا عَنِ الْمَسْأَلَةِ.', en: 'I asked a great scholar about the issue.' },
    'alm-maful': { ar: 'هَذَا أَمْرٌ {} عِنْدَ النَّاسِ.', en: 'This is a well-known matter among people.' },
    'alm-masdar': { ar: 'طَلَبْتُ {} نَافِعًا.', en: 'I sought beneficial knowledge.' },
    'sma-madi-1p': { ar: '{} صَوْتَ الْأَذَانِ مِنَ الْمَسْجِدِ.', en: 'We heard the sound of the adhān from the mosque.' },
    'sma-amr': { ar: '{} كَلَامَ أُسْتَاذِكَ جَيِّدًا.', en: 'Listen to your teacher\'s words carefully.' },
    'sma-fail': { ar: 'اللَّهُ {} لِدُعَاءِ عِبَادِهِ.', en: 'Allah is the hearer of His servants\' supplication.' },

    /* ---- ك ر م / ح س ب ---- */
    'krm-madi': { ar: '{} الرَّجُلُ فَأَعْطَى الْفَقِيرَ.', en: 'The man was generous and gave to the poor.' },
    'krm-sifah': { ar: 'أَبُوهُ رَجُلٌ {} يُحِبُّ الضُّيُوفَ.', en: 'His father is a generous man who loves guests.' },
    'hsb-mud': { ar: '{} النَّاسُ أَنَّ الْمَالَ سَعَادَةٌ.', en: 'People think that wealth is happiness.' },
    'hsb-maful': { ar: 'كُلُّ عَمَلٍ {} عِنْدَ اللَّهِ.', en: 'Every deed is counted with Allah.' },

    /* ---- muḍāʿaf ---- */
    'mdd-madi': { ar: '{} الرَّجُلُ يَدَهُ إِلَى السَّائِلِ.', en: 'The man stretched out his hand to the beggar.' },
    'mdd-mud': { ar: '{} الْحَبْلَ حَتَّى يَطُولَ.', en: 'He stretches the rope until it is long.' },
    'rdd-mud-3mp': { ar: 'التُّجَّارُ {} الْمَالَ إِلَى أَصْحَابِهِ.', en: 'The merchants return the money to its owners.' },
    'rdd-maful': { ar: 'كَلَامُهُ {} عَلَيْهِ.', en: 'His words are turned back on him.' },
    'rdd-nahi': { ar: '{} السَّائِلَ خَائِبًا.', en: 'Do not turn the beggar away disappointed.' },

    /* ---- mahmūz ---- */
    'akhdh-madi': { ar: '{} الْوَلَدُ الْكِتَابَ مِنَ الرَّفِّ.', en: 'The boy took the book from the shelf.' },
    'akhdh-amr': { ar: '{} حَقَّكَ وَلَا تَظْلِمْ.', en: 'Take your right and do not wrong anyone.' },
    'akhdh-maful': { ar: 'هَذَا الْحُكْمُ {} مِنَ الْقُرْآنِ.', en: 'This ruling is taken from the Qur\'an.' },
    'sal-madi': { ar: '{} الطَّالِبُ أُسْتَاذَهُ عَنِ الدَّرْسِ.', en: 'The student asked his teacher about the lesson.' },
    'sal-mud-3mp': { ar: 'النَّاسُ {} عَنْ أَمْرِ الدِّينِ.', en: 'People ask about the affairs of the religion.' },
    'qra-amr': { ar: '{} بِاسْمِ رَبِّكَ الَّذِي خَلَقَ.', en: 'Recite in the name of your Lord who created.' },
    'qra-majhul': { ar: '{} الْقُرْآنُ فِي الْمَسْجِدِ.', en: 'The Qur\'an was recited in the mosque.' },
    'qra-fail': { ar: 'صَوْتُ هَذَا {} جَمِيلٌ.', en: 'The voice of this reciter is beautiful.' },
    'qra-masdar': { ar: 'قَرَأَ الطَّالِبُ {} جَمِيلَةً.', en: 'The student read beautifully.' },

    /* ---- mithāl ---- */
    'wad-madi': { ar: '{} اللَّهُ الْمُؤْمِنِينَ جَنَّاتٍ.', en: 'Allah promised the believers gardens.' },
    'wad-mud': { ar: 'الرَّجُلُ {} وَلَا يُخْلِفُ.', en: 'The man promises and does not break his word.' },
    'wad-amr': { ar: '{} أَخَاكَ خَيْرًا وَأَوْفِ بِهِ.', en: 'Promise your brother good and fulfil it.' },
    'wad-zarf': { ar: 'بَيْنَنَا {} فِي الْمَسْجِدِ.', en: 'We have an appointment at the mosque.' },
    'wsl-mud': { ar: 'الْقِطَارُ {} فِي السَّاعَةِ الثَّامِنَةِ.', en: 'The train arrives at eight o\'clock.' },
    'wsl-madi-3fs': { ar: '{} الرِّسَالَةُ إِلَى أَهْلِهَا.', en: 'The letter reached its people.' },

    /* ---- ajwaf ---- */
    'qwl-madi': { ar: '{} الرَّجُلُ الْحَقَّ أَمَامَ النَّاسِ.', en: 'The man spoke the truth in front of the people.' },
    'qwl-mud': { ar: 'مَاذَا {} فِي هَذِهِ الْمَسْأَلَةِ؟', en: 'What does he say about this issue?' },
    'qwl-majhul': { ar: '{} لَهُمُ ادْخُلُوا الْبَابَ.', en: 'It was said to them: enter the gate.' },
    'qwl-amr': { ar: '{} هُوَ اللَّهُ أَحَدٌ.', en: 'Say: He is Allah, One.' },
    'qwl-fail': { ar: 'مَنْ {} هَذَا الْكَلَامِ؟', en: 'Who is the speaker of these words?' },
    'bya-madi': { ar: '{} التَّاجِرُ بَيْتَهُ بِثَمَنٍ قَلِيلٍ.', en: 'The merchant sold his house for a small price.' },
    'bya-mud': { ar: '{} الرَّجُلُ الْخُبْزَ فِي السُّوقِ.', en: 'The man sells bread in the market.' },
    'bya-fail': { ar: 'أَعْطَى {} الْفَاكِهَةِ الْوَلَدَ تُفَّاحَةً.', en: 'The fruit seller gave the boy an apple.' },
    'khwf-mud-3mp': { ar: 'الْمُؤْمِنُونَ {} رَبَّهُمْ.', en: 'The believers fear their Lord.' },
    'khwf-amr': { ar: '{} اللَّهَ حَيْثُمَا كُنْتَ.', en: 'Fear Allah wherever you are.' },

    /* ---- nāqiṣ / lafīf ---- */
    'daw-madi': { ar: '{} الْمُؤْمِنُ رَبَّهُ فِي السَّحَرِ.', en: 'The believer called upon his Lord before dawn.' },
    'daw-mud': { ar: '{} الرَّجُلُ رَبَّهُ خَوْفًا وَطَمَعًا.', en: 'The man calls upon his Lord in fear and hope.' },
    'daw-amr': { ar: '{} رَبَّكَ وَأَنْتَ مُوقِنٌ بِالْإِجَابَةِ.', en: 'Call upon your Lord certain of the answer.' },
    'daw-masdar': { ar: 'دَعَا الْعَبْدُ رَبَّهُ {} خَالِصًا.', en: 'The servant called upon his Lord with sincere supplication.' },
    'rmy-madi': { ar: '{} الْوَلَدُ الْحَجَرَ فِي الْبِئْرِ.', en: 'The boy threw the stone into the well.' },
    'rmy-mud': { ar: '{} الصَّيَّادُ شَبَكَتَهُ فِي الْبَحْرِ.', en: 'The fisherman casts his net into the sea.' },
    'rmy-maful': { ar: 'الْحَجَرُ {} فِي الْمَاءِ.', en: 'The stone is thrown into the water.' },
    'nsy-madi': { ar: '{} الطَّالِبُ كِتَابَهُ فِي الْبَيْتِ.', en: 'The student forgot his book at home.' },
    'nsy-nahi': { ar: '{} ذِكْرَ اللَّهِ فِي كُلِّ حَالٍ.', en: 'Do not forget the remembrance of Allah in any state.' },
    'wqy-madi': { ar: '{} اللَّهُ عَبْدَهُ مِنَ النَّارِ.', en: 'Allah protected His servant from the Fire.' },
    'wqy-amr': { ar: '{} نَفْسَكَ وَأَهْلَكَ.', en: 'Protect yourself and your family.' },
    'twy-madi': { ar: '{} الرَّجُلُ الْوَرَقَةَ وَوَضَعَهَا فِي جَيْبِهِ.', en: 'The man folded the paper and put it in his pocket.' },
    'twy-mud': { ar: '{} الْخَادِمُ الثِّيَابَ بَعْدَ غَسْلِهَا.', en: 'The servant folds the clothes after washing them.' },

    /* ---- mazīd ---- */
    'alm2-madi': { ar: '{} الْأُسْتَاذُ تَلَامِيذَهُ الْقِرَاءَةَ.', en: 'The teacher taught his students reading.' },
    'alm2-mud': { ar: '{} الشَّيْخُ النَّاسَ أَمْرَ دِينِهِمْ.', en: 'The shaykh teaches people the matters of their religion.' },
    'alm2-fail': { ar: 'دَخَلَ {} الصَّفَّ.', en: 'The teacher entered the classroom.' },
    'alm2-masdar': { ar: 'عَلَّمَ الْأُسْتَاذُ تَلَامِيذَهُ {} حَسَنًا.', en: 'The teacher taught his students well.' },
    'nzl2-madi': { ar: '{} اللَّهُ الْقُرْآنَ عَلَى نَبِيِّهِ.', en: 'Allah sent down the Qur\'an upon His Prophet.' },
    'nzl2-masdar': { ar: 'نَزَّلَ اللَّهُ الْكِتَابَ {}.', en: 'Allah sent the Book down, a true sending down.' },
    'jhd3-madi': { ar: '{} الْمُؤْمِنُ نَفْسَهُ فِي طَاعَةِ اللَّهِ.', en: 'The believer struggled against his own soul in obeying Allah.' },
    'jhd3-fail': { ar: 'رَجَعَ {} مِنَ الْمَعْرَكَةِ.', en: 'The one who strove returned from the battle.' },
    'slm4-madi': { ar: '{} الرَّجُلُ عَلَى يَدِ النَّبِيِّ.', en: 'The man became Muslim at the hand of the Prophet.' },
    'slm4-fail': { ar: 'كُلُّ {} أَخٌ لِلْمُسْلِمِ.', en: 'Every Muslim is a brother to another Muslim.' },
    'slm4-fail-pl': { ar: '{} إِخْوَةٌ فِي الدِّينِ.', en: 'Muslims are brothers in religion.' },
    'slm4-masdar': { ar: 'أَسْلَمَ الرَّجُلُ {} صَادِقًا.', en: 'The man submitted with sincere submission.' },
    'krm4-madi': { ar: '{} الرَّجُلُ ضَيْفَهُ.', en: 'The man honoured his guest.' },
    'krm4-amr': { ar: '{} ضَيْفَكَ وَلَوْ كَانَ فَقِيرًا.', en: 'Honour your guest even if he is poor.' },
    'alm5-madi': { ar: '{} الْوَلَدُ الْحِسَابَ فِي الْمَدْرَسَةِ.', en: 'The boy learned arithmetic at school.' },
    'alm5-mud': { ar: '{} الطَّالِبُ الْعَرَبِيَّةَ كُلَّ يَوْمٍ.', en: 'The student learns Arabic every day.' },
    'alm5-fail': { ar: '{} الصَّغِيرُ يَسْأَلُ كَثِيرًا.', en: 'The young learner asks a lot.' },
    'qbl5-amr': { ar: 'رَبَّنَا {} مِنَّا صَلَاتَنَا.', en: 'Our Lord, accept our prayer from us.' },
    'awn6-madi': { ar: '{} النَّاسُ عَلَى بِنَاءِ الْمَسْجِدِ.', en: 'The people cooperated in building the mosque.' },
    'awn6-amr-pl': { ar: '{} عَلَى الْبِرِّ وَالتَّقْوَى.', en: 'Cooperate in righteousness and piety.' },
    'ksr7-madi': { ar: '{} الْبَابُ مِنْ شِدَّةِ الرِّيحِ.', en: 'The door broke from the force of the wind.' },
    'jma8-madi': { ar: '{} النَّاسُ فِي الْمَسْجِدِ لِلصَّلَاةِ.', en: 'The people gathered in the mosque for prayer.' },
    'jma8-masdar': { ar: 'عَقَدْنَا {} مُهِمًّا أَمْسِ.', en: 'We held an important meeting yesterday.' },
    'jhd8-fail': { ar: '{} يَنَالُ مَا يُرِيدُ.', en: 'The one who exerts himself attains what he wants.' },
    'hmr9-madi': { ar: '{} وَجْهُهُ مِنَ الْخَجَلِ.', en: 'His face turned red from embarrassment.' },
    'ghfr10-madi': { ar: '{} الْعَبْدُ رَبَّهُ مِنْ ذُنُوبِهِ.', en: 'The servant sought his Lord\'s forgiveness for his sins.' },
    'ghfr10-amr': { ar: '{} رَبَّكَ وَتُبْ إِلَيْهِ.', en: 'Seek your Lord\'s forgiveness and turn to Him.' },
    'ghfr10-masdar': { ar: 'أَكْثَرَ الْمُؤْمِنُ مِنَ {}.', en: 'The believer sought forgiveness often.' },
    'khrj10-majhul': { ar: '{} الْمَاءُ مِنَ الْبِئْرِ.', en: 'The water was drawn out of the well.' },

    /* ---- rubāʿī ---- */
    'dhrj-madi': { ar: '{} الْوَلَدُ الْحَجَرَ مِنَ الْجَبَلِ.', en: 'The boy rolled the stone down the mountain.' },
    'dhrj-masdar': { ar: 'دَحْرَجَ الْوَلَدُ الْكُرَةَ {} سَرِيعَةً.', en: 'The boy rolled the ball quickly.' },
    'trjm-madi': { ar: '{} الرَّجُلُ الْكِتَابَ إِلَى الْعَرَبِيَّةِ.', en: 'The man translated the book into Arabic.' },
    'trjm-fail': { ar: 'جَلَسَ {} بَيْنَ الرَّجُلَيْنِ.', en: 'The translator sat between the two men.' },
    'dhrj2-madi': { ar: '{} الْحَجَرُ مِنَ الْجَبَلِ.', en: 'The stone rolled down the mountain.' },

    /* ---- nouns without a verbal paradigm, and ḥurūf ---- */
    'jamid-rajul': { ar: 'جَاءَ {} مِنَ السُّوقِ.', en: 'A man came from the market.' },
    'jamid-bayt': { ar: 'هَذَا {} كَبِيرٌ وَجَمِيلٌ.', en: 'This is a big, beautiful house.' },
    'jamid-shams': { ar: 'طَلَعَتِ {} مِنَ الْمَشْرِقِ.', en: 'The sun rose from the east.' },
    'tafdil-akbar': { ar: 'اللَّهُ {} مِنْ كُلِّ شَيْءٍ.', en: 'Allah is greater than everything.' },
    'tafdil-ahsan': { ar: 'هَذَا الطَّرِيقُ {} مِنْ ذَاكَ.', en: 'This road is better than that one.' },
    'sifah-hasan': { ar: 'خُلُقُهُ {} بَيْنَ النَّاسِ.', en: 'His character is good among people.' },
    'harf-min': { ar: 'خَرَجْتُ {} الْبَيْتِ صَبَاحًا.', en: 'I went out of the house in the morning.' },
    'harf-fi': { ar: 'الْكِتَابُ {} الْحَقِيبَةِ.', en: 'The book is in the bag.' },
    'harf-ila': { ar: 'ذَهَبَ الْوَلَدُ {} الْمَسْجِدِ.', en: 'The boy went to the mosque.' },
    'harf-lam': { ar: '{} يَحْضُرِ الطَّالِبُ الدَّرْسَ.', en: 'The student did not attend the lesson.' },
    'harf-lan': { ar: '{} أَتْرُكَ الصَّلَاةَ أَبَدًا.', en: 'I will never abandon the prayer.' },
    'harf-hal': { ar: '{} فَهِمْتَ الدَّرْسَ؟', en: 'Did you understand the lesson?' },
    'harf-inna': { ar: '{} اللَّهَ غَفُورٌ رَحِيمٌ.', en: 'Indeed Allah is Forgiving, Merciful.' }
  };

  MP.sentences = sentences;
})(typeof window !== 'undefined' ? window : globalThis);
