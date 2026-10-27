/* ============================================================================
   TIMAWA service worker
   ----------------------------------------------------------------------------
   • App shell caching so a member can open TIMAWA like a native app, and so a
     dropped connection shows the last page instead of the browser error page.
   • Web Push receiver: renders activity notifications while the site is closed
     and routes a tap to the right page.
   Bump CACHE_VERSION whenever the shell files change.
   ========================================================================== */

const CACHE_VERSION = 'v1.0.0';
const SHELL_CACHE = `timawa-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `timawa-runtime-${CACHE_VERSION}`;
const MAX_RUNTIME_ENTRIES = 60;

/* Small, always-needed files. Pages are cached on first visit instead of being
   precached, so installing the app does not download ~2 MB of HTML. */
const SHELL_ASSETS = [
    './offline.html',
    './pwa.css',
    './pwa.js',
    './push-config.js',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/badge-72.png',
    './icons/apple-touch-icon-180.png',
    './icons/favicon-32.png'
];

/* -------------------------------------------------------------------------- */
/* Install / activate                                                          */
/* -------------------------------------------------------------------------- */

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(SHELL_CACHE);
        // Individual failures must not abort the whole install.
        await Promise.all(SHELL_ASSETS.map(async (url) => {
            try {
                await cache.add(new Request(url, { cache: 'reload' }));
            } catch (err) {
                console.warn('[sw] could not precache', url, err);
            }
        }));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keep = new Set([SHELL_CACHE, RUNTIME_CACHE]);
        const names = await caches.keys();
        await Promise.all(names.map((name) => {
            if (name.startsWith('timawa-') && !keep.has(name)) return caches.delete(name);
            return Promise.resolve();
        }));
        if (self.registration.navigationPreload) {
            // Network-first navigation below, so preload would just double fetch.
            try { await self.registration.navigationPreload.disable(); } catch (_) { /* ignore */ }
        }
        await self.clients.claim();
    })());
});

/* -------------------------------------------------------------------------- */
/* Fetch                                                                       */
/* -------------------------------------------------------------------------- */

function isCacheableAsset(pathname) {
    return /\.(?:css|js|mjs|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf)$/i.test(pathname);
}

async function trimRuntimeCache() {
    const cache = await caches.open(RUNTIME_CACHE);
    const keys = await cache.keys();
    if (keys.length <= MAX_RUNTIME_ENTRIES) return;
    await Promise.all(keys.slice(0, keys.length - MAX_RUNTIME_ENTRIES).map((k) => cache.delete(k)));
}

async function networkFirstPage(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    try {
        const fresh = await fetch(request);
        if (fresh && fresh.ok) {
            cache.put(request, fresh.clone()).then(trimRuntimeCache).catch(() => {});
        }
        return fresh;
    } catch (err) {
        const exact = await caches.match(request, { ignoreSearch: true });
        if (exact) return exact;

        // Same page, different query string (?v=..., deep links).
        const url = new URL(request.url);
        const keys = await cache.keys();
        const samePage = keys.find((k) => new URL(k.url).pathname === url.pathname);
        if (samePage) {
            const hit = await cache.match(samePage);
            if (hit) return hit;
        }

        const shell = await caches.match('./offline.html');
        if (shell) return shell;

        return new Response('You are offline and this page has not been saved yet.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    const network = fetch(request).then((response) => {
        if (response && response.ok) {
            cache.put(request, response.clone()).then(trimRuntimeCache).catch(() => {});
        }
        return response;
    }).catch(() => null);

    if (cached) return cached;
    const fresh = await network;
    if (fresh) return fresh;

    return new Response('', { status: 504, statusText: 'Offline' });
}

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;         // Firebase, CDNs, fonts
    if (url.pathname.endsWith('/sw.js')) return;             // never cache the worker
    if (request.headers.has('range')) return;                // media / partial content
    if (url.pathname.endsWith('/manifest.json')) return;      // keep install metadata fresh

    if (request.mode === 'navigate') {
        event.respondWith(networkFirstPage(request));
        return;
    }

    if (isCacheableAsset(url.pathname)) {
        event.respondWith(staleWhileRevalidate(request));
    }
});

/* -------------------------------------------------------------------------- */
/* Web Push                                                                    */
/* -------------------------------------------------------------------------- */

function normalizeTarget(raw) {
    const fallback = './dashboard.html';
    if (!raw) return fallback;
    try {
        const url = new URL(raw, self.location.origin);
        if (url.origin !== self.location.origin) return fallback;
        return url.href;
    } catch (_) {
        return fallback;
    }
}

async function renderNotification(payload) {
    const data = payload && typeof payload === 'object' ? payload : {};
    const title = data.title || 'TIMAWA';
    const options = {
        body: data.body || 'New activity from the squad.',
        icon: data.icon || './icons/icon-192.png',
        badge: data.badge || './icons/badge-72.png',
        tag: data.tag || `timawa-${Date.now()}`,
        data: Object.assign({ url: normalizeTarget(data.url) }, data.meta || {}),
        timestamp: data.timestamp ? (Date.parse(data.timestamp) || Date.now()) : Date.now(),
        vibrate: [90, 50, 90],
        actions: [
            { action: 'open', title: 'View' },
            { action: 'close', title: 'Dismiss' }
        ]
    };
    if (data.image) options.image = data.image;
    return self.registration.showNotification(title, options);
}

self.addEventListener('push', (event) => {
    event.waitUntil((async () => {
        let payload = {};
        if (event.data) {
            try {
                payload = event.data.json();
            } catch (_) {
                try { payload = { body: event.data.text() }; } catch (__) { payload = {}; }
            }
        }
        try {
            await renderNotification(payload);
        } catch (err) {
            // Permission can be revoked between subscription and delivery.
            console.warn('[sw] push could not be displayed', err);
        }
    })());
});

self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    const action = event.action;
    notification.close();
    if (action === 'close') return;

    const target = normalizeTarget(notification.data && notification.data.url);

    event.waitUntil((async () => {
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of windows) {
            if (new URL(client.url).origin !== self.location.origin) continue;
            try {
                if ('navigate' in client) await client.navigate(target);
                await client.focus();
                client.postMessage({ type: 'PUSH_NAVIGATED', url: target });
                return;
            } catch (_) { /* fall through to opening a new window */ }
        }
        await self.clients.openWindow(target);
    })());
});

/* A browser may rotate or drop a subscription (app updated, keys rotated). */
self.addEventListener('pushsubscriptionchange', (event) => {
    event.waitUntil((async () => {
        let subscription = event.newSubscription || null;
        if (!subscription && event.oldSubscription) {
            try {
                subscription = await self.registration.pushManager.subscribe(event.oldSubscription.options);
            } catch (_) { subscription = null; }
        }
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        windows.forEach((client) => {
            client.postMessage({
                type: 'PUSH_SUBSCRIPTION_CHANGED',
                subscription: subscription ? subscription.toJSON() : null
            });
        });
    })());
});

/* -------------------------------------------------------------------------- */
/* Messages from the page (debugging + update handshake)                       */
/* -------------------------------------------------------------------------- */

async function reply(port, message) {
    if (port) port.postMessage(message);
}

self.addEventListener('message', (event) => {
    const data = event.data || {};
    const port = event.ports && event.ports[0];

    if (data.type === 'SKIP_WAITING') {
        self.skipWaiting();
        return;
    }

    if (data.type === 'TEST_PUSH') {
        event.waitUntil((async () => {
            try {
                await renderNotification(data.payload || {});
                await reply(port, { ok: true });
            } catch (err) {
                await reply(port, { ok: false, error: String(err && err.message || err) });
            }
        })());
        return;
    }

    if (data.type === 'CACHE_STATUS') {
        event.waitUntil((async () => {
            const shell = await caches.open(SHELL_CACHE);
            const runtime = await caches.open(RUNTIME_CACHE);
            await reply(port, {
                version: CACHE_VERSION,
                shell: (await shell.keys()).length,
                runtime: (await runtime.keys()).length
            });
        })());
    }
});
