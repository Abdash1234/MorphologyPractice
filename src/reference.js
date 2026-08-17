/*
 * reference.js — two bodies of teaching content:
 *
 *   MP.hints     the "?" panel on each question: how to spot the answer
 *                yourself, before you guess.
 *   MP.reference the browsable summary — the six gates, Forms II–X, the
 *                rubāʿī, noun patterns, weak-verb categories, and the
 *                conjugation markers.
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});

  /* ================================================================== */
  /* hints shown behind the ? on each question                          */
  /* ================================================================== */

  const hints = {
    ilalForm: {
      title: 'Work it out in order',
      bullets: [
        'Is there a weak letter carrying a vowel with a fatḥah in front of it? Then it becomes an alif — قَوَلَ becomes قَالَ.',
        'Is there a weak letter carrying a vowel with a sukūn in front of it? Then the vowel moves back onto that letter — يَقْوُلُ becomes يَقُولُ.',
        'Would two sukūns end up side by side? Then the weak letter drops — يَقُولُ + نَ becomes يَقُلْنَ.',
        'Are the last two radicals the same letter? Then they merge under a shaddah — مَدَدَ becomes مَدَّ.',
        'Say it aloud. If it is still heavy on the tongue, a rule has been missed.'
      ]
    },
    ilalRule: {
      title: 'Which of the four was it?',
      bullets: [
        'Qalb: a letter is still there but it is a different letter — the wāw of ق و ل shows up as an alif in قَالَ.',
        'Naql: every letter is still there, but a vowel has moved one place to the left — يَقُولُ.',
        'Ḥadhf: a letter has gone altogether. Count the radicals in what you wrote; if one is missing, it dropped.',
        'Idghām: two identical letters are written once with a shaddah — مَدَّ.',
        'The quickest test is to count letters against the root. Same number but one looks different is qalb; same letters with a vowel elsewhere is naql; one short is ḥadhf.'
      ]
    },

    harfType: {
      title: 'What does the particle govern?',
      bullets: [
        'If a noun can follow it, it is a ḥarf jarr, and that noun takes a kasrah: مِنَ البَيْتِ، فِي الدَّارِ، بِسْمِ اللهِ.',
        'If a muḍāriʿ follows with a fatḥah on the end, the particle is nāṣibah: أَنْ، لَنْ، كَيْ، إِذَنْ.',
        'If a muḍāriʿ follows with a sukūn on the end, it is jāzimah: لَمْ، لَمَّا، إِنْ الشرطية.',
        'إِنَّ and her sisters take a whole nominal sentence: the subject goes into naṣb, the predicate stays in rafʿ.',
        'A ḥarf ʿaṭf just joins, and whatever follows copies the iʿrāb of what came before: زَيْدٌ وَعَمْرٌو، رَأَيْتُ زَيْدًا وَعَمْرًا.',
        'قَدْ، سَوْفَ، هَلْ، نَعَمْ change the meaning and leave the iʿrāb alone — those are muhmal.',
        'Watch the shaddah: أَنْ takes the subjunctive but أَنَّ is one of inna’s sisters; إِنْ is the conditional but إِنَّ is not.'
      ]
    },

    wordType: {
      title: 'Ism, fiʿl or ḥarf?',
      bullets: [
        'Signs of an ism: tanwīn (ـٌ ـٍ ـً), الـ, a kasrah of jarr, or a ḥarf al-jarr in front of it. It can be described and made dual or plural.',
        'Signs of a fiʿl: it starts with أ ن ي ت in the muḍāriʿ, ends in ـْتُ ـْتَ ـْنَا in the māḍī, or takes قَدْ / سَوْفَ / لَمْ / لَنْ.',
        'A ḥarf takes none of those signs and gives no meaning standing alone — مِنْ، فِي، هَلْ، إِنَّ.'
      ]
    },

    tense: {
      title: 'Which tense?',
      bullets: [
        'Māḍī: nothing added at the front; the pronoun endings sit at the back — فَعَلَ، فَعَلُوا، فَعَلْتُ.',
        'Muḍāriʿ: always begins with one of أ ن ي ت (remembered as أَنَيْتُ) — أَفْعَلُ، نَفْعَلُ، يَفْعَلُ، تَفْعَلُ.',
        'Amr: a command with no tense letter at the front; it ends in a sukūn or drops a letter — اُنْصُرْ، قُلْ، اِرْمِ.',
        'Careful: لَا تَنْصُرْ looks like a command but it is a muḍāriʿ made majzūm by لَا — it is a nahy, not an amr.'
      ]
    },

    mood: {
      title: 'Reading the iʿrāb of a muḍāriʿ',
      bullets: [
        'Marfūʿ (default): ḍammah on the last letter — يَنْصُرُ — or the نَ still attached in يَنْصُرُونَ / تَنْصُرِينَ / يَنْصُرَانِ.',
        'Manṣūb: fatḥah on the last letter, and that نَ is gone — after أَنْ، لَنْ، كَيْ، حَتَّى، لِـ.',
        'Majzūm: sukūn on the last letter (or the weak letter dropped), نَ gone — after لَمْ، لَمَّا، لَا الناهية، لِـ الأمر، إِنْ.',
        'Muʾakkad: carries nūn al-tawkīd — heavy ـَنَّ or light ـَنْ — لَيَنْصُرَنَّ.',
        'Shortcut for the five verbs (يَنْصُرَانِ، تَنْصُرَانِ، يَنْصُرُونَ، تَنْصُرُونَ، تَنْصُرِينَ): the nūn still there means marfūʿ, the nūn gone means manṣūb or majzūm — لَنْ يَنْصُرُوا، لَمْ يَنْصُرُوا.'
      ]
    },

    voice: {
      title: 'Maʿlūm or majhūl — read the vowels',
      bullets: [
        'Māḍī majhūl: ḍammah on the first letter, kasrah on the letter before last — نَصَرَ becomes نُصِرَ، كَتَبَ becomes كُتِبَ.',
        'Muḍāriʿ majhūl: ḍammah on the tense letter, fatḥah on the letter before last — يَنْصُرُ becomes يُنْصَرُ، يَكْتُبُ becomes يُكْتَبُ.',
        'So in the muḍāriʿ the giveaway pair is ḍammah at the front + fatḥah at the back. يُعَلِّمُ (kasrah) is active; يُعَلَّمُ (fatḥah) is passive.',
        'A ḍammah at the front alone proves nothing — every mazīd verb of Forms II, III and IV has it in the active too.',
        'A lāzim (intransitive) verb has no majhūl at all, because there is no مفعول به to raise.'
      ]
    },

    polarity: {
      title: 'Is it negated?',
      bullets: [
        'Look for a particle in front: مَا، لَمْ، لَمَّا، لَنْ، لَا، لَيْسَ.',
        'لَمْ negates the past through a majzūm muḍāriʿ; لَنْ negates the future through a manṣūb one; مَا negates a plain māḍī.',
        'لَا with a majzūm verb is a prohibition (nahy); لَا with a marfūʿ verb is a plain negation.'
      ]
    },

    person: {
      title: 'Who is doing it?',
      bullets: [
        'Muḍāriʿ prefixes — remember them as أَنَيْتُ: أ = I, نـ = we, يـ = he/they, تـ = you (or "she").',
        'Māḍī endings, said aloud: "-tu" ـْتُ = I, "-naa" ـْنَا = we, "-ta / -ti / -tum / -tunna" ـْتَ ـْتِ ـْتُمْ ـْتُنَّ = you, and nothing at all / "-uu" ـُوا / "-at" ـَتْ = the absent one.',
        'تـ is the trap: تَنْصُرُ can be "you (m.) help" or "she helps" — only context decides.'
      ]
    },

    gender: {
      title: 'Masculine or feminine?',
      bullets: [
        'Listen to the ending. "-at" ـَتْ is she in the māḍī: نَصَرَتْ. "-na" ـْنَ is the feminine plural: نَصَرْنَ، يَنْصُرْنَ.',
        '"-eena" ـِينَ on a verb is "you (f. sing.)": تَنْصُرِينَ. On a noun it is a masculine plural instead — مُسْلِمِينَ — so check whether you are holding a verb or a noun first.',
        '"-oona" ـُونَ is masculine plural, verb or noun: يَنْصُرُونَ، مُسْلِمُونَ.',
        'Muḍāriʿ تـ also marks the feminine singular absent: تَنْصُرُ = she helps.',
        'The 1st person shows no gender at all — أَنْصُرُ، نَصَرْتُ are the same for a man or a woman.'
      ]
    },

    number: {
      title: 'One, two or many?',
      bullets: [
        'Say the ending out loud — it names the number for you:',
        '"-aa" ـَا and "-aani" ـَانِ → dual: نَصَرَا، يَنْصُرَانِ، مُسْلِمَانِ. ("-ayni" ـَيْنِ is the same dual noun in naṣb or jarr: مُسْلِمَيْنِ.)',
        '"-uu" ـُوا (wāw with a silent alif) and "-oona" ـُونَ → masculine plural: نَصَرُوا، يَنْصُرُونَ، مُسْلِمُونَ.',
        '"-eena" ـِينَ → masculine plural on a noun in naṣb/jarr (مُسْلِمِينَ), but "you (f. singular)" on a verb (تَنْصُرِينَ).',
        '"-na" ـْنَ → feminine plural, nūn al-niswah: نَصَرْنَ، يَنْصُرْنَ.',
        '"-aat" ـَاتٌ → sound feminine plural on a noun: مُسْلِمَاتٌ. Its manṣūb and majrūr both take a kasrah, never a fatḥah.',
        'No ending at all but clearly more than two? A broken plural, where the word is rebuilt: رَجُل → رِجَال، عَالِم → عُلَمَاء.',
        'Do not confuse the نَ of يَنْصُرُونَ (a sign of rafʿ, dropped in naṣb and jazm) with the نَ of يَنْصُرْنَ (a pronoun, never dropped).',
        'One more trap: a final wāw with no alif is not a plural — يَدْعُو is "he calls".'
      ]
    },

    ismType: {
      title: 'Which kind of noun?',
      bullets: [
        'فَاعِل → ism al-fāʿil, the doer (كَاتِب). From a mazīd bāb it is مُـ + the muḍāriʿ stem with a kasrah before the last letter (مُعَلِّم، مُسْتَغْفِر).',
        'مَفْعُول → ism al-mafʿūl (مَكْتُوب). From a mazīd bāb it is the same as the fāʿil but with a fatḥah before the last letter (مُعَلَّم، مُكْرَم).',
        'مَـ with a fatḥah on the mīm → a place or time (مَكْتَب، مَجْلِس). مِـ with a kasrah → a tool (مِفْتَاح، مِضْرَب).',
        'أَفْعَل → ism al-tafḍīl (أَكْبَر), unless it is a colour or defect, in which case it is a ṣifah mushabbahah (أَحْمَر).',
        'فَعِيل / فَعِل / فَعْلَان → a settled quality, ṣifah mushabbahah (كَرِيم، فَرِح، عَطْشَان).',
        'A maṣdar names the bare action with no doer — نَصْر، تَعْلِيم، اِسْتِغْفَار.',
        'If it fits none of these and comes from no verb, it is jāmid — رَجُل، بَيْت، شَمْس.'
      ]
    },

    letters: {
      title: 'Counting the root letters',
      bullets: [
        'Strip anything added, then count what is left: three letters = thulāthī, four = rubāʿī.',
        'The added letters all come from سَأَلْتُمُونِيهَا — any letter outside that set must be part of the root.',
        'A shaddah counts as two letters: مَدَّ is م + د + د, and عَلَّمَ is ع + ل + ل + م where one ل is the addition.',
        'Warning: تَرْجَمَ has four root letters (ت ر ج م) even though تـ is usually an addition. Check the meaning, not just the shape.'
      ]
    },

    augmentation: {
      title: 'Mujarrad or mazīd fīh?',
      bullets: [
        'Put the word back into the māḍī and count. Exactly three letters, no shaddah, no prefix = thulāthī mujarrad.',
        'Anything longer carries additions: a hamzah at the front (أَفْعَلَ), a تـ at the front (تَفَعَّلَ), a shaddah (فَعَّلَ), an alif after the first letter (فَاعَلَ), اِنـ, اِـتـ, اِسْتـ.',
        'A quick tell in the muḍāriʿ: a ḍammah on the tense letter (يُـ) means the verb is mazīd — Forms II, III, IV or a rubāʿī. Mujarrad always has a fatḥah there (يَـ).',
        'A hamzat waṣl at the front (the alif you skip when joining words) means Form VII, VIII, IX or X.'
      ]
    },

    baabThulathiMujarrad: {
      title: 'Which of the six gates?',
      bullets: [
        'The māḍī vowel on the middle letter narrows it down immediately:',
        'ḍammah on the ʿayn (فَعُلَ) → it can only be karuma. Always intransitive, always a settled quality.',
        'kasrah on the ʿayn (فَعِلَ) → ʿalima, or the rare ḥasiba. Assume ʿalima unless you know the verb is one of the small ḥasiba set (حَسِبَ، وَرِثَ، وَثِقَ، نَعِمَ).',
        'fatḥah on the ʿayn (فَعَلَ) → naṣara, ḍaraba or fataḥa, and only the muḍāriʿ vowel separates them.',
        'A throat letter (ء ه ع ح غ خ) as the middle or last root letter pulls the verb towards fataḥa — فَتَحَ، ذَهَبَ، مَنَعَ، سَأَلَ.',
        'Meaning helps too: bodily states and senses cluster in ʿalima; qualities in karuma; plain transitive actions in naṣara and ḍaraba.'
      ]
    },

    baabThulathiMazeed: {
      title: 'Reading the added letters',
      bullets: [
        'Shaddah on the middle letter → Form II فَعَّلَ (عَلَّمَ). Usually makes the verb transitive, or intensifies it.',
        'Alif after the first letter → Form III فَاعَلَ (جَاهَدَ). Doing the action with or against someone else.',
        'Hamzah at the front of the māḍī, gone in the muḍāriʿ (أَكْرَمَ / يُكْرِمُ) → Form IV. Causative.',
        'تـ at the front + shaddah → Form V تَفَعَّلَ (تَعَلَّمَ). The effect of Form II landing back on the subject.',
        'تـ at the front + alif → Form VI تَفَاعَلَ (تَعَاوَنَ). Two or more parties acting on each other.',
        'نـ after a hamzat waṣl → Form VII اِنْفَعَلَ (اِنْكَسَرَ). The effect of Form I happening to the subject.',
        'تـ tucked in after the first root letter → Form VIII اِفْتَعَلَ (اِجْتَمَعَ). Do not confuse it with Form V, where the تـ is out at the front.',
        'Shaddah on the last letter after a hamzat waṣl → Form IX اِفْعَلَّ (اِحْمَرَّ). Colours and defects only.',
        'اِسْتـ at the front → Form X اِسْتَفْعَلَ (اِسْتَغْفَرَ). Seeking, asking for, or considering something to be so.'
      ]
    },

    baabRubaiMujarrad: {
      title: 'Rubāʿī mujarrad',
      bullets: [
        'Four root letters and nothing added: فَعْلَلَ يُفَعْلِلُ فَعْلَلَةً — دَحْرَجَ، تَرْجَمَ، وَسْوَسَ، زَلْزَلَ.',
        'Its muḍāriʿ takes a ḍammah on the tense letter (يُدَحْرِجُ) even though the verb is mujarrad — the one place that tell fails.'
      ]
    },

    baabRubaiMazeed: {
      title: 'Rubāʿī mazīd fīh',
      bullets: [
        'تـ at the front → تَفَعْلَلَ (تَدَحْرَجَ): the effect of فَعْلَلَ landing on the subject.',
        'نـ after the third letter → اِفْعَنْلَلَ (اِحْرَنْجَمَ).',
        'Last letter doubled after a hamzat waṣl → اِفْعَلَلَّ (اِقْشَعَرَّ).'
      ]
    },

    soundness: {
      title: 'Ṣaḥīḥ or muʿtall?',
      bullets: [
        'Look at the three (or four) root letters only — not the added ones.',
        'If any root letter is و or ي (the ḥurūf al-ʿillah), the verb is muʿtall.',
        'An alif in the middle of a māḍī is almost always a و or ي in disguise: قَالَ is ق و ل، بَاعَ is ب ي ع. Check the muḍāriʿ — يَقُولُ shows the wāw, يَبِيعُ shows the yāʾ.',
        'A hamzah is not a ḥarf ʿillah — أَخَذَ is ṣaḥīḥ (mahmūz), not muʿtall.'
      ]
    },

    sahihType: {
      title: 'Which kind of ṣaḥīḥ?',
      bullets: [
        'Muḍāʿaf: the second and third root letters are the same, written with a shaddah — مَدَّ (م د د)، رَدَّ (ر د د).',
        'Mahmūz: one of the root letters is a hamzah — أَخَذَ، سَأَلَ، قَرَأَ.',
        'Sālim: none of the above, and no weak letter either — the plain, well-behaved case.'
      ]
    },

    mutalType: {
      title: 'Which kind of muʿtall?',
      bullets: [
        'Mithāl: the weak letter is first — وَعَدَ، يَسَرَ. It tends to vanish in the muḍāriʿ: وَعَدَ becomes يَعِدُ.',
        'Ajwaf: the weak letter is in the middle — قَالَ (ق و ل)، بَاعَ (ب ي ع)، خَافَ (خ و ف). "Hollow" because the middle collapses into an alif.',
        'Nāqiṣ: the weak letter is last — دَعَا (د ع و)، رَمَى (ر م ي)، نَسِيَ (ن س ي).',
        'Lafīf mafrūq: first and last are weak, sound letter in between — وَقَى (و ق ي).',
        'Lafīf maqrūn: the last two are weak and side by side — طَوَى (ط و ي)، نَوَى (ن و ي).'
      ]
    },

    mahmuzPosition: {
      title: 'Where is the hamzah?',
      bullets: [
        'Name the three root letters and see which position the hamzah occupies.',
        'Mahmūz al-fāʾ: first — أَخَذَ، أَكَلَ، أَمَرَ. These three drop the hamzah in the amr: خُذْ، كُلْ، مُرْ.',
        'Mahmūz al-ʿayn: middle — سَأَلَ، رَأَسَ.',
        'Mahmūz al-lām: last — قَرَأَ، بَدَأَ، مَلَأَ.'
      ]
    },

    radicals: {
      title: 'Picking the radicals out',
      bullets: [
        'Cross off the servants first: prefixes يـ تـ نـ أ, endings ـُونَ ـِينَ ـْتُ ـُوا, and any added letter from سَأَلْتُمُونِيهَا.',
        'What is left, in order, is the fāʾ, the ʿayn and the lām — the first, second and third radicals.',
        'A weak radical can be missing from the word in front of you: يَعِدُ shows only ع and د, but the fāʾ is a و (وَعَدَ). Put it back.',
        'A long alif in the middle is never a radical by itself — it stands for a و or a ي: قَالَ is ق و ل, بَاعَ is ب ي ع. The muḍāriʿ shows you which.',
        'A shaddah is two letters: مَدَّ is م د د, so the ʿayn and the lām are both د.',
        'A final ا or ى stands for a weak lām: دَعَا is د ع و, رَمَى is ر م ي.'
      ]
    },

    baseMadi: {
      title: 'Getting back to the māḍī',
      bullets: [
        'Strip the tense letter and the ending, then put the word into the plain past for هُوَ — يَنْصُرُونَ goes back to نَصَرَ.',
        'Keep the added letters of the bāb: يَسْتَغْفِرُ goes back to اِسْتَغْفَرَ, not to غَفَرَ.',
        'A weak letter that dropped out comes back: يَعِدُ → وَعَدَ, قُلْ → قَالَ.',
        'This is the form every table is built from, so it is the one worth being fastest at.'
      ]
    },

    production: {
      title: 'Building the form yourself',
      bullets: [
        'Say the ṣarf ṣaghīr of the bāb in your head and stop at the cell you are asked for.',
        'From thulāthī mujarrad: fāʿil is فَاعِل, mafʿūl is مَفْعُول, the ẓarf is مَفْعَل or مَفْعِل, the tool is مِفْعَل / مِفْعَال.',
        'From any mazīd bāb: take the muḍāriʿ, put مُـ in place of the tense letter — kasrah before the last letter for the doer, fatḥah for the one done to.',
        'Passives: ḍammah on the first letter, kasrah before the last in the māḍī; ḍammah on the tense letter, fatḥah before the last in the muḍāriʿ.',
        'Ḥarakāt are not compulsory here — the answer is checked on the letters — but say them anyway.'
      ]
    },

    conjugation: {
      title: 'Running through the fourteen',
      bullets: [
        'Māḍī endings: ـَا dual, ـُوا masc. plural, ـَتْ she, ـْنَ fem. plural, ـْتَ ـْتِ ـْتُمْ for you, ـْتُ for I, ـْنَا for we.',
        'Muḍāriʿ: يـ he/they, تـ she and all of "you", أ for I, نـ for we — plus ـَانِ dual, ـُونَ masc. plural, ـِينَ you (f.), ـْنَ fem. plural.',
        'Weak verbs shift their stem: قَالَ but قُلْتُ, رَمَى but رَمَوْا, مَدَّ but مَدَدْتُ. If the ending starts with a sukūn, expect the stem to change.',
        'The amr only has six forms, all 2nd person.'
      ]
    },

    context: {
      title: 'Reading the gap',
      bullets: [
        'Read the whole sentence first and decide what is missing: a doer, an action, a description, a particle.',
        'Look at what follows the gap. A word in the accusative after it usually means the gap is a verb with an object.',
        'Check agreement: a plural subject wants a plural verb ending, a feminine subject wants تـ or ـَتْ.',
        'Then check the meaning of the English translation underneath — the two together only allow one answer.'
      ]
    },

    root: {
      title: 'Finding the root',
      bullets: [
        'Strip the prefixes and endings first — يـ، تـ، نـ، أ at the front; ـُونَ، ـِينَ، ـَانِ، ـْتُ، ـُوا at the back.',
        'Then remove the added letters, which all come from سَأَلْتُمُونِيهَا. What remains is the root.',
        'Undo the changes weak letters cause: an alif in the middle goes back to و or ي, and a dropped first letter in a mithāl comes back (يَعِدُ → و ع د).',
        'State the root as the bare māḍī of the mujarrad, with no vowels: ن ص ر، ق و ل، د ح ر ج.'
      ]
    },

    sarf: {
      title: 'Placing the word in the table',
      bullets: [
        'Work out what the word IS first: a verb in the past, a verb in the present, a doer, a thing done to, a place, a tool, a command.',
        'Then find the cell with that description — the Arabic term is written beside every row.',
        'مَـ with a fatḥah = place or time; مِـ with a kasrah = tool; مَفْعُول = the one acted upon; فَاعِل = the doer.',
        'The passive rows are the ones whose first letter carries a ḍammah — نُصِرَ، يُنْصَرُ.'
      ]
    },

    translation: {
      title: 'Working out the meaning',
      bullets: [
        'Take the root sense, then apply what the bāb does to it. ع ل م is "knowing": عَلِمَ he knew, عَلَّمَ he taught, تَعَلَّمَ he learned, أَعْلَمَ he informed, اِسْتَعْلَمَ he sought information.',
        'The pattern carries as much meaning as the root does — that is the whole point of learning the abwāb.',
        'If the meaning will not come, say the ṣarf ṣaghīr of the root aloud; the cell usually pulls the word back.'
      ]
    }
  };

  /* ================================================================== */
  /* the browsable reference                                            */
  /* ================================================================== */

  const sections = [
    /* ------------------------------------------------------------- */
    {
      id: 'tricks',
      name: 'Tips & tricks',
      intro: 'The give-aways, gathered in one place. Most of identifying a word is recognising a handful of sounds and shapes: say the ending out loud, look at the front of the word, and read two vowels. Learn this page and the questions start answering themselves.',
      cards: [
        {
          ar: 'أَوَاخِر الكَلِمَات',
          title: 'The endings — say them out loud',
          tag: 'the last syllable names person, gender and number',
          rows: [
            ['"-aa" ـَا', 'dual, in the māḍī — نَصَرَا، نَصَرَتَا'],
            ['"-aani" ـَانِ', 'dual and marfūʿ — يَنْصُرَانِ، مُسْلِمَانِ'],
            ['"-ayni" ـَيْنِ', 'the same dual noun, but manṣūb or majrūr — مُسْلِمَيْنِ'],
            ['"-uu" ـُوا', 'masculine plural in the māḍī or the amr — نَصَرُوا، اُنْصُرُوا'],
            ['"-oona" ـُونَ', 'masculine plural, marfūʿ — يَنْصُرُونَ، مُسْلِمُونَ'],
            ['"-eena" ـِينَ', 'on a verb: you (f. sing.) — تَنْصُرِينَ · on a noun: masculine plural, manṣūb/majrūr — مُسْلِمِينَ'],
            ['"-na" ـْنَ', 'feminine plural, nūn al-niswah — نَصَرْنَ، يَنْصُرْنَ'],
            ['"-at" ـَتْ', 'she, in the māḍī — نَصَرَتْ'],
            ['"-tu" ـْتُ · "-naa" ـْنَا', 'I · we — نَصَرْتُ، نَصَرْنَا'],
            ['"-ta / -ti" ـْتَ ـْتِ', 'you, masculine · feminine — نَصَرْتَ، نَصَرْتِ'],
            ['"-tum / -tunna" ـْتُمْ ـْتُنَّ', 'you, masculine plural · feminine plural — نَصَرْتُمْ، نَصَرْتُنَّ']
          ],
          spot: [
            'Read the ending first and the front of the word second: between them they fix the person, the gender and the number without you having to think about the meaning at all.',
            'A wāw with a silent alif after it (ـُوا) is a plural. A wāw with nothing after it is not: يَدْعُو is "he calls".',
            'The same ـِينَ does two different jobs, so settle ism-or-fiʿl before you use it.'
          ]
        },
        {
          ar: 'الأَفْعَال الخَمْسَة',
          title: 'The five verbs — the nūn tells you the iʿrāb',
          tag: 'aani · oona · eena',
          rows: [
            ['The five', 'يَنْصُرَانِ · تَنْصُرَانِ · يَنْصُرُونَ · تَنْصُرُونَ · تَنْصُرِينَ'],
            ['Nūn still there', 'marfūʿ — يَنْصُرُونَ'],
            ['Nūn gone', 'manṣūb or majzūm — لَنْ يَنْصُرُوا، لَمْ يَنْصُرُوا']
          ],
          spot: [
            'Any muḍāriʿ ending in "-aani", "-oona" or "-eena" is one of the five verbs, and its iʿrāb is decided by whether that nūn survives — not by a vowel you have to squint at.',
            'The nūn of يَنْصُرْنَ is a different beast: it is the pronoun itself, so it never drops however much naṣb or jazm you throw at it.'
          ]
        },
        {
          ar: 'أَنَيْتُ',
          title: 'The front of the word',
          tag: 'prefixes and what they promise',
          rows: [
            ['أ', 'I — أَنْصُرُ'],
            ['نـ', 'we — نَنْصُرُ'],
            ['يـ', 'he, or they — يَنْصُرُ، يَنْصُرُونَ'],
            ['تـ', 'she, or any "you" — تَنْصُرُ، تَنْصُرِينَ'],
            ['fatḥah on that prefix (يَـ)', 'the verb is mujarrad — يَنْصُرُ'],
            ['ḍammah on that prefix (يُـ)', 'the verb is mazīd — يُعَلِّمُ، يُكْرِمُ (or a rubāʿī: يُدَحْرِجُ)']
          ],
          spot: ['The four tense letters are remembered as the word أَنَيْتُ. Nothing else can start a muḍāriʿ.']
        },
        {
          ar: 'حَرَكَتَانِ فَقَط',
          title: 'Two vowels decide the voice',
          tag: 'maʿlūm or majhūl',
          rows: [
            ['Māḍī active', 'نَصَرَ — fatḥah at the front'],
            ['Māḍī passive', 'نُصِرَ — ḍammah at the front, kasrah before the last letter'],
            ['Muḍāriʿ active', 'يَنْصُرُ · يُعَلِّمُ — kasrah or ḍammah before the last letter'],
            ['Muḍāriʿ passive', 'يُنْصَرُ · يُعَلَّمُ — fatḥah before the last letter']
          ],
          spot: [
            'In the muḍāriʿ it comes down to the vowel before the last letter: kasrah = doing, fatḥah = done to.',
            'A ḍammah at the front proves nothing on its own — every Form II, III and IV verb has one in the active too.'
          ]
        },
        {
          ar: 'مُـ · مَـ · مِـ',
          title: 'A mīm at the front',
          tag: 'which kind of noun',
          rows: [
            ['مُـ with a ḍammah', 'a doer or a done-to from a mazīd bāb — مُعَلِّمٌ (kasrah = doer) · مُعَلَّمٌ (fatḥah = done-to)'],
            ['مَـ with a fatḥah', 'a place or a time — مَكْتَبٌ، مَجْلِسٌ · or a mafʿūl from thulāthī — مَنْصُورٌ'],
            ['مِـ with a kasrah', 'a tool — مِفْتَاحٌ، مِضْرَبٌ']
          ],
          spot: ['مَفْتَح would be the place you open; مِفْتَاح is the key. One vowel on the mīm is the whole difference.']
        },
        {
          ar: 'أَلِف الوَصْل',
          title: 'An alif at the front',
          tag: 'which form it belongs to',
          rows: [
            ['أَ that you always pronounce', 'Form IV — أَكْرَمَ (and it vanishes in the muḍāriʿ: يُكْرِمُ)'],
            ['اِ you skip when joining words', 'hamzat waṣl — Forms VII, VIII, IX, X, and every thulāthī amr: اُنْصُرْ، اِضْرِبْ'],
            ['اِنْـ', 'Form VII — اِنْكَسَرَ'], ['اِـتـ', 'Form VIII — اِجْتَمَعَ'],
            ['اِسْتـ', 'Form X — اِسْتَغْفَرَ']
          ],
          spot: ['If the alif disappears when the word is joined to what comes before it, it is waṣl, and the verb is VII, VIII, IX, X or an imperative.']
        },
        {
          ar: 'سَأَلْتُمُونِيهَا',
          title: 'The mnemonics worth memorising',
          tag: 'four short words that carry a lot',
          rows: [
            ['سَأَلْتُمُونِيهَا', 'every letter that can be added to a root. Anything outside it must be a root letter.'],
            ['أَنَيْتُ', 'the four letters a muḍāriʿ can begin with.'],
            ['خُذْ · كُلْ · مُرْ', 'the three verbs that drop their hamzah in the amr (أَخَذَ، أَكَلَ، أَمَرَ).'],
            ['ء ه ع ح غ خ', 'the throat letters — their presence pulls a verb towards bāb fataḥa.']
          ],
          spot: ['Learning these four is worth more than learning fifty words: they let you take apart a word you have never seen.']
        },
        {
          ar: 'المُشْتَبِهَات',
          title: 'The traps — one shape, two jobs',
          tag: 'where people lose marks',
          rows: [
            ['تَنْصُرُ', 'she helps, or you (m.) help'],
            ['ـِينَ', 'you (f.) on a verb, masculine plural on a noun'],
            ['نـ at the front', 'we (نَنْصُرُ), or Form VII (يَنْكَسِرُ)'],
            ['تـ at the front', '2nd person, or Form V/VI (تَعَلَّمَ), or a root letter (تَرْجَمَ)'],
            ['تـ inside', 'Form VIII (اِجْتَمَعَ) — not Form V, where it is out at the front'],
            ['ـُو vs ـُوا', 'يَدْعُو is "he calls"; نَصَرُوا is "they helped"'],
            ['نَ of ـُونَ vs نَ of ـْنَ', 'the first is a sign of rafʿ and drops; the second is a pronoun and never does']
          ],
          spot: ['When two readings are possible, the sentence around the word decides — but knowing that the ambiguity exists is what stops you guessing confidently and wrongly.']
        },
        {
          ar: 'الأَبْوَاب',
          title: 'Naming the bāb quickly',
          tag: 'start from the māḍī vowel',
          rows: [
            ['ḍammah on the ʿayn — فَعُلَ', 'karuma. No other option.'],
            ['kasrah on the ʿayn — فَعِلَ', 'ʿalima, or the rare ḥasiba.'],
            ['fatḥah on the ʿayn — فَعَلَ', 'naṣara, ḍaraba or fataḥa — you need the muḍāriʿ vowel.'],
            ['a throat letter in the root', 'leans towards fataḥa — فَتَحَ، ذَهَبَ، مَنَعَ'],
            ['a settled quality', 'leans towards karuma — كَرُمَ، حَسُنَ'],
            ['a sense or an inner state', 'leans towards ʿalima — سَمِعَ، فَرِحَ']
          ],
          spot: ['Three of the six are settled by the māḍī alone. That is why a dictionary always gives you both parts.']
        },
        {
          ar: 'الجُمُوع',
          title: 'Plurals beyond "-oona"',
          tag: 'the feminine plural, and the ones with no ending at all',
          rows: [
            ['"-aat" ـَاتٌ', 'sound feminine plural — مُسْلِمَاتٌ، مُعَلِّمَاتٌ'],
            ['its cases', 'marfūʿ takes a ḍammah (مُسْلِمَاتٌ); manṣūb and majrūr both take a kasrah (مُسْلِمَاتٍ) — a fatḥah never appears on it'],
            ['broken plural — جَمْع التَّكْسِير', 'no ending at all: the word itself is rebuilt — رَجُل → رِجَال، كِتَاب → كُتُب، عَالِم → عُلَمَاء، مَسْجِد → مَسَاجِد'],
            ['common broken shapes', 'أَفْعَال · فُعُول · فِعَال · فُعَلَاء · مَفَاعِل']
          ],
          spot: [
            'If a word clearly means more than two but carries none of ـُونَ ـِينَ ـَاتٌ, it is a broken plural — and those come with the singular, not from a rule.',
            'Careful with ـَات: it is a plural marker on a noun, but the ـَتْ of نَصَرَتْ is "she" on a verb. Settle ism-or-fiʿl first.'
          ],
          means: [
            'A plural of non-humans is treated as a feminine singular: الكُتُبُ جَمِيلَةٌ, الجِبَالُ تَسِيرُ — not جَمِيلَاتٌ, not يَسِيرُونَ.',
            'A verb that comes before its subject stays singular: قَالَ الرِّجَالُ, never قَالُوا الرِّجَالُ.'
          ]
        },
        {
          ar: 'التَّنْوِين وَأَلْ',
          title: 'Tanwīn, الـ and the words that refuse tanwīn',
          tag: 'quick tests on any noun',
          rows: [
            ['tanwīn', 'only ever sits on an ism — a verb can never carry it. Instant word-type test.'],
            ['الـ + tanwīn', 'never both at once, and no tanwīn inside an iḍāfah: كِتَابُ الوَلَدِ'],
            ['diptotes — المَمْنُوع مِنَ الصَّرْف', 'أَفْعَل (أَكْبَرُ) · فَعْلَاء (حَمْرَاءُ) · فُعَلَاء (عُلَمَاءُ) · مَفَاعِل (مَسَاجِدُ)'],
            ['how a diptote behaves', 'no tanwīn, and a fatḥah where you expect a kasrah in jarr: فِي مَسَاجِدَ']
          ],
          spot: ['A noun with no tanwīn and no الـ that takes a fatḥah after a ḥarf al-jarr is not a mistake — it is a diptote.']
        },
        {
          ar: 'اللَّازِم وَالمُتَعَدِّي',
          title: 'Does it take an object?',
          tag: 'transitive or intransitive, by bāb',
          rows: [
            ['bāb karuma', 'always lāzim — a settled quality has nothing to fall on'],
            ['Forms VII and IX', 'always lāzim — they carry an effect rather than do something'],
            ['Forms II, III, IV', 'commonly make a verb transitive: عَلِمَ → عَلَّمَ / أَعْلَمَ'],
            ['Form X', 'usually transitive — you seek something'],
            ['the ṣarf ṣaghīr itself', 'if it has an ism al-mafʿūl, the verb takes an object; if that cell is —, it does not']
          ],
          spot: ['A lāzim verb still reaches an object, but through a preposition: ذَهَبَ إِلَى المَسْجِدِ, جَلَسَ فِي البَيْتِ.']
        },
        {
          ar: 'المَصْدَر يَدُلُّ عَلَى البَاب',
          title: 'The maṣdar names the bāb on sight',
          tag: 'works in both directions',
          rows: [
            ['تَفْعِيل', 'Form II'], ['مُفَاعَلَة / فِعَال', 'Form III'], ['إِفْعَال', 'Form IV'],
            ['تَفَعُّل', 'Form V'], ['تَفَاعُل', 'Form VI'], ['اِنْفِعَال', 'Form VII'],
            ['اِفْتِعَال', 'Form VIII'], ['اِفْعِلَال', 'Form IX'], ['اِسْتِفْعَال', 'Form X'],
            ['فَعْلَلَة', 'rubāʿī mujarrad']
          ],
          spot: [
            'See اِسْتِغْفَارًا and you know it is Form X of غ ف ر without ever meeting the verb.',
            'It runs the other way too: know the bāb and the maṣdar is fixed — which is why the mujarrad maṣdars, which have no rule, are the ones you must memorise.'
          ]
        },
        {
          ar: 'الأَجْوَف',
          title: 'Hollow verbs — the leftover vowel gives the game away',
          tag: 'when the middle letter drops',
          rows: [
            ['قُلْتُ — ḍammah', 'from قَالَ يَقُولُ, so the ʿayn is a wāw'],
            ['بِعْتُ — kasrah', 'from بَاعَ يَبِيعُ, so the ʿayn is a yāʾ'],
            ['خِفْتُ — kasrah', 'from خَافَ يَخَافُ, bāb ʿalima'],
            ['نَاقِص before ـَتْ', 'the weak letter drops too: رَمَى → رَمَتْ, دَعَا → دَعَتْ']
          ],
          spot: ['When the middle letter vanishes, the vowel it leaves on the first letter is the fingerprint of the original — that is how you recover the root.']
        },
        {
          ar: 'اِفْتَعَلَ المُدْغَم',
          title: 'Form VIII in disguise',
          tag: 'when the تـ changes or swallows a letter',
          rows: [
            ['اِتَّصَلَ', 'Form VIII of و ص ل — the wāw assimilated into the tāʾ'],
            ['اِتَّخَذَ', 'Form VIII of أ خ ذ'],
            ['اِصْطَبَرَ', 'ص ب ر — the tāʾ hardened to ط'],
            ['اِضْطَرَبَ', 'ض ر ب'], ['اِزْدَحَمَ', 'ز ح م — the tāʾ softened to د'],
            ['اِدَّعَى', 'د ع و']
          ],
          spot: ['A shaddah on a tāʾ near the front, or a ط / د sitting where a تـ should be, is almost always Form VIII hiding. Do not count the changed letter as a radical.']
        },
        {
          ar: 'الحُرُوف العَامِلَة',
          title: 'The particles that change the verb',
          tag: 'what to look for in front',
          rows: [
            ['أَنْ · لَنْ · كَيْ · حَتَّى · لِـ (of purpose)', 'manṣūb — fatḥah, and the nūn of the five verbs drops'],
            ['لَمْ · لَمَّا · لَا (of prohibition) · لِـ (of command) · إِنْ', 'majzūm — sukūn, or a weak letter drops, or the nūn drops'],
            ['قَدْ · سَـ · سَوْفَ', 'no change to the iʿrāb, but they prove the word is a verb'],
            ['مَا · لَيْسَ', 'negate without touching the ending']
          ],
          spot: ['لَمْ is the one that catches people: the verb after it is a muḍāriʿ in form but past in meaning — لَمْ يَنْصُرْ is "he did not help".']
        }
      ]
    },

    /* ------------------------------------------------------------- */
    {
      id: 'gates',
      name: 'The six gates',
      /* six long cards: one page each, rather than one page you scroll */
      subpages: true,
      intro: 'Every thulāthī mujarrad verb belongs to one of these six abwāb. The bāb is decided by two vowels: the one on the middle letter of the māḍī, and the one on the middle letter of the muḍāriʿ. Learn the pair and you can build the whole ṣarf ṣaghīr yourself.',
      cards: [
        {
          ar: 'نَصَرَ يَنْصُرُ',
          title: 'Bāb 1 — naṣara',
          tag: 'fatḥah → ḍammah',
          rows: [['Maṣdar (commonest)', 'فَعْلًا — نَصْرًا'], ['Ism al-fāʿil', 'نَاصِرٌ'], ['Ism al-mafʿūl', 'مَنْصُورٌ']],
          spot: ['Fatḥah on the ʿayn of the māḍī, ḍammah on the ʿayn of the muḍāriʿ.', 'Nothing in the letters gives it away — this bāb has to be learned verb by verb.'],
          means: ['Mostly transitive, plain physical or worldly actions.'],
          examples: [
            { ar: 'نَصَرَ يَنْصُرُ', en: 'to help' },
            { ar: 'كَتَبَ يَكْتُبُ', en: 'to write' },
            { ar: 'دَخَلَ يَدْخُلُ', en: 'to enter' },
            { ar: 'خَرَجَ يَخْرُجُ', en: 'to go out' }
          ]
        },
        {
          ar: 'ضَرَبَ يَضْرِبُ',
          title: 'Bāb 2 — ḍaraba',
          tag: 'fatḥah → kasrah',
          rows: [['Maṣdar (commonest)', 'فَعْلًا — ضَرْبًا'], ['Ism al-fāʿil', 'ضَارِبٌ'], ['Ism al-mafʿūl', 'مَضْرُوبٌ']],
          spot: ['Fatḥah on the ʿayn of the māḍī, kasrah on the ʿayn of the muḍāriʿ.', 'Almost every mithāl wāwī verb (وَعَدَ، وَصَلَ، وَزَنَ) sits here, and drops its و in the muḍāriʿ.'],
          means: ['Mostly transitive; a very large bāb.'],
          examples: [
            { ar: 'ضَرَبَ يَضْرِبُ', en: 'to strike' },
            { ar: 'جَلَسَ يَجْلِسُ', en: 'to sit' },
            { ar: 'عَرَفَ يَعْرِفُ', en: 'to know, recognise' },
            { ar: 'وَعَدَ يَعِدُ', en: 'to promise' }
          ]
        },
        {
          ar: 'فَتَحَ يَفْتَحُ',
          title: 'Bāb 3 — fataḥa',
          tag: 'fatḥah → fatḥah',
          rows: [['Maṣdar (commonest)', 'فَعْلًا — فَتْحًا'], ['Ism al-fāʿil', 'فَاتِحٌ'], ['Ism al-mafʿūl', 'مَفْتُوحٌ']],
          spot: ['Fatḥah in both.', 'It needs a throat letter — ء ه ع ح غ خ — as the middle or the last root letter. That is the one bāb you can often predict from the letters alone.'],
          means: ['Mostly transitive.'],
          examples: [
            { ar: 'فَتَحَ يَفْتَحُ', en: 'to open' },
            { ar: 'ذَهَبَ يَذْهَبُ', en: 'to go' },
            { ar: 'مَنَعَ يَمْنَعُ', en: 'to prevent' },
            { ar: 'قَرَأَ يَقْرَأُ', en: 'to read, recite' }
          ]
        },
        {
          ar: 'عَلِمَ يَعْلَمُ',
          title: 'Bāb 4 — ʿalima',
          tag: 'kasrah → fatḥah',
          rows: [['Maṣdar (commonest)', 'عِلْمًا، فَرَحًا'], ['Ism al-fāʿil', 'عَالِمٌ'], ['Ism al-mafʿūl', 'مَعْلُومٌ']],
          spot: ['Kasrah on the ʿayn of the māḍī, fatḥah in the muḍāriʿ.', 'If the māḍī has a kasrah, this is the bāb to assume — ḥasiba is a short, closed list.'],
          means: ['Senses, inner states and passing conditions — knowing, hearing, drinking, rejoicing, grieving.', 'Some are transitive (عَلِمَ، سَمِعَ), many are not (فَرِحَ، حَزِنَ).'],
          examples: [
            { ar: 'عَلِمَ يَعْلَمُ', en: 'to know' },
            { ar: 'سَمِعَ يَسْمَعُ', en: 'to hear' },
            { ar: 'شَرِبَ يَشْرَبُ', en: 'to drink' },
            { ar: 'فَرِحَ يَفْرَحُ', en: 'to rejoice' }
          ]
        },
        {
          ar: 'كَرُمَ يَكْرُمُ',
          title: 'Bāb 5 — karuma',
          tag: 'ḍammah → ḍammah',
          rows: [['Maṣdar (commonest)', 'كَرَمًا، كَرَامَةً، حُسْنًا'], ['Its adjective', 'a ṣifah mushabbahah — كَرِيمٌ، حَسَنٌ'], ['Ism al-mafʿūl', 'none — it is intransitive']],
          spot: ['A ḍammah on the ʿayn of the māḍī can only be this bāb — no ambiguity at all.'],
          means: ['Innate, settled qualities: being noble, being beautiful, being big.', 'Always lāzim, so it has no passive and no ism al-mafʿūl.'],
          examples: [
            { ar: 'كَرُمَ يَكْرُمُ', en: 'to be noble' },
            { ar: 'حَسُنَ يَحْسُنُ', en: 'to be beautiful' },
            { ar: 'كَبُرَ يَكْبُرُ', en: 'to be big' },
            { ar: 'شَرُفَ يَشْرُفُ', en: 'to be honourable' }
          ]
        },
        {
          ar: 'حَسِبَ يَحْسِبُ',
          title: 'Bāb 6 — ḥasiba',
          tag: 'kasrah → kasrah',
          rows: [['Maṣdar (commonest)', 'حِسْبَانًا'], ['Ism al-fāʿil', 'حَاسِبٌ'], ['Ism al-mafʿūl', 'مَحْسُوبٌ']],
          spot: ['Kasrah in both — the rarest bāb, and a closed list worth memorising outright.', 'Most of its verbs are mithāl wāwī: وَرِثَ، وَثِقَ، وَرِمَ.'],
          means: ['No single theme — learn the handful of verbs and you have the bāb.'],
          examples: [
            { ar: 'حَسِبَ يَحْسِبُ', en: 'to reckon, to think' },
            { ar: 'وَرِثَ يَرِثُ', en: 'to inherit' },
            { ar: 'وَثِقَ يَثِقُ', en: 'to trust' },
            { ar: 'نَعِمَ يَنْعِمُ', en: 'to live in ease' }
          ]
        }
      ]
    },

    /* ------------------------------------------------------------- */
    {
      id: 'forms',
      name: 'Forms II–X',
      /* nine long cards: one page each */
      subpages: true,
      intro: 'A mazīd fīh verb is the root plus one or more added letters, and each set of additions carries its own meaning. Learn what each form does and you can often guess a new verb from a root you already know.',
      cards: [
        {
          ar: 'فَعَّلَ يُفَعِّلُ',
          title: 'Form II — al-tafʿīl',
          tag: 'the ʿayn is doubled',
          rows: [
            ['Māḍī / muḍāriʿ', 'فَعَّلَ / يُفَعِّلُ'],
            ['Maṣdar', 'تَفْعِيلًا'],
            ['Fāʿil / mafʿūl', 'مُفَعِّلٌ / مُفَعَّلٌ'],
            ['Amr', 'فَعِّلْ']
          ],
          spot: ['A shaddah on the middle root letter, and a ḍammah on the tense letter of the muḍāriʿ.', 'Its maṣdar تَفْعِيل is unmistakable.'],
          means: [
            'Making a verb transitive (taʿdiyah): عَلِمَ he knew → عَلَّمَ he taught someone.',
            'Intensity or repetition (takthīr): كَسَرَ he broke → كَسَّرَ he smashed to pieces; طَافَ he circled → طَوَّفَ he went round and round.',
            'Declaring someone to be something: كَفَّرَ he called him a disbeliever; صَدَّقَ he declared him truthful.'
          ],
          examples: [
            { ar: 'عَلَّمَ يُعَلِّمُ تَعْلِيمًا', en: 'to teach' },
            { ar: 'نَزَّلَ يُنَزِّلُ تَنْزِيلًا', en: 'to send down' },
            { ar: 'كَبَّرَ يُكَبِّرُ تَكْبِيرًا', en: 'to magnify' }
          ]
        },
        {
          ar: 'فَاعَلَ يُفَاعِلُ',
          title: 'Form III — al-mufāʿalah',
          tag: 'an alif after the first letter',
          rows: [
            ['Māḍī / muḍāriʿ', 'فَاعَلَ / يُفَاعِلُ'],
            ['Maṣdar', 'مُفَاعَلَةً وَفِعَالًا'],
            ['Fāʿil / mafʿūl', 'مُفَاعِلٌ / مُفَاعَلٌ'],
            ['Amr', 'فَاعِلْ']
          ],
          spot: ['A long alif straight after the first root letter, with a ḍammah on the tense letter of the muḍāriʿ.', 'Do not confuse مُفَاعِل (Form III doer) with فَاعِل (Form I doer).'],
          means: [
            'Doing the action with or against another party (mushārakah): قَاتَلَ he fought someone; كَاتَبَ he corresponded with someone.',
            'Directing the action at someone: نَادَى he called out to him.',
            'Sometimes simply a transitive verb with no partner implied: سَافَرَ he travelled.'
          ],
          examples: [
            { ar: 'جَاهَدَ يُجَاهِدُ جِهَادًا', en: 'to strive, struggle against' },
            { ar: 'قَاتَلَ يُقَاتِلُ قِتَالًا', en: 'to fight' },
            { ar: 'سَاعَدَ يُسَاعِدُ مُسَاعَدَةً', en: 'to help' }
          ]
        },
        {
          ar: 'أَفْعَلَ يُفْعِلُ',
          title: 'Form IV — al-ifʿāl',
          tag: 'a hamzah at the front',
          rows: [
            ['Māḍī / muḍāriʿ', 'أَفْعَلَ / يُفْعِلُ'],
            ['Maṣdar', 'إِفْعَالًا'],
            ['Fāʿil / mafʿūl', 'مُفْعِلٌ / مُفْعَلٌ'],
            ['Amr', 'أَفْعِلْ']
          ],
          spot: ['A cutting hamzah on the māḍī (أَكْرَمَ) which disappears in the muḍāriʿ (يُكْرِمُ), leaving a sukūn on the first root letter.', 'That أَفْعَلَ / يُفْعِلُ pairing is the surest sign — Form I never looks like this.'],
          means: [
            'Causative (taʿdiyah), the commonest use: خَرَجَ he went out → أَخْرَجَ he took (something) out; عَلِمَ he knew → أَعْلَمَ he informed.',
            'Entering a time or a place: أَصْبَحَ he entered the morning; أَشْأَمَ he went to Syria.',
            'Finding something to have a quality: أَحْمَدْتُهُ I found him praiseworthy.'
          ],
          examples: [
            { ar: 'أَسْلَمَ يُسْلِمُ إِسْلَامًا', en: 'to submit, become Muslim' },
            { ar: 'أَكْرَمَ يُكْرِمُ إِكْرَامًا', en: 'to honour' },
            { ar: 'أَرْسَلَ يُرْسِلُ إِرْسَالًا', en: 'to send' }
          ]
        },
        {
          ar: 'تَفَعَّلَ يَتَفَعَّلُ',
          title: 'Form V — al-tafaʿʿul',
          tag: 'تـ in front of Form II',
          rows: [
            ['Māḍī / muḍāriʿ', 'تَفَعَّلَ / يَتَفَعَّلُ'],
            ['Maṣdar', 'تَفَعُّلًا'],
            ['Fāʿil / mafʿūl', 'مُتَفَعِّلٌ / مُتَفَعَّلٌ'],
            ['Amr', 'تَفَعَّلْ']
          ],
          spot: ['تـ at the very front plus a shaddah on the middle letter.', 'Its muḍāriʿ keeps a fatḥah on the tense letter (يَتَعَلَّمُ), unlike Forms II–IV.'],
          means: [
            'Muṭāwaʿah of Form II — the effect of Form II settling on the subject: عَلَّمَهُ he taught him → تَعَلَّمَ he learned; كَسَّرَهُ he smashed it → تَكَسَّرَ it broke up.',
            'Taking something on with effort (takalluf): تَصَبَّرَ he forced himself to be patient.',
            'Doing something bit by bit: تَجَرَّعَ he swallowed it in gulps.'
          ],
          examples: [
            { ar: 'تَعَلَّمَ يَتَعَلَّمُ تَعَلُّمًا', en: 'to learn' },
            { ar: 'تَقَبَّلَ يَتَقَبَّلُ تَقَبُّلًا', en: 'to accept' },
            { ar: 'تَذَكَّرَ يَتَذَكَّرُ تَذَكُّرًا', en: 'to remember' }
          ]
        },
        {
          ar: 'تَفَاعَلَ يَتَفَاعَلُ',
          title: 'Form VI — al-tafāʿul',
          tag: 'تـ in front of Form III',
          rows: [
            ['Māḍī / muḍāriʿ', 'تَفَاعَلَ / يَتَفَاعَلُ'],
            ['Maṣdar', 'تَفَاعُلًا'],
            ['Fāʿil', 'مُتَفَاعِلٌ'],
            ['Amr', 'تَفَاعَلْ']
          ],
          spot: ['تـ at the front and an alif after the first root letter.'],
          means: [
            'A mutual action between two or more parties (mushārakah): تَقَاتَلَ they fought each other; تَعَاوَنَ they cooperated.',
            'Pretending: تَمَارَضَ he pretended to be ill; تَنَاوَمَ he feigned sleep.',
            'Something happening by degrees: تَزَايَدَ it increased steadily.'
          ],
          examples: [
            { ar: 'تَعَاوَنَ يَتَعَاوَنُ تَعَاوُنًا', en: 'to cooperate' },
            { ar: 'تَقَاتَلَ يَتَقَاتَلُ تَقَاتُلًا', en: 'to fight one another' },
            { ar: 'تَبَارَكَ يَتَبَارَكُ', en: 'to be blessed' }
          ]
        },
        {
          ar: 'اِنْفَعَلَ يَنْفَعِلُ',
          title: 'Form VII — al-infiʿāl',
          tag: 'نـ after a hamzat waṣl',
          rows: [
            ['Māḍī / muḍāriʿ', 'اِنْفَعَلَ / يَنْفَعِلُ'],
            ['Maṣdar', 'اِنْفِعَالًا'],
            ['Fāʿil', 'مُنْفَعِلٌ'],
            ['Amr', 'اِنْفَعِلْ']
          ],
          spot: ['A نـ right after the connecting hamzah at the front.', 'It never comes from roots beginning with ن ل ر م و ي — the sound would collapse.'],
          means: [
            'Muṭāwaʿah of Form I — the effect of the simple verb happening to the subject: كَسَرَهُ he broke it → اِنْكَسَرَ it broke.',
            'Always intransitive, so it has no passive and no ism al-mafʿūl.'
          ],
          examples: [
            { ar: 'اِنْكَسَرَ يَنْكَسِرُ اِنْكِسَارًا', en: 'to be broken' },
            { ar: 'اِنْقَطَعَ يَنْقَطِعُ اِنْقِطَاعًا', en: 'to be cut off' },
            { ar: 'اِنْفَتَحَ يَنْفَتِحُ اِنْفِتَاحًا', en: 'to be opened' }
          ]
        },
        {
          ar: 'اِفْتَعَلَ يَفْتَعِلُ',
          title: 'Form VIII — al-iftiʿāl',
          tag: 'تـ tucked in after the first letter',
          rows: [
            ['Māḍī / muḍāriʿ', 'اِفْتَعَلَ / يَفْتَعِلُ'],
            ['Maṣdar', 'اِفْتِعَالًا'],
            ['Fāʿil / mafʿūl', 'مُفْتَعِلٌ / مُفْتَعَلٌ'],
            ['Amr', 'اِفْتَعِلْ']
          ],
          spot: ['The تـ sits inside the word, after the first root letter — that is what separates it from Form V, where the تـ is at the front.', 'The تـ can change to suit its neighbour: اِصْطَبَرَ (from ص ب ر), اِزْدَحَمَ (from ز ح م), اِدَّعَى (from د ع و).'],
          means: [
            'Muṭāwaʿah of Form I: جَمَعَهُ he gathered it → اِجْتَمَعَ they came together.',
            'Doing something for one\'s own benefit: كَسَبَ he earned → اِكْتَسَبَ he earned for himself.',
            'Effort and application: اِجْتَهَدَ he exerted himself.'
          ],
          examples: [
            { ar: 'اِجْتَمَعَ يَجْتَمِعُ اِجْتِمَاعًا', en: 'to gather together' },
            { ar: 'اِجْتَهَدَ يَجْتَهِدُ اِجْتِهَادًا', en: 'to strive, exert oneself' },
            { ar: 'اِسْتَمَعَ يَسْتَمِعُ اِسْتِمَاعًا', en: 'to listen attentively' }
          ]
        },
        {
          ar: 'اِفْعَلَّ يَفْعَلُّ',
          title: 'Form IX — al-ifʿilāl',
          tag: 'the last letter doubled',
          rows: [
            ['Māḍī / muḍāriʿ', 'اِفْعَلَّ / يَفْعَلُّ'],
            ['Maṣdar', 'اِفْعِلَالًا'],
            ['Fāʿil', 'مُفْعَلٌّ'],
            ['Amr', 'اِفْعَلَّ / اِفْعَلِلْ']
          ],
          spot: ['Hamzat waṣl at the front and a shaddah on the final root letter.'],
          means: [
            'Reserved for colours and physical defects: اِحْمَرَّ it turned red; اِسْوَدَّ it turned black; اِعْوَجَّ it became crooked.',
            'Always intransitive.'
          ],
          examples: [
            { ar: 'اِحْمَرَّ يَحْمَرُّ اِحْمِرَارًا', en: 'to turn red' },
            { ar: 'اِسْوَدَّ يَسْوَدُّ اِسْوِدَادًا', en: 'to turn black' },
            { ar: 'اِعْوَجَّ يَعْوَجُّ اِعْوِجَاجًا', en: 'to become crooked' }
          ]
        },
        {
          ar: 'اِسْتَفْعَلَ يَسْتَفْعِلُ',
          title: 'Form X — al-istifʿāl',
          tag: 'اِسْتـ at the front',
          rows: [
            ['Māḍī / muḍāriʿ', 'اِسْتَفْعَلَ / يَسْتَفْعِلُ'],
            ['Maṣdar', 'اِسْتِفْعَالًا'],
            ['Fāʿil / mafʿūl', 'مُسْتَفْعِلٌ / مُسْتَفْعَلٌ'],
            ['Amr', 'اِسْتَفْعِلْ']
          ],
          spot: ['اِسْتـ at the front — the most visible of all the forms.'],
          means: [
            'Seeking or asking for the action (ṭalab), the commonest use: اِسْتَغْفَرَ he sought forgiveness; اِسْتَأْذَنَ he asked permission.',
            'Considering something to be so: اِسْتَحْسَنَهُ he deemed it good; اِسْتَكْبَرَ he thought himself great.',
            'Turning into something: اِسْتَحْجَرَ الطِّينُ the clay turned to stone.'
          ],
          examples: [
            { ar: 'اِسْتَغْفَرَ يَسْتَغْفِرُ اِسْتِغْفَارًا', en: 'to seek forgiveness' },
            { ar: 'اِسْتَخْرَجَ يَسْتَخْرِجُ اِسْتِخْرَاجًا', en: 'to extract' },
            { ar: 'اِسْتَعَانَ يَسْتَعِينُ اِسْتِعَانَةً', en: 'to seek help' }
          ]
        }
      ]
    },

    /* ------------------------------------------------------------- */
    {
      id: 'rubai',
      name: 'Rubāʿī',
      intro: 'Verbs with four root letters. One bare pattern, three augmented ones.',
      cards: [
        {
          ar: 'فَعْلَلَ يُفَعْلِلُ',
          title: 'Rubāʿī mujarrad — faʿlala',
          tag: 'four root letters, nothing added',
          rows: [['Maṣdar', 'فَعْلَلَةً وَفِعْلَالًا'], ['Fāʿil / mafʿūl', 'مُفَعْلِلٌ / مُفَعْلَلٌ'], ['Amr', 'فَعْلِلْ']],
          spot: ['Four letters that are all part of the root.', 'Its muḍāriʿ takes a ḍammah on the tense letter (يُدَحْرِجُ) even though it is mujarrad — the one exception to that rule of thumb.'],
          means: ['Often onomatopoeic or repetitive: وَسْوَسَ to whisper, زَلْزَلَ to shake.'],
          examples: [
            { ar: 'دَحْرَجَ يُدَحْرِجُ دَحْرَجَةً', en: 'to roll something along' },
            { ar: 'تَرْجَمَ يُتَرْجِمُ تَرْجَمَةً', en: 'to translate' },
            { ar: 'زَلْزَلَ يُزَلْزِلُ زَلْزَلَةً', en: 'to shake violently' }
          ]
        },
        {
          ar: 'تَفَعْلَلَ يَتَفَعْلَلُ',
          title: 'Tafaʿlala',
          tag: 'تـ added at the front',
          rows: [['Maṣdar', 'تَفَعْلُلًا'], ['Fāʿil', 'مُتَفَعْلِلٌ']],
          spot: ['تـ in front of a four-letter root.'],
          means: ['Muṭāwaʿah — the effect of faʿlala landing on the subject: دَحْرَجَهُ he rolled it → تَدَحْرَجَ it rolled along.'],
          examples: [{ ar: 'تَدَحْرَجَ يَتَدَحْرَجُ تَدَحْرُجًا', en: 'to roll along' }]
        },
        {
          ar: 'اِفْعَنْلَلَ يَفْعَنْلِلُ',
          title: 'Ifʿanlala',
          tag: 'نـ infixed',
          rows: [['Maṣdar', 'اِفْعِنْلَالًا']],
          spot: ['A نـ inserted after the third letter, behind a hamzat waṣl.'],
          means: ['Rare; gathering and crowding.'],
          examples: [{ ar: 'اِحْرَنْجَمَ يَحْرَنْجِمُ', en: 'to crowd together' }]
        },
        {
          ar: 'اِفْعَلَلَّ يَفْعَلِلُّ',
          title: 'Ifʿalalla',
          tag: 'last letter doubled',
          rows: [['Maṣdar', 'اِفْعِلْلَالًا']],
          spot: ['Hamzat waṣl at the front and a shaddah at the end.'],
          means: ['Intense physical states.'],
          examples: [{ ar: 'اِقْشَعَرَّ يَقْشَعِرُّ اِقْشِعْرَارًا', en: 'to shudder, get goosebumps' }]
        }
      ]
    },

    /* ------------------------------------------------------------- */
    {
      id: 'nouns',
      name: 'Noun patterns',
      intro: 'The derived nouns on the second page of the chart. Each has a shape you can recognise on sight.',
      cards: [
        {
          ar: 'اِسْم الفَاعِل',
          title: 'Ism al-fāʿil — the doer',
          tag: 'فَاعِل',
          rows: [['From thulāthī mujarrad', 'فَاعِل — كَاتِبٌ، نَاصِرٌ'], ['From any mazīd bāb', 'مُـ + muḍāriʿ stem, kasrah before the last letter — مُعَلِّمٌ، مُسْلِمٌ، مُسْتَغْفِرٌ']],
          spot: ['Take the muḍāriʿ, swap the tense letter for مُـ, and put a kasrah before the last letter. يُعَلِّمُ → مُعَلِّمٌ.'],
          means: ['The one performing the action: a writer, a helper, a teacher.'],
          examples: [{ ar: 'كَاتِبٌ', en: 'a writer' }, { ar: 'مُجَاهِدٌ', en: 'one who strives' }, { ar: 'مُسْتَغْفِرٌ', en: 'one seeking forgiveness' }]
        },
        {
          ar: 'اِسْم المَفْعُول',
          title: 'Ism al-mafʿūl — the one acted upon',
          tag: 'مَفْعُول',
          rows: [['From thulāthī mujarrad', 'مَفْعُول — مَكْتُوبٌ، مَنْصُورٌ'], ['From any mazīd bāb', 'the same as the fāʿil but with a fatḥah before the last letter — مُعَلَّمٌ، مُكْرَمٌ، مُسْتَخْرَجٌ']],
          spot: ['In the mazīd forms the doer and the done-to differ by a single vowel: kasrah = doer, fatḥah = done-to. مُعَلِّم the teacher, مُعَلَّم the taught.'],
          means: ['The thing the action falls upon.'],
          examples: [{ ar: 'مَكْتُوبٌ', en: 'written' }, { ar: 'مُعَلَّمٌ', en: 'one who is taught' }]
        },
        {
          ar: 'الصِّفَة المُشَبَّهَة',
          title: 'Ṣifah mushabbahah — a settled quality',
          tag: 'فَعِيل، فَعِل، أَفْعَل، فَعْلَان',
          rows: [['Common patterns', 'كَرِيمٌ، حَسَنٌ، فَرِحٌ، أَحْمَرُ، عَطْشَانُ']],
          spot: ['It looks like a description rather than an action, and it usually comes from an intransitive verb — especially bāb karuma.'],
          means: ['A permanent or long-standing quality, not something passing. كَرِيم is generous by nature; نَاصِر is helping right now.'],
          examples: [{ ar: 'كَرِيمٌ', en: 'noble, generous' }, { ar: 'أَحْمَرُ', en: 'red' }, { ar: 'عَطْشَانُ', en: 'thirsty' }]
        },
        {
          ar: 'اِسْم التَّفْضِيل',
          title: 'Ism al-tafḍīl — the elative',
          tag: 'أَفْعَل',
          rows: [['Masculine', 'أَفْعَل — أَكْبَرُ، أَحْسَنُ'], ['Feminine', 'فُعْلَى — كُبْرَى، حُسْنَى']],
          spot: ['أَفْعَل on a noun, not a verb. If it is a colour or a defect (أَحْمَر، أَعْرَج) it is a ṣifah mushabbahah instead.'],
          means: ['More X, or the most X.'],
          examples: [{ ar: 'أَكْبَرُ', en: 'greater, greatest' }, { ar: 'أَحْسَنُ', en: 'better, best' }]
        },
        {
          ar: 'اِسْم الظَّرْف',
          title: 'Ism al-ẓarf — place or time',
          tag: 'مَفْعَل / مَفْعِل',
          rows: [['If the muḍāriʿ has ḍammah or fatḥah', 'مَفْعَل — مَكْتَبٌ، مَذْهَبٌ'], ['If the muḍāriʿ has kasrah', 'مَفْعِل — مَجْلِسٌ، مَوْعِدٌ'], ['Also', 'مَفْعَلَة — مَدْرَسَةٌ']],
          spot: ['مَـ with a fatḥah on the mīm. Match the vowel of the muḍāriʿ: يَجْلِسُ gives مَجْلِس, يَكْتُبُ gives مَكْتَب.'],
          means: ['Where or when the action happens.'],
          examples: [{ ar: 'مَكْتَبٌ', en: 'a desk, an office' }, { ar: 'مَجْلِسٌ', en: 'a sitting place, a council' }]
        },
        {
          ar: 'اِسْم الآلَة',
          title: 'Ism al-ālah — the tool',
          tag: 'مِفْعَل، مِفْعَال، مِفْعَلَة',
          rows: [['Patterns', 'مِفْعَل — مِضْرَبٌ · مِفْعَال — مِفْتَاحٌ · مِفْعَلَة — مِكْنَسَةٌ']],
          spot: ['A kasrah on the mīm is the whole difference: مِفْتَاح is the key (tool), مَفْتَح would be the place.'],
          means: ['The instrument the action is done with.'],
          examples: [{ ar: 'مِفْتَاحٌ', en: 'a key' }, { ar: 'مِضْرَبٌ', en: 'a bat, a racket' }, { ar: 'مِكْنَسَةٌ', en: 'a broom' }]
        },
        {
          ar: 'المَصْدَر',
          title: 'Maṣdar — the bare action',
          tag: 'fixed for mazīd, learned for mujarrad',
          rows: [
            ['Form II', 'تَفْعِيل'], ['Form III', 'مُفَاعَلَة / فِعَال'], ['Form IV', 'إِفْعَال'],
            ['Form V', 'تَفَعُّل'], ['Form VI', 'تَفَاعُل'], ['Form VII', 'اِنْفِعَال'],
            ['Form VIII', 'اِفْتِعَال'], ['Form IX', 'اِفْعِلَال'], ['Form X', 'اِسْتِفْعَال']
          ],
          spot: ['Every mazīd bāb has one fixed maṣdar pattern — worth memorising as a block, because it identifies the bāb instantly.', 'The mujarrad maṣdars have no single rule (نَصْر، جُلُوس، عِلْم، كَرَامَة) and must be learned with the verb.'],
          means: ['The action named as a thing: helping, teaching, seeking forgiveness.'],
          examples: [{ ar: 'تَعْلِيمًا', en: 'teaching' }, { ar: 'اِسْتِغْفَارًا', en: 'seeking forgiveness' }]
        }
      ]
    },

    /* ------------------------------------------------------------- */
    {
      id: 'weak',
      name: 'Ṣaḥīḥ & muʿtall',
      intro: 'How the root letters behave. Sound roots keep their shape; weak roots (containing و or ي) shift, drop letters and merge — knowing which category you are in tells you what to expect.',
      cards: [
        {
          ar: 'سَالِم',
          title: 'Sālim — perfectly sound',
          tag: 'no weak letter, no hamzah, no doubling',
          rows: [['Example', 'نَصَرَ، كَتَبَ، جَلَسَ']],
          spot: ['Three distinct, sound letters. Everything behaves exactly as the pattern says.'],
          means: ['The reference case — learn its ṣarf ṣaghīr first and every other category is described as a deviation from it.'],
          examples: [{ ar: 'نَصَرَ يَنْصُرُ', en: 'to help' }]
        },
        {
          ar: 'مُضَاعَف',
          title: 'Muḍāʿaf — doubled',
          tag: 'ʿayn and lām are the same letter',
          rows: [['Example', 'مَدَّ (م د د)، رَدَّ (ر د د)']],
          spot: ['A shaddah where you would expect two identical letters. مَدَّ is really مَدَدَ.'],
          means: ['The two letters merge whenever they can; they separate again when a sukūn would fall on the second (اُمْدُدْ، مَدَدْتُ).'],
          examples: [{ ar: 'مَدَّ يَمُدُّ', en: 'to stretch out' }, { ar: 'رَدَّ يَرُدُّ', en: 'to return' }]
        },
        {
          ar: 'مَهْمُوز',
          title: 'Mahmūz — hamzated',
          tag: 'one root letter is a hamzah',
          rows: [['Fāʾ', 'أَخَذَ، أَكَلَ، أَمَرَ'], ['ʿAyn', 'سَأَلَ، رَأَسَ'], ['Lām', 'قَرَأَ، بَدَأَ']],
          spot: ['Find the hamzah among the three root letters and name its position.', 'A hamzah is a sound letter — mahmūz verbs are ṣaḥīḥ, not muʿtall.'],
          means: ['The hamzah changes seat (أ ؤ ئ) depending on the vowels around it, and أَخَذَ، أَكَلَ، أَمَرَ drop it altogether in the amr: خُذْ، كُلْ، مُرْ.'],
          examples: [{ ar: 'أَخَذَ يَأْخُذُ', en: 'to take' }, { ar: 'سَأَلَ يَسْأَلُ', en: 'to ask' }, { ar: 'قَرَأَ يَقْرَأُ', en: 'to read' }]
        },
        {
          ar: 'مِثَال',
          title: 'Mithāl — weak first letter',
          tag: 'و or ي as the fāʾ',
          rows: [['Example', 'وَعَدَ يَعِدُ، وَصَلَ يَصِلُ، يَسَرَ يَيْسِرُ']],
          spot: ['The māḍī begins with و (or ي) and the muḍāriʿ has lost it.'],
          means: ['A mithāl wāwī in bāb ḍaraba drops its و in the muḍāriʿ and the amr: وَعَدَ → يَعِدُ → عِدْ. It comes back in the passive: يُوعَدُ.'],
          examples: [{ ar: 'وَعَدَ يَعِدُ', en: 'to promise' }, { ar: 'وَصَلَ يَصِلُ', en: 'to arrive' }]
        },
        {
          ar: 'أَجْوَف',
          title: 'Ajwaf — weak middle letter',
          tag: 'و or ي as the ʿayn',
          rows: [['Wāwī', 'قَالَ يَقُولُ (ق و ل)'], ['Yāʾī', 'بَاعَ يَبِيعُ (ب ي ع)'], ['Bāb ʿalima', 'خَافَ يَخَافُ (خ و ف)']],
          spot: ['A long alif in the middle of the māḍī. The muḍāriʿ reveals which weak letter is hiding: يَقُولُ shows و, يَبِيعُ shows ي.'],
          means: ['The middle letter drops whenever a sukūn would land on it: قُلْ، لَمْ يَقُلْ، قُلْتُ. The passive māḍī takes a kasrah: قِيلَ، بِيعَ.'],
          examples: [{ ar: 'قَالَ يَقُولُ', en: 'to say' }, { ar: 'بَاعَ يَبِيعُ', en: 'to sell' }, { ar: 'خَافَ يَخَافُ', en: 'to fear' }]
        },
        {
          ar: 'نَاقِص',
          title: 'Nāqiṣ — weak last letter',
          tag: 'و or ي as the lām',
          rows: [['Wāwī', 'دَعَا يَدْعُو (د ع و)'], ['Yāʾī', 'رَمَى يَرْمِي (ر م ي)'], ['Bāb ʿalima', 'نَسِيَ يَنْسَى (ن س ي)']],
          spot: ['The word ends in ا، ى، و or ي rather than a hard consonant.', 'The māḍī ending tells you which: دَعَا (wāwī) ends in alif, رَمَى (yāʾī) ends in alif maqṣūrah.'],
          means: ['The final weak letter drops in the amr and in jazm: اُدْعُ، لَمْ يَدْعُ، اِرْمِ، لَمْ يَرْمِ.'],
          examples: [{ ar: 'دَعَا يَدْعُو', en: 'to call' }, { ar: 'رَمَى يَرْمِي', en: 'to throw' }]
        },
        {
          ar: 'لَفِيف',
          title: 'Lafīf — two weak letters',
          tag: 'mafrūq and maqrūn',
          rows: [['Mafrūq (separated)', 'وَقَى يَقِي (و ق ي)'], ['Maqrūn (joined)', 'طَوَى يَطْوِي (ط و ي)']],
          spot: ['Two of the three root letters are weak. If a sound letter sits between them it is mafrūq; if they are side by side it is maqrūn.'],
          means: ['Mafrūq behaves like a mithāl at the front and a nāqiṣ at the back — both weak letters can fall away at once, leaving قِ as the whole imperative.', 'Maqrūn behaves like a nāqiṣ only; the middle weak letter stays put.'],
          examples: [{ ar: 'وَقَى يَقِي', en: 'to protect' }, { ar: 'طَوَى يَطْوِي', en: 'to fold' }]
        }
      ]
    },

    /* ------------------------------------------------------------- */
    {
      id: 'sighah',
      name: 'The 14 forms',
      intro: 'Ṣarf kabīr: every verb runs through fourteen persons. Learn the endings once on فَعَلَ and you can read them on any verb. The pronoun is written beside each one.',
      cards: [
        {
          ar: 'الماضي',
          title: 'Māḍī — the perfect',
          tag: 'endings only, nothing at the front',
          rows: [
            ['هُوَ — he', 'فَعَلَ'], ['هُمَا — they two (m.)', 'فَعَلَا'], ['هُمْ — they (m.)', 'فَعَلُوا'],
            ['هِيَ — she', 'فَعَلَتْ'], ['هُمَا — they two (f.)', 'فَعَلَتَا'], ['هُنَّ — they (f.)', 'فَعَلْنَ'],
            ['أَنْتَ — you (m.)', 'فَعَلْتَ'], ['أَنْتُمَا — you two', 'فَعَلْتُمَا'], ['أَنْتُمْ — you (m. pl.)', 'فَعَلْتُمْ'],
            ['أَنْتِ — you (f.)', 'فَعَلْتِ'], ['أَنْتُمَا — you two (f.)', 'فَعَلْتُمَا'], ['أَنْتُنَّ — you (f. pl.)', 'فَعَلْتُنَّ'],
            ['أَنَا — I', 'فَعَلْتُ'], ['نَحْنُ — we', 'فَعَلْنَا']
          ],
          spot: ['Everything hangs off the back of the word.', 'ـْتُ is "I", ـْنَا is "we", ـْتَ / ـْتِ are "you", ـَتْ is "she".', 'Watch the pair فَعَلْنَ (they, f.) and فَعَلْنَا (we) — one letter apart.']
        },
        {
          ar: 'المضارع',
          title: 'Muḍāriʿ — the imperfect',
          tag: 'a letter in front, sometimes an ending too',
          rows: [
            ['هُوَ — he', 'يَفْعَلُ'], ['هُمَا — they two (m.)', 'يَفْعَلَانِ'], ['هُمْ — they (m.)', 'يَفْعَلُونَ'],
            ['هِيَ — she', 'تَفْعَلُ'], ['هُمَا — they two (f.)', 'تَفْعَلَانِ'], ['هُنَّ — they (f.)', 'يَفْعَلْنَ'],
            ['أَنْتَ — you (m.)', 'تَفْعَلُ'], ['أَنْتُمَا — you two', 'تَفْعَلَانِ'], ['أَنْتُمْ — you (m. pl.)', 'تَفْعَلُونَ'],
            ['أَنْتِ — you (f.)', 'تَفْعَلِينَ'], ['أَنْتُمَا — you two (f.)', 'تَفْعَلَانِ'], ['أَنْتُنَّ — you (f. pl.)', 'تَفْعَلْنَ'],
            ['أَنَا — I', 'أَفْعَلُ'], ['نَحْنُ — we', 'نَفْعَلُ']
          ],
          spot: ['The four tense letters أ ن ي ت (أَنَيْتُ) sit at the front.', 'تَفْعَلُ is both "she" and "you (m.)"; تَفْعَلَانِ covers three different pronouns. Context decides.', 'The نَ of يَفْعَلُونَ falls away in naṣb and jazm (لَنْ يَفْعَلُوا); the نَ of يَفْعَلْنَ never does, because it is the pronoun itself.']
        },
        {
          ar: 'الأمر',
          title: 'Amr — the imperative',
          tag: 'six forms, 2nd person only',
          rows: [
            ['أَنْتَ — you (m.)', 'اِفْعَلْ'], ['أَنْتُمَا — you two', 'اِفْعَلَا'], ['أَنْتُمْ — you (m. pl.)', 'اِفْعَلُوا'],
            ['أَنْتِ — you (f.)', 'اِفْعَلِي'], ['أَنْتُمَا — you two (f.)', 'اِفْعَلَا'], ['أَنْتُنَّ — you (f. pl.)', 'اِفْعَلْنَ']
          ],
          spot: ['Take the majzūm muḍāriʿ, drop the تـ, and add a hamzat waṣl at the front if what remains starts with a sukūn: تَنْصُرْ → اُنْصُرْ.', 'The hamzah takes a ḍammah when the muḍāriʿ has a ḍammah (اُنْصُرْ) and a kasrah otherwise (اِضْرِبْ، اِفْتَحْ).', 'A prohibition is different: لَا + majzūm muḍāriʿ — لَا تَنْصُرْ.']
        }
      ]
    },

    /* ------------------------------------------------------------- */
    {
      id: 'ilal',
      name: 'Weak letter rules',
      subpages: true,
      intro: 'The other page tells you which category a weak verb belongs to. This one tells you what actually happens to the letter — because قَوَلَ is never said, it comes out قَالَ, and يَقْوُلُ comes out يَقُولُ. There are only three things a weak letter ever does: it turns into something else, it hands its vowel back, or it drops. Learn those three and the whole muʿtall system stops being a list to memorise.',
      cards: [
        {
          ar: 'الإِعْلَال',
          title: 'The three things that can happen',
          tag: 'the whole system in one card',
          rows: [
            ['إِعْلَال بِالقَلْب', 'The weak letter turns into a different letter — usually an alif'],
            ['إِعْلَال بِالنَّقْل', 'The weak letter hands its vowel back to the sound letter before it'],
            ['إِعْلَال بِالحَذْف', 'The weak letter is deleted outright']
          ],
          spot: [
            'Build the word on the plain pattern first, exactly as if the root were sound: ق و ل on فَعَلَ gives قَوَلَ.',
            'Then ask which of the three applies. قَوَلَ has a wāw with a fatḥah after a fatḥah, so it turns into an alif: قَالَ.',
            'Nothing here is arbitrary. Every one of these exists because the sound is heavy on the tongue, and Arabic will not carry a heavy sound it can avoid.'
          ],
          means: ['Work forwards from the pattern, never backwards from the finished word. That is the difference between knowing the rules and guessing.']
        },
        {
          ar: 'القَلْب — تَصِير أَلِفًا',
          title: 'Turning into an alif',
          tag: 'wāw or yāʾ with a fatḥah, after a fatḥah',
          rows: [
            ['قَوَلَ', 'قَالَ — wāw with a fatḥah, fatḥah before it'],
            ['بَيَعَ', 'بَاعَ — yāʾ, same conditions'],
            ['رَمَيَ', 'رَمَى — at the end it becomes an alif maqṣūrah'],
            ['دَعَوَ', 'دَعَا — a final wāw does the same']
          ],
          spot: [
            'Two conditions, both needed: the weak letter carries a vowel, and the letter before it carries a fatḥah.',
            'A final weak letter written as ى comes from a yāʾ, and one written as ا comes from a wāw — رَمَى is ر م ي, دَعَا is د ع و.',
            'It reverses the moment an ending is added: رَمَى but رَمَيْتُ, دَعَا but دَعَوْتُ. The alif was only ever a disguise.'
          ],
          means: ['This is why an ajwaf verb looks nothing like its root in the māḍī. قَالَ hides a wāw that the ṣarf ṣaghīr will bring straight back.']
        },
        {
          ar: 'النَّقْل — تُنْقَل الحَرَكَة',
          title: 'Handing the vowel back',
          tag: 'the vowel moves left, the weak letter goes quiet',
          rows: [
            ['يَقْوُلُ', 'يَقُولُ — the ḍammah moves onto the ق'],
            ['يَبْيِعُ', 'يَبِيعُ — the kasrah moves onto the ب'],
            ['يَخْوَفُ', 'يَخَافُ — the fatḥah moves, then the wāw turns into an alif'],
            ['أَقْوَمَ', 'أَقَامَ — the same, in Form IV']
          ],
          spot: [
            'The setup is always the same: a weak letter carrying a vowel, with a sound letter before it that has a sukūn.',
            'The vowel jumps back onto that sound letter, and the weak letter is left with a sukūn.',
            'Sometimes that is the whole story (يَقُولُ). Sometimes the now-sākin weak letter then turns into an alif as well (يَخَافُ) — two rules, applied in order.'
          ],
          means: ['A sukūn followed by a vowelled weak letter is awkward to say. Moving the vowel one place left fixes it without losing anything.']
        },
        {
          ar: 'الحَذْف — اِلْتِقَاء السَّاكِنَيْن',
          title: 'Dropping: when two sukūns meet',
          tag: 'the commonest reason a letter vanishes',
          rows: [
            ['قَالَ + تُ', 'قُلْتُ — the alif cannot stay next to a sākin ت'],
            ['يَقُولُ + نَ', 'يَقُلْنَ'],
            ['بَاعَ + تُ', 'بِعْتُ — and the stem vowel turns to a kasrah'],
            ['لَمْ + يَقُولْ', 'لَمْ يَقُلْ — the jazm puts a sukūn on the end']
          ],
          spot: [
            'Arabic will not say two sākin letters in a row. When an ending beginning with a sukūn meets a sākin weak letter, the weak letter is the one that goes.',
            'The vowel left behind tells you which letter was deleted: قُلْتُ keeps a ḍammah because the wāw was there, بِعْتُ takes a kasrah because it was a yāʾ.',
            'This is the single rule behind almost every strange-looking cell in an ajwaf conjugation table.'
          ],
          means: ['If you can spot where two sukūns would have collided, you can rebuild the form instead of memorising it.']
        },
        {
          ar: 'الحَذْف فِي المِثَال',
          title: 'The wāw that vanishes',
          tag: 'mithāl — weak first letter',
          rows: [
            ['وَعَدَ', 'يَوْعِدُ → يَعِدُ — the wāw drops in the muḍāriʿ'],
            ['وَصَلَ', 'يَصِلُ'],
            ['وَضَعَ', 'يَضَعُ'],
            ['وَعَدَ (passive)', 'يُوعَدُ — and it comes straight back']
          ],
          spot: [
            'The condition: a wāw at the front, caught between a fatḥah in front of it and a kasrah behind it. That is exactly what يَوْعِدُ has.',
            'It only affects the active muḍāriʿ. The māḍī keeps it (وَعَدَ), the maṣdar keeps it, and the passive brings it back (يُوعَدُ) because the vowel before it is now a ḍammah.',
            'A yāʾ at the front does not drop: يَسَرَ يَيْسِرُ keeps its yāʾ.'
          ],
          means: ['This is why a mithāl verb looks two letters shorter in the present than the past. Nothing is lost — the letter returns wherever the conditions change.']
        },
        {
          ar: 'النَّاقِص',
          title: 'The tail that keeps changing',
          tag: 'nāqiṣ — weak last letter',
          rows: [
            ['رَمَى / يَرْمِي', 'from ر م ي'],
            ['دَعَا / يَدْعُو', 'from د ع و'],
            ['نَسِيَ / يَنْسَى', 'the alif maqṣūrah of bāb ʿalima'],
            ['يَرْمِي + ونَ', 'يَرْمُونَ — the yāʾ drops before the wāw'],
            ['لَمْ يَرْمِ', 'in the jazm the whole letter goes']
          ],
          spot: [
            'In the jazm a nāqiṣ verb loses its last letter entirely rather than taking a sukūn: لَمْ يَرْمِ، لَمْ يَدْعُ، لَمْ يَنْسَ. The vowel before it is the only trace left.',
            'Before the wāw of the plural, the weak letter drops and the vowel before it changes: يَرْمِيُونَ is impossible, so يَرْمُونَ.',
            'يَدْعُونَ is both "they (m.) call" and "they (f.) call" — two different words that collapsed into one shape. Only the context tells them apart.'
          ],
          means: ['The final weak letter is the least stable thing in the language. Expect it to disappear whenever anything is added.']
        },
        {
          ar: 'المُضَاعَف',
          title: 'The doubled verb',
          tag: 'not weak, but it behaves like it',
          rows: [
            ['مَدَدَ', 'مَدَّ — the two identical letters run together'],
            ['مَدَّ + تُ', 'مَدَدْتُ — and they separate again'],
            ['يَمُدُّ + نَ', 'يَمْدُدْنَ']
          ],
          spot: [
            'The two letters merge under a shaddah whenever they can, and split apart whenever a sukūn would land on the second one.',
            'That is the same collision rule as the weak verbs, applied to a different problem — which is why muḍāʿaf sits with the ṣaḥīḥ verbs but conjugates like a muʿtall one.'
          ],
          means: ['Idghām is about the same instinct: do not say the same letter twice if you can say it once, long.']
        },
        {
          ar: 'المَهْمُوز وَالأَمْر',
          title: 'The hamzah, and the three imperatives',
          tag: 'كُلْ، خُذْ، مُرْ',
          rows: [
            ['أَكَلَ', 'اُأْكُلْ → كُلْ'],
            ['أَخَذَ', 'اُأْخُذْ → خُذْ'],
            ['أَمَرَ', 'اُأْمُرْ → مُرْ'],
            ['قَرَأَ', 'اِقْرَأْ — hamzah at the end, nothing drops'],
            ['سَأَلَ', 'اِسْأَلْ — hamzah in the middle, nothing drops']
          ],
          spot: [
            'The amr of a mahmūz al-fāʾ verb would need a hamzat al-waṣl followed immediately by a second, sākinah hamzah: اُأْكُلْ. Two hamzahs in a row is heavy, so both go.',
            'Only these three do it, and only when they start the sentence. After a وَ or a فَ the hamzah comes back: وَأْمُرْ بِالمَعْرُوفِ.',
            'A hamzah in the middle or at the end is not affected at all — اِسْأَلْ and اِقْرَأْ keep everything.'
          ],
          means: ['A hamzah is a full consonant, not a weak letter, so it never turns into an alif or hands its vowel back. It only ever gets dropped for being hard to say.']
        },
        {
          ar: 'كَيْفَ تَبْنِي',
          title: 'Working it out, step by step',
          tag: 'the method',
          rows: [
            ['1', 'Drop the root letters into the plain pattern, as if the root were sound'],
            ['2', 'Is there a weak letter with a vowel, after a fatḥah? → it becomes an alif'],
            ['3', 'Is there a weak letter with a vowel, after a sukūn? → hand the vowel back'],
            ['4', 'Would two sukūns end up next to each other? → drop the weak letter'],
            ['5', 'Read it aloud. If it is still heavy, a rule has been missed']
          ],
          spot: [
            'قَ و َ لَ → wāw vowelled, fatḥah before it → قَالَ.',
            'يَ قْ وُ لُ → wāw vowelled, sukūn before it → hand the ḍammah back → يَقُولُ.',
            'يَقُولُ + نَ → the wāw is now sākin and نْ is sākin → drop the wāw → يَقُلْنَ.',
            'Three rules, applied in that order, generate the whole ajwaf table from the root alone.'
          ],
          means: ['This is the payoff: you stop memorising conjugation tables and start deriving them.']
        }
      ]
    },

    /* ------------------------------------------------------------- */
    {
      id: 'particles',
      name: 'Particles',
      subpages: true,
      intro: 'A ḥarf has no root and no pattern, so there is nothing in it to take apart. What you learn is its ʿamal — what it does to the word after it. Sorted that way here, with the meaning of each beside it.',
      cards: [
        {
          ar: 'حُرُوف الجَرّ',
          title: 'Prepositions',
          tag: 'the noun after it takes a kasrah',
          rows: [
            ['مِنْ', 'from — مِنَ البَيْتِ'],
            ['إِلَى', 'to, towards'],
            ['عَنْ', 'away from, about'],
            ['عَلَى', 'on, upon'],
            ['فِي', 'in'],
            ['بِ', 'with, by, in — joined to the front of the noun: بِسْمِ اللهِ'],
            ['كَ', 'like, as'],
            ['مُنْذُ', 'since'],
            ['رُبَّ', 'many a, how often']
          ],
          spot: [
            'A noun always follows, never a verb, and that noun is majrūr — a kasrah, or a yāʾ in the dual and sound masculine plural.',
            'بِ، كَ and لِ are written joined to the word they govern, so look at the first letter of the word, not for a separate one.'
          ],
          means: ['They tie a noun to the verb or noun before it: to it, from it, on it, with it.']
        },
        {
          ar: 'حُرُوف النَّصْب',
          title: 'Takes the subjunctive',
          tag: 'fatḥah on the end of the muḍāriʿ',
          rows: [
            ['أَنْ', 'that — أُرِيدُ أَنْ أَذْهَبَ'],
            ['لَنْ', 'will never — لَنْ يَنْصُرَ'],
            ['كَيْ', 'in order that'],
            ['إِذَنْ', 'in that case, then']
          ],
          spot: [
            'The verb after it ends in a fatḥah, and the نَ of the five verbs drops: يَنْصُرُونَ becomes لَنْ يَنْصُرُوا.',
            'أَنْ with a sukūn is this one. أَنَّ with a shaddah is a different word entirely — one of inna’s sisters.'
          ],
          means: ['They point the verb at something not yet real: a purpose, an intention, a denial of the future.']
        },
        {
          ar: 'حُرُوف الجَزْم',
          title: 'Takes the jussive',
          tag: 'sukūn on the end of the muḍāriʿ',
          rows: [
            ['لَمْ', 'did not — لَمْ يَنْصُرْ'],
            ['لَمَّا', 'not yet'],
            ['إِنْ', 'if — the conditional']
          ],
          spot: [
            'The verb ends in a sukūn, and the نَ of the five verbs drops.',
            'لَمْ is the strange one: a present-tense form with a past meaning. لَمْ يَنْصُرْ is "he did not help", not "he does not help".',
            'إِنْ الشرطية makes two verbs majzūm — the condition and its answer.'
          ],
          means: ['They negate in the past, or hang the sentence on a condition.']
        },
        {
          ar: 'إِنَّ وَأَخَوَاتُهَا',
          title: 'Inna and her sisters',
          tag: 'naṣb on the noun, rafʿ on the predicate',
          rows: [
            ['إِنَّ', 'indeed — إِنَّ اللهَ غَفُورٌ'],
            ['أَنَّ', 'that'],
            ['كَأَنَّ', 'as though'],
            ['لَكِنَّ', 'but, however'],
            ['لَيْتَ', 'if only, would that'],
            ['لَعَلَّ', 'perhaps, so that']
          ],
          spot: [
            'They come at the head of a nominal sentence, not before a verb.',
            'The subject after them takes a fatḥah and the predicate keeps its ḍammah — that split is the giveaway.'
          ],
          means: ['They colour the whole sentence: certainty, comparison, contrast, longing, hope.']
        },
        {
          ar: 'حُرُوف العَطْف',
          title: 'Conjunctions',
          tag: 'what follows copies what came before',
          rows: [
            ['وَ', 'and — no order implied'],
            ['فَ', 'so, and then — immediately after'],
            ['ثُمَّ', 'then — after a gap'],
            ['أَوْ', 'or'],
            ['بَلْ', 'rather, on the contrary'],
            ['أَمْ', 'or, in a question']
          ],
          spot: ['Whatever follows takes the same iʿrāb as the word it is joined to: رَأَيْتُ زَيْدًا وَعَمْرًا, both manṣūb.'],
          means: ['وَ، فَ and ثُمَّ differ only in timing: together, straight after, and later.']
        },
        {
          ar: 'حَرْف النِّدَاء',
          title: 'Vocative',
          tag: 'calling out',
          rows: [['يَا', 'O! — يَا عَبْدَ اللهِ']],
          spot: ['A name or a title follows it directly.'],
          means: ['It addresses someone.']
        },
        {
          ar: 'الحُرُوف المُهْمَلَة',
          title: 'No governing effect',
          tag: 'meaning changes, iʿrāb does not',
          rows: [
            ['قَدْ', 'with the māḍī: certainly, already. With the muḍāriʿ it weakens to "sometimes"'],
            ['سَوْفَ', 'shall, will — the far future'],
            ['هَلْ', 'is/does…? — turns a statement into a question'],
            ['نَعَمْ', 'yes'],
            ['بَلَى', 'yes indeed — only to contradict a negative question']
          ],
          spot: ['The word after them is unchanged: قَدْ نَصَرَ, سَوْفَ يَنْصُرُ — the ḍammah stays put.'],
          means: [
            'قَدْ is worth dwelling on: قَدْ نَصَرَ is "he certainly helped", but قَدْ يَنْصُرُ is "he sometimes helps". Same particle, opposite strength, decided by the tense after it.',
            'بَلَى and نَعَمْ are not interchangeable — بَلَى answers a negative question by contradicting it.'
          ]
        },
        {
          ar: 'حَتَّى، لِ، لَا',
          title: 'The ones that wear two hats',
          tag: 'the same form, different jobs',
          rows: [
            ['حَتَّى + noun', 'jārrah — until: حَتَّى مَطْلَعِ الفَجْرِ'],
            ['حَتَّى + muḍāriʿ', 'nāṣibah — until, so that: حَتَّى يَرْجِعَ'],
            ['لِ + noun', 'jārrah — for, belonging to: لِلَّهِ'],
            ['لِ + muḍāriʿ', 'nāṣibah — in order to: لِيَعْلَمَ'],
            ['لِ الأمر', 'jāzimah — let him: لِيَنْصُرْ'],
            ['لَا النافية', 'no effect — does not: لَا يَنْصُرُ'],
            ['لَا الناهية', 'jāzimah — do not: لَا تَنْصُرْ']
          ],
          spot: [
            'These are not drilled in the practice bank on purpose: shown alone with nothing after them they have no single right answer.',
            'The word that follows decides. A noun after حَتَّى makes it jārrah; a muḍāriʿ makes it nāṣibah.',
            'For لَا, read the ending: لَا تَنْصُرُ with a ḍammah is "you do not help", لَا تَنْصُرْ with a sukūn is "do not help".'
          ],
          means: ['The whole point: a particle is defined by what comes after it, not by its own shape.']
        }
      ]
    },

    /* ------------------------------------------------------------- */
    {
      id: 'forms-tables',
      name: 'Form tables',
      kind: 'formtables',
      intro: 'A page for every bāb: the whole thing it produces, with each line labelled for what it is. The left column is the bare pattern on فعل, the right is a real verb in the same shape — read across and you see the rule and the example at once.',
      cards: []
    },

    /* ------------------------------------------------------------- */
    {
      id: 'tables',
      name: 'Conjugate any verb',
      kind: 'conjugator',
      intro: 'Pick a verb and read its full ṣarf kabīr — all fourteen persons of the māḍī and the muḍāriʿ, and the six of the amr. The weak and doubled verbs are written out in full, so you can see exactly where the stem shifts.',
      cards: []
    },

    /* ------------------------------------------------------------- */
    {
      id: 'spotting',
      name: 'Quick spotting guide',
      intro: 'The tells worth committing to memory, gathered in one place.',
      cards: [
        {
          ar: 'مَعْلُوم / مَجْهُول',
          title: 'Active or passive',
          tag: 'read two vowels',
          rows: [
            ['Māḍī active', 'نَصَرَ — fatḥah at the front'],
            ['Māḍī passive', 'نُصِرَ — ḍammah at the front, kasrah before the last letter'],
            ['Muḍāriʿ active', 'يَنْصُرُ — fatḥah on the tense letter'],
            ['Muḍāriʿ passive', 'يُنْصَرُ — ḍammah on the tense letter, fatḥah before the last letter'],
            ['Mazīd active', 'يُعَلِّمُ، يُكْرِمُ — ḍammah at the front but kasrah at the back'],
            ['Mazīd passive', 'يُعَلَّمُ، يُكْرَمُ — ḍammah at the front and fatḥah at the back']
          ],
          spot: ['In the muḍāriʿ, the vowel before the last letter decides it: kasrah = active, fatḥah = passive.', 'A ḍammah at the front on its own proves nothing — Forms II, III and IV have one in the active too.']
        },
        {
          ar: 'مُجَرَّد / مَزِيد',
          title: 'Bare or augmented',
          tag: 'letters of ziyādah',
          rows: [
            ['The added letters', 'all come from سَأَلْتُمُونِيهَا'],
            ['Front hamzah', 'Form IV — أَفْعَلَ'],
            ['Front تـ', 'Form V or VI — تَفَعَّلَ، تَفَاعَلَ'],
            ['Inner تـ', 'Form VIII — اِفْتَعَلَ'],
            ['Front نـ', 'Form VII — اِنْفَعَلَ'],
            ['اِسْتـ', 'Form X — اِسْتَفْعَلَ'],
            ['Shaddah on the ʿayn', 'Form II — فَعَّلَ'],
            ['Shaddah on the lām', 'Form IX — اِفْعَلَّ']
          ],
          spot: ['Any letter outside سَأَلْتُمُونِيهَا has to be a root letter.', 'A ḍammah on the tense letter of the muḍāriʿ (يُـ) means mazīd — except in the rubāʿī mujarrad يُدَحْرِجُ.']
        },
        {
          ar: 'الأبواب الستة',
          title: 'Naming the gate',
          tag: 'start from the māḍī vowel',
          rows: [
            ['ḍammah on the ʿayn — فَعُلَ', 'karuma, guaranteed'],
            ['kasrah on the ʿayn — فَعِلَ', 'ʿalima, or the rare ḥasiba'],
            ['fatḥah on the ʿayn — فَعَلَ', 'naṣara, ḍaraba or fataḥa — you need the muḍāriʿ'],
            ['throat letter in the root', 'leans towards fataḥa'],
            ['a settled quality', 'leans towards karuma'],
            ['a sense or an inner state', 'leans towards ʿalima']
          ],
          spot: ['Three of the six are fixed by the māḍī alone. The other three need the muḍāriʿ vowel, which is why dictionaries always give both.']
        },
        {
          ar: 'اِسْم / فِعْل / حَرْف',
          title: 'Word type at a glance',
          tag: 'the signs',
          rows: [
            ['Signs of an ism', 'tanwīn, الـ, a ḥarf al-jarr in front, being described, being made dual or plural'],
            ['Signs of a fiʿl', 'قَدْ، سَوْفَ، لَمْ، لَنْ, the tense letters أ ن ي ت, and the endings ـْتُ ـْتَ ـْنَا'],
            ['Signs of a ḥarf', 'none of the above — it accepts no marker at all']
          ],
          spot: ['If a word takes tanwīn it can never be a verb; if it takes لَمْ it can never be a noun.']
        }
      ]
    }
  ];

  MP.hints = hints;
  MP.reference = { sections: sections };
})(typeof window !== 'undefined' ? window : globalThis);
