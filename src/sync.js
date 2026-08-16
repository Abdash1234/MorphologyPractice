/*
 * sync.js — the client half of cloud sync.
 *
 * Local storage stays the working copy. Sync pushes both documents, the server
 * merges them against what it holds, and the client adopts the merged result.
 * Being offline is normal, not an error: a failed sync is remembered and
 * retried next time, and nothing about the app stops working meanwhile.
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});
  const KEY = 'mp.sync.v1';

  let state = null;     // {token, deviceId, label, lastSync, lastError, revs}
  let inFlight = null;
  const listeners = [];

  function load() {
    if (state) return state;
    let raw = null;
    try {
      raw = global.localStorage.getItem(KEY);
    } catch (e) { /* storage blocked */ }
    try {
      state = raw ? JSON.parse(raw) : {};
    } catch (e) {
      state = {};
    }
    return state;
  }

  function save() {
    try {
      global.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) { /* nothing we can do */ }
    listeners.forEach((fn) => fn(status()));
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  function status() {
    const s = load();
    return {
      signedIn: !!s.token,
      deviceId: s.deviceId || null,
      label: s.label || null,
      lastSync: s.lastSync || 0,
      lastError: s.lastError || null,
      syncing: !!inFlight,
      online: global.navigator ? global.navigator.onLine !== false : true
    };
  }

  /* The API sits on the same origin as the app, so there is nothing to
     configure and no CORS. Opened from a file:// path there is no server. */
  function apiBase() {
    if (location.protocol === 'file:') return null;
    return location.origin;
  }

  async function call(path, options) {
    const base = apiBase();
    if (!base) throw new Error('Sync needs the app to be served over http(s).');
    const s = load();
    const opts = Object.assign({ method: 'GET' }, options || {});
    opts.headers = Object.assign(
      { 'content-type': 'application/json' },
      s.token ? { authorization: 'Bearer ' + s.token } : {},
      opts.headers || {}
    );
    if (opts.body && typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);

    const response = await fetch(base + path, opts);
    let body = null;
    try {
      body = await response.json();
    } catch (e) { /* an error page, most likely */ }

    if (response.status === 401 && s.token) {
      /* the token has been revoked from another device */
      signOut();
      throw new Error('This device was signed out. Sign in again.');
    }
    if (!response.ok) throw new Error((body && body.error) || 'Sync failed (' + response.status + ').');
    return body;
  }

  /* ------------------------------------------------------------------ */

  function defaultLabel() {
    const ua = (global.navigator && global.navigator.userAgent) || '';
    if (/iphone|android.*mobile/i.test(ua)) return 'phone';
    if (/ipad|tablet/i.test(ua)) return 'tablet';
    return 'laptop';
  }

  async function signIn(passphrase, label) {
    const body = await call('/api/auth/login', {
      method: 'POST',
      body: { passphrase: passphrase, label: label || defaultLabel() }
    });
    state = Object.assign(load(), {
      token: body.token,
      deviceId: body.deviceId,
      label: body.label,
      lastError: null
    });
    save();
    return syncNow();
  }

  function signOut() {
    state = {};
    save();
  }

  function localDocuments() {
    return {
      progress: MP.store.exportProgress(),
      content: MP.custom.load()
    };
  }

  function adopt(docs) {
    if (!docs) return;
    if (docs.progress && docs.progress.body) MP.store.importProgress(docs.progress.body);
    if (docs.content && docs.content.body) MP.custom.replaceAll(docs.content.body);
    state.revs = {
      progress: docs.progress ? docs.progress.rev : 0,
      content: docs.content ? docs.content.rev : 0
    };
  }

  /* Push both documents, take back the merged result. */
  function syncNow() {
    const s = load();
    if (!s.token) return Promise.reject(new Error('Not signed in.'));
    if (inFlight) return inFlight;

    listeners.forEach((fn) => fn(Object.assign(status(), { syncing: true })));

    inFlight = call('/api/sync', { method: 'POST', body: localDocuments() })
      .then((body) => {
        adopt(body.docs);
        state.lastSync = Date.now();
        state.lastError = null;
        save();
        return status();
      })
      .catch((err) => {
        state.lastError = err.message;
        save();
        throw err;
      })
      .then(
        (v) => { inFlight = null; return v; },
        (e) => { inFlight = null; throw e; }
      );

    return inFlight;
  }

  /* Used after a session and on start-up: never throws, never interrupts. */
  function syncQuietly() {
    const s = load();
    if (!s.token) return Promise.resolve(null);
    if (global.navigator && global.navigator.onLine === false) return Promise.resolve(null);
    return syncNow().catch(() => null);
  }

  async function devices() {
    const body = await call('/api/devices');
    return body.devices || [];
  }

  async function revoke(id) {
    const body = await call('/api/devices/' + encodeURIComponent(id), { method: 'DELETE' });
    if (body.wasCurrent) signOut();
    return body;
  }

  MP.sync = {
    status,
    onChange,
    signIn,
    signOut,
    syncNow,
    syncQuietly,
    devices,
    revoke,
    available: () => apiBase() !== null
  };

  /* catch up as soon as we are back online */
  if (global.addEventListener) {
    global.addEventListener('online', () => syncQuietly());
  }
})(typeof window !== 'undefined' ? window : globalThis);
