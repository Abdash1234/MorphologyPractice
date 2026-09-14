/*
 * vocab.js — plain vocabulary revision, kept apart from the morphology bank.
 *
 * A word in words.js is a grammar question: it carries a paradigm, a cell, a
 * tense, a person. A vocabulary item is none of that — it is an Arabic word,
 * an English gloss, and the section of a course it was met in. Mixing the two
 * would mean every item needed grammar fields it does not have, so this is a
 * separate list with its own drills.
 *
 * The entries live in the custom-content document alongside your own words, so
 * they are carried between devices by the same sync and leave with the same
 * export. Scheduling goes through MP.store under a "v:" id, which keeps the
 * Leitner boxes and the due dates identical to everything else in the app.
 *
 * You type the list in yourself — it is your copy of your book, on your
 * device, the same as a notebook.
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});
  const PREFIX = 'v:';

  const ARABIC = /[؀-ۿ]/;
  const LATIN_MARKS = /[̀-ͯʿʼ]/g;

  /* ------------------------------------------------------------------ */
  /* storage — a thin layer over the custom-content document             */
  /* ------------------------------------------------------------------ */

  function all() {
    const data = MP.custom.load();
    return Array.isArray(data.vocab) ? data.vocab : [];
  }

  function writeAll(list) {
    const data = MP.custom.load();
    data.vocab = list;
    MP.custom.save(data);
  }

  /* ------------------------------------------------------------------ */
  /* normalising, for duplicate detection and for marking typed answers  */
  /* ------------------------------------------------------------------ */

  const normAr = (s) => MP.engine.normalizeArabic(String(s || '')).replace(/\s+/g, ' ').trim();
  /* the word exactly as written, ḥarakāt and all — for telling entries apart */
  const exactAr = (s) => String(s || '').normalize('NFC').replace(/\s+/g, ' ').trim();

  function normEn(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(LATIN_MARKS, '')
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\b(?:to|a|an|the)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /*
   * Every form of the meaning that should count as knowing the word.
   *
   * A gloss often holds alternatives — "to help, to aid" — and once you start
   * replacing the short glosses with fuller dictionary definitions it also
   * holds asides: "God (Lane: the proper name of the Creator)". Typing "God"
   * has to keep counting, or improving your definitions would quietly make
   * the typing drill impossible to pass.
   */
  function glosses(en) {
    const raw = String(en || '');
    const out = [];
    const push = (s) => { const n = normEn(s); if (n && out.indexOf(n) === -1) out.push(n); };
    const split = (s) => s.split(/[,;/]|\bor\b/).forEach(push);
    const plain = raw.replace(/\([^)]*\)/g, ' ');

    split(raw);                                                   // as written
    split(plain);                                                 // without the asides
    (raw.match(/\(([^)]*)\)/g) || []).forEach((m) => split(m.slice(1, -1)));  // the asides alone
    split(plain.split(/[:—–]/)[0]);                               // the head of a definition
    return out;
  }

  /* one transposition or typo should not read as not knowing the word */
  function withinOne(a, b) {
    if (a === b) return true;
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0;
    let j = 0;
    let slips = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++slips > 1) return false;
      if (a.length > b.length) i++;
      else if (a.length < b.length) j++;
      else { i++; j++; }
    }
    return slips + (a.length - i) + (b.length - j) <= 1;
  }

  /*
   * Mark a typed answer. Arabic is checked on its letters, so ḥarakāt are
   * optional exactly as they are in the morphology drills. English accepts any
   * one of the glosses, and forgives a single slip on a longer word.
   */
  function matches(typed, entry, direction) {
    const given = String(typed || '').trim();
    if (!given) return false;
    if (direction === 'toPl') return normAr(given) === normAr(entry.pl);
    if (direction === 'toAr') return normAr(given) === normAr(entry.ar);
    const got = normEn(given);
    if (!got) return false;
    return glosses(entry.en).some((g) => g === got || (g.length >= 5 && withinOne(g, got)));
  }

  /* ------------------------------------------------------------------ */
  /* parsing a pasted list                                               */
  /* ------------------------------------------------------------------ */

  /*
   * One item per line. The Arabic is found by looking for Arabic letters
   * rather than by position, so "word — meaning" and "meaning — word" both
   * work, and a middle column is taken as the transliteration.
   */
  function parse(text) {
    const rows = [];
    const errors = [];
    let current = null;   // set by a "## 2" header, applies until the next one
    String(text || '').split(/\r?\n/).forEach((raw, i) => {
      const line = raw.trim();
      if (!line) return;

      /* "## 2", "## Section 2", "## nouns" — everything after it belongs to
         that section, so a whole book's worth goes in as one paste */
      const header = line.match(/^##\s*(?:section\s*)?(.+?)\s*$/i);
      if (header) { current = sectionKey(header[1]); return; }
      if (line[0] === '#') return;   // an ordinary comment

      const parts = line.split(/\t|\s*[|=]\s*|\s+[–—]\s+|\s+-\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

      if (parts.length < 2) {
        errors.push('Line ' + (i + 1) + ': needs an Arabic word and a meaning, separated by | or a tab.');
        return;
      }

      const arParts = parts.filter((p) => ARABIC.test(p));
      const enParts = parts.filter((p) => !ARABIC.test(p));
      if (!arParts.length) {
        errors.push('Line ' + (i + 1) + ': no Arabic found.');
        return;
      }
      if (!enParts.length) {
        errors.push('Line ' + (i + 1) + ': no English meaning found.');
        return;
      }

      /* of the non-Arabic columns the last is the meaning; an earlier one,
         if there is a spare, is the transliteration. A second Arabic column
         is the plural — glossaries print singular and plural side by side,
         and folding them into one field would make both unsearchable. */
      let en = enParts[enParts.length - 1];
      let tr = enParts.length > 1 ? enParts[0] : '';

      /* glossaries mark gender in passing — "arḍun (f.)" — and it is worth a
         field of its own rather than sitting inside the transliteration */
      let gender = '';
      const takeMark = (text) => text.replace(/\((?:\s*)(f|fem|m|masc)\.?(?:\s*)\)/gi, (all, g) => {
        gender = /^f/i.test(g) ? 'muannath' : 'mudhakkar';
        return ' ';
      }).replace(/\s+/g, ' ').trim();
      tr = takeMark(tr);
      en = takeMark(en);

      rows.push({
        ar: arParts[0], pl: arParts[1] || '', tr: tr, en: en,
        gender: gender, section: current
      });
    });
    return { rows, errors };
  }

  /* ------------------------------------------------------------------ */
  /* sections                                                            */
  /* ------------------------------------------------------------------ */

  function sectionKey(v) {
    const n = String(v == null ? '' : v).trim();
    return n || '?';
  }

  /* numeric sections sort as numbers, anything else falls in after them */
  function compareSections(a, b) {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    if (!isNaN(na)) return -1;
    if (!isNaN(nb)) return 1;
    return a.localeCompare(b);
  }

  function sections() {
    const stats = MP.store.load().words;
    const now = Date.now();
    const map = {};
    all().forEach((e) => {
      const k = sectionKey(e.section);
      const s = (map[k] = map[k] || { id: k, count: 0, due: 0, seen: 0 });
      s.count++;
      const st = stats[e.id];
      if (st && st.seen) s.seen++;
      if (!st || !st.due || st.due <= now) s.due++;
    });
    return Object.keys(map).sort(compareSections).map((k) => map[k]);
  }

  function bySection(id) {
    if (!id || id === 'all') return all().slice();
    if (id === 'due') {
      const stats = MP.store.load().words;
      const now = Date.now();
      return all().filter((e) => {
        const st = stats[e.id];
        return !st || !st.due || st.due <= now;
      });
    }
    const key = sectionKey(id);
    return all().filter((e) => sectionKey(e.section) === key);
  }

  /* ------------------------------------------------------------------ */
  /* adding and removing                                                 */
  /* ------------------------------------------------------------------ */

  function nextId(taken, seed) {
    let n = 1;
    let id = PREFIX + seed + '-' + n;
    while (taken[id]) id = PREFIX + seed + '-' + ++n;
    return id;
  }

  /*
   * Add a parsed batch to a section. An item already in that section with the
   * same Arabic is left alone rather than duplicated, so re-pasting a list you
   * have extended only adds what is new.
   */
  function addMany(section, rows) {
    const list = all();
    const taken = {};
    list.forEach((e) => { taken[e.id] = true; });

    const fallback = sectionKey(section);

    /* Compared as written, not on the letters alone: آخِرٌ "last" and آخَرُ
       "other" are the same skeleton and different words, and stripping the
       ḥarakāt to compare them would silently swallow the second one. The
       key carries the section, so the same word may sit in two of them. */
    const here = {};
    list.forEach((e) => { here[sectionKey(e.section) + '\u0000' + exactAr(e.ar)] = true; });

    let added = 0;
    let skipped = 0;
    const touched = {};
    rows.forEach((r) => {
      const key = r.section ? sectionKey(r.section) : fallback;
      const word = exactAr(r.ar);
      const k = key + '\u0000' + word;
      if (!word || here[k]) { skipped++; return; }
      here[k] = true;
      const id = nextId(taken, key.replace(/[^a-zA-Z0-9]/g, '') || 'x');
      taken[id] = true;
      list.push({
        id: id, ar: r.ar, pl: r.pl || '', en: r.en, tr: r.tr || '',
        gender: r.gender || '',
        section: key, added: Date.now(), updatedAt: Date.now()
      });
      touched[key] = true;
      added++;
    });

    if (added) writeAll(list);
    return { added, skipped, sections: Object.keys(touched).sort(compareSections) };
  }

  /*
   * Deleting leaves a tombstone. Without one, mergeContent has no way to tell
   * a word you deleted here from a word the other device simply has and this
   * one has not seen yet, so the next sync would hand it straight back.
   */
  function removeMany(ids) {
    if (!ids.length) return;
    const data = MP.custom.load();
    const gone = {};
    ids.forEach((id) => { gone[id] = true; });
    data.vocab = (data.vocab || []).filter((e) => !gone[e.id]);
    data.tombstones = data.tombstones || {};
    const now = Date.now();
    ids.forEach((id) => { data.tombstones[id] = now; });
    MP.custom.save(data);
  }

  function remove(id) {
    removeMany([id]);
  }

  function removeSection(id) {
    const key = sectionKey(id);
    removeMany(all().filter((e) => sectionKey(e.section) === key).map((e) => e.id));
  }

  /*
   * Edit an entry in place. The stamp matters: mergeContent picks the newer
   * of two copies by updatedAt, so an edit that did not bump it would lose to
   * the other device's stale copy on the next sync.
   */
  function update(id, fields) {
    const list = all();
    const e = list.find((x) => x.id === id);
    if (!e) return false;
    Object.assign(e, fields);
    if (fields.section != null) e.section = sectionKey(fields.section);
    e.updatedAt = Date.now();
    writeAll(list);
    return true;
  }

  function get(id) {
    return all().find((e) => e.id === id) || null;
  }

  /*
   * Gender, and whether the word wears it on its sleeve.
   *
   * Most feminine nouns end in ة, ى or اء and need no marking at all. The
   * ones worth a note are the two kinds that break that rule: أَرْضٌ, feminine
   * with nothing to show for it, and خَلِيفَةٌ, a tāʾ marbūṭah on a word that
   * takes masculine agreement. Those have to be learned with the word, so
   * this is what the drills surface rather than the gender on its own.
   */
  const FEM_ENDING = /(?:ة|ى|ا?ء)ٌ?ً?ٍ?$/;

  function looksFeminine(word) {
    return FEM_ENDING.test(String(word || '').replace(/[\u064B-\u0652]/g, '').trim());
  }

  function genderNote(entry) {
    if (!entry || !entry.gender) return '';
    const looks = looksFeminine(entry.ar);
    if (entry.gender === 'muannath') {
      return looks ? 'feminine' : 'feminine — nothing on the word shows it';
    }
    return looks ? 'masculine, despite the tāʾ marbūṭah' : 'masculine';
  }

  const GENDERS = [
    { id: '', name: 'unmarked' },
    { id: 'mudhakkar', name: 'masculine' },
    { id: 'muannath', name: 'feminine' }
  ];

  /* ------------------------------------------------------------------ */
  /* building a round                                                    */
  /* ------------------------------------------------------------------ */

  function shuffle(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = out[i];
      out[i] = out[j];
      out[j] = t;
    }
    return out;
  }

  const MODES = [
    { id: 'flash', name: 'Flashcards', desc: 'Turn the card over and mark yourself. The quickest first pass.' },
    { id: 'choice', name: 'Multiple choice', desc: 'One prompt, four answers. Good when the words are still new.' },
    { id: 'type', name: 'Type the answer', desc: 'No options to pick from — you have to produce it.' },
    { id: 'match', name: 'Match the pairs', desc: 'Six pairs on a grid, against the clock.' }
  ];

  /*
   * What to do with the plurals.
   *
   * Held with the word they are a footnote on the answer. But a plural like
   * كُتُبٌ is its own shape to recognise and its own thing to recall, so it can
   * also be drilled on its own schedule, or asked for directly from the
   * singular — which is the one that actually tests whether you know it.
   */
  const PLURAL_MODES = [
    { id: 'with', name: 'Shown with the word', desc: 'The plural appears on the answer.' },
    { id: 'separate', name: 'Tested separately', desc: 'Each plural becomes its own card, with its own schedule.' },
    { id: 'produce', name: 'Asked from the singular', desc: 'You are shown the singular and have to give the plural.' }
  ];

  const DIRECTIONS = [
    { id: 'toEn', name: 'Arabic → English', desc: 'You are shown the Arabic.' },
    { id: 'toAr', name: 'English → Arabic', desc: 'You are shown the English.' },
    { id: 'mixed', name: 'Mixed', desc: 'Both ways, shuffled.' }
  ];

  const MATCH_PAIRS = 6;

  /* three wrong answers, taken from the same section so they are plausible */
  function distractors(entry, pool, direction, n) {
    const field = direction === 'toPl' ? 'pl' : (direction === 'toAr' ? 'ar' : 'en');
    const want = String(entry[field] || '');
    const seen = { [want]: true };
    const out = [];
    shuffle(pool).forEach((e) => {
      if (out.length >= n || e.id === entry.id) return;
      const v = String(e[field] || '');
      if (!v || seen[v]) return;
      seen[v] = true;
      out.push(e);
    });
    return out;
  }

  /*
   * A round is a list of questions the screens can render without knowing
   * anything about how they were chosen. Weakest and most overdue first, so a
   * short round spends its time where it is needed.
   */
  function buildRound(opts) {
    const o = opts || {};
    const mode = o.mode || 'choice';
    const plurals = o.plurals || 'with';
    let pool = bySection(o.section);

    if (plurals === 'produce') {
      /* only the words that have one */
      pool = pool.filter((e) => e.pl);
    } else if (plurals === 'separate') {
      /* a plural becomes a card of its own, with an id of its own so it gets
         its own Leitner box rather than riding on the singular's */
      const expanded = [];
      pool.forEach((e) => {
        expanded.push(e);
        if (e.pl) {
          expanded.push({
            id: e.id + ':pl', ar: e.pl, pl: '', tr: '',
            en: e.en + ' (pl.)', gender: e.gender || '',
            section: e.section, ofId: e.id, isPlural: true
          });
        }
      });
      pool = expanded;
    }
    /* replaying the ones that were missed: narrow to those, but keep the rest
       of the section around so multiple choice still has distractors */
    const only = o.only && o.only.length ? o.only : null;
    const context = pool.slice();
    if (only) {
      const want = {};
      only.forEach((id) => { want[id] = true; });
      pool = pool.filter((e) => want[e.id]);
    }
    if (!pool.length) return { mode: mode, items: [], boards: [], pool: [] };

    const stats = MP.store.load().words;
    const now = Date.now();
    pool = shuffle(pool);
    if (o.section !== 'all' || o.weakestFirst !== false) {
      pool.sort((a, b) => {
        const sa = stats[a.id] || {};
        const sb = stats[b.id] || {};
        const overdue = (s) => (s.due ? now - s.due : 0);
        if ((sa.box || 0) !== (sb.box || 0)) return (sa.box || 0) - (sb.box || 0);
        return overdue(sb) - overdue(sa);
      });
    }

    const len = o.length && o.length > 0 ? Math.min(o.length, pool.length) : pool.length;

    if (mode === 'match') {
      /* every chosen word gets on a board: full boards of six, then whatever
         is left over. A single stray cannot make a pair, so it joins the
         board before it rather than being dropped from the round. */
      const chosen = pool.slice(0, len);
      const boards = [];
      for (let i = 0; i < chosen.length; i += MATCH_PAIRS) {
        const group = chosen.slice(i, i + MATCH_PAIRS);
        if (group.length < 2 && boards.length) {
          boards[boards.length - 1] = boards[boards.length - 1].concat(group);
          break;
        }
        if (group.length < 2) break;
        boards.push(group);
      }
      return { mode: mode, boards: boards, items: chosen, pool: pool, plurals: plurals };
    }

    const chosen = pool.slice(0, len);
    const dir = plurals === 'produce' ? 'toPl' : (o.direction || 'toEn');
    const items = chosen.map((entry) => {
      const direction = dir === 'mixed' ? (Math.random() < 0.5 ? 'toEn' : 'toAr') : dir;
      /* an expanded plural has no plural of its own to be asked for */
      if (direction === 'toPl' && !entry.pl) return null;
      const q = { entry: entry, direction: direction };
      if (mode === 'choice') {
        const wrong = distractors(entry, context, direction, 3);
        q.options = shuffle([entry].concat(wrong));
        /* too small a section cannot fill four tiles — show what there is */
        q.enough = q.options.length > 1;
      }
      return q;
    }).filter(Boolean);

    return { mode: mode, items: items, pool: pool, plurals: plurals };
  }

  function record(entryId, correct) {
    MP.store.recordWordSeen(entryId, !!correct);
  }

  function progressOf(entryId) {
    const s = MP.store.load().words[entryId];
    if (!s) return { box: 0, seen: 0, due: 0 };
    return { box: s.box || 0, seen: s.seen || 0, due: s.due || 0 };
  }

  function count() {
    return all().length;
  }

  MP.vocab = {
    PREFIX,
    all,
    get,
    count,
    sections,
    bySection,
    parse,
    addMany,
    remove,
    removeSection,
    update,
    buildRound,
    record,
    progressOf,
    matches,
    glosses,
    genderNote,
    looksFeminine,
    GENDERS,
    shuffle,
    sectionKey,
    MODES,
    DIRECTIONS,
    PLURAL_MODES,
    MATCH_PAIRS
  };
})(typeof window !== 'undefined' ? window : globalThis);
