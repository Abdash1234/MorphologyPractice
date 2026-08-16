/*
 * sw.js — service worker.
 *
 * The app is a few hundred kilobytes of static files and keeps all of its
 * state locally, so caching the whole shell makes it work with no network at
 * all: on a phone, on the train, in a masjid with no signal.
 *
 * PRECACHE and VERSION are rewritten by tools/bump-version.js at release time,
 * so the list can never drift from what is actually on disk.
 */
'use strict';

const VERSION = '20260816-40a9ff7';
const CACHE = 'sarf-' + VERSION;

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/styles.css',
  './src/taxonomy.js',
  './src/paradigms.js',
  './src/words.js',
  './src/reference.js',
  './src/conjugation.js',
  './src/sentences.js',
  './src/generator.js',
  './src/custom.js',
  './src/store.js',
  './src/engine.js',
  './src/sync.js',
  './src/editor.js',
  './src/app.js',
  './src/pwa.js',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      /* one bad URL should not sink the whole install */
      Promise.allSettled(PRECACHE.map((url) => cache.add(url)))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* the page asks for this when you accept an update */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;   // leave anything external alone

  /* The API must never be cached: a cached 401 would lock you out, and cached
     sync data would be worse than no sync at all. Straight to the network. */
  if (url.pathname.startsWith('/api/')) return;

  /* Navigations: try the network so a deploy is picked up, fall back to the
     cached shell when offline. */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }

  /* Everything else: serve from cache at once, refresh it in the background. */
  event.respondWith(
    caches.match(request).then((hit) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => hit);
      return hit || network;
    })
  );
});
