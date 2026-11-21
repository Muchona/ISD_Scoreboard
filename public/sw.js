const CACHE_NAME = 'citizenscore-offline-v3';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg', '/logo.png'];

async function precacheAppAndBundles() {
  const cache = await caches.open(CACHE_NAME);
  try {
    await cache.addAll(APP_SHELL);
  } catch {}

  try {
    const res = await fetch('/index.html', { cache: 'no-cache' });
    if (!res.ok) return;
    const html = await res.text();
    const htmlHeaders = { 'Content-Type': 'text/html; charset=utf-8' };
    await cache.put('/', new Response(html, { headers: htmlHeaders }));
    await cache.put('/index.html', new Response(html, { headers: htmlHeaders }));

    const assetMatches = html.match(/assets\/[a-zA-Z0-9._-]+\.(?:js|css|mjs)/g) || [];
    const assetUrls = Array.from(new Set(assetMatches.map((m) => '/' + m)));

    await Promise.all(
      assetUrls.map(async (url) => {
        try {
          const assetRes = await fetch(url);
          if (!assetRes.ok) return;
          await cache.put(url, assetRes.clone());

          if (url.endsWith('.js')) {
            const jsText = await assetRes.text();
            const subMatches = jsText.match(/(?:assets\/)?[a-zA-Z0-9._-]+-[a-zA-Z0-9_-]{8}\.(?:js|mjs|css)/g) || [];
            const subUrls = Array.from(
              new Set(subMatches.map((m) => (m.startsWith('assets/') ? '/' + m : '/assets/' + m)))
            );
            await Promise.all(
              subUrls.map((subUrl) =>
                fetch(subUrl)
                  .then((r) => (r.ok ? cache.put(subUrl, r) : undefined))
                  .catch(() => {})
              )
            );
          }
        } catch {}
      })
    );
  } catch {}
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheAppAndBundles());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/_vercel/')) return;

  // Navigation requests: network-first when online, instant cached app shell when offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/', copy.clone());
              cache.put('/index.html', copy);
            });
          }
          return res;
        })
        .catch(async () => {
          const cached =
            (await caches.match(req, { ignoreSearch: true })) ||
            (await caches.match('/', { ignoreSearch: true })) ||
            (await caches.match('/index.html', { ignoreSearch: true }));
          return (
            cached ||
            new Response('Offline — please open CitizenScore.ie once while online to cache the app.', {
              status: 200,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            })
          );
        })
    );
    return;
  }

  // Static assets (/assets/*, scripts, styles, PDF worker, icons): cache-first, populate on fetch
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (
            res &&
            res.ok &&
            (url.pathname.startsWith('/assets/') ||
              url.pathname.endsWith('.js') ||
              url.pathname.endsWith('.css') ||
              url.pathname.endsWith('.mjs') ||
              url.pathname.endsWith('.svg') ||
              url.pathname.endsWith('.png') ||
              url.pathname.endsWith('.webmanifest'))
          ) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(async () => {
          const fallback = await caches.match(req, { ignoreSearch: true });
          return fallback || new Response('', { status: 504 });
        })
    })
  );
});
