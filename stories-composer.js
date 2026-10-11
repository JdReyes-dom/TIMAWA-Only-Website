/* ================================================================
   stories-composer.js · TIMAWA / Barkada Stories  (lazy-loaded, v1.2)
   Editor: media -> text overlays -> music -> preview -> publish.

   Media rules
     - Photos: up to 6 per story, arranged with collage layout presets,
       story duration 15 s - 60 s (you choose).
     - Video:  ONE video per story, max 60 s, duration is automatic.
     - Music:  search songs in the site (30 s previews), pick which part
       plays. Music added to a video mutes the video's own sound.

   Text is stored as STRUCTURED data (never baked into pixels):
     { id, text, x, y, size, rot, font, color, bg, bgColor, align, bold, italic }
   x / y are the element CENTRE as fractions (0-1) of the story canvas and
   size is a fraction of canvas width, so every device renders identically.
   Photos / videos are uploaded untouched (no re-encoding); overlays and
   collage layouts are rendered live by StoriesShared.
   ================================================================ */
(function () {
    'use strict';
    if (window.StoriesComposer) return;
    const S = window.StoriesShared;
    const MAX_TEXTS = 8, MAX_TEXT_LEN = 120, MAX_CAPTION = 200, MAX_IMG = 15 * 1024 * 1024, MAX_VID = 50 * 1024 * 1024, MAX_VID_S = 60;
    const MAX_PHOTOS = S.MAX_PHOTOS, MIN_DUR = S.MIN_SHOW_MS / 1000, MAX_DUR = S.MAX_SHOW_MS / 1000;
    const rid = () => Math.random().toString(36).slice(2, 8);

    let C = null, root = null, q = {}, stopObs = null;
    const M = {
        tab: 'media', items: [], video: null, layout: '', fit: 'fill', dur: MIN_DUR,
        texts: [], sel: null, caption: '', track: null, spotify: null, query: '', spq: '',
        hist: [], preview: false, xhr: null, busy: false, results: [], msg: '', searching: false, playing: '', drag: null, lastTap: null
    };
    let PALETTE = ['#ffffff', '#111111', '#ffd23f', '#ff5a6e', '#4ade80', '#38bdf8', '#c084fc'];

    const $ = (s, r) => (r || root).querySelector(s);
    const find = id => M.texts.find(t => t.id === id);
    const selT = () => find(M.sel);
    const hex = v => { v = (v || '').trim(); return /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : null; };
    const hasMedia = () => M.items.length > 0 || !!M.video;
    const durSec = () => M.video ? Math.min(MAX_DUR, Math.round(M.video.dur || 0)) : M.dur;

    // ------------------------------------------------------------ preview audio (composer only)
    let aud = null, audStop = null;
    function stopAudio() {
        if (audStop) { audStop(); audStop = null; }
        if (aud) { try { aud.pause(); aud.removeAttribute('src'); aud.load(); } catch (e) { /* ignore */ } aud = null; }
        M.playing = '';
    }
    function playAudio(url, key, start, end, loop) {
        stopAudio();
        const a = new Audio(); aud = a; a.preload = 'auto'; a.src = url;
        a.addEventListener('loadedmetadata', () => { try { a.currentTime = start || 0; } catch (e) { /* ignore */ } });
        if (loop) audStop = S.attachClipLoop(a, start || 0, end);
        else a.addEventListener('ended', () => { if (aud === a) { M.playing = ''; if (M.tab === 'music') renderPanel(); } });
        M.playing = key;
        a.play().catch(() => { if (aud === a) { M.playing = ''; C.toast('Your browser blocked the audio. Tap play again.', 'info'); if (M.tab === 'music') renderPanel(); } });
    }
    const clipEnd = t => Math.min(t.startSec + t.clipSec, t.previewSec || 30);
    function toggleClip() {
        if (M.playing === 'clip') { stopAudio(); renderPanel(); return; }
        if (!M.track) return;
        playAudio(M.track.previewUrl, 'clip', M.track.startSec, clipEnd(M.track), true); renderPanel();
    }

    // ------------------------------------------------------------ DOM
    function build() {
        if (root) return;
        S.loadFonts();
        root = document.createElement('div');
        root.className = 'st-comp'; root.hidden = true;
        root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Create story');
        root.innerHTML = `
          <div class="st-ch">
            <button class="st-ib" style="background:var(--theme-primary-soft,#e0f2fe);color:var(--theme-primary,#1089d3)" type="button" data-k="close" aria-label="Close editor"><i class="fas fa-xmark"></i></button>
            <h3>New story</h3>
            <button class="st-btn ghost sm" type="button" data-k="preview"><i class="fas fa-eye"></i> Preview</button>
            <button class="st-btn" type="button" data-k="publish"><i class="fas fa-paper-plane"></i> Share</button>
          </div>
          <div class="st-cbody">
            <div class="st-stagewrap"><div class="st-cstage">
              <div class="st-bgblur"></div><div class="st-media-wrap"></div><div class="st-texts"></div>
              <div class="st-safe" style="top:14%"></div><div class="st-safe" style="top:80%"></div>
              <div class="st-scrim-t" hidden></div><div class="st-scrim-b" hidden></div>
              <div class="st-pv" hidden style="position:absolute;left:12px;right:12px;bottom:12px;z-index:4;color:#fff;display:flex;flex-direction:column;gap:8px;pointer-events:none"></div>
              <div class="st-empty"><div><i class="fas fa-photo-film"></i><b>Add photos or a video</b><p style="margin:6px 0 12px;font-size:13px;opacity:.85">Stories disappear after 24 hours</p>
                <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
                  <button class="st-btn" type="button" data-k="pickImg"><i class="fas fa-images"></i> Photos</button>
                  <button class="st-btn ghost" type="button" data-k="pickVid"><i class="fas fa-video"></i> Video</button></div></div></div>
            </div></div>
            <div class="st-panel"><div class="st-tabs" role="tablist">
                <button type="button" role="tab" data-tab="media">Media</button><button type="button" role="tab" data-tab="text">Text</button><button type="button" role="tab" data-tab="music">Music</button></div>
              <div class="st-tabbody"></div><div class="st-bar" hidden><i></i></div></div>
          </div>
          <input type="file" hidden>`;
        document.body.appendChild(root);
        q = { stage: $('.st-cstage'), mw: $('.st-media-wrap'), bg: $('.st-bgblur'), tx: $('.st-texts'), empty: $('.st-empty'), panel: $('.st-tabbody'), file: $('input[type=file]'),
              bar: $('.st-bar'), barI: $('.st-bar i'), pub: $('[data-k=publish]'), pv: $('.st-pv'), sT: $('.st-scrim-t'), sB: $('.st-scrim-b'), prevB: $('[data-k=preview]') };
        stopObs = S.observeStage(q.stage);

        root.addEventListener('click', onClick);
        q.file.addEventListener('change', e => { const fl = [...e.target.files]; e.target.value = ''; if (fl.length) addFiles(fl); });
        q.panel.addEventListener('input', onInput);
        q.panel.addEventListener('change', e => {
            if (e.target.type !== 'range') return;
            const k = e.target.dataset.in;
            if ((k === 'cstart' || k === 'cclip') && M.playing === 'clip' && M.track) playAudio(M.track.previewUrl, 'clip', M.track.startSec, clipEnd(M.track), true);
            else if (!k || k === 'size' || k === 'rot') pushHist();
        });
        q.panel.addEventListener('keydown', e => {
            if (e.key !== 'Enter') return;
            if (e.target.dataset.in === 'music') { e.preventDefault(); musicSearch(); }
            else if (e.target.dataset.in === 'spotify') { e.preventDefault(); spotifyGo(); }
        });
        wireStage();
        document.addEventListener('keydown', e => { if (root && !root.hidden && e.key === 'Escape' && !e.target.isContentEditable) tryClose(); });
    }

    function open(ctx) {
        C = ctx; C.cfg = Object.assign({ cloudName: 'ooq99nlw', uploadPreset: 't-imawa' }, C.cfg);
        build();
        const cs = getComputedStyle(document.documentElement);
        PALETTE = ['#ffffff', '#111111', hex(cs.getPropertyValue('--theme-primary')), hex(cs.getPropertyValue('--theme-accent')), '#ffd23f', '#ff5a6e', '#4ade80', '#38bdf8', '#c084fc'].filter(Boolean);
        reset();
        root.hidden = false; document.documentElement.classList.add('st-lock');
        renderAll();
        root.querySelector('[data-k=close]').focus({ preventScroll: true });
    }
    function revokeAll() {
        M.items.forEach(i => { try { URL.revokeObjectURL(i.url); } catch (e) { /* ignore */ } });
        if (M.video) { try { URL.revokeObjectURL(M.video.url); } catch (e) { /* ignore */ } }
    }
    function reset() {
        stopAudio(); revokeAll();
        Object.assign(M, { tab: 'media', items: [], video: null, layout: '', fit: 'fill', dur: MIN_DUR, texts: [], sel: null, caption: '', track: null, spotify: null, query: '', spq: '',
            hist: [], preview: false, busy: false, results: [], msg: '', searching: false, playing: '' });
    }
    function dirty() { return !!(hasMedia() || M.texts.length || M.track || M.spotify); }
    function tryClose() {
        if (M.busy) { if (!confirm('Cancel the upload?')) return; if (M.xhr) M.xhr.abort(); }
        else if (dirty() && !confirm('Discard this story?')) return;
        closeNow();
    }
    function closeNow() {
        reset(); root.hidden = true; document.documentElement.classList.remove('st-lock');
        q.mw.innerHTML = ''; q.bg.innerHTML = ''; q.tx.innerHTML = '';
    }

    // ------------------------------------------------------------ media
    function readImage(f) {
        return new Promise((res, rej) => {
            const url = URL.createObjectURL(f), im = new Image();
            im.onload = () => res({ id: rid(), file: f, url, w: im.naturalWidth, h: im.naturalHeight });
            im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('read')); };
            im.src = url;
        });
    }
    function readVideo(f) {
        return new Promise((res, rej) => {
            const url = URL.createObjectURL(f), v = document.createElement('video'); v.preload = 'metadata';
            v.onloadedmetadata = () => {
                if (v.duration > MAX_VID_S + 0.5) { URL.revokeObjectURL(url); return rej(new Error('long')); }
                res({ file: f, url, w: v.videoWidth, h: v.videoHeight, dur: v.duration || 0 });
            };
            v.onerror = () => { URL.revokeObjectURL(url); rej(new Error('format')); };
            v.src = url;
        });
    }
    function fixLayout() { M.layout = M.items.length >= 2 ? S.getLayout(M.layout, M.items.length).id : ''; }

    async function addFiles(files) {
        const vids = files.filter(f => f.type.startsWith('video/')), imgs = files.filter(f => f.type.startsWith('image/'));
        if (!vids.length && !imgs.length) return C.toast('Please choose photos or a video.', 'warn');
        if (vids.length) {
            if (files.length > 1) return C.toast('A video story can only have one video, and photos can’t be mixed with it.', 'warn');
            if (M.items.length && !confirm('A video story can only contain one video. Replace your photos with this video?')) return;
            return setVideo(vids[0]);
        }
        if (M.video && !confirm('Photo stories can’t include a video. Replace your video with these photos?')) return;
        return addImages(imgs);
    }
    async function setVideo(f) {
        if (f.size > MAX_VID) return C.toast('Videos can be up to 50 MB.', 'warn');
        try {
            const v = await readVideo(f);
            revokeAll(); M.items = []; M.layout = '';
            M.video = v; M.preview = false; stopAudio();
            renderStage(); renderPanel();
        } catch (e) {
            C.toast(e.message === 'long' ? 'Videos can be up to 1 minute.' : 'That video format is not supported by your browser.', e.message === 'long' ? 'warn' : 'error');
        }
    }
    async function addImages(imgs) {
        if (M.video) { revokeAll(); M.video = null; }
        const room = MAX_PHOTOS - M.items.length;
        if (room <= 0) return C.toast('You can add up to ' + MAX_PHOTOS + ' photos.', 'warn');
        if (imgs.length > room) C.toast('Only ' + room + ' more photo' + (room === 1 ? '' : 's') + ' fit in this story (max ' + MAX_PHOTOS + ').', 'warn');
        for (const f of imgs.slice(0, room)) {
            if (f.size > MAX_IMG) { C.toast('“' + f.name + '” is over 15 MB, skipped.', 'warn'); continue; }
            try { M.items.push(await readImage(f)); } catch (e) { C.toast('Could not read “' + f.name + '”.', 'error'); }
        }
        fixLayout(); renderStage(); renderPanel();
    }
    function removeItem(i) {
        const it = M.items[i]; if (!it) return;
        try { URL.revokeObjectURL(it.url); } catch (e) { /* ignore */ }
        M.items.splice(i, 1); fixLayout(); renderStage(); renderPanel();
    }
    function moveItem(i, d) {
        const j = i + d; if (j < 0 || j >= M.items.length) return;
        [M.items[i], M.items[j]] = [M.items[j], M.items[i]]; renderStage(); renderPanel();
    }
    function removeVideo() { if (!M.video) return; revokeAll(); M.video = null; renderStage(); renderPanel(); }

    function renderStage() {
        q.empty.hidden = hasMedia();
        q.mw.innerHTML = ''; q.bg.innerHTML = '';
        const n = M.items.length;
        q.mw.className = 'st-media-wrap' + (n > 1 ? ' collage' : (M.fit === 'fit' ? ' fit' : ''));
        if (M.video) {
            const v = document.createElement('video'); v.src = M.video.url; v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.setAttribute('playsinline', '');
            q.mw.appendChild(v); v.play().catch(() => {});
        } else if (n > 1) {
            q.mw.innerHTML = S.collageHtml(M.items, M.layout, true);
        } else if (n === 1) {
            const i = new Image(); i.src = M.items[0].url; i.alt = ''; q.mw.appendChild(i);
            if (M.fit === 'fit') { const b = new Image(); b.src = M.items[0].url; b.alt = ''; q.bg.appendChild(b); }
        }
        renderTexts(); renderPv();
    }
    function renderTexts() {
        q.tx.innerHTML = M.texts.map(t => S.textHtml(t, t.id === M.sel && !M.preview ? 'sel' : '', `data-id="${t.id}"`)).join('');
    }
    function refreshEl(t) {
        const el = q.tx.querySelector(`[data-id="${t.id}"]`); if (!el) return;
        const keep = el.getAttribute('contenteditable');
        el.style.cssText = S.textStyle(t);
        el.className = 'st-t st-t-' + (t.bg || 'none') + (t.id === M.sel && !M.preview ? ' sel' : '');
        if (keep) el.setAttribute('contenteditable', keep);
    }
    function musicCard(tr, spotify) {
        const art = S.safeImgUrl(tr.thumbnail);
        return `<div class="st-music-card playing">${art ? `<img src="${S.esc(art)}" alt="">` : '<span class="ph">🎵</span>'}<div class="st-mt"><b>${S.esc(tr.title)}</b><small>${S.esc(tr.artist || (spotify ? 'Spotify' : 'Music'))}</small></div>${spotify ? '<span class="st-mbtn">▶ Play</span>' : '<span class="st-eq" aria-hidden="true"><i></i><i></i><i></i></span>'}</div>`;
    }
    function renderPv() {
        q.stage.classList.toggle('pv', M.preview);
        q.sT.hidden = q.sB.hidden = q.pv.hidden = !M.preview;
        q.tx.style.pointerEvents = M.preview ? 'none' : '';
        if (!M.preview) { q.pv.innerHTML = ''; return; }
        q.pv.innerHTML = (M.caption ? `<div style="text-align:center;font-size:14px;text-shadow:0 1px 6px #000">${S.esc(M.caption)}</div>` : '') +
            (M.track ? musicCard(M.track, false) : M.spotify ? musicCard(M.spotify, true) : '');
    }

    // ------------------------------------------------------------ text elements
    const snap = () => JSON.stringify(M.texts);
    function pushHist() { const s = snap(); if (M.hist[M.hist.length - 1] !== s) { M.hist.push(s); if (M.hist.length > 40) M.hist.shift(); } }
    function undo() {
        if (M.hist.length < 2) { if (M.hist.length === 1 && M.texts.length) { M.texts = JSON.parse(M.hist[0]); } else return; }
        else { M.hist.pop(); M.texts = JSON.parse(M.hist[M.hist.length - 1]); }
        if (!find(M.sel)) M.sel = null;
        renderTexts(); renderPanel();
    }
    function addText() {
        if (!hasMedia()) return C.toast('Add photos or a video first.', 'warn');
        if (M.texts.length >= MAX_TEXTS) return C.toast('You can add up to ' + MAX_TEXTS + ' text elements.', 'warn');
        if (!M.hist.length) M.hist.push('[]');
        const t = { id: rid(), text: 'Your text', x: 0.5, y: 0.5, size: 0.075, rot: 0, font: 'modern', color: '#ffffff', bg: 'none', bgColor: '#000000', align: 'center', bold: true, italic: false };
        M.texts.push(t); M.sel = t.id; M.tab = 'text';
        renderTexts(); renderPanel(); pushHist(); edit(t.id, true);
    }
    function dup() {
        const t = selT(); if (!t) return;
        if (M.texts.length >= MAX_TEXTS) return C.toast('Text limit reached.', 'warn');
        const n = Object.assign({}, t, { id: rid(), x: S.clamp(t.x + 0.05, S.SAFE.xMin, S.SAFE.xMax), y: S.clamp(t.y + 0.06, S.SAFE.yMin, S.SAFE.yMax) });
        M.texts.push(n); M.sel = n.id; renderTexts(); renderPanel(); pushHist();
    }
    function del() {
        if (!M.sel) return;
        M.texts = M.texts.filter(t => t.id !== M.sel); M.sel = null; renderTexts(); renderPanel(); pushHist();
    }
    function select(id) {
        if (M.sel === id) return;
        M.sel = id;
        q.tx.querySelectorAll('.st-t').forEach(el => el.classList.toggle('sel', el.dataset.id === id));
        if (id && M.tab !== 'text') M.tab = 'text';
        renderPanel();
    }
    function edit(id, selectAll) {
        const el = q.tx.querySelector(`[data-id="${id}"]`); if (!el) return;
        el.setAttribute('contenteditable', 'true'); el.setAttribute('role', 'textbox'); el.setAttribute('aria-label', 'Story text'); el.focus();
        if (selectAll) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
        else { const r = document.createRange(); r.selectNodeContents(el); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
        const t = find(id);
        const onIn = () => { if (el.innerText.length > MAX_TEXT_LEN) { el.innerText = el.innerText.slice(0, MAX_TEXT_LEN); } };
        const onPaste = e => { e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData.getData('text/plain') || '').slice(0, MAX_TEXT_LEN)); };
        const onBlur = () => {
            el.removeEventListener('input', onIn); el.removeEventListener('paste', onPaste); el.removeEventListener('blur', onBlur);
            el.removeAttribute('contenteditable'); el.removeAttribute('role');
            const v = el.innerText.replace(/\u00a0/g, ' ').trim().slice(0, MAX_TEXT_LEN);
            if (!find(id)) return;
            if (!v) { M.texts = M.texts.filter(x => x.id !== id); if (M.sel === id) M.sel = null; renderTexts(); renderPanel(); pushHist(); return; }
            if (v !== t.text) { t.text = v; pushHist(); }
            el.textContent = t.text;
        };
        el.addEventListener('input', onIn); el.addEventListener('paste', onPaste); el.addEventListener('blur', onBlur);
    }
    function wireStage() {
        const st = q.stage;
        st.addEventListener('pointerdown', e => {
            if (M.preview) return;
            const el = e.target.closest('.st-t');
            if (!el) { if (!e.target.closest('button')) { if (document.activeElement && document.activeElement.isContentEditable) document.activeElement.blur(); select(null); } return; }
            if (el.isContentEditable) return;
            const t = find(el.dataset.id); if (!t) return;
            select(t.id);
            const nowT = Date.now();
            if (M.lastTap && M.lastTap.id === t.id && nowT - M.lastTap.t < 320) { M.lastTap = null; edit(t.id); return; }
            M.lastTap = { id: t.id, t: nowT };
            const r = st.getBoundingClientRect();
            M.drag = { id: t.id, sx: e.clientX, sy: e.clientY, ox: t.x, oy: t.y, w: r.width, h: r.height, moved: false };
            try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
            e.preventDefault();
        });
        st.addEventListener('pointermove', e => {
            const d = M.drag; if (!d) return;
            const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
            if (!d.moved && Math.hypot(dx, dy) < 4) return;
            d.moved = true; st.classList.add('drag');
            const t = find(d.id); if (!t) return;
            t.x = S.clamp(d.ox + dx / d.w, S.SAFE.xMin, S.SAFE.xMax);
            t.y = S.clamp(d.oy + dy / d.h, S.SAFE.yMin, S.SAFE.yMax);
            refreshEl(t);
        });
        const end = () => { const d = M.drag; M.drag = null; st.classList.remove('drag'); if (d && d.moved) { pushHist(); renderPanel(); } };
        st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
    }

    // ------------------------------------------------------------ panel
    function renderAll() { renderStage(); renderPanel(); }
    function sw(list, cur, k) { return list.map(c => `<button type="button" class="st-sw ${c === cur ? 'on' : ''}" data-k="${k}" data-v="${c}" style="background:${c}" aria-label="Colour ${c}"></button>`).join(''); }
    function chips(list, cur, k) { return list.map(([v, l]) => `<button type="button" class="st-chip ${v === cur ? 'on' : ''}" data-k="${k}" data-v="${v}">${l}</button>`).join(''); }

    function mediaPanel() {
        const n = M.items.length;
        let h = `<div class="st-row2">
            <button class="st-btn sm" type="button" data-k="pickImg" ${n >= MAX_PHOTOS ? 'disabled' : ''}><i class="fas fa-images"></i> ${n ? 'Add photos' : 'Choose photos'}${n ? ` (${n}/${MAX_PHOTOS})` : ''}</button>
            <button class="st-btn ghost sm" type="button" data-k="pickVid"><i class="fas fa-video"></i> ${M.video ? 'Replace video' : 'Choose video'}</button></div>`;
        if (hasMedia()) {
            h += `<div class="st-strip" aria-label="Story media">` +
                (M.video ? `<div class="st-thumb"><video src="${M.video.url}#t=0.1" muted playsinline preload="metadata"></video><button type="button" class="x" data-k="rmVideo" aria-label="Remove video"><i class="fas fa-xmark"></i></button></div>`
                    : M.items.map((it, i) => `<div class="st-thumb"><img src="${it.url}" alt="Photo ${i + 1}">
                        <button type="button" class="x" data-k="rmItem" data-v="${i}" aria-label="Remove photo ${i + 1}"><i class="fas fa-xmark"></i></button>
                        ${i > 0 ? `<button type="button" class="l" data-k="mvL" data-v="${i}" aria-label="Move earlier"><i class="fas fa-chevron-left"></i></button>` : ''}
                        ${i < n - 1 ? `<button type="button" class="r" data-k="mvR" data-v="${i}" aria-label="Move later"><i class="fas fa-chevron-right"></i></button>` : ''}</div>`).join('')) +
                `</div>`;
        }
        if (n >= 2) {
            h += `<div class="st-lab">Layout</div><div class="st-row2">${S.layoutsFor(n).map(L => `<button type="button" class="st-lay ${L.id === M.layout ? 'on' : ''}" data-k="layout" data-v="${L.id}" title="${S.esc(L.label)}" aria-label="Layout: ${S.esc(L.label)}">${S.miniLayoutHtml(L)}</button>`).join('')}</div>`;
        } else if (hasMedia()) {
            h += `<div class="st-lab">Framing</div><div class="st-row2">${chips([['fill', 'Fill screen'], ['fit', 'Fit whole']], M.fit, 'fit')}</div>`;
        }
        if (M.video) {
            h += `<div class="st-lab">Duration</div><p class="st-hint" style="margin:0 0 10px">Automatic · ${S.fmtSec(durSec())} (videos can be up to 1 minute)</p>`;
        } else if (n) {
            h += `<div class="st-lab">Duration</div><div class="st-row2" style="margin-bottom:4px">${[15, 30, 45, 60].map(v => `<button type="button" class="st-chip ${M.dur === v ? 'on' : ''}" data-k="dur" data-v="${v}">${v}s</button>`).join('')}</div>
                <div class="st-row2"><label class="st-range">Custom <input type="range" min="${MIN_DUR}" max="${MAX_DUR}" step="1" value="${M.dur}" data-in="dur" aria-label="Story duration in seconds"><b class="st-durv" style="min-width:34px">${M.dur}s</b></label></div>`;
        }
        h += `<div class="st-lab">Caption (optional)</div><input class="st-input" data-in="caption" maxlength="${MAX_CAPTION}" placeholder="Say something about this moment…" value="${S.esc(M.caption)}">
              <p class="st-hint">Up to ${MAX_PHOTOS} photos (15 MB each) with layout presets, or one video (50 MB / 60 s). Duration for photos is 15 s – 1 min. Your originals are uploaded untouched.</p>`;
        return h;
    }
    function musicPanel() {
        const tr = M.track, sp = M.spotify;
        let h = `<div class="st-lab">Search a song</div>
            <div class="st-row2" style="flex-wrap:nowrap"><input class="st-input" data-in="music" placeholder="Song or artist…" aria-label="Search songs" value="${S.esc(M.query)}"><button class="st-btn sm" type="button" data-k="musicGo" ${M.searching ? 'disabled' : ''}><i class="fas fa-magnifying-glass"></i></button></div>
            ${M.searching ? '<p class="st-hint">Searching…</p>' : M.msg ? `<p class="st-hint">${S.esc(M.msg)}</p>` : '<p class="st-hint">Plays automatically for viewers. Pick which part of the song goes with your story.</p>'}
            ${M.results.map((r, i) => `<div class="st-track">${r.thumbnail ? `<img src="${S.esc(r.thumbnail)}" alt="">` : ''}<div class="st-mt"><b>${S.esc(r.title)}</b><small>${S.esc(r.artist || '')}</small></div>
                <button class="st-btn ghost sm" type="button" data-k="playRes" data-v="${i}" aria-label="Preview">${M.playing === 'r' + i ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>'}</button>
                <button class="st-btn sm" type="button" data-k="pickTrack" data-v="${i}">Select</button></div>`).join('')}`;
        if (tr) {
            const P = tr.previewSec || 30;
            h += `<div class="st-lab" style="margin-top:12px">Attached song</div>
                <div class="st-track">${S.safeImgUrl(tr.thumbnail) ? `<img src="${S.esc(S.safeImgUrl(tr.thumbnail))}" alt="">` : '<span class="ph" style="width:44px;height:44px;border-radius:8px;background:#1db954;display:grid;place-items:center">🎵</span>'}
                  <div class="st-mt"><b>${S.esc(tr.title)}</b><small>${S.esc(tr.artist || 'Music')}</small></div>
                  <button class="st-btn ghost sm" type="button" data-k="playClip">${M.playing === 'clip' ? '<i class="fas fa-pause"></i> Pause' : '<i class="fas fa-play"></i> Play clip'}</button>
                  <button class="st-btn danger sm" type="button" data-k="rmTrack" aria-label="Remove song"><i class="fas fa-xmark"></i></button></div>
                <div class="st-lab" style="margin-top:10px">Part of the song</div>
                <div class="st-clip" aria-hidden="true"><i style="left:${(tr.startSec / P * 100).toFixed(2)}%;width:${(tr.clipSec / P * 100).toFixed(2)}%"></i></div>
                <div class="st-hint st-cliplabel" style="margin:0 0 6px">${S.fmtSec(tr.startSec)} – ${S.fmtSec(tr.startSec + tr.clipSec)} (${tr.clipSec}s of a ${P}s preview)</div>
                <div class="st-row2"><label class="st-range">Start <input type="range" min="0" max="${P - 5}" step="1" value="${tr.startSec}" data-in="cstart" aria-label="Clip start"></label>
                  <label class="st-range">Length <input type="range" min="5" max="${P - tr.startSec}" step="1" value="${tr.clipSec}" data-in="cclip" aria-label="Clip length"></label></div>
                <p class="st-hint">${M.video ? '🔇 The video’s own sound is muted while a song is attached. ' : ''}Songs are 30-second previews; the clip loops if your story is longer.</p>`;
        }
        if (sp) {
            h += `<div class="st-lab" style="margin-top:12px">Attached Spotify link</div>
                <div class="st-track">${S.safeImgUrl(sp.thumbnail) ? `<img src="${S.esc(S.safeImgUrl(sp.thumbnail))}" alt="">` : '<span class="ph" style="width:44px;height:44px;border-radius:8px;background:#1db954;display:grid;place-items:center">🎵</span>'}
                  <div class="st-mt"><b>${S.esc(sp.title)}</b><small>${S.esc(sp.artist || 'Spotify')}</small></div>
                  <a class="st-btn ghost sm" href="${S.esc(sp.url)}" target="_blank" rel="noopener noreferrer">Open</a>
                  <button class="st-btn danger sm" type="button" data-k="rmSpotify" aria-label="Remove link"><i class="fas fa-xmark"></i></button></div>
                <p class="st-hint">Spotify links show a Play button for viewers. They can’t auto-play or be clipped; search above for that.</p>`;
        }
        h += `<details class="st-det"${sp && !tr ? ' open' : ''}><summary>Use a Spotify link instead</summary>
            <div class="st-row2" style="flex-wrap:nowrap;margin-top:8px"><input class="st-input" data-in="spotify" placeholder="Paste a Spotify track link" aria-label="Spotify link" value="${S.esc(M.spq)}"><button class="st-btn sm" type="button" data-k="spotifyGo">Add</button></div></details>`;
        return h;
    }
    function renderPanel() {
        root.querySelectorAll('.st-tabs button').forEach(b => { const on = b.dataset.tab === M.tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
        q.prevB.innerHTML = M.preview ? '<i class="fas fa-pen"></i> Edit' : '<i class="fas fa-eye"></i> Preview';
        q.pub.disabled = M.busy || !hasMedia();
        let h = '';
        if (M.tab === 'media') h = mediaPanel();
        else if (M.tab === 'text') {
            const t = selT();
            h = `<div class="st-row2"><button class="st-btn sm" type="button" data-k="addText"><i class="fas fa-plus"></i> Add text</button>
                <button class="st-btn ghost sm" type="button" data-k="editText" ${t ? '' : 'disabled'}><i class="fas fa-pen"></i> Edit</button>
                <button class="st-btn ghost sm" type="button" data-k="dup" ${t ? '' : 'disabled'}><i class="far fa-clone"></i> Duplicate</button>
                <button class="st-btn danger sm" type="button" data-k="del" ${t ? '' : 'disabled'}><i class="fas fa-trash"></i></button>
                <button class="st-btn ghost sm" type="button" data-k="undo" ${M.hist.length > 1 ? '' : 'disabled'}><i class="fas fa-rotate-left"></i> Undo</button>
                <button class="st-btn ghost sm" type="button" data-k="resetText" ${M.texts.length ? '' : 'disabled'}>Reset</button></div>`;
            if (!t) h += `<p class="st-hint">${M.texts.length ? 'Tap a text on the story to style it. Double-tap to edit.' : 'Add text, then drag it anywhere on the story.'}</p>`;
            else h += `<div class="st-lab">Font</div><div class="st-row2">${Object.entries(S.FONTS).map(([k, f]) => `<button type="button" class="st-chip ${t.font === k ? 'on' : ''}" data-k="font" data-v="${k}" style="font-family:${f.css}">${f.label}</button>`).join('')}</div>
              <div class="st-row2"><label class="st-range">Size <input type="range" min="35" max="180" value="${Math.round(t.size * 1000)}" data-in="size"></label>
                <label class="st-range">Rotate <input type="range" min="-45" max="45" value="${Math.round(t.rot)}" data-in="rot"></label></div>
              <div class="st-row2">${chips([['left', '<i class="fas fa-align-left"></i>'], ['center', '<i class="fas fa-align-center"></i>'], ['right', '<i class="fas fa-align-right"></i>']], t.align, 'align')}
                <button type="button" class="st-chip ${t.bold ? 'on' : ''}" data-k="bold"><b>B</b></button><button type="button" class="st-chip ${t.italic ? 'on' : ''}" data-k="italic"><i>I</i></button></div>
              <div class="st-lab">Text colour</div><div class="st-row2">${sw(PALETTE, t.color, 'color')}</div>
              <div class="st-lab">Background</div><div class="st-row2">${chips([['none', 'None'], ['semi', 'Soft'], ['solid', 'Solid'], ['pill', 'Pill']], t.bg, 'bg')}</div>
              ${t.bg !== 'none' ? `<div class="st-row2">${sw(PALETTE, t.bgColor, 'bgColor')}</div>` : ''}
              <div class="st-lab">Position</div><div class="st-row2">${chips([['top', 'Top'], ['mid', 'Middle'], ['bot', 'Bottom']], '', 'place')}</div>`;
        } else h = musicPanel();
        q.panel.innerHTML = h;
    }

    function updateClipUI() {
        const t = M.track; if (!t) return;
        const P = t.previewSec || 30, bar = $('.st-clip i'), lbl = $('.st-cliplabel'), len = $('[data-in=cclip]');
        if (bar) { bar.style.left = (t.startSec / P * 100).toFixed(2) + '%'; bar.style.width = (t.clipSec / P * 100).toFixed(2) + '%'; }
        if (lbl) lbl.textContent = `${S.fmtSec(t.startSec)} – ${S.fmtSec(t.startSec + t.clipSec)} (${t.clipSec}s of a ${P}s preview)`;
        if (len) { len.max = String(P - t.startSec); len.value = String(t.clipSec); }
    }
    function onInput(e) {
        const k = e.target.dataset.in, t = selT();
        if (k === 'caption') { M.caption = e.target.value.slice(0, MAX_CAPTION); }
        else if (k === 'music') { M.query = e.target.value; }
        else if (k === 'spotify') { M.spq = e.target.value; }
        else if (k === 'dur') { M.dur = S.clamp(Math.round(e.target.value), MIN_DUR, MAX_DUR); const b = $('.st-durv'); if (b) b.textContent = M.dur + 's'; }
        else if (k === 'cstart' && M.track) {
            const P = M.track.previewSec || 30;
            M.track.startSec = S.clamp(Math.round(e.target.value), 0, P - 5);
            M.track.clipSec = S.clamp(M.track.clipSec, 5, P - M.track.startSec); updateClipUI();
        }
        else if (k === 'cclip' && M.track) { M.track.clipSec = S.clamp(Math.round(e.target.value), 5, (M.track.previewSec || 30) - M.track.startSec); updateClipUI(); }
        else if (t && k === 'size') { t.size = S.clamp(e.target.value / 1000, 0.035, 0.18); refreshEl(t); }
        else if (t && k === 'rot') { t.rot = Number(e.target.value); refreshEl(t); }
    }
    function setPreview(on) {
        M.preview = on;
        if (on) {
            M.sel = null; if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
            if (M.track) playAudio(M.track.previewUrl, 'clip', M.track.startSec, clipEnd(M.track), true);
        } else stopAudio();
        renderTexts(); renderPv(); renderPanel();
    }
    function onClick(e) {
        const tab = e.target.closest('[data-tab]');
        if (tab) { M.tab = tab.dataset.tab; if (!M.preview) stopAudio(); renderPanel(); return; }
        const b = e.target.closest('[data-k]'); if (!b) return;
        const k = b.dataset.k, v = b.dataset.v, t = selT();
        const style = (fn) => { if (!t) return; fn(t); refreshEl(t); pushHist(); renderPanel(); };
        switch (k) {
            case 'close': tryClose(); break;
            case 'pickImg': if (M.items.length >= MAX_PHOTOS) { C.toast('You can add up to ' + MAX_PHOTOS + ' photos.', 'warn'); break; } q.file.accept = 'image/jpeg,image/png,image/webp,image/gif'; q.file.multiple = true; q.file.click(); break;
            case 'pickVid': q.file.accept = 'video/mp4,video/webm,video/quicktime'; q.file.multiple = false; q.file.click(); break;
            case 'rmItem': removeItem(Number(v)); break;
            case 'rmVideo': removeVideo(); break;
            case 'mvL': moveItem(Number(v), -1); break;
            case 'mvR': moveItem(Number(v), 1); break;
            case 'layout': M.layout = v; renderStage(); renderPanel(); break;
            case 'fit': M.fit = v; renderStage(); renderPanel(); break;
            case 'dur': M.dur = S.clamp(Number(v), MIN_DUR, MAX_DUR); renderPanel(); break;
            case 'preview': setPreview(!M.preview); break;
            case 'addText': addText(); break;
            case 'editText': if (t) edit(t.id); break;
            case 'dup': dup(); break;
            case 'del': del(); break;
            case 'undo': undo(); break;
            case 'resetText': if (M.texts.length && confirm('Remove all text from this story?')) { if (!M.hist.length) M.hist.push(snap()); M.texts = []; M.sel = null; renderTexts(); renderPanel(); pushHist(); } break;
            case 'font': style(x => { x.font = v; }); break;
            case 'align': style(x => { x.align = v; }); break;
            case 'bold': style(x => { x.bold = !x.bold; }); break;
            case 'italic': style(x => { x.italic = !x.italic; }); break;
            case 'color': style(x => { x.color = v; }); break;
            case 'bg': style(x => { x.bg = v; }); break;
            case 'bgColor': style(x => { x.bgColor = v; }); break;
            case 'place': style(x => { x.y = v === 'top' ? 0.2 : v === 'mid' ? 0.5 : 0.74; x.x = 0.5; }); break;
            case 'musicGo': musicSearch(); break;
            case 'playRes': {
                const r = M.results[Number(v)]; if (!r) break;
                if (M.playing === 'r' + v) stopAudio(); else playAudio(r.previewUrl, 'r' + v, 0, 30, false);
                renderPanel(); break;
            }
            case 'pickTrack': {
                const r = M.results[Number(v)]; if (!r) break;
                stopAudio();
                M.track = Object.assign({}, r, { startSec: 0, clipSec: Math.min(15, Math.max(5, durSec() || 15)) });
                M.spotify = null; M.results = []; M.msg = ''; renderPanel(); renderPv(); break;
            }
            case 'playClip': toggleClip(); break;
            case 'rmTrack': stopAudio(); M.track = null; renderPanel(); renderPv(); break;
            case 'spotifyGo': spotifyGo(); break;
            case 'rmSpotify': M.spotify = null; renderPanel(); renderPv(); break;
            case 'publish': publish(); break;
        }
    }

    // ------------------------------------------------------------ music: in-site search (iTunes) + optional Spotify link
    async function musicSearch() {
        const term = (M.query || '').trim();
        if (term.length < 2 || M.searching) { if (term.length < 2) { M.msg = 'Type at least 2 characters.'; renderPanel(); } return; }
        stopAudio(); M.searching = true; M.msg = ''; M.results = []; renderPanel();
        try {
            M.results = await S.searchMusic(term);
            M.msg = M.results.length ? '' : 'No songs found. Try the artist name or a different spelling.';
        } catch (e) { M.msg = 'Song search is unavailable right now. Check your connection and try again.'; }
        M.searching = false; renderPanel();
    }
    function spotifyId(v) {
        v = (v || '').trim();
        let m = v.match(/^spotify:track:([A-Za-z0-9]{22})$/); if (m) return m[1];
        try { const u = new URL(v); if (u.hostname !== 'open.spotify.com') return null; m = u.pathname.match(/\/(?:intl-[a-z-]+\/)?track\/([A-Za-z0-9]{22})/); return m ? m[1] : null; } catch (e) { return null; }
    }
    async function spotifyGo() {
        const val = (M.spq || '').trim(); if (!val) return;
        const id = spotifyId(val);
        if (!id) { M.msg = 'That doesn’t look like a Spotify track link. Open a song in Spotify → Share → Copy link.'; renderPanel(); return; }
        M.msg = 'Looking up…'; renderPanel();
        const url = 'https://open.spotify.com/track/' + id;
        let title = 'Spotify track', thumbnail = '';
        try {
            const r = await fetch('https://open.spotify.com/oembed?url=' + encodeURIComponent(url));
            if (r.ok) { const j = await r.json(); title = String(j.title || title).slice(0, 120); thumbnail = S.safeImgUrl(j.thumbnail_url) || ''; }
        } catch (e) { /* oEmbed unreachable: keep link-only card */ }
        stopAudio(); M.track = null; M.spq = '';
        M.spotify = { trackId: id, url, title, artist: '', thumbnail }; M.msg = '';
        renderPanel(); renderPv();
    }

    // ------------------------------------------------------------ publish
    const ymd = ms => { const d = new Date(ms); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    function upload(file, onProg) {
        return new Promise((res, rej) => {
            const fd = new FormData();
            fd.append('file', file); fd.append('upload_preset', C.cfg.uploadPreset); fd.append('folder', 't-imawa/stories');
            fd.append('tags', 'story,expires_' + ymd(Date.now() + 86400000));
            const x = new XMLHttpRequest(); M.xhr = x;
            x.open('POST', `https://api.cloudinary.com/v1_1/${C.cfg.cloudName}/auto/upload`);
            x.upload.onprogress = e => { if (e.lengthComputable) onProg(e.loaded / e.total); };
            x.onload = () => {
                let j = {}; try { j = JSON.parse(x.responseText); } catch (e) { /* ignore */ }
                x.status === 200 ? res(j) : rej(new Error((j.error && j.error.message) || 'Upload failed (' + x.status + ')'));
            };
            x.onerror = () => rej(new Error('Network error during upload'));
            x.onabort = () => rej(new Error('cancelled'));
            x.send(fd);
        });
    }
    // Best-effort cleanup if something fails after media was uploaded (unsigned presets return a short-lived delete_token).
    async function discardUploads(list) {
        for (const up of list) {
            try {
                if (!up || !up.delete_token) continue;
                const fd = new FormData(); fd.append('token', up.delete_token);
                await fetch(`https://api.cloudinary.com/v1_1/${C.cfg.cloudName}/delete_by_token`, { method: 'POST', body: fd });
            } catch (e) { /* orphan is swept by the expires_ tag job (see STORIES_SETUP.md) */ }
        }
    }
    async function publish() {
        if (M.busy || !hasMedia()) return;
        if (M.texts.some(t => !t.text)) M.texts = M.texts.filter(t => t.text);
        stopAudio(); M.busy = true; M.preview = false; renderPv(); renderPanel();
        q.bar.hidden = false; q.barI.style.width = '3%';
        const ups = [];
        try {
            const files = M.video ? [M.video.file] : M.items.map(i => i.file);
            for (let i = 0; i < files.length; i++) {
                ups.push(await upload(files[i], p => { q.barI.style.width = Math.max(3, Math.round(((i + p) / files.length) * 92)) + '%'; }));
            }
            const urls = ups.map(u => S.safeMediaUrl(u.secure_url));
            if (urls.some(u => !u)) throw new Error('Unexpected upload response');
            const first = ups[0], url = urls[0];
            const isV = first.resource_type === 'video';
            const thumb = isV ? url.replace('/video/upload/', '/video/upload/so_0,w_480,h_854,c_fill,f_jpg/').replace(/\.[a-z0-9]+$/i, '.jpg') : url.replace('/image/upload/', '/image/upload/w_480,q_auto,f_auto/');
            const ref = C.db.collection('stories').doc();
            const exp = firebase.firestore.Timestamp.fromMillis((C.now ? C.now() : Date.now()) + S.DURATION_MS);
            const multi = !isV && ups.length > 1;
            const vidSec = Math.min(MAX_DUR, first.duration || (M.video && M.video.dur) || 0);
            const doc = {
                ownerUid: C.me.uid, ownerName: C.me.name, ownerPhoto: C.me.photo || '',
                mediaType: isV ? 'video' : 'image', mediaUrl: url, mediaPublicId: first.public_id || '', thumbUrl: S.safeMediaUrl(thumb),
                mediaFit: M.fit, mediaW: first.width || 0, mediaH: first.height || 0,
                // how long the story plays: photos = the chosen 15-60 s, video = its own length (max 60 s)
                durationMs: isV ? Math.round(vidSec * 1000) : Math.round(M.dur * 1000),
                caption: M.caption.trim().slice(0, MAX_CAPTION),
                textOverlays: M.texts.slice(0, MAX_TEXTS).map(t => ({ id: t.id, text: t.text.slice(0, MAX_TEXT_LEN), x: +t.x.toFixed(4), y: +t.y.toFixed(4), size: +t.size.toFixed(4), rot: Math.round(t.rot), font: t.font, color: t.color, bg: t.bg, bgColor: t.bgColor, align: t.align, bold: !!t.bold, italic: !!t.italic })),
                spotifyTrack: M.spotify ? { trackId: M.spotify.trackId, url: M.spotify.url, title: M.spotify.title, artist: (M.spotify.artist || '').slice(0, 80), thumbnail: M.spotify.thumbnail || '' } : null,
                music: M.track ? { provider: 'itunes', trackId: M.track.trackId, title: M.track.title, artist: (M.track.artist || '').slice(0, 80), thumbnail: M.track.thumbnail || '', previewUrl: M.track.previewUrl, previewSec: M.track.previewSec || 30, startSec: M.track.startSec, clipSec: M.track.clipSec } : null,
                muteVideo: !!(isV && M.track),          // music added to a video mutes the video's audio
                mediaPublicIds: ups.map(u => u.public_id || '').filter(Boolean),
                status: 'active',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                expiresAt: exp
            };
            if (multi) { doc.mediaItems = ups.map((u, i) => ({ url: urls[i], w: u.width || 0, h: u.height || 0 })); doc.layout = S.getLayout(M.layout, ups.length).id; }
            q.barI.style.width = '96%';
            try { await ref.set(doc); }
            catch (we) { await discardUploads(ups); throw we; }
            try { const s = await ref.get({ source: 'server' }); const c = s.data().createdAt; if (c && c.toMillis) C.onPublished(c.toMillis() - Date.now()); } catch (e) { /* skew is optional */ }
            q.barI.style.width = '100%';
            C.toast('Story shared! It will disappear in 24 hours.', 'success');
            M.busy = false; closeNow();
        } catch (e) {
            // upload failed / cancelled part-way: drop what already went up (a failed Firestore write was already cleaned above)
            if (!e.code) await discardUploads(ups);
            M.busy = false; q.bar.hidden = true;
            if (e.message === 'cancelled') { renderPanel(); return; }
            console.warn('publish failed', e);
            C.toast(e.code === 'permission-denied' ? 'Couldn’t publish. Check that you’re signed in and your device clock/time zone is correct.' : ('Couldn’t publish: ' + e.message), 'error');
            renderPanel();
        }
    }

    window.StoriesComposer = { open };
})();