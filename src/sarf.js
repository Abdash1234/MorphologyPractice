/*
 * sarf.js — the ṣarf ṣaghīr as it is actually recited.
 *
 * The eleven cells are not learned as a list. They are learned as three lines
 * said out loud, in a fixed order, with the same joining words every time:
 *
 *   نَصَرَ يَنْصُرُ نَصْرًا
 *   نُصِرَ يُنْصَرُ، فَهُوَ نَاصِرٌ وَذَاكَ مَنْصُورٌ
 *   اُنْصُرْ، لَا تَنْصُرْ، مَنْصَرٌ، مِنْصَرٌ
 *
 * That shape is the same for every bāb and every form — only the words in it
 * change — so this builds it from any paradigm rather than being written out
 * per form. A cell the bāb does not have (an intransitive verb has no passive,
 * only the bare triliteral gives a ẓarf or an ālah) collapses to a dash and is
 * never blanked out in a drill: there is nothing to recall.
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});

  /*
   * The three lines. `lead` is the word recited before a cell — فَهُوَ before
   * the doer, وَذَاكَ before the one done to — and `sep` is what separates this
   * part from the one before it.
   */
  const LINES = [
    {
      id: 'malum',
      ar: 'المَعْلُوم',
      en: 'Active — past, present, verbal noun',
      parts: [
        { slot: 'madi' },
        { slot: 'mudari' },
        { slot: 'masdar' }
      ]
    },
    {
      id: 'majhul',
      ar: 'المَجْهُول',
      en: 'The same, with the doer dropped',
      parts: [
        { slot: 'madiMajhul' },
        { slot: 'mudariMajhul' }
      ]
    },
    {
      id: 'mushtaqqat',
      ar: 'المُشْتَقَّات',
      en: 'The doer, the one done to, the command, the prohibition, the place, the tool',
      parts: [
        { slot: 'ismFail', lead: 'فَهُوَ' },
        { slot: 'ismMaful', lead: 'وَذَاكَ' },
        { slot: 'amr', lead: 'وَالأَمْرُ مِنْهُ', sep: '،' },
        { slot: 'nahi', lead: 'وَالنَّهْيُ عَنْهُ', sep: '،' },
        { slot: 'zarf', lead: 'وَالظَّرْفُ مِنْهُ', sep: '،' },
        { slot: 'aalah', lead: 'وَالآلَةُ مِنْهُ', sep: '،' }
      ]
    }
  ];

  const slotInfo = (id) => (MP.taxonomy.sarfSlots || []).find((s) => s.id === id) || { id: id, ar: id, en: id };

  const used = (paradigm, slotId) => {
    const v = paradigm && paradigm[slotId];
    return typeof v === 'string' && v && v !== MP.NOT_USED;
  };

  /*
   * The recitation for one paradigm: three lines, each a list of cells with
   * the words that join them. Everything the renderers and the drill need.
   */
  function build(paradigm) {
    return LINES.map((line) => ({
      id: line.id,
      ar: line.ar,
      en: line.en,
      parts: line.parts.map((part) => {
        const info = slotInfo(part.slot);
        return {
          slot: part.slot,
          lead: part.lead || '',
          sep: part.sep || '',
          value: paradigm[part.slot],
          used: used(paradigm, part.slot),
          labelAr: info.ar,
          labelEn: info.en
        };
      })
    }));
  }

  /* Every cell that carries a word — the only ones worth asking for. */
  function fillableSlots(paradigm) {
    const out = [];
    LINES.forEach((line) => line.parts.forEach((p) => {
      if (used(paradigm, p.slot)) out.push(p.slot);
    }));
    return out;
  }

  /*
   * Which cells to blank out.
   *   'none'  nothing — the plain overview
   *   'all'   every cell that has a word in it
   *   'some'  a bit under half, chosen at random, but never a whole line
   */
  function blanksFor(paradigm, mode) {
    const all = fillableSlots(paradigm);
    if (mode === 'all') return all.slice();
    if (mode !== 'some') return [];
    const shuffled = MP.engine.shuffle(all);
    const n = Math.max(1, Math.round(all.length * 0.45));
    return shuffled.slice(0, n);
  }

  /* The whole thing as one line of text, for a title or a read-aloud prompt. */
  function asText(paradigm) {
    return build(paradigm)
      .map((line) => line.parts
        .filter((p) => p.used)
        .map((p) => (p.lead ? p.lead + ' ' : '') + p.value)
        .join(' '))
      .filter(Boolean)
      .join(' — ');
  }

  MP.sarf = { LINES, build, fillableSlots, blanksFor, asText, slotInfo, used };
})(typeof window !== 'undefined' ? window : globalThis);
