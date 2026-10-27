/* ============================================================================
   TIMAWA — PWA + push runtime (shared by every page)
   ----------------------------------------------------------------------------
   Drop-in: registers the service worker, adds the "install app" banner, and
   wires the notification card in profile.html (#pwaNotifToggle and friends).

   Public API:
     window.TIMAWA_PWA.enablePush()   -> { ok, reason }
     window.TIMAWA_PWA.disablePush()  -> { ok, reason }
     window.TIMAWA_PWA.pushState()    -> 'unsupported' | 'unconfigured' |
                                        'signed-out' | 'denied' | 'enabled' |
                                        'off'
     window.TIMAWA_PWA.promptInstall()
     window.TIMAWA_PWA.testNotification()
   ========================================================================== */

(function () {
    'use strict';

    const CONFIG = Object.assign({
        vapidPublicKey: '',
        collection: 'pushSubscriptions',
        defaultUrl: 'calendar.html',
        installDismissKey: 'timawa.pwa.installDismissedAt',
        optOutKey: 'timawa.push.optOut'
    }, window.TIMAWA_PUSH || {});

    const SW_URL = 'sw.js';
    const SCOPED = new URL('./', window.location.href).href;

    const IS_STANDALONE = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
    const IS_IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

    let registration = null;
    let installPromptEvent = null;
    let bannerTimer = null;

    /* ------------------------------------------------------------------ */
    /* Small helpers                                                       */
    /* ------------------------------------------------------------------ */

    const state = {
        ready: false,
        registration: null,
        lastError: ''
    };

    function log(...args) {
        // Quiet in production, still visible for debugging.
        if (window.console && console.info) console.info('[TIMAWA PWA]', ...args);
    }

    function warn(...args) {
        if (window.console && console.warn) console.warn('[TIMAWA PWA]', ...args);
    }

    function toast(message, type) {
        if (typeof window.showToast === 'function') {
            try { window.showToast(message, type || 'info'); return; } catch (_) { /* ignore */ }
        }
        log(message);
    }

    function currentUser() {
        try {
            if (typeof auth !== 'undefined' && auth && auth.currentUser) return auth.currentUser;
        } catch (_) { /* auth not on this page yet */ }
        return null;
    }

    function firestoreHandle() {
        try {
            if (typeof db !== 'undefined' && db) return db;
        } catch (_) { /* not ready */ }
        return null;
    }

    function serverTimestamp() {
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore &&
                firebase.firestore.FieldValue) {
                return firebase.firestore.FieldValue.serverTimestamp();
            }
        } catch (_) { /* ignore */ }
        return new Date();
    }

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const raw = atob(base64);
        const out = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
        return out;
    }

    async function sha256Hex(value) {
        if (window.crypto && crypto.subtle && window.TextEncoder) {
            const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
            return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
        }
        // Very old browsers: still deterministic enough for a document id.
        let hash = 0;
        for (let i = 0; i < value.length; i += 1) {
            hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
        }
        return 'h' + Math.abs(hash).toString(16);
    }

    function secureContextOk() {
        return window.isSecureContext === true ||
            location.protocol === 'https:' ||
            ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
    }

    /* ------------------------------------------------------------------ */
    /* Service worker                                                      */
    /* ------------------------------------------------------------------ */

    async function registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            warn('service workers are not supported here');
            return null;
        }
        if (!secureContextOk()) {
            log('service worker needs https (or localhost) — skipped on', location.protocol);
            return null;
        }
        try {
            const reg = await navigator.serviceWorker.register(SW_URL, { scope: './' });
            state.registration = reg;
            registration = reg;
            log('service worker registered', reg.scope);

            reg.addEventListener('updatefound', () => {
                const installing = reg.installing;
                if (!installing) return;
                installing.addEventListener('statechange', () => {
                    if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                        log('new version ready');
                    }
                });
            });

            await navigator.serviceWorker.ready;
            return reg;
        } catch (err) {
            warn('service worker registration failed', err);
            return null;
        }
    }

    function listenForWorkerMessages() {
        if (!('serviceWorker' in navigator)) return;
        navigator.serviceWorker.addEventListener('message', (event) => {
            const data = event.data || {};
            if (data.type === 'PUSH_SUBSCRIPTION_CHANGED') {
                if (data.subscription) {
                    saveSubscription(data.subscription).catch((err) => warn('re-save failed', err));
                }
            }
            if (data.type === 'PUSH_NAVIGATED') {
                log('opened from notification:', data.url);
            }
        });
    }

    /* ------------------------------------------------------------------ */
    /* Subscriptions <-> Firestore                                         */
    /* ------------------------------------------------------------------ */

    function configured() {
        return typeof CONFIG.vapidPublicKey === 'string' && CONFIG.vapidPublicKey.length > 30;
    }

    function pushSupported() {
        return 'serviceWorker' in navigator && 'PushManager' in window &&
            'Notification' in window;
    }

    async function getSubscription() {
        const reg = registration || (navigator.serviceWorker
            ? await navigator.serviceWorker.getRegistration(SCOPED)
            : null);
        if (!reg || !reg.pushManager) return null;
        try {
            return await reg.pushManager.getSubscription();
        } catch (err) {
            warn('getSubscription failed', err);
            return null;
        }
    }

    function subscriptionDocId(endpoint) {
        return sha256Hex(endpoint);
    }

    async function saveSubscription(subscription) {
        const store = firestoreHandle();
        const user = currentUser();
        if (!store || !user) {
            state.lastError = 'no-auth';
            return false;
        }
        if (!subscription || !subscription.endpoint) return false;

        const json = typeof subscription.toJSON === 'function' ? subscription.toJSON() : subscription;
        const keys = json.keys || {};
        const docId = await subscriptionDocId(json.endpoint);

        const payload = {
            uid: user.uid,
            endpoint: json.endpoint,
            keys: { p256dh: keys.p256dh || '', auth: keys.auth || '' },
            ua: navigator.userAgent,
            platform: (navigator.userAgentData && navigator.userAgentData.platform) ||
                navigator.platform || '',
            language: navigator.language || '',
            timezone: (() => {
                try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; }
                catch (_) { return ''; }
            })(),
            enabled: true,
            updatedAt: serverTimestamp()
        };

        try {
            const ref = store.collection(CONFIG.collection).doc(docId);
            const existing = await ref.get();
            if (!existing.exists) payload.createdAt = serverTimestamp();
            await ref.set(payload, { merge: true });
            state.lastError = '';
            log('subscription saved', docId.slice(0, 12));
            return true;
        } catch (err) {
            state.lastError = String(err && err.code || err);
            warn('could not save subscription', err);
            return false;
        }
    }

    async function deleteSubscriptionDoc(subscription) {
        const store = firestoreHandle();
        if (!store || !subscription || !subscription.endpoint) return;
        try {
            const docId = await subscriptionDocId(subscription.endpoint);
            await store.collection(CONFIG.collection).doc(docId).delete();
            log('subscription removed');
        } catch (err) {
            warn('could not delete subscription', err);
        }
    }

    /* ------------------------------------------------------------------ */
    /* Enable / disable                                                    */
    /* ------------------------------------------------------------------ */

    async function enablePush() {
        if (!pushSupported()) {
            return { ok: false, reason: 'unsupported' };
        }
        if (!configured()) {
            toast('Push is not configured on this site yet.', 'warn');
            return { ok: false, reason: 'unconfigured' };
        }
        if (!currentUser()) {
            toast('Sign in first to turn on notifications.', 'warn');
            return { ok: false, reason: 'signed-out' };
        }

        try { localStorage.removeItem(CONFIG.optOutKey); } catch (_) { /* ignore */ }

        // Must be requested straight from the click, before any await.
        let permission = Notification.permission;
        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }
        if (permission !== 'granted') {
            renderNotificationCard();
            toast(permission === 'denied'
                ? 'Notifications are blocked for this site in your browser settings.'
                : 'Notifications were not allowed.', 'warn');
            return { ok: false, reason: permission };
        }

        const reg = registration || await registerServiceWorker();
        if (!reg || !reg.pushManager) {
            renderNotificationCard();
            return { ok: false, reason: 'no-worker' };
        }

        let subscription = await getSubscription();
        try {
            if (!subscription) {
                subscription = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(CONFIG.vapidPublicKey)
                });
            }
        } catch (err) {
            warn('subscribe failed', err);
            renderNotificationCard();
            toast('Could not turn on notifications: ' + (err && err.message || err), 'error');
            return { ok: false, reason: 'subscribe-failed' };
        }

        const saved = await saveSubscription(subscription);
        renderNotificationCard();
        if (!saved) {
            toast('Notifications are on for this device, but could not be saved to your account.', 'warn');
            return { ok: true, reason: 'unsaved' };
        }
        toast('Notifications are on — you will hear about new activities.', 'success');
        return { ok: true };
    }

    async function disablePush() {
        try { localStorage.setItem(CONFIG.optOutKey, '1'); } catch (_) { /* ignore */ }
        const subscription = await getSubscription();
        if (subscription) {
            await deleteSubscriptionDoc(subscription);
            try { await subscription.unsubscribe(); } catch (err) { warn('unsubscribe failed', err); }
        }
        renderNotificationCard();
        toast('Notifications are off for this device.', 'info');
        return { ok: true };
    }

    async function pushState() {
        if (!pushSupported()) return 'unsupported';
        if (!configured()) return 'unconfigured';
        if (!currentUser()) return 'signed-out';
        if (Notification.permission === 'denied') return 'denied';
        if (Notification.permission === 'granted') {
            const sub = await getSubscription();
            return sub ? 'enabled' : 'off';
        }
        return 'off';
    }

    /* Runs on every page load: keeps the stored subscription in sync without
       asking for permission again. */
    async function syncSilently() {
        if (!pushSupported() || !configured() || !currentUser()) return;
        if (Notification.permission !== 'granted') return;
        let optedOut = false;
        try { optedOut = localStorage.getItem(CONFIG.optOutKey) === '1'; } catch (_) { /* ignore */ }
        if (optedOut) return;

        const reg = registration || await registerServiceWorker();
        if (!reg || !reg.pushManager) return;

        let subscription = await getSubscription();
        if (!subscription) {
            try {
                subscription = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(CONFIG.vapidPublicKey)
                });
            } catch (err) {
                warn('silent re-subscribe failed', err);
                return;
            }
        }
        await saveSubscription(subscription);
    }

    /* ------------------------------------------------------------------ */
    /* Notification card (profile.html)                                    */
    /* ------------------------------------------------------------------ */

    async function renderNotificationCard() {
        const button = document.getElementById('pwaNotifToggle');
        if (!button) return;

        const statusEl = document.getElementById('pwaNotifStatus');
        const dot = document.getElementById('pwaNotifDot');
        const hintEl = document.getElementById('pwaNotifHint');
        const labelEl = document.getElementById('pwaNotifLabel');

        const set = (text, hint, tone, action) => {
            if (statusEl) statusEl.textContent = text;
            if (hintEl) hintEl.innerHTML = hint;
            if (labelEl) labelEl.textContent = action.label;
            if (dot) {
                dot.dataset.tone = tone;
            }
            button.disabled = !!action.disabled;
            button.dataset.mode = action.mode || 'toggle';
            const icon = button.querySelector('i');
            if (icon) icon.className = 'fas ' + (action.icon || 'fa-bell');
        };

        const current = await pushState();
        state.pushState = current;

        if (current === 'unsupported') {
            set('Not supported in this browser.',
                '<i class="fas fa-circle-info"></i> On iPhone, install TIMAWA to your home screen first.',
                'off', { label: 'Unavailable', icon: 'fa-ban', disabled: true, mode: 'none' });
            return;
        }
        if (current === 'unconfigured') {
            set('Setup needed.',
                '<i class="fas fa-circle-info"></i> Add your VAPID public key to <b>push-config.js</b> to turn this on.',
                'off', { label: 'Unavailable', icon: 'fa-wrench', disabled: true, mode: 'none' });
            return;
        }
        if (current === 'signed-out') {
            set('Sign in to enable.',
                '<i class="fas fa-circle-info"></i> Notifications follow your account, so sign in first.',
                'off', { label: 'Enable notifications', icon: 'fa-bell', disabled: true, mode: 'none' });
            return;
        }
        if (current === 'denied') {
            set('Blocked by the browser.',
                '<i class="fas fa-circle-info"></i> Open your browser site settings for TIMAWA and allow notifications, then reload.',
                'off', { label: 'Blocked', icon: 'fa-bell-slash', disabled: true, mode: 'none' });
            return;
        }
        if (current === 'enabled') {
            set('On for this device.',
                '<i class="fas fa-circle-check"></i> You will get activity alerts even when TIMAWA is closed.',
                'on', { label: 'Turn off', icon: 'fa-bell-slash', mode: 'off' });
            return;
        }

        set('Off.', IS_IOS && !IS_STANDALONE
            ? '<i class="fas fa-circle-info"></i> On iPhone, add TIMAWA to your home screen, then enable notifications inside the installed app.'
            : '<i class="fas fa-circle-info"></i> Get pinged when the squad adds an activity — no need to keep the site open.',
        'off', { label: 'Enable notifications', icon: 'fa-bell', mode: 'on' });
    }

    function wireNotificationCard() {
        const button = document.getElementById('pwaNotifToggle');
        if (!button) return;

        button.addEventListener('click', async () => {
            if (button.dataset.mode === 'on') {
                button.disabled = true;
                await enablePush();
                button.disabled = false;
                return;
            }
            if (button.dataset.mode === 'off') {
                button.disabled = true;
                await disablePush();
                button.disabled = false;
            }
        });

        renderNotificationCard();
    }

    /* ------------------------------------------------------------------ */
    /* Install banner                                                      */
    /* ------------------------------------------------------------------ */

    function bannerDismissed() {
        let raw = null;
        try { raw = localStorage.getItem(CONFIG.installDismissKey); } catch (_) { /* ignore */ }
        if (!raw) return false;
        const dismissedAt = Number(raw);
        if (!dismissedAt) return false;
        const days = (Date.now() - dismissedAt) / 86400000;
        return days < 30;
    }

    function dismissBanner(node) {
        try { localStorage.setItem(CONFIG.installDismissKey, String(Date.now())); } catch (_) { /* ignore */ }
        if (node && node.parentNode) {
            node.dataset.hidden = 'true';
            setTimeout(() => node.remove(), 260);
        }
    }

    function buildBanner(text, actionLabel, onAction) {
        if (document.getElementById('pwaInstallBanner')) return null;
        const banner = document.createElement('div');
        banner.id = 'pwaInstallBanner';
        banner.className = 'pwa-banner';
        banner.innerHTML = [
            '<div class="pwa-banner__art"><img src="icons/icon-192.png" alt="" width="44" height="44" /></div>',
            '<div class="pwa-banner__copy">',
            '<strong>Install TIMAWA</strong>',
            '<span></span>',
            '</div>',
            '<button type="button" class="pwa-banner__action"></button>',
            '<button type="button" class="pwa-banner__close" aria-label="Dismiss">',
            '<i class="fas fa-xmark"></i>',
            '</button>'
        ].join('');
        banner.querySelector('.pwa-banner__copy span').textContent = text;
        const action = banner.querySelector('.pwa-banner__action');
        action.textContent = actionLabel;
        action.addEventListener('click', onAction);
        banner.querySelector('.pwa-banner__close').addEventListener('click', () => dismissBanner(banner));
        document.body.appendChild(banner);
        requestAnimationFrame(() => { banner.dataset.visible = 'true'; });
        return banner;
    }

    function setupInstallBanner() {
        if (IS_STANDALONE || bannerDismissed()) return;

        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
            installPromptEvent = event;
            if (IS_STANDALONE || bannerDismissed()) return;
            clearTimeout(bannerTimer);
            bannerTimer = setTimeout(() => {
                const banner = buildBanner(
                    'Add it to your home screen — opens full screen, works offline.',
                    'Install',
                    async () => {
                        const evt = installPromptEvent;
                        if (!evt) return;
                        installPromptEvent = null;
                        try { evt.prompt(); await evt.userChoice; } catch (err) { warn('install failed', err); }
                        dismissBanner(banner);
                    }
                );
                if (banner) log('install banner shown');
            }, 4000);
        });

        window.addEventListener('appinstalled', () => {
            installPromptEvent = null;
            const banner = document.getElementById('pwaInstallBanner');
            if (banner) dismissBanner(banner);
        });

        // iOS never fires beforeinstallprompt — show the manual instructions once.
        if (IS_IOS) {
            bannerTimer = setTimeout(() => {
                buildBanner(
                    'Tap Share, then “Add to Home Screen” to install and enable notifications.',
                    'Got it',
                    () => {
                        const banner = document.getElementById('pwaInstallBanner');
                        if (banner) dismissBanner(banner);
                    }
                );
            }, 6000);
        }
    }

    async function promptInstall() {
        if (installPromptEvent) {
            installPromptEvent.prompt();
            try { await installPromptEvent.userChoice; } catch (_) { /* ignore */ }
            installPromptEvent = null;
            return true;
        }
        return false;
    }

    /* The address-bar colour is already owned by theme.js (it tracks the page
       background, including dark mode), so this file deliberately does not
       touch <meta name="theme-color"> — two writers would just fight. */

    /* ------------------------------------------------------------------ */
    /* Debug helper                                                        */
    /* ------------------------------------------------------------------ */

    async function testNotification() {
        const reg = registration || await navigator.serviceWorker.ready;
        if (!reg || !reg.active) return false;
        return new Promise((resolve) => {
            const channel = new MessageChannel();
            const timer = setTimeout(() => resolve(false), 3000);
            channel.port1.onmessage = (event) => {
                clearTimeout(timer);
                if (!event.data || !event.data.ok) warn('test notification failed', event.data);
                resolve(!!(event.data && event.data.ok));
            };
            reg.active.postMessage({
                type: 'TEST_PUSH',
                payload: {
                    title: 'TIMAWA test notification',
                    body: 'If you can see this, push notifications are working on this device.',
                    url: CONFIG.defaultUrl
                }
            }, [channel.port2]);
        });
    }

    /* ------------------------------------------------------------------ */
    /* Boot                                                                */
    /* ------------------------------------------------------------------ */

    async function boot() {
        listenForWorkerMessages();
        setupInstallBanner();

        await registerServiceWorker();
        wireNotificationCard();

        try {
            if (typeof auth !== 'undefined' && auth && auth.onAuthStateChanged) {
                auth.onAuthStateChanged(() => {
                    renderNotificationCard();
                    syncSilently();
                });
            }
        } catch (_) { /* page without auth */ }

        await syncSilently();
        state.ready = true;
    }

    window.TIMAWA_PWA = {
        enablePush,
        disablePush,
        pushState,
        promptInstall,
        testNotification,
        syncSilently,
        refreshNotificationCard: renderNotificationCard,
        get registration() { return registration; }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
