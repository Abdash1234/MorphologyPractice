/*
 * vocab-decks.js — vocabulary that ships with the app.
 *
 * Someone who downloads this should find something to revise before they
 * have typed anything, so these two decks come built in. They are ordered by
 * how often the words actually occur in the Qur'an, most frequent first,
 * because that ordering is what makes a short list worth more than a long
 * one: the first few hundred words carry the large majority of the running
 * text, and every course built on the Qur'an is teaching roughly them.
 *
 * They behave exactly like vocabulary you add yourself — same drills, same
 * Leitner boxes, same plural and gender handling. Editing one keeps your
 * version: the change is written to your own store under the same id and
 * wins from then on, so an app update can never overwrite a gloss you have
 * replaced with a better one. Deleting one hides it for good.
 *
 * gender is given only where the word does not show it, or contradicts it —
 * أَرْض is feminine with nothing to say so, خَلِيفَة takes masculine agreement
 * despite the tāʾ marbūṭah. The rest is left to the ending.
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});

  /* [ word, plural, transliteration, meaning, gender ] */
  const w = (ar, pl, tr, en, gender) => ({ ar, pl: pl || '', tr, en, gender: gender || '' });

  const decks = [
    {
      id: 'q1',
      name: 'Qurʾānic core I',
      desc: 'The commonest nouns in the Qurʾān — the ones you meet on nearly every page.',
      words: [
        w('رَبٌّ', 'أَرْبَابٌ', 'rabb', 'lord, master'),
        w('يَوْمٌ', 'أَيَّامٌ', 'yawm', 'day'),
        w('نَاسٌ', '', 'nās', 'people, mankind'),
        w('أَرْضٌ', '', 'arḍ', 'earth, land', 'muannath'),
        w('سَمَاءٌ', 'سَمَاوَاتٌ', 'samāʾ', 'sky, heaven', 'muannath'),
        w('كِتَابٌ', 'كُتُبٌ', 'kitāb', 'book, scripture'),
        w('نَفْسٌ', 'أَنْفُسٌ', 'nafs', 'soul, self', 'muannath'),
        w('قَوْمٌ', 'أَقْوَامٌ', 'qawm', 'a people, a folk'),
        w('آيَةٌ', 'آيَاتٌ', 'āyah', 'sign, verse'),
        w('رَسُولٌ', 'رُسُلٌ', 'rasūl', 'messenger'),
        w('نَبِيٌّ', 'أَنْبِيَاءُ', 'nabī', 'prophet'),
        w('عَبْدٌ', 'عِبَادٌ', 'ʿabd', 'servant, slave'),
        w('قَلْبٌ', 'قُلُوبٌ', 'qalb', 'heart'),
        w('عَذَابٌ', '', 'ʿadhāb', 'punishment, torment'),
        w('جَنَّةٌ', 'جَنَّاتٌ', 'jannah', 'garden, paradise'),
        w('نَارٌ', 'نِيرَانٌ', 'nār', 'fire', 'muannath'),
        w('حَقٌّ', '', 'ḥaqq', 'truth, right'),
        w('خَيْرٌ', '', 'khayr', 'good, better'),
        w('شَيْءٌ', 'أَشْيَاءُ', 'shayʾ', 'thing'),
        w('أَمْرٌ', 'أُمُورٌ', 'amr', 'matter, affair, command'),
        w('بَيْتٌ', 'بُيُوتٌ', 'bayt', 'house'),
        w('مَالٌ', 'أَمْوَالٌ', 'māl', 'wealth, property'),
        w('وَلَدٌ', 'أَوْلَادٌ', 'walad', 'child, son'),
        w('أَهْلٌ', 'أَهْلُونَ', 'ahl', 'family, people of'),
        w('دِينٌ', 'أَدْيَانٌ', 'dīn', 'religion, judgement'),
        w('عِلْمٌ', 'عُلُومٌ', 'ʿilm', 'knowledge'),
        w('عَمَلٌ', 'أَعْمَالٌ', 'ʿamal', 'deed, work'),
        w('سَبِيلٌ', 'سُبُلٌ', 'sabīl', 'way, path'),
        w('دُنْيَا', '', 'dunyā', 'the world, this life', 'muannath'),
        w('آخِرَةٌ', '', 'ākhirah', 'the hereafter'),
        w('مَلَكٌ', 'مَلَائِكَةٌ', 'malak', 'angel'),
        w('شَيْطَانٌ', 'شَيَاطِينُ', 'shayṭān', 'devil, satan'),
        w('رَحْمَةٌ', '', 'raḥmah', 'mercy'),
        w('نُورٌ', 'أَنْوَارٌ', 'nūr', 'light'),
        w('كَلِمَةٌ', 'كَلِمَاتٌ', 'kalimah', 'word')
      ]
    },
    {
      id: 'q2',
      name: 'Qurʾānic core II',
      desc: 'The next band: the divine attributes, the standing descriptions of people, and the world around them.',
      words: [
        w('عَظِيمٌ', '', 'ʿaẓīm', 'great, mighty'),
        w('عَلِيمٌ', '', 'ʿalīm', 'all-knowing'),
        w('حَكِيمٌ', '', 'ḥakīm', 'wise'),
        w('غَفُورٌ', '', 'ghafūr', 'forgiving'),
        w('رَحِيمٌ', '', 'raḥīm', 'merciful'),
        w('عَزِيزٌ', '', 'ʿazīz', 'mighty, almighty'),
        w('قَدِيرٌ', '', 'qadīr', 'powerful, able'),
        w('سَمِيعٌ', '', 'samīʿ', 'all-hearing'),
        w('بَصِيرٌ', '', 'baṣīr', 'all-seeing'),
        w('كَرِيمٌ', 'كِرَامٌ', 'karīm', 'noble, generous'),
        w('كَبِيرٌ', 'كِبَارٌ', 'kabīr', 'big, great'),
        w('مُبِينٌ', '', 'mubīn', 'clear, manifest'),
        w('صَالِحٌ', 'صَالِحُونَ', 'ṣāliḥ', 'righteous, sound'),
        w('مُؤْمِنٌ', 'مُؤْمِنُونَ', 'muʾmin', 'believer'),
        w('كَافِرٌ', 'كَافِرُونَ', 'kāfir', 'disbeliever, ungrateful'),
        w('ظَالِمٌ', 'ظَالِمُونَ', 'ẓālim', 'wrongdoer'),
        w('مُسْلِمٌ', 'مُسْلِمُونَ', 'muslim', 'one who submits, Muslim'),
        w('صَابِرٌ', 'صَابِرُونَ', 'ṣābir', 'patient, steadfast'),
        w('شَاكِرٌ', 'شَاكِرُونَ', 'shākir', 'grateful'),
        w('وَجْهٌ', 'وُجُوهٌ', 'wajh', 'face'),
        w('يَدٌ', 'أَيْدٍ', 'yad', 'hand', 'muannath'),
        w('عَيْنٌ', 'أَعْيُنٌ', 'ʿayn', 'eye, spring', 'muannath'),
        w('قَرْيَةٌ', 'قُرًى', 'qaryah', 'town, settlement'),
        w('جَبَلٌ', 'جِبَالٌ', 'jabal', 'mountain'),
        w('بَحْرٌ', 'بِحَارٌ', 'baḥr', 'sea'),
        w('نَهْرٌ', 'أَنْهَارٌ', 'nahr', 'river'),
        w('شَمْسٌ', '', 'shams', 'sun', 'muannath'),
        w('قَمَرٌ', 'أَقْمَارٌ', 'qamar', 'moon'),
        w('لَيْلٌ', '', 'layl', 'night'),
        w('نَهَارٌ', '', 'nahār', 'daytime'),
        w('مَاءٌ', 'مِيَاهٌ', 'māʾ', 'water'),
        w('طَعَامٌ', '', 'ṭaʿām', 'food'),
        w('رِزْقٌ', 'أَرْزَاقٌ', 'rizq', 'provision, sustenance'),
        w('أَجْرٌ', 'أُجُورٌ', 'ajr', 'reward, wage'),
        w('خَلِيفَةٌ', 'خُلَفَاءُ', 'khalīfah', 'successor, deputy', 'mudhakkar')
      ]
    }
  ];

  MP.vocabDecks = { decks: decks };
})(typeof window !== 'undefined' ? window : globalThis);
