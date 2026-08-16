/*
 * pwa.js — service worker registration and the update prompt.
 *
 * Only runs over http(s): opening index.html straight off disk still works,
 * it simply has no service worker.
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});
  const supported = 'serviceWorker' in navigator &&
    (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');

  function banner(text, actionLabel, onAction) {
    const bar = document.createElement('div');
    bar.className = 'update-bar';
    const msg = document.createElement('span');
    msg.textContent = text;
    bar.appendChild(msg);

    const act = document.createElement('button');
    act.className = 'btn primary small';
    act.type = 'button';
    act.textContent = actionLabel;
    act.addEventListener('click', onAction);
    bar.appendChild(act);

    const dismiss = document.createElement('button');
    dismiss.className = 'btn ghost small';
    dismiss.type = 'button';
    dismiss.textContent = 'Later';
    dismiss.addEventListener('click', () => bar.remove());
    bar.appendChild(dismiss);

    document.body.appendChild(bar);
  }

  function register() {
    if (!supported) return;

    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const incoming = reg.installing;
        if (!incoming) return;
        incoming.addEventListener('statechange', () => {
          /* installed while another worker is in charge = a genuine update,
             rather than the very first install */
          if (incoming.state === 'installed' && navigator.serviceWorker.controller) {
            banner('A new version of the app is ready.', 'Reload', () => {
              incoming.postMessage('SKIP_WAITING');
            });
          }
        });
      });
    }).catch(() => { /* offline first run, or blocked — the app still works */ });

    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return;
      reloading = true;
      location.reload();
    });
  }

  MP.pwa = { register, supported };
  document.addEventListener('DOMContentLoaded', register);
})(typeof window !== 'undefined' ? window : globalThis);
