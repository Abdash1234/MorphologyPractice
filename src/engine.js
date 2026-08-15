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
    { id: 'root', name: 'Name the root', desc: 'Type the root letters.' },
    { id: 'sarf', name: 'Ṣarf ṣaghīr', desc: 'Place the word in its blank ṣarf ṣaghīr.' },
    { id: 'translation', name: 'Translation', desc: 'Recall the meaning at the end.' }
  ];

  function choiceStep(o) {
    return Object.assign({ kind: 'choice' }, o);
  }

  function buildSteps(word, settings) {
    const p = paradigmOf(word);
    const on = (g) => settings.groups[g] !== false;
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

    /* --- root recall --- */
    const root = rootOf(word);
    if (root && on('root')) {
      steps.push({
        kind: 'text', id: 'root', group: 'root',
        q: 'What is the root?', qAr: 'ما مادته؟',
        placeholder: 'e.g. ن ص ر',
        answer: root,
        check: (input) => normalizeArabic(input) === normalizeArabic(root)
      });
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

    return steps;
  }

  /* Options shown for a choice step, in chart order (never shuffled — the
     chart's own order is part of what you are memorising). */
  function optionsFor(step) {
    return T.groups[step.groupId] || [];
  }

  /* ------------------------------------------------------------------ */
  /* sessions                                                            */
  /* ------------------------------------------------------------------ */

  function deckWords(deckId) {
    return MP.words.filter((w) => tagsOf(w).indexOf(deckId) !== -1);
  }

  function buildSession(opts) {
    const settings = opts.settings;
    let pool = deckWords(opts.deckId || 'all');

    if (opts.only && opts.only.length) {
      pool = MP.words.filter((w) => opts.only.indexOf(w.id) !== -1);
    } else {
      pool = shuffle(pool);
      if (settings.weakestFirst) {
        const stats = MP.store.load().words;
        pool.sort((a, b) => scoreOf(stats, a) - scoreOf(stats, b));
      }
      const len = settings.length;
      if (len && len > 0) pool = pool.slice(0, len);
    }

    return {
      deckId: opts.deckId || 'all',
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
    buildSteps,
    buildSession,
    optionsFor,
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
