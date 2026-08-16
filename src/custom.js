/*
 * custom.js — words and roots you add yourself.
 *
 * Everything lives in localStorage and is merged into the built-in bank at
 * start-up, so your own vocabulary behaves exactly like the shipped words:
 * same questions, same ṣarf ṣaghīr, same spaced repetition, same drills.
 *
 * Export gives you a JSON file to keep, move to another device, or send on to
 * have it merged into the repository itself.
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});
  const KEY = 'mp.custom.v1';
  const PREFIX = 'my:';

  let memory = null; // fallback when localStorage is blocked

  function blank() {
    return { paradigms: {}, words: [], sentences: {}, tombstones: {}, updatedAt: 0 };
  }

  function load() {
    let raw = null;
    try {
      raw = global.localStorage.getItem(KEY);
    } catch (e) {
      return memory || blank();
    }
    if (!raw) return memory || blank();
    try {
      const parsed = JSON.parse(raw);
      return Object.assign(blank(), parsed);
    } catch (e) {
      return blank();
    }
  }

  function save(data) {
    data.tombstones = data.tombstones || {};
    data.updatedAt = Date.now();
    memory = data;
    try {
      global.localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      /* keep it in memory for this session at least */
    }
    apply();
  }

  /*
   * Fold the custom data into the live bank. Safe to call repeatedly: anything
   * previously merged is stripped out first.
   */
  function apply() {
    const data = load();

    Object.keys(MP.paradigms).forEach((id) => {
      if (id.indexOf(PREFIX) === 0) delete MP.paradigms[id];
    });
    Object.keys(data.paradigms).forEach((id) => {
      MP.paradigms[id] = Object.assign({ id: id, custom: true }, data.paradigms[id]);
    });

    const builtIn = MP.words.filter((w) => !w.custom);
    MP.words.length = 0;
    builtIn.forEach((w) => MP.words.push(w));
    data.words.forEach((w) => MP.words.push(Object.assign({ custom: true }, w)));

    Object.keys(MP.sentences).forEach((id) => {
      if (id.indexOf(PREFIX) === 0) delete MP.sentences[id];
    });
    Object.keys(data.sentences).forEach((id) => {
      MP.sentences[id] = data.sentences[id];
    });
  }

  function nextId(kind, hint) {
    const clean = String(hint || kind).replace(/[^a-zA-Z0-9-]/g, '').slice(0, 24) || kind;
    const data = load();
    const taken = kind === 'paradigm'
      ? Object.keys(data.paradigms)
      : data.words.map((w) => w.id);
    let id = PREFIX + clean;
    let n = 2;
    while (taken.indexOf(id) !== -1) id = PREFIX + clean + '-' + n++;
    return id;
  }

  /* ------------------------------------------------------------------ */
  /* checks — the same rules the offline validator applies               */
  /* ------------------------------------------------------------------ */

  function checkParadigm(p) {
    const errors = [];
    const letters = String(p.root || '').trim().split(/\s+/).filter(Boolean);
    if (letters.length < 3 || letters.length > 4) errors.push('A root needs three or four letters.');
    if (letters.some((l) => !/^[؀-ۿ]$/.test(l))) errors.push('Root letters must be single Arabic letters.');
    if (!p.meaning) errors.push('Give the verb a meaning in English.');
    const group = p.letters === 'rubai'
      ? (p.augmentation === 'mujarrad' ? 'baabRubaiMujarrad' : 'baabRubaiMazeed')
      : (p.augmentation === 'mujarrad' ? 'baabThulathiMujarrad' : 'baabThulathiMazeed');
    if (!MP.taxonomy.option(group, p.baabId)) errors.push('That bāb does not match thulāthī/rubāʿī and mujarrad/mazīd.');
    MP.taxonomy.sarfSlots.forEach((s) => {
      if (typeof p[s.id] !== 'string' || !p[s.id].trim()) {
        errors.push('The cell "' + s.en + '" is empty — use — if the verb has no such form.');
      }
    });
    return errors;
  }

  function checkWord(w) {
    const errors = [];
    if (!w.w || !/[؀-ۿ]/.test(w.w)) errors.push('Type the word in Arabic.');
    if (!w.en) errors.push('Give it a translation.');
    if (!MP.taxonomy.option('wordType', w.type)) errors.push('Pick a word type.');

    const p = w.p ? MP.paradigms[w.p] : null;
    if (w.p && !p) errors.push('That root is not in the bank.');
    if (w.slot) {
      if (!p) errors.push('A ṣarf ṣaghīr cell needs a root.');
      else if (p[w.slot] === MP.NOT_USED) errors.push('That cell is marked — for this root.');
    }
    if (w.type === 'fil') {
      if (!MP.taxonomy.option('tense', w.tense)) errors.push('Pick a tense.');
      if (w.tense === 'mudari' && !MP.taxonomy.option('mood', w.mood)) errors.push('A muḍāriʿ needs an iʿrāb.');
      if (!MP.taxonomy.option('voice', w.voice)) errors.push('Pick active or passive.');
      if (!MP.taxonomy.option('polarity', w.pol)) errors.push('Pick affirmative or negative.');
      if (!MP.taxonomy.option('person', w.person)) errors.push('Pick a person.');
      if (!MP.taxonomy.option('number', w.number)) errors.push('Pick a number.');
      if (w.voice === 'majhul' && p && p.madiMajhul === MP.NOT_USED) {
        errors.push('This root is marked as having no passive.');
      }
    }
    if (w.type === 'ism' && !MP.taxonomy.option('ismType', w.ismType)) errors.push('Pick the kind of noun.');
    if (w.gender !== 'any' && !MP.taxonomy.option('gender', w.gender)) errors.push('Pick a gender.');
    return errors;
  }

  /* ------------------------------------------------------------------ */
  /* writing                                                             */
  /* ------------------------------------------------------------------ */

  function saveParadigm(p, existingId) {
    const errors = checkParadigm(p);
    if (errors.length) return { ok: false, errors: errors };
    const data = load();
    const id = existingId || nextId('paradigm', p.root.replace(/\s+/g, '') + '-' + p.baabId);
    data.paradigms[id] = Object.assign({}, p, { updatedAt: Date.now() });
    delete data.tombstones[id];
    save(data);
    return { ok: true, id: id };
  }

  function saveWord(w, sentence, existingId) {
    const errors = checkWord(w);
    if (errors.length) return { ok: false, errors: errors };
    const data = load();
    const id = existingId || nextId('word', w.tr || w.en);
    const record = Object.assign({}, w, { id: id, updatedAt: Date.now() });
    delete data.tombstones[id];
    const at = data.words.findIndex((x) => x.id === id);
    if (at === -1) data.words.push(record);
    else data.words[at] = record;

    if (sentence && sentence.ar && sentence.en) {
      let ar = sentence.ar.trim();
      /* if they typed the sentence with the word in it, cut the gap for them */
      if (ar.indexOf('{}') === -1) {
        const bare = MP.engine.normalizeArabic(w.w);
        const hit = ar.split(/\s+/).find((tok) => MP.engine.normalizeArabic(tok).indexOf(bare) !== -1);
        if (hit) ar = ar.replace(hit, '{}');
      }
      if (ar.indexOf('{}') !== -1) data.sentences[id] = { ar: ar, en: sentence.en.trim(), updatedAt: Date.now() };
    } else {
      delete data.sentences[id];
    }
    save(data);
    return { ok: true, id: id };
  }

  function removeWord(id) {
    const data = load();
    data.words = data.words.filter((w) => w.id !== id);
    delete data.sentences[id];
    data.tombstones[id] = Date.now();
    save(data);
  }

  function removeParadigm(id) {
    const data = load();
    const now = Date.now();
    delete data.paradigms[id];
    data.tombstones[id] = now;
    /* words hanging off it would break, so they go too */
    const orphans = data.words.filter((w) => w.p === id).map((w) => w.id);
    data.words = data.words.filter((w) => w.p !== id);
    orphans.forEach((wid) => {
      delete data.sentences[wid];
      data.tombstones[wid] = now;
    });
    save(data);
    return orphans.length;
  }

  /* Adopt a document handed back by the server after a merge. */
  function replaceAll(doc) {
    const data = Object.assign(blank(), doc || {});
    data.words = Array.isArray(data.words) ? data.words : [];
    save(data);
  }

  /* ------------------------------------------------------------------ */
  /* backup                                                              */
  /* ------------------------------------------------------------------ */

  function exportJSON() {
    return JSON.stringify(load(), null, 2);
  }

  function importJSON(text, mode) {
    let incoming;
    try {
      incoming = JSON.parse(text);
    } catch (e) {
      return { ok: false, errors: ['That is not valid JSON.'] };
    }
    if (!incoming || typeof incoming !== 'object') return { ok: false, errors: ['Nothing to import.'] };

    const data = mode === 'replace' ? blank() : load();
    const errors = [];
    let added = 0;

    Object.keys(incoming.paradigms || {}).forEach((id) => {
      const errs = checkParadigm(incoming.paradigms[id]);
      if (errs.length) errors.push(id + ': ' + errs[0]);
      else { data.paradigms[id] = incoming.paradigms[id]; added++; }
    });
    /* paradigms have to be live before the words that point at them are checked */
    save(data);

    (incoming.words || []).forEach((w) => {
      const errs = checkWord(w);
      if (errs.length) errors.push((w.id || w.w) + ': ' + errs[0]);
      else {
        const at = data.words.findIndex((x) => x.id === w.id);
        if (at === -1) data.words.push(w);
        else data.words[at] = w;
        added++;
      }
    });
    Object.keys(incoming.sentences || {}).forEach((id) => {
      const s = incoming.sentences[id];
      if (s && s.ar && s.en && s.ar.indexOf('{}') !== -1) data.sentences[id] = s;
    });

    save(data);
    return { ok: true, added: added, errors: errors };
  }

  function count() {
    const data = load();
    return { words: data.words.length, roots: Object.keys(data.paradigms).length };
  }

  MP.custom = {
    PREFIX,
    load,
    save,
    apply,
    checkWord,
    checkParadigm,
    saveWord,
    saveParadigm,
    removeWord,
    removeParadigm,
    exportJSON,
    importJSON,
    replaceAll,
    count
  };
})(typeof window !== 'undefined' ? window : globalThis);
