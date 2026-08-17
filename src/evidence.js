/*
 * evidence.js — which part of the word gives each answer away.
 *
 * Every node of the chart is decided by looking at something specific: the two
 * vowels tell you active from passive, the letter that is not a radical tells
 * you the form, the و or ي among the radicals tells you which kind of muʿtall
 * it is. This works out, for a given word and a given question, exactly which
 * characters carry that evidence, so the walkthrough can light them up.
 *
 * It is deliberately conservative. Where the evidence cannot be located with
 * confidence it returns no indices and lets the explanation stand on its own —
 * highlighting the wrong letter would teach the wrong thing.
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});

  const HARAKAH = /[ً-ْٰـ]/;
  const SHADDAH = 'ّ';

  const isMark = (ch) => HARAKAH.test(ch);

  /* Letters that count as the same radical once written into a word. */
  const FAMILIES = [
    ['ا', 'أ', 'إ', 'آ', 'ٱ'],
    ['و', 'ؤ'],
    ['ي', 'ى', 'ئ'],
    ['ه', 'ة'],
    /* a hamzah radical is written on whichever seat the word needs — أَخَذَ,
       سَأَلَ, سُئِلَ, قَرَأَ are all the same radical ء */
    ['ء', 'أ', 'إ', 'آ', 'ٱ', 'ؤ', 'ئ']
  ];

  function sameLetter(a, b) {
    if (a === b) return true;
    return FAMILIES.some((f) => f.indexOf(a) !== -1 && f.indexOf(b) !== -1);
  }

  /* Indices of the actual letters, skipping every vowel mark. */
  function letterSlots(w) {
    const out = [];
    for (let i = 0; i < w.length; i++) {
      if (!isMark(w[i]) && w[i] !== ' ') out.push(i);
    }
    return out;
  }

  /* The vowel marks sitting on the letter at index i. */
  function marksAt(w, i) {
    const out = [];
    for (let k = i + 1; k < w.length && isMark(w[k]); k++) out.push(k);
    return out;
  }

  /*
   * Where each radical landed in the word, in order. -1 means the radical is
   * not on the surface — a weak letter that dropped or turned into an alif.
   */
  function rootMap(w, root) {
    const slots = letterSlots(w);
    const map = [];
    let from = 0;
    root.forEach((r) => {
      let found = -1;
      for (let k = from; k < slots.length; k++) {
        if (sameLetter(w[slots[k]], r)) { found = slots[k]; from = k + 1; break; }
      }
      map.push(found);
    });
    return map;
  }

  const seen = (map) => map.filter((i) => i >= 0);

  /* Letters that are not radicals and sit inside the stem — the additions that
     make a mazīd form, plus the shaddah of a doubled ʿayn. */
  function augmentAt(w, map) {
    const present = seen(map);
    if (!present.length) return [];
    const last = Math.max.apply(null, present);
    const out = [];
    letterSlots(w).forEach((i) => {
      if (i <= last && map.indexOf(i) === -1) out.push(i);
    });
    /* Form II, V and IX add nothing but a shaddah */
    for (let i = 0; i < w.length; i++) {
      if (w[i] === SHADDAH && i <= last) out.push(i);
    }
    return out.sort((a, b) => a - b);
  }

  /* Everything after the last radical: the ending that carries person,
     gender, number and iʿrāb. */
  function endingAt(w, map) {
    const present = seen(map);
    if (!present.length) return [];
    const last = Math.max.apply(null, present);
    const out = [];
    for (let i = last + 1; i < w.length; i++) out.push(i);
    return out;
  }

  /* Everything before the first radical: the tense letter, the hamzat waṣl of
     an amr, a negating particle. */
  function prefixAt(w, map) {
    const present = seen(map);
    if (!present.length) return [];
    const first = Math.min.apply(null, present);
    const out = [];
    for (let i = 0; i < first; i++) out.push(i);
    return out;
  }

  const WEAK = ['و', 'ي'];

  /*
   * The weak radical, wherever it ended up. If it is not on the surface —
   * قَالَ from ق و ل — fall back to whatever letter is standing in its place
   * between the radicals on either side, which is the alif you want lit up.
   */
  function weakAt(w, root, map) {
    const out = [];
    root.forEach((r, k) => {
      if (WEAK.indexOf(r) === -1) return;
      if (map[k] >= 0) { out.push(map[k]); return; }
      const before = k > 0 ? map[k - 1] : -1;
      const after = map.slice(k + 1).find((i) => i >= 0);
      letterSlots(w).forEach((i) => {
        if (i > before && (after === undefined || i < after) && map.indexOf(i) === -1) out.push(i);
      });
    });
    return out;
  }

  /* Include a letter's vowel marks along with the letter itself. */
  function withMarks(w, indices) {
    const out = [];
    indices.forEach((i) => {
      out.push(i);
      marksAt(w, i).forEach((m) => out.push(m));
    });
    return out;
  }

  const uniq = (a) => a.filter((x, i, arr) => arr.indexOf(x) === i).sort((x, y) => x - y);

  /*
   * The evidence for one question about one word.
   * Returns { indices, why } — the characters to light up, and the reason.
   */
  function forStep(word, paradigm, stepId, answerId) {
    const w = word.w || '';
    const rootStr = (paradigm && paradigm.root) || word.root || '';
    const root = rootStr.trim().split(/\s+/).filter(Boolean);

    /* the questions that are not about the letters at all, and so are the only
       ones a rootless word — a particle — can be asked */
    if (stepId === 'harfType') {
      return { indices: [], why: 'Nothing inside the particle gives this away: its ʿamal is learned, then confirmed by what the next word does.' };
    }
    if (stepId === 'wordType') {
      return { indices: [], why: 'Whether it carries a tense, stands on its own, or needs something else before it means anything.' };
    }

    if (!w || !root.length) return { indices: [], why: '' };

    const map = rootMap(w, root);
    const R = (ix, why) => ({ indices: uniq(ix), why: why });

    const slots = letterSlots(w);
    const firstLetter = slots[0];
    const beforeLast = slots.length > 1 ? slots[slots.length - 2] : slots[0];

    switch (stepId) {
      case 'voice': {
        /* the two vowels the whole distinction rests on */
        const ix = marksAt(w, firstLetter).concat(marksAt(w, beforeLast));
        return R(ix, answerId === 'majhul'
          ? 'A ḍammah at the front and a kasrah (māḍī) or fatḥah (muḍāriʿ) before the last letter — that pair is the passive.'
          : 'A fatḥah at the front rather than a ḍammah: the doer is still named, so it is active.');
      }

      case 'tense': {
        if (answerId === 'mudari' || answerId === 'amr') {
          return R(withMarks(w, prefixAt(w, map)), answerId === 'mudari'
            ? 'The tense letter at the front — one of أ ن ي ت — is what makes it muḍāriʿ.'
            : 'The hamzat waṣl at the front, with the ending cut back to a sukūn: an amr.');
        }
        return R(endingAt(w, map), 'No tense letter in front and the root standing bare: māḍī.');
      }

      case 'letters':
        return R(withMarks(w, seen(map)),
          root.length + ' radicals: ' + root.join(' ') + '.');

      case 'root': {
        /*
         * A radical that is not on the surface is the most useful thing on
         * this screen: it is why قَالَ hides a wāw and كُلْ hides a hamzah.
         * Nothing can be lit up for it, so name it instead.
         */
        const missing = root.filter((r, k) => map[k] < 0);
        const why = 'Strip every addition and these are what is left: ' + root.join(' ') + '.';
        if (missing.length) {
          return R(withMarks(w, seen(map)), why + ' The ' + missing.join(' and ') +
            ' is not written in this form — it has dropped or changed, and only the ṣarf ṣaghīr brings it back.');
        }
        return R(withMarks(w, seen(map)), why);
      }

      case 'augmentation': {
        const aug = augmentAt(w, map);
        if (!aug.length) return R(withMarks(w, seen(map)), 'Every letter here is a radical — nothing has been added, so it is mujarrad.');
        return R(withMarks(w, aug), 'These are not radicals: the word is the root with letters added on top.');
      }

      case 'baab': {
        if (paradigm && paradigm.augmentation === 'mujarrad') {
          /* the six gates are decided by the vowel on the ʿayn */
          const ayn = map[1];
          if (ayn < 0) return R([], 'The bāb is set by the vowel on the middle radical in the māḍī and again in the muḍāriʿ.');
          return R(marksAt(w, ayn), 'The vowel on the middle radical is what picks the bāb out from the other five.');
        }
        const aug = augmentAt(w, map);
        return R(withMarks(w, aug), 'The letters added to the root are the shape of the form.');
      }

      case 'soundness':
      case 'subtype': {
        const weak = weakAt(w, root, map);
        if (weak.length) {
          return R(withMarks(w, weak), answerId === 'salim'
            ? 'Nothing weak among the radicals.'
            : 'The weak radical — this is the letter that decides which kind it is.');
        }
        if (answerId === 'mudaaf') {
          const doubled = [];
          for (let i = 0; i < w.length; i++) if (w[i] === SHADDAH) doubled.push(i);
          return R(withMarks(w, seen(map).slice(1)).concat(doubled),
            'The ʿayn and the lām are the same letter, run together under a shaddah.');
        }
        if (answerId === 'mahmuz') {
          const hamzah = seen(map).filter((i) => 'ءأإؤئآ'.indexOf(w[i]) !== -1);
          return R(hamzah, 'One of the radicals is a hamzah.');
        }
        return R(withMarks(w, seen(map)), 'No و or ي among the radicals, no hamzah and no doubling: sound and plain.');
      }

      case 'mahmuzPosition': {
        const hamzah = seen(map).filter((i) => 'ءأإؤئآ'.indexOf(w[i]) !== -1);
        if (!hamzah.length) {
          /* كُلْ، خُذْ، مُرْ — the hamzah is a radical that is simply not here */
          return R([], 'The hamzah is the first radical, but it is not in this form at all: the amr of أَكَلَ، أَخَذَ، أَمَرَ would need two hamzahs in a row, so both are dropped. It is still mahmūz al-fāʾ by its root.');
        }
        return R(withMarks(w, hamzah), 'Where the hamzah sits among the radicals is what names it.');
      }

      case 'person':
      case 'gender':
      case 'number': {
        const ix = endingAt(w, map).concat(word.tense === 'mudari' ? prefixAt(w, map) : []);
        return R(ix, word.tense === 'mudari'
          ? 'The tense letter in front and the ending behind, read together, give the person, gender and number.'
          : 'The ending is what carries the person, the gender and the number.');
      }

      case 'mood': {
        const end = endingAt(w, map);
        const tail = end.length ? end : marksAt(w, slots[slots.length - 1]);
        return R(tail, 'The very end of the word: ḍammah for marfūʿ, fatḥah for manṣūb, sukūn for majzūm.');
      }

      case 'polarity':
        return R(prefixAt(w, map), answerId === 'manfi'
          ? 'The negating particle in front of the verb.'
          : 'Nothing negating it in front.');

      case 'ismType': {
        const aug = augmentAt(w, map);
        return R(aug.length ? aug : withMarks(w, seen(map)),
          'The pattern the radicals are poured into is what makes it this kind of noun.');
      }


      case 'sarf':
        return R(withMarks(w, seen(map)),
          'The same radicals run through all eleven cells — the word sits in whichever cell its pattern matches.');

      default:
        return { indices: [], why: '' };
    }
  }

  MP.evidence = { forStep, rootMap, letterSlots, marksAt, augmentAt, endingAt, prefixAt, weakAt };
})(typeof window !== 'undefined' ? window : globalThis);
