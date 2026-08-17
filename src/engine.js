/*
 * engine.js — turns a word into a sequence of questions, checks answers,
 * and keeps score. No DOM in here.
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});
  const T = MP.taxonomy;

  /* ------------------------------------------------------------------ */
  /* text helpers                                                        */
  /* ------------------------------------------------------------------ */

  const HARAKAT = /[ً-ْٰـ]/g; // fatḥah…sukūn, dagger alif, taṭwīl

  function stripHarakat(s) {
    return (s || '').replace(HARAKAT, '');
  }

  function normalizeArabic(s) {
    return stripHarakat(s)
      .replace(/[إأآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/[^ء-ي]/g, ''); // drop spaces, dashes, latin, anything else
  }

  function normalizeLatin(s) {
    return (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-̣̱ͯ]/g, '')
      .replace(/[^a-z ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const STOPWORDS = ['a', 'an', 'the', 'to', 'he', 'she', 'it', 'they', 'you', 'we', 'i',
    'is', 'are', 'was', 'were', 'be', 'of', 'his', 'her', 'them', 'one', 'who', 'm', 'f',
    'pl', 'sg', 'and', 'or', 'that', 'this', 'do', 'does', 'did', 'not', 'will'];

  /* Loose check for the translation box: does the user's answer share a
     meaningful word with the accepted translation? */
  function translationLooksRight(userAnswer, expected) {
    const u = normalizeLatin(userAnswer);
    if (u.length < 2) return false;
    const eWords = normalizeLatin(expected)
      .split(' ')
      .filter((w) => w.length > 2 && STOPWORDS.indexOf(w) === -1);
    const uWords = u.split(' ').filter((w) => w.length > 2 && STOPWORDS.indexOf(w) === -1);
    return eWords.some((e) =>
      uWords.some((w) => w === e || (w.length > 3 && e.indexOf(w) === 0) || (e.length > 3 && w.indexOf(e) === 0))
    );
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ------------------------------------------------------------------ */
  /* word helpers                                                        */
  /* ------------------------------------------------------------------ */

  function paradigmOf(word) {
    return word.p ? MP.paradigms[word.p] : null;
  }

  function rootOf(word) {
    const p = paradigmOf(word);
    return (p && p.root) || word.root || null;
  }

  /* Which bāb group applies, given the structural facts of the paradigm. */
  function baabGroupId(p) {
    if (p.letters === 'rubai') {
      return p.augmentation === 'mujarrad' ? 'baabRubaiMujarrad' : 'baabRubaiMazeed';
    }
    return p.augmentation === 'mujarrad' ? 'baabThulathiMujarrad' : 'baabThulathiMazeed';
  }

  function tagsOf(word) {
    const tags = ['all'];
    const p = paradigmOf(word);
    if (word.type === 'fil') tags.push('verbs');
    if (word.type === 'ism') tags.push('nouns');
    if (word.starter) tags.push('starter');
    if (word.custom) tags.push('mine');
    if (p) {
      if (p.letters === 'thulathi' && p.augmentation === 'mujarrad') tags.push('mujarrad');
      if (p.augmentation === 'mazeed' || p.letters === 'rubai') tags.push('mazeed');
      tags.push(p.soundness); // 'sahih' | 'mutal'
    }
    return tags;
  }

  /* ------------------------------------------------------------------ */
  /* step construction                                                   */
  /* ------------------------------------------------------------------ */

  /*
   * Groups a step can belong to — these map onto the on/off switches in
   * settings, so the user can drill only part of the chart.
   */
  const STEP_GROUPS = [
    { id: 'identity', name: 'Word type & category', desc: 'Ism / fiʿl / ḥarf, tense, and the kind of noun.', locked: true },
    { id: 'features', name: 'Verb details', desc: 'Mood, voice, affirmative/negative, person, gender, number.' },
    { id: 'structure', name: 'Root structure', desc: 'Thulāthī/rubāʿī, mujarrad/mazīd, the bāb, ṣaḥīḥ/muʿtall.' },
    { id: 'root', name: 'The root', desc: 'Pick out the fāʾ, ʿayn and lām, letter by letter.' },
    { id: 'base', name: 'Back to the māḍī', desc: 'Produce the bare هُوَ form the word came from.' },
    { id: 'sarf', name: 'Ṣarf ṣaghīr', desc: 'Place the word in its blank ṣarf ṣaghīr.' },
    { id: 'translation', name: 'Translation', desc: 'Recall the meaning at the end.' },
    { id: 'context', name: 'In a sentence', desc: 'Fill the word into a real sentence.' }
  ];

  /* ---- little helpers shared by the production-style steps ---- */

  const RADICAL_SLOTS = [
    { id: 'fa', ar: 'الفَاء', en: '1st radical' },
    { id: 'ayn', ar: 'العَيْن', en: '2nd radical' },
    { id: 'lam', ar: 'اللَّام', en: '3rd radical' },
    { id: 'lam2', ar: 'اللَّام الثَّانِيَة', en: '4th radical' }
  ];

  /* A cell may offer two accepted maṣdars — "مُجَاهَدَةً وَجِهَادًا". */
  function acceptedForms(cell) {
    const whole = String(cell).trim();
    const parts = whole
      .split(/\s+وَ|\s+و/)
      .map((s) => s.trim())
      .filter(Boolean);
    /* either maṣdar on its own is fine, and so is giving both */
    return parts.indexOf(whole) === -1 ? [whole].concat(parts) : parts;
  }

  function matchesArabic(input, cell) {
    const given = normalizeArabic(input);
    if (!given) return false;
    return acceptedForms(cell).some((f) => normalizeArabic(f) === given);
  }

  /* The letter keypad for the radicals question: the root letters, the letters
     actually visible in the word, and the weak letters + hamzah, so a weak root
     can be reconstructed even when its letter is missing from the surface. */
  function radicalKeypad(word, rootLetters) {
    const pool = {};
    rootLetters.forEach((l) => (pool[l] = true));
    stripHarakat(word.w).split('').forEach((ch) => {
      if (/[ء-ي]/.test(ch)) pool[ch] = true;
    });
    ['و', 'ي', 'ا', 'ء', 'أ', 'ن', 'ت', 'س', 'م'].forEach((l) => (pool[l] = true));
    const others = Object.keys(pool).filter(
      (l) => rootLetters.indexOf(l) === -1 && (l !== 'ا' || rootLetters.indexOf('ا') !== -1)
    );
    const size = Math.max(10, rootLetters.length + 6);
    /* the root letters are always on the keypad; the rest are padding */
    return shuffle(rootLetters.concat(shuffle(others).slice(0, size - rootLetters.length)));
  }

  function choiceStep(o) {
    return Object.assign({ kind: 'choice' }, o);
  }

  /* Which questions to ask: an empty list means "everything". Older settings
     stored a single id as a string, so accept that too. */
  function focusList(settings) {
    const f = settings && settings.focus;
    if (Array.isArray(f)) return f.filter((x) => typeof x === 'string' && x);
    if (typeof f === 'string' && f) return [f];
    return [];
  }

  function buildSteps(subject, settings) {
    /* the production modes hand us a synthetic subject, not a word */
    if (subject.kind === 'production') return [productionStep(subject)];
    if (subject.kind === 'conjugation') return [conjugationStep(subject)];
    if (subject.kind === 'sentence') {
      const word = subject.word;
      const steps = [clozeStep(word)];
      if (settings.groups.translation !== false) {
        steps.push({
          kind: 'translate', id: 'translation', group: 'translation',
          q: 'And what does the whole sentence mean?', qAr: 'ما معنى الجملة؟',
          placeholder: 'translate the sentence',
          answer: MP.sentences[word.id].en
        });
      }
      return steps;
    }

    const word = subject;
    const p = paradigmOf(word);
    const focus = focusList(settings);
    /* when specific questions are chosen, every stage is built and the rest
       dropped at the end — so a switched-off group cannot hide one */
    const on = (g) => (focus.length ? true : settings.groups[g] !== false);
    const steps = [];

    /* --- identity --- */
    steps.push(choiceStep({
      id: 'wordType', group: 'identity', groupId: 'wordType',
      q: 'What kind of word is this?',
      qAr: 'ما نوع هذه الكلمة؟',
      answer: word.type
    }));

    if (word.type === 'fil') {
      steps.push(choiceStep({
        id: 'tense', group: 'identity', groupId: 'tense',
        q: 'Which tense is it?', qAr: 'ما صيغته؟', answer: word.tense
      }));

      if (on('features')) {
        if (word.tense === 'mudari') {
          steps.push(choiceStep({
            id: 'mood', group: 'features', groupId: 'mood',
            q: 'What is its iʿrāb (mood)?', qAr: 'ما إعرابه؟', answer: word.mood
          }));
        }
        steps.push(choiceStep({
          id: 'voice', group: 'features', groupId: 'voice',
          q: 'Active or passive?', qAr: 'معلوم أم مجهول؟', answer: word.voice
        }));
        steps.push(choiceStep({
          id: 'polarity', group: 'features', groupId: 'polarity',
          q: 'Affirmative or negative?', qAr: 'مثبت أم منفي؟', answer: word.pol
        }));
        steps.push(choiceStep({
          id: 'person', group: 'features', groupId: 'person',
          q: 'Which person?', qAr: 'من المتكلم أم المخاطب أم الغائب؟', answer: word.person
        }));
        if (word.gender !== 'any') {
          steps.push(choiceStep({
            id: 'gender', group: 'features', groupId: 'gender',
            q: 'Which gender?', qAr: 'مذكر أم مؤنث؟', answer: word.gender
          }));
        }
        steps.push(choiceStep({
          id: 'number', group: 'features', groupId: 'number',
          q: 'How many?', qAr: 'مفرد أم مثنى أم جمع؟', answer: word.number
        }));
      }
    }

    if (word.type === 'ism') {
      steps.push(choiceStep({
        id: 'ismType', group: 'identity', groupId: 'ismType',
        q: 'What kind of noun is it?', qAr: 'ما نوع هذا الاسم؟', answer: word.ismType
      }));
      if (on('features')) {
        steps.push(choiceStep({
          id: 'gender', group: 'features', groupId: 'gender',
          q: 'Which gender?', qAr: 'مذكر أم مؤنث؟', answer: word.gender
        }));
        steps.push(choiceStep({
          id: 'number', group: 'features', groupId: 'number',
          q: 'How many?', qAr: 'مفرد أم مثنى أم جمع؟', answer: word.number
        }));
      }
    }

    /*
     * --- the root, picked out of the word letter by letter ---
     *
     * This used to be two questions in a row — "which letters are the
     * radicals?" and then "what is the root?" — which is the same question
     * asked twice, since the radicals in order *are* the root. One step now:
     * the keypad, because naming each slot as the fāʾ, the ʿayn and the lām
     * teaches more than a free-text box does.
     */
    const rootStr = rootOf(word);
    if (rootStr && on('root')) {
      const rootLetters = rootStr.trim().split(/\s+/);
      steps.push({
        kind: 'radicals', id: 'root', group: 'root',
        q: 'What is the root — which letters are the radicals?',
        qAr: 'ما مادتها؟ ما حروفها الأصلية؟',
        slots: RADICAL_SLOTS.slice(0, rootLetters.length),
        keypad: radicalKeypad(word, rootLetters),
        answer: rootLetters
      });
    }

    /* --- structure: only meaningful when the word comes from a root --- */
    if (p && on('structure')) {
      steps.push(choiceStep({
        id: 'letters', group: 'structure', groupId: 'letters',
        q: 'How many root letters?', qAr: 'ثلاثي أم رباعي؟', answer: p.letters
      }));
      steps.push(choiceStep({
        id: 'augmentation', group: 'structure', groupId: 'augmentation',
        q: 'Bare root, or with letters added?', qAr: 'مجرد أم مزيد فيه؟', answer: p.augmentation
      }));
      steps.push(choiceStep({
        id: 'baab', group: 'structure', groupId: baabGroupId(p),
        q: 'Which bāb / form is it from?', qAr: 'من أي باب؟', answer: p.baabId
      }));
      steps.push(choiceStep({
        id: 'soundness', group: 'structure', groupId: 'soundness',
        q: 'Sound or weak?', qAr: 'صحيح أم معتل؟', answer: p.soundness
      }));
      steps.push(choiceStep({
        id: 'subtype', group: 'structure',
        groupId: p.soundness === 'sahih' ? 'sahihType' : 'mutalType',
        q: p.soundness === 'sahih' ? 'Which kind of ṣaḥīḥ?' : 'Which kind of muʿtall?',
        qAr: p.soundness === 'sahih' ? 'أي نوع من الصحيح؟' : 'أي نوع من المعتل؟',
        answer: p.subtype
      }));
      if (p.subtype === 'mahmuz' && p.mahmuzPosition) {
        steps.push(choiceStep({
          id: 'mahmuzPosition', group: 'structure', groupId: 'mahmuzPosition',
          q: 'Where does the hamzah sit?', qAr: 'أين الهمزة؟', answer: p.mahmuzPosition
        }));
      }
    }

    /* --- take it back to the bare هُوَ form it was built from --- */
    if (p && p.madi !== MP.NOT_USED && on('base')) {
      const isMadi3ms = word.slot === 'madi' && word.type === 'fil' &&
        word.person === 'ghaib' && word.gender === 'mudhakkar' && word.number === 'mufrad';
      if (!isMadi3ms) {
        steps.push({
          kind: 'text', id: 'baseMadi', group: 'base',
          q: 'Take it back to the māḍī — the bare هُوَ form.',
          qAr: 'رُدَّهَا إلى الماضي المعروف للغائب.',
          placeholder: 'e.g. نَصَرَ',
          arabicInput: true,
          answer: p.madi,
          check: (input) => matchesArabic(input, p.madi)
        });
      }
    }

    /* --- ṣarf ṣaghīr with the word's own cell left blank --- */
    if (p && word.slot && on('sarf')) {
      steps.push({
        kind: 'sarf', id: 'sarf', group: 'sarf',
        q: 'Here is the ṣarf ṣaghīr with one cell blank. Which cell is this word?',
        qAr: 'أين موضع هذه الكلمة من الصرف الصغير؟',
        paradigm: p,
        answer: word.slot
      });
    }

    /* --- translation --- */
    if (on('translation')) {
      steps.push({
        kind: 'translate', id: 'translation', group: 'translation',
        q: 'What does it mean?', qAr: 'ما معناها؟',
        placeholder: 'type the meaning in English',
        answer: word.en
      });
    }

    /* --- see it in a real sentence, with the word itself taken out --- */
    if (on('context') && MP.sentences && MP.sentences[word.id]) {
      steps.push(clozeStep(word));
    }

    if (focus.length) return steps.filter((s) => focus.indexOf(s.id) !== -1);
    return steps;
  }

  /* ------------------------------------------------------------------ */
  /* the production-style steps                                          */
  /* ------------------------------------------------------------------ */

  /* Fill the missing word into a sentence, choosing from four candidates. */
  function clozeStep(word) {
    const sentence = MP.sentences[word.id];
    const sameType = MP.words.filter((w) => w.id !== word.id && w.type === word.type);
    const sameParadigm = sameType.filter((w) => w.p && w.p === word.p);
    const distractors = shuffle(sameParadigm).slice(0, 2)
      .concat(shuffle(sameType).slice(0, 4))
      .filter((w, i, arr) => arr.findIndex((x) => x.id === w.id) === i)
      .slice(0, 3);
    return {
      kind: 'cloze', id: 'context', group: 'context',
      q: 'Which word fills the gap?', qAr: 'ما الكلمة الناقصة؟',
      sentence: sentence,
      choices: shuffle([word].concat(distractors)),
      answer: word.id
    };
  }

  /* Build a named cell of the ṣarf ṣaghīr from the root. */
  function productionStep(item) {
    const p = item.paradigm;
    const slot = MP.taxonomy.sarfSlots.find((s) => s.id === item.slot);
    return {
      kind: 'text', id: 'production', group: 'production',
      q: 'Build the ' + slot.en.toLowerCase() + ' of this root.',
      qAr: 'هَاتِ ' + slot.ar + ' من هذه المادة.',
      placeholder: 'type it with its ḥarakāt',
      arabicInput: true,
      answer: p[item.slot],
      check: (input) => matchesArabic(input, p[item.slot])
    };
  }

  /* Conjugate the verb for one of the fourteen persons. */
  function conjugationStep(item) {
    const table = MP.conjugation.tableFor(item.paradigmId);
    const forms = table[item.tense];
    const pronouns = item.tense === 'amr' ? MP.conjugation.AMR_PRONOUNS : MP.conjugation.PRONOUNS;
    const tenseName = { madi: 'māḍī', mudari: 'muḍāriʿ (marfūʿ)', amr: 'amr' }[item.tense];
    return {
      kind: 'text', id: 'conjugation', group: 'conjugation',
      q: 'Put it into the ' + tenseName + ' for ' + pronouns[item.index].en + '.',
      qAr: 'صَرِّفْهُ لِضَمِيرِ ' + pronouns[item.index].ar,
      placeholder: 'type the whole word',
      arabicInput: true,
      answer: forms[item.index],
      check: (input) => matchesArabic(input, forms[item.index])
    };
  }

  /* The hint panel behind the "?" — bāb and sub-type questions key off the
     option group, everything else off the step id. */
  function hintFor(step) {
    return (MP.hints && (MP.hints[step.groupId] || MP.hints[step.id])) || null;
  }

  /* Options shown for a choice step, in chart order (never shuffled — the
     chart's own order is part of what you are memorising). */
  function optionsFor(step) {
    return T.groups[step.groupId] || [];
  }

  /* ------------------------------------------------------------------ */
  /* sessions                                                            */
  /* ------------------------------------------------------------------ */

  /* The review deck is not a fixed list — it is whatever the Leitner boxes
     say is due right now, plus anything never studied. */
  function dueWords() {
    const stats = MP.store.load().words;
    const now = Date.now();
    return MP.words.filter((w) => {
      const s = stats[w.id];
      return !s || !s.due || s.due <= now;
    });
  }

  function deckWords(deckId) {
    if (deckId === 'due') return dueWords();
    return MP.words.filter((w) => tagsOf(w).indexOf(deckId) !== -1);
  }

  /* ------------------------------------------------------------------ */
  /* the subject pools for each practice mode                            */
  /* ------------------------------------------------------------------ */

  /* every (root, cell) pair worth producing from memory */
  function productionItems(deckId) {
    const wanted = {};
    deckWords(deckId).forEach((w) => {
      if (w.p) wanted[w.p] = true;
    });
    const items = [];
    Object.keys(wanted).forEach((pid) => {
      const p = MP.paradigms[pid];
      MP.taxonomy.sarfSlots.forEach((slot) => {
        if (p[slot.id] === MP.NOT_USED) return;
        items.push({
          id: 'prod:' + pid + ':' + slot.id,
          kind: 'production',
          paradigmId: pid,
          paradigm: p,
          slot: slot.id,
          w: p.root,
          sub: p.meaning + ' · from bāb ' + MP.taxonomy.label(baabGroupId(p), p.baabId)
        });
      });
    });
    return items;
  }

  /* every (verb, tense, person) the tables can vouch for */
  function conjugationItems(deckId) {
    const wanted = {};
    deckWords(deckId).forEach((w) => {
      if (w.p && MP.conjugation.tableFor(w.p)) wanted[w.p] = true;
    });
    const items = [];
    Object.keys(wanted).forEach((pid) => {
      const p = MP.paradigms[pid];
      const table = MP.conjugation.tableFor(pid);
      ['madi', 'mudari', 'amr'].forEach((tense) => {
        const forms = table[tense];
        if (!forms) return;
        forms.forEach((form, i) => {
          items.push({
            id: 'conj:' + pid + ':' + tense + ':' + i,
            kind: 'conjugation',
            paradigmId: pid,
            tense: tense,
            index: i,
            w: p.madi,
            sub: p.root + ' · ' + p.meaning
          });
        });
      });
    });
    return items;
  }

  /* every word that has a sentence written for it */
  function sentenceItems(deckId) {
    return deckWords(deckId)
      .filter((w) => MP.sentences && MP.sentences[w.id])
      .map((w) => ({ id: 'sent:' + w.id, kind: 'sentence', word: w, w: w.w }));
  }

  function poolFor(mode, deckId) {
    if (mode === 'production') return productionItems(deckId);
    if (mode === 'conjugation') return conjugationItems(deckId);
    if (mode === 'sentences') return sentenceItems(deckId);
    return deckWords(deckId);
  }

  function buildSession(opts) {
    const settings = opts.settings;
    const mode = settings.mode || 'analysis';
    let pool = poolFor(mode, opts.deckId || 'all');

    /* keep only the words that actually carry the chosen questions */
    if (focusList(settings).length && mode === 'analysis') {
      pool = pool.filter((w) => buildSteps(w, settings).length > 0);
    }

    if (opts.only && opts.only.length) {
      /* replaying the misses: pull them from the whole pool of this mode */
      const everything = poolFor(mode, 'all');
      pool = everything.filter((x) => opts.only.indexOf(x.id) !== -1);
    } else {
      pool = shuffle(pool);
      const stats = MP.store.load().words;
      if (opts.deckId === 'due') {
        /* most overdue first; never-studied words sit in the middle */
        const dueAt = (w) => (stats[w.id] && stats[w.id].due) || Date.now();
        pool.sort((a, b) => dueAt(a) - dueAt(b));
      } else if (settings.weakestFirst) {
        pool.sort((a, b) => scoreOf(stats, a) - scoreOf(stats, b));
      }
      const len = settings.length;
      if (len && len > 0) pool = pool.slice(0, len);
    }

    return {
      deckId: opts.deckId || 'all',
      mode: mode,
      words: pool,
      index: 0,
      stepIndex: 0,
      steps: pool.length ? buildSteps(pool[0], settings) : [],
      answers: [],   // {wordId, stepId, correct}
      missedWords: [],
      settings: settings
    };
  }

  /* lower = practise sooner: never seen sits in the middle, poor accuracy first */
  function scoreOf(stats, word) {
    const s = stats[word.id];
    if (!s || !s.seen) return 0.5;
    return s.correct / Math.max(1, s.correct + s.wrong);
  }

  function currentWord(session) {
    return session.words[session.index];
  }

  function currentStep(session) {
    return session.steps[session.stepIndex];
  }

  function recordAnswer(session, correct) {
    const w = currentWord(session);
    const st = currentStep(session);
    session.answers.push({ wordId: w.id, stepId: st.id, group: st.group, correct: !!correct });
    if (!correct && session.missedWords.indexOf(w.id) === -1) session.missedWords.push(w.id);
    MP.store.recordStep(w.id, st.id, !!correct);
  }

  /* returns 'nextStep' | 'nextWord' | 'done' */
  function advance(session) {
    if (session.stepIndex < session.steps.length - 1) {
      session.stepIndex++;
      return 'nextStep';
    }
    MP.store.recordWordSeen(currentWord(session).id, session.answers
      .filter((a) => a.wordId === currentWord(session).id)
      .every((a) => a.correct));
    if (session.index < session.words.length - 1) {
      session.index++;
      session.stepIndex = 0;
      session.steps = buildSteps(currentWord(session), session.settings);
      return 'nextWord';
    }
    return 'done';
  }

  function sessionScore(session) {
    const total = session.answers.length;
    const correct = session.answers.filter((a) => a.correct).length;
    return { correct, total, pct: total ? Math.round((correct / total) * 100) : 0 };
  }

  /* Accuracy per step type across the whole session, for the summary. */
  function breakdown(session) {
    const map = {};
    session.answers.forEach((a) => {
      const m = (map[a.stepId] = map[a.stepId] || { correct: 0, total: 0 });
      m.total++;
      if (a.correct) m.correct++;
    });
    return map;
  }

  MP.engine = {
    STEP_GROUPS,
    RADICAL_SLOTS,
    matchesArabic,
    acceptedForms,
    poolFor,
    focusList,
    buildSteps,
    buildSession,
    optionsFor,
    hintFor,
    deckWords,
    currentWord,
    currentStep,
    recordAnswer,
    advance,
    sessionScore,
    breakdown,
    paradigmOf,
    rootOf,
    tagsOf,
    baabGroupId,
    stripHarakat,
    normalizeArabic,
    translationLooksRight,
    shuffle
  };
})(typeof window !== 'undefined' ? window : globalThis);
