/*
 * store.js — settings and progress, kept in localStorage.
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});

  const STATS_KEY = 'mp.stats.v1';
  const SETTINGS_KEY = 'mp.settings.v1';

  const DEFAULT_SETTINGS = {
    deckId: 'all',
    length: 10,
    showTranslit: true,
    showHarakat: true,
    weakestFirst: true,
    groups: { identity: true, features: true, structure: true, root: true, sarf: true, translation: true }
  };

  function safeParse(raw, fallback) {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function available() {
    try {
      global.localStorage.setItem('mp.probe', '1');
      global.localStorage.removeItem('mp.probe');
      return true;
    } catch (e) {
      return false;
    }
  }

  const hasLS = available();
  let memory = { stats: null, settings: null }; // fallback when storage is blocked

  function load() {
    const base = { words: {}, steps: {}, sessions: 0, answered: 0, correct: 0 };
    const raw = hasLS ? global.localStorage.getItem(STATS_KEY) : null;
    const stats = hasLS ? safeParse(raw, base) : memory.stats || base;
    return Object.assign(base, stats);
  }

  function save(stats) {
    if (hasLS) {
      try {
        global.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
        return;
      } catch (e) {
        /* fall through to memory */
      }
    }
    memory.stats = stats;
  }

  function loadSettings() {
    const raw = hasLS ? global.localStorage.getItem(SETTINGS_KEY) : null;
    const s = hasLS ? safeParse(raw, null) : memory.settings;
    const merged = Object.assign({}, DEFAULT_SETTINGS, s || {});
    merged.groups = Object.assign({}, DEFAULT_SETTINGS.groups, (s && s.groups) || {});
    return merged;
  }

  function saveSettings(s) {
    if (hasLS) {
      try {
        global.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
        return;
      } catch (e) {
        /* fall through */
      }
    }
    memory.settings = s;
  }

  function recordStep(wordId, stepId, correct) {
    const stats = load();
    const w = (stats.words[wordId] = stats.words[wordId] || { seen: 0, correct: 0, wrong: 0, last: 0 });
    const s = (stats.steps[stepId] = stats.steps[stepId] || { correct: 0, total: 0 });
    if (correct) {
      w.correct++;
      s.correct++;
      stats.correct++;
    } else {
      w.wrong++;
    }
    s.total++;
    stats.answered++;
    save(stats);
  }

  function recordWordSeen(wordId, cleanSweep) {
    const stats = load();
    const w = (stats.words[wordId] = stats.words[wordId] || { seen: 0, correct: 0, wrong: 0, last: 0 });
    w.seen++;
    w.last = Date.now();
    if (cleanSweep) w.clean = (w.clean || 0) + 1;
    save(stats);
  }

  function recordSession() {
    const stats = load();
    stats.sessions++;
    save(stats);
  }

  function reset() {
    if (hasLS) global.localStorage.removeItem(STATS_KEY);
    memory.stats = null;
  }

  MP.store = {
    load,
    save,
    loadSettings,
    saveSettings,
    recordStep,
    recordWordSeen,
    recordSession,
    reset,
    DEFAULT_SETTINGS,
    storageAvailable: hasLS
  };
})(typeof window !== 'undefined' ? window : globalThis);
