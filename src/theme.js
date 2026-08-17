/*
 * theme.js — light, dim and dark.
 *
 * "dim" is the one in the middle: warm off-white paper rather than a bright
 * screen, with softened contrast. Easier on the eyes than light mode without
 * going fully dark.
 *
 * The choice is written onto <html data-theme="…"> and stored, and it is
 * applied before the app renders so there is no flash of the wrong colours.
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});
  const KEY = 'mp.theme.v1';

  const THEMES = [
    { id: 'light', name: 'Light', desc: 'Clean white paper.' },
    { id: 'dim', name: 'Dim', desc: 'Warm, low-glare paper — the middle setting.' },
    { id: 'dark', name: 'Dark', desc: 'Dark screen for night.' },
    { id: 'system', name: 'System', desc: 'Follow the device.' }
  ];

  function stored() {
    try {
      return global.localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  function current() {
    const t = stored();
    return THEMES.some((x) => x.id === t) ? t : 'dim';
  }

  function apply(id) {
    const theme = THEMES.some((x) => x.id === id) ? id : current();
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);

    /* keep the browser chrome in step with the page */
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const bg = getComputedStyle(document.body || root).getPropertyValue('--bg').trim();
      if (bg) meta.setAttribute('content', bg);
    }
  }

  function set(id) {
    try {
      global.localStorage.setItem(KEY, id);
    } catch (e) { /* storage blocked; the choice lasts this session only */ }
    apply(id);
  }

  /* next theme in the list, for a one-tap cycle */
  function cycle() {
    const order = ['light', 'dim', 'dark'];
    const at = order.indexOf(current());
    const next = order[(at + 1) % order.length];
    set(next);
    return next;
  }

  MP.theme = { THEMES, current, apply, set, cycle };
  apply(current());   // before first paint
})(typeof window !== 'undefined' ? window : globalThis);
