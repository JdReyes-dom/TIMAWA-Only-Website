/* ================================================================
   theme.js
   TIMAWA — Shared theme system
   Loaded SYNCHRONOUSLY in <head> after theme.css, before page render.

   ★ Matches theme.css ★
   - Ocean: 3 static bubbles + 2 rising animated bubbles.
   - Sakura: single sweeping blossom branch (no more tree).
   - Crimson: added a resting butterfly.
   Palettes, applyTheme, storage, sync: UNCHANGED.
   ================================================================ */

(function () {
    'use strict';

    window.THEME_STORAGE_KEY = 'timawa_theme';
    window.THEME_EVENT = 'timawa-theme-change';

    window.THEME_SHAPES = {

        // ★ OCEAN — wave + fish + 2 rising bubbles animated; 3 bubbles static
        ocean: `
            <div class="shape ocean-wave"></div>
            <div class="shape ocean-wave w2"></div>
            <div class="shape ocean-bubble b1"></div>
            <div class="shape ocean-bubble b2"></div>
            <div class="shape ocean-bubble b3"></div>
            <div class="shape ocean-bubble-rise b4"></div>
            <div class="shape ocean-bubble-rise b5"></div>
            <div class="shape ocean-fish f1"></div>
        `,

        sunset: `
            <div class="shape sunset-sun"></div>
            <div class="shape sunset-horizon"></div>
            <div class="shape sunset-mountain m1"></div>
            <div class="shape sunset-mountain m2"></div>
            <div class="shape sunset-mountain m3"></div>
            <div class="shape sunset-ground"></div>
            <div class="shape sunset-cloud c1"></div>
            <div class="shape sunset-bird sb1"></div>
        `,

        // ★ NEW SAKURA — single sweeping blossom branch + 2 twigs +
        //   6 clusters + 3 petals + sun + ground
        sakura: `
            <div class="shape sakura-sun"></div>
            <div class="shape sakura-ground"></div>
            <div class="shape sakura-branch"></div>
            <div class="shape sakura-twig"></div>
            <div class="shape sakura-twig t2"></div>
            <div class="shape sakura-cluster c1"></div>
            <div class="shape sakura-cluster c2"></div>
            <div class="shape sakura-cluster c3"></div>
            <div class="shape sakura-cluster c4"></div>
            <div class="shape sakura-cluster c5"></div>
            <div class="shape sakura-cluster c6"></div>
            <div class="shape sakura-petal p1"></div>
            <div class="shape sakura-petal p2"></div>
            <div class="shape sakura-petal p3"></div>
        `,

        pink: `
            <div class="shape blossom-sky-haze"></div>
            <div class="shape blossom-meadow-hill hill-far"></div>
            <div class="shape blossom-meadow-hill"></div>
            <div class="shape blossom-meadow-ground"></div>
            <div class="shape blossom-tulip t1"></div>
            <div class="shape blossom-tulip t2"></div>
            <div class="shape blossom-tulip t3"></div>
            <div class="shape blossom-tulip t4"></div>
            <div class="shape blossom-tulip t5"></div>
            <div class="shape blossom-tulip t6"></div>
            <div class="shape blossom-daisy d1"></div>
            <div class="shape blossom-daisy d2"></div>
            <div class="shape blossom-daisy d3"></div>
            <div class="shape blossom-floating-petal fp1"></div>
            <div class="shape blossom-butterfly bf1"></div>
        `,

        forest: `
            <div class="shape forest-moon"></div>
            <div class="shape forest-hill"></div>
            <div class="shape forest-pines"></div>
            <div class="shape forest-ground"></div>
            <div class="shape forest-fog f1"></div>
            <div class="shape forest-spore sp1"></div>
        `,

        sunshine: `
            <div class="shape sunshine-beam"></div>
            <div class="shape sunshine-sun"></div>
            <div class="shape sunshine-ray sr1"></div>
            <div class="shape sunshine-ray sr2"></div>
            <div class="shape sunshine-ray sr3"></div>
            <div class="shape sunshine-ray sr4"></div>
            <div class="shape sunshine-ray sr5"></div>
            <div class="shape sunshine-ray sr6"></div>
            <div class="shape sunshine-ray sr7"></div>
            <div class="shape sunshine-ray sr8"></div>
            <div class="shape sunshine-sunflower sf1"></div>
            <div class="shape sunshine-sunflower sf2"></div>
            <div class="shape sunshine-sunflower sf3"></div>
            <div class="shape sunshine-sunflower sf4"></div>
            <div class="shape sunshine-sunflower sf5"></div>
            <div class="shape sunshine-pollen sp1"></div>
        `,

        starry: `
            <div class="shape starfield"></div>
            <div class="shape starfield starfield-2"></div>
            <div class="shape shooting-star sh1"></div>
            <div class="shape shooting-star sh2"></div>
            <div class="shape shooting-star sh3"></div>
            <div class="shape shooting-star sh4"></div>
            <div class="shape nebula n1"></div>
            <div class="shape nebula n2"></div>
        `,

        cafe: `
            <div class="shape cafe-window-light"></div>
            <div class="shape cafe-saucer"></div>
            <div class="shape cafe-cup"></div>
            <div class="shape cafe-cup-fill"></div>
            <div class="shape cafe-croissant"></div>
            <div class="shape cafe-sugar-cube sc1"></div>
            <div class="shape cafe-sugar-cube sc2"></div>
            <div class="shape coffee-ring cr1"></div>
            <div class="shape coffee-ring cr2"></div>
            <div class="shape cafe-steam-wisp sw1"></div>
            <div class="shape bean bn1"></div>
        `,

        // ★ CRIMSON — halo, stem, 2 leaves, 2 dew drops, rose, butterfly, petal
        crimson: `
            <div class="shape crimson-vignette"></div>
            <div class="shape crimson-ground-glow"></div>
            <div class="shape crimson-halo"></div>
            <div class="shape crimson-stem"></div>
            <div class="shape crimson-leaf l1"></div>
            <div class="shape crimson-leaf l2"></div>
            <div class="shape crimson-dew d1"></div>
            <div class="shape crimson-dew d2"></div>
            <div class="shape crimson-rose"></div>
            <div class="shape crimson-butterfly"></div>
            <div class="shape crimson-petal p1"></div>
        `,

        maroon: `
            <div class="shape maroon-vignette"></div>
            <div class="shape maroon-wall"></div>
            <div class="shape maroon-table"></div>
            <div class="shape maroon-spotlight"></div>
            <div class="shape maroon-plate"></div>
            <div class="shape maroon-cork"></div>
            <div class="shape maroon-glass">
                <div class="maroon-glass-bowl"></div>
                <div class="maroon-glass-stem"></div>
                <div class="maroon-glass-base"></div>
            </div>
            <div class="shape maroon-wine-bubble"></div>
        `,

        ember: `
            <div class="shape ember-volcano-far"></div>
            <div class="shape ember-horizon"></div>
            <div class="shape ember-crack ec1"></div>
            <div class="shape ember-crack ec2"></div>
            <div class="shape ember-crack ec3"></div>
            <div class="shape ember-crack ec4"></div>
            <div class="shape ember-crack ec5"></div>
            <div class="shape ember-heat"></div>
            <div class="shape ember-particle"></div>
        `,

        autumn: `
            <div class="shape autumn-pumpkin ap1"></div>
            <div class="shape autumn-pumpkin ap2"></div>
            <div class="shape autumn-leaf-tornado"></div>
            <div class="shape autumn-fence"></div>
            <div class="shape autumn-wheat tuft1"></div>
            <div class="shape autumn-wheat tuft2"></div>
            <div class="shape autumn-fog af1"></div>
        `,

        glacier: `
            <div class="shape glacier-iceberg ib1"></div>
            <div class="shape glacier-iceberg ib2"></div>
            <div class="shape glacier-iceberg ib3"></div>
            <div class="shape glacier-water-line"></div>
            <div class="shape glacier-water-surface"></div>
            <div class="shape glacier-peak pk1"></div>
            <div class="shape glacier-peak pk2"></div>
            <div class="shape glacier-snowflake gs1"></div>
            <div class="shape glacier-sparkle gk1"></div>
            <div class="shape glacier-sparkle gk2"></div>
        `,

        tropic: `
            <div class="shape tropic-sunset-horizon"></div>
            <div class="shape tropic-water-band"></div>
            <div class="shape tropic-tiki tki1"></div>
            <div class="shape tropic-tiki tki2"></div>
            <div class="shape tropic-driftwood"></div>
            <div class="shape tropic-bird tb1"></div>
        `,

        moonlit: `
            <div class="shape moonlit-lighthouse"></div>
            <div class="shape moonlit-beam"></div>
            <div class="shape moonlit-water-line"></div>
            <div class="shape moonlit-reflection mr1"></div>
            <div class="shape moonlit-reflection mr2"></div>
            <div class="shape moonlit-crescent"></div>
            <div class="shape moonlit-star mls1"></div>
            <div class="shape moonlit-star mls2"></div>
            <div class="shape moonlit-star mls3"></div>
        `,

        aurora: `
            <div class="shape aurora-mountain am1"></div>
            <div class="shape aurora-mountain am2"></div>
            <div class="shape aurora-mountain am3"></div>
            <div class="shape aurora-curtain ac1"></div>
            <div class="shape aurora-curtain ac2"></div>
            <div class="shape aurora-curtain ac3"></div>
            <div class="shape aurora-reflection-lake"></div>
            <div class="shape aurora-snowcap as1"></div>
            <div class="shape aurora-snowcap as2"></div>
        `,

        nebula: `
            <div class="shape nebula-wormhole"></div>
            <div class="shape nebula-wormhole-core"></div>
            <div class="shape nebula-planet"></div>
            <div class="shape nebula-planet-ring"></div>
            <div class="shape nebula-constellation-grid"></div>
            <div class="shape nebula-pulse-star nps1"></div>
        `,

        matcha: `
            <div class="shape matcha-zen-circle mzc1"></div>
            <div class="shape matcha-zen-circle mzc2"></div>
            <div class="shape matcha-zen-circle mzc3"></div>
            <div class="shape matcha-leaf ml1"></div>
            <div class="shape matcha-leaf ml2"></div>
            <div class="shape matcha-leaf ml3"></div>
            <div class="shape matcha-steam ms1"></div>
            <div class="shape matcha-shoji-grid"></div>
            <div class="shape matcha-bamboo mb1"></div>
            <div class="shape matcha-bamboo mb2"></div>
        `
    };

    // ================================================================
    // ===== THEMES (palettes) — UNCHANGED =====
    // ================================================================
    window.THEMES = {
        ocean: {
            name: 'Ocean', sub: 'Fresh · Cool', emoji: '🌊',
            preview: { primary: '#1089d3', gradient: 'linear-gradient(135deg, #1089d3 0%, #12b1d1 100%)' },
            light: {
                '--theme-primary': '#1089d3', '--theme-accent': '#12b1d1', '--theme-primary-dark': '#0c6ca8',
                '--theme-primary-soft': '#e0f2fe', '--theme-primary-soft-2': '#f0f7ff',
                '--theme-bg': '#ffffff', '--theme-bg-soft': '#f8faff', '--theme-card': '#ffffff',
                '--theme-text': '#1a1a2e', '--theme-text-muted': '#555', '--theme-text-dim': '#888', '--theme-text-faint': '#aaa',
                '--theme-border': '#eef2f7', '--theme-border-soft': '#f0f4ff', '--theme-border-input': '#e0e7ff',
                '--theme-gradient': 'linear-gradient(45deg, #1089d3 0%, #12b1d1 100%)',
                '--theme-shadow': 'rgba(133, 189, 215, 0.15)', '--theme-shadow-soft': '#cff0ff',
                '--theme-nav-bg': 'rgba(255, 255, 255, 0.98)'
            },
            dark: {
                '--theme-primary': '#4dabf7', '--theme-accent': '#5ac8fa', '--theme-primary-dark': '#339af0',
                '--theme-primary-soft': '#1a2b3d', '--theme-primary-soft-2': '#0f1a26',
                '--theme-bg': '#0a1118', '--theme-bg-soft': '#131b24', '--theme-card': '#131b24',
                '--theme-text': '#e6f0f9', '--theme-text-muted': '#a0b3c5', '--theme-text-dim': '#7a8fa3', '--theme-text-faint': '#5a6b7d',
                '--theme-border': '#1f2a37', '--theme-border-soft': '#16202b', '--theme-border-input': '#1f2a37',
                '--theme-gradient': 'linear-gradient(45deg, #4dabf7 0%, #5ac8fa 100%)',
                '--theme-shadow': 'rgba(77, 171, 247, 0.2)', '--theme-shadow-soft': 'rgba(77, 171, 247, 0.15)',
                '--theme-nav-bg': 'rgba(10, 17, 24, 0.98)'
            }
        },
        sunset: {
            name: 'Sunset', sub: 'Warm · Bold', emoji: '🌅',
            preview: { primary: '#f5576c', gradient: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)' },
            light: {
                '--theme-primary': '#f5576c', '--theme-accent': '#f093fb', '--theme-primary-dark': '#c73a52',
                '--theme-primary-soft': '#ffe4e6', '--theme-primary-soft-2': '#fff1f2',
                '--theme-bg': '#ffffff', '--theme-bg-soft': '#fff8f9', '--theme-card': '#ffffff',
                '--theme-text': '#2e1a1e', '--theme-text-muted': '#6b4a50', '--theme-text-dim': '#9c7a80', '--theme-text-faint': '#c4a5aa',
                '--theme-border': '#fdeef0', '--theme-border-soft': '#fef5f6', '--theme-border-input': '#fde0e3',
                '--theme-gradient': 'linear-gradient(45deg, #f5576c 0%, #f093fb 100%)',
                '--theme-shadow': 'rgba(245, 87, 108, 0.15)', '--theme-shadow-soft': 'rgba(245, 87, 108, 0.2)',
                '--theme-nav-bg': 'rgba(255, 255, 255, 0.98)'
            },
            dark: {
                '--theme-primary': '#ff6b7e', '--theme-accent': '#ff9db0', '--theme-primary-dark': '#e04458',
                '--theme-primary-soft': '#3d1f26', '--theme-primary-soft-2': '#1e0f13',
                '--theme-bg': '#1a0e11', '--theme-bg-soft': '#241318', '--theme-card': '#241318',
                '--theme-text': '#fbe5e8', '--theme-text-muted': '#c9a0a7', '--theme-text-dim': '#a57a82', '--theme-text-faint': '#7d5a61',
                '--theme-border': '#3a1f26', '--theme-border-soft': '#2a151b', '--theme-border-input': '#3a1f26',
                '--theme-gradient': 'linear-gradient(45deg, #ff6b7e 0%, #ff9db0 100%)',
                '--theme-shadow': 'rgba(255, 107, 126, 0.25)', '--theme-shadow-soft': 'rgba(255, 107, 126, 0.18)',
                '--theme-nav-bg': 'rgba(26, 14, 17, 0.98)'
            }
        },
        pink: {
            name: 'Blossom', sub: 'Soft · Sweet', emoji: '🌸',
            preview: { primary: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #f9a8d4 100%)' },
            light: {
                '--theme-primary': '#ec4899', '--theme-accent': '#f9a8d4', '--theme-primary-dark': '#be185d',
                '--theme-primary-soft': '#fce7f3', '--theme-primary-soft-2': '#fdf2f8',
                '--theme-bg': '#ffffff', '--theme-bg-soft': '#fff7fb', '--theme-card': '#ffffff',
                '--theme-text': '#2e1a26', '--theme-text-muted': '#6b4a5c', '--theme-text-dim': '#9c7a8c', '--theme-text-faint': '#c4a5b4',
                '--theme-border': '#fde8f1', '--theme-border-soft': '#fef3f9', '--theme-border-input': '#fbd5e5',
                '--theme-gradient': 'linear-gradient(45deg, #ec4899 0%, #f9a8d4 100%)',
                '--theme-shadow': 'rgba(236, 72, 153, 0.15)', '--theme-shadow-soft': 'rgba(236, 72, 153, 0.2)',
                '--theme-nav-bg': 'rgba(255, 255, 255, 0.98)'
            },
            dark: {
                '--theme-primary': '#f472b6', '--theme-accent': '#fbcfe8', '--theme-primary-dark': '#db2777',
                '--theme-primary-soft': '#3d1f30', '--theme-primary-soft-2': '#1e0f1a',
                '--theme-bg': '#1a0e16', '--theme-bg-soft': '#241320', '--theme-card': '#241320',
                '--theme-text': '#fbe5f0', '--theme-text-muted': '#c9a0b8', '--theme-text-dim': '#a57a95', '--theme-text-faint': '#7d5a70',
                '--theme-border': '#3a1f30', '--theme-border-soft': '#2a1522', '--theme-border-input': '#3a1f30',
                '--theme-gradient': 'linear-gradient(45deg, #f472b6 0%, #fbcfe8 100%)',
                '--theme-shadow': 'rgba(244, 114, 182, 0.25)', '--theme-shadow-soft': 'rgba(244, 114, 182, 0.18)',
                '--theme-nav-bg': 'rgba(26, 14, 22, 0.98)'
            }
        },
        forest: {
            name: 'Forest', sub: 'Fresh · Natural', emoji: '🌲',
            preview: { primary: '#16a34a', gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' },
            light: {
                '--theme-primary': '#16a34a', '--theme-accent': '#22c55e', '--theme-primary-dark': '#15803d',
                '--theme-primary-soft': '#dcfce7', '--theme-primary-soft-2': '#f0fdf4',
                '--theme-bg': '#ffffff', '--theme-bg-soft': '#f8fdf9', '--theme-card': '#ffffff',
                '--theme-text': '#0f2e1a', '--theme-text-muted': '#3d5c47', '--theme-text-dim': '#698072', '--theme-text-faint': '#9cb3a4',
                '--theme-border': '#e8f5ec', '--theme-border-soft': '#f0f9f2', '--theme-border-input': '#d1e7d8',
                '--theme-gradient': 'linear-gradient(45deg, #16a34a 0%, #22c55e 100%)',
                '--theme-shadow': 'rgba(22, 163, 74, 0.15)', '--theme-shadow-soft': 'rgba(22, 163, 74, 0.2)',
                '--theme-nav-bg': 'rgba(255, 255, 255, 0.98)'
            },
            dark: {
                '--theme-primary': '#4ade80', '--theme-accent': '#86efac', '--theme-primary-dark': '#22c55e',
                '--theme-primary-soft': '#14281a', '--theme-primary-soft-2': '#0a1810',
                '--theme-bg': '#08140d', '--theme-bg-soft': '#0f1e15', '--theme-card': '#0f1e15',
                '--theme-text': '#e0f2e6', '--theme-text-muted': '#a0c4ad', '--theme-text-dim': '#7a9c86', '--theme-text-faint': '#5a7c66',
                '--theme-border': '#1c3524', '--theme-border-soft': '#122319', '--theme-border-input': '#1c3524',
                '--theme-gradient': 'linear-gradient(45deg, #4ade80 0%, #86efac 100%)',
                '--theme-shadow': 'rgba(74, 222, 128, 0.25)', '--theme-shadow-soft': 'rgba(74, 222, 128, 0.18)',
                '--theme-nav-bg': 'rgba(8, 20, 13, 0.98)'
            }
        },
        sunshine: {
            name: 'Sunshine', sub: 'Bright · Cheery', emoji: '☀️',
            preview: { primary: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' },
            light: {
                '--theme-primary': '#f59e0b', '--theme-accent': '#fbbf24', '--theme-primary-dark': '#d97706',
                '--theme-primary-soft': '#fef3c7', '--theme-primary-soft-2': '#fffbeb',
                '--theme-bg': '#ffffff', '--theme-bg-soft': '#fffdf5', '--theme-card': '#ffffff',
                '--theme-text': '#2e2410', '--theme-text-muted': '#6b5a30', '--theme-text-dim': '#9c8a5c', '--theme-text-faint': '#c4b588',
                '--theme-border': '#fdf3dc', '--theme-border-soft': '#fef9ec', '--theme-border-input': '#fce8b3',
                '--theme-gradient': 'linear-gradient(45deg, #f59e0b 0%, #fbbf24 100%)',
                '--theme-shadow': 'rgba(245, 158, 11, 0.15)', '--theme-shadow-soft': 'rgba(245, 158, 11, 0.2)',
                '--theme-nav-bg': 'rgba(255, 255, 255, 0.98)'
            },
            dark: {
                '--theme-primary': '#fbbf24', '--theme-accent': '#fcd34d', '--theme-primary-dark': '#f59e0b',
                '--theme-primary-soft': '#3d3018', '--theme-primary-soft-2': '#1f1808',
                '--theme-bg': '#171207', '--theme-bg-soft': '#221a0c', '--theme-card': '#221a0c',
                '--theme-text': '#fbf3d9', '--theme-text-muted': '#c9baa0', '--theme-text-dim': '#a59578', '--theme-text-faint': '#7d7058',
                '--theme-border': '#3a2e15', '--theme-border-soft': '#2a210f', '--theme-border-input': '#3a2e15',
                '--theme-gradient': 'linear-gradient(45deg, #fbbf24 0%, #fcd34d 100%)',
                '--theme-shadow': 'rgba(251, 191, 36, 0.25)', '--theme-shadow-soft': 'rgba(251, 191, 36, 0.18)',
                '--theme-nav-bg': 'rgba(23, 18, 7, 0.98)'
            }
        },
        starry: {
            name: 'Starry', sub: 'Cosmic · Night', emoji: '✨',
            preview: { primary: '#8b5cf6', gradient: 'linear-gradient(135deg, #1e1b4b 0%, #6d28d9 50%, #c4b5fd 100%)' },
            light: {
                '--theme-primary': '#a78bfa', '--theme-accent': '#c4b5fd', '--theme-primary-dark': '#8b5cf6',
                '--theme-primary-soft': '#2a1e3d', '--theme-primary-soft-2': '#150e26',
                '--theme-bg': '#0a0714', '--theme-bg-soft': '#0e0818', '--theme-card': '#17102a',
                '--theme-text': '#e8e0ff', '--theme-text-muted': '#b0a0d0', '--theme-text-dim': '#8878b0', '--theme-text-faint': '#665a88',
                '--theme-border': '#281e3d', '--theme-border-soft': '#1a1229', '--theme-border-input': '#281e3d',
                '--theme-gradient': 'linear-gradient(45deg, #a78bfa 0%, #c4b5fd 100%)',
                '--theme-shadow': 'rgba(167, 139, 250, 0.3)', '--theme-shadow-soft': 'rgba(167, 139, 250, 0.2)',
                '--theme-nav-bg': 'rgba(10, 7, 20, 0.98)'
            },
            dark: {
                '--theme-primary': '#a78bfa', '--theme-accent': '#c4b5fd', '--theme-primary-dark': '#8b5cf6',
                '--theme-primary-soft': '#2a1e3d', '--theme-primary-soft-2': '#150e26',
                '--theme-bg': '#0a0714', '--theme-bg-soft': '#0e0818', '--theme-card': '#17102a',
                '--theme-text': '#e8e0ff', '--theme-text-muted': '#b0a0d0', '--theme-text-dim': '#8878b0', '--theme-text-faint': '#665a88',
                '--theme-border': '#281e3d', '--theme-border-soft': '#1a1229', '--theme-border-input': '#281e3d',
                '--theme-gradient': 'linear-gradient(45deg, #a78bfa 0%, #c4b5fd 100%)',
                '--theme-shadow': 'rgba(167, 139, 250, 0.3)', '--theme-shadow-soft': 'rgba(167, 139, 250, 0.2)',
                '--theme-nav-bg': 'rgba(10, 7, 20, 0.98)'
            }
        },
        cafe: {
            name: 'Café', sub: 'Warm · Cozy', emoji: '☕',
            preview: { primary: '#8B5E3C', gradient: 'linear-gradient(135deg, #8B5E3C 0%, #D2B48C 100%)' },
            light: {
                '--theme-primary': '#8B5E3C', '--theme-accent': '#D2B48C', '--theme-primary-dark': '#6B4226',
                '--theme-primary-soft': '#F5E6D3', '--theme-primary-soft-2': '#FAF3E8',
                '--theme-bg': '#FDF8F2', '--theme-bg-soft': '#F9F1E7', '--theme-card': '#FFFFFF',
                '--theme-text': '#3E2C1C', '--theme-text-muted': '#6B5A4A', '--theme-text-dim': '#9C8A7A', '--theme-text-faint': '#C4B5A5',
                '--theme-border': '#EDE0D0', '--theme-border-soft': '#F5EDE2', '--theme-border-input': '#DCC8B0',
                '--theme-gradient': 'linear-gradient(45deg, #8B5E3C 0%, #D2B48C 100%)',
                '--theme-shadow': 'rgba(139, 94, 60, 0.15)', '--theme-shadow-soft': 'rgba(139, 94, 60, 0.2)',
                '--theme-nav-bg': 'rgba(253, 248, 242, 0.98)'
            },
            dark: {
                '--theme-primary': '#C49A6C', '--theme-accent': '#D2B48C', '--theme-primary-dark': '#A67B5B',
                '--theme-primary-soft': '#3D2E1E', '--theme-primary-soft-2': '#1E150E',
                '--theme-bg': '#1A120B', '--theme-bg-soft': '#241A12', '--theme-card': '#241A12',
                '--theme-text': '#F0E6D8', '--theme-text-muted': '#C4B5A0', '--theme-text-dim': '#A09080', '--theme-text-faint': '#7D6E60',
                '--theme-border': '#3A2C1E', '--theme-border-soft': '#2A1E14', '--theme-border-input': '#3A2C1E',
                '--theme-gradient': 'linear-gradient(45deg, #C49A6C 0%, #D2B48C 100%)',
                '--theme-shadow': 'rgba(196, 154, 108, 0.25)', '--theme-shadow-soft': 'rgba(196, 154, 108, 0.18)',
                '--theme-nav-bg': 'rgba(26, 18, 11, 0.98)'
            }
        },
        crimson: {
            name: 'Crimson', sub: 'Bold · Passion', emoji: '🌹',
            preview: { primary: '#dc2626', gradient: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)' },
            light: {
                '--theme-primary': '#dc2626', '--theme-accent': '#f87171', '--theme-primary-dark': '#b91c1c',
                '--theme-primary-soft': '#fee2e2', '--theme-primary-soft-2': '#fef2f2',
                '--theme-bg': '#ffffff', '--theme-bg-soft': '#fff5f5', '--theme-card': '#ffffff',
                '--theme-text': '#2e1a1a', '--theme-text-muted': '#6b4a4a', '--theme-text-dim': '#9c7a7a', '--theme-text-faint': '#c4a5a5',
                '--theme-border': '#fde8e8', '--theme-border-soft': '#fef3f3', '--theme-border-input': '#fbd5d5',
                '--theme-gradient': 'linear-gradient(45deg, #dc2626 0%, #f87171 100%)',
                '--theme-shadow': 'rgba(220, 38, 38, 0.15)', '--theme-shadow-soft': 'rgba(220, 38, 38, 0.2)',
                '--theme-nav-bg': 'rgba(255, 255, 255, 0.98)'
            },
            dark: {
                '--theme-primary': '#ef4444', '--theme-accent': '#fca5a5', '--theme-primary-dark': '#dc2626',
                '--theme-primary-soft': '#3d1a1a', '--theme-primary-soft-2': '#1e0e0e',
                '--theme-bg': '#1a0a0a', '--theme-bg-soft': '#241010', '--theme-card': '#241010',
                '--theme-text': '#fbe5e5', '--theme-text-muted': '#c9a0a0', '--theme-text-dim': '#a57a7a', '--theme-text-faint': '#7d5a5a',
                '--theme-border': '#3a1a1a', '--theme-border-soft': '#2a1010', '--theme-border-input': '#3a1a1a',
                '--theme-gradient': 'linear-gradient(45deg, #ef4444 0%, #fca5a5 100%)',
                '--theme-shadow': 'rgba(239, 68, 68, 0.25)', '--theme-shadow-soft': 'rgba(239, 68, 68, 0.18)',
                '--theme-nav-bg': 'rgba(26, 10, 10, 0.98)'
            }
        },
        maroon: {
            name: 'Maroon', sub: 'Deep · Classic', emoji: '🍷',
            preview: { primary: '#800000', gradient: 'linear-gradient(135deg, #800000 0%, #a52a2a 100%)' },
            light: {
                '--theme-primary': '#800000', '--theme-accent': '#a52a2a', '--theme-primary-dark': '#5c0000',
                '--theme-primary-soft': '#f5e6e6', '--theme-primary-soft-2': '#faf0f0',
                '--theme-bg': '#fdf8f8', '--theme-bg-soft': '#f9f0f0', '--theme-card': '#ffffff',
                '--theme-text': '#2e1a1a', '--theme-text-muted': '#5c3a3a', '--theme-text-dim': '#8a6a6a', '--theme-text-faint': '#b5a0a0',
                '--theme-border': '#e8d5d5', '--theme-border-soft': '#f0e0e0', '--theme-border-input': '#d4b5b5',
                '--theme-gradient': 'linear-gradient(45deg, #800000 0%, #a52a2a 100%)',
                '--theme-shadow': 'rgba(128, 0, 0, 0.15)', '--theme-shadow-soft': 'rgba(128, 0, 0, 0.2)',
                '--theme-nav-bg': 'rgba(253, 248, 248, 0.98)'
            },
            dark: {
                '--theme-primary': '#a52a2a', '--theme-accent': '#c04040', '--theme-primary-dark': '#800000',
                '--theme-primary-soft': '#2a1515', '--theme-primary-soft-2': '#1a0d0d',
                '--theme-bg': '#120808', '--theme-bg-soft': '#1a0f0f', '--theme-card': '#1a0f0f',
                '--theme-text': '#f0e0e0', '--theme-text-muted': '#c4a0a0', '--theme-text-dim': '#a08080', '--theme-text-faint': '#7d6060',
                '--theme-border': '#2e1a1a', '--theme-border-soft': '#221212', '--theme-border-input': '#2e1a1a',
                '--theme-gradient': 'linear-gradient(45deg, #a52a2a 0%, #c04040 100%)',
                '--theme-shadow': 'rgba(165, 42, 42, 0.25)', '--theme-shadow-soft': 'rgba(165, 42, 42, 0.18)',
                '--theme-nav-bg': 'rgba(18, 8, 8, 0.98)'
            }
        },
        sakura: {
            name: 'Sakura', sub: 'Dreamy · Spring', emoji: '🌸',
            preview: { primary: '#ff8fab', gradient: 'linear-gradient(135deg, #ffb7c5 0%, #ff8fab 100%)' },
            light: {
                '--theme-primary': '#ff8fab', '--theme-accent': '#ffb7c5', '--theme-primary-dark': '#e57399',
                '--theme-primary-soft': '#ffe4ec', '--theme-primary-soft-2': '#fff0f5',
                '--theme-bg': '#fff9fb', '--theme-bg-soft': '#fff5f8', '--theme-card': '#ffffff',
                '--theme-text': '#3a1f2b', '--theme-text-muted': '#7a5563', '--theme-text-dim': '#a88091', '--theme-text-faint': '#d4b3bf',
                '--theme-border': '#ffe0ea', '--theme-border-soft': '#ffeef4', '--theme-border-input': '#ffd0dd',
                '--theme-gradient': 'linear-gradient(45deg, #ff8fab 0%, #ffb7c5 100%)',
                '--theme-shadow': 'rgba(255, 143, 171, 0.18)', '--theme-shadow-soft': 'rgba(255, 143, 171, 0.22)',
                '--theme-nav-bg': 'rgba(255, 249, 251, 0.98)'
            },
            dark: {
                '--theme-primary': '#ffa5b8', '--theme-accent': '#ffc8d4', '--theme-primary-dark': '#e57a94',
                '--theme-primary-soft': '#3d1f2c', '--theme-primary-soft-2': '#1e0f17',
                '--theme-bg': '#1a0e14', '--theme-bg-soft': '#241420', '--theme-card': '#241420',
                '--theme-text': '#fbe5ed', '--theme-text-muted': '#c9a0b3', '--theme-text-dim': '#a57a8f', '--theme-text-faint': '#7d5a6c',
                '--theme-border': '#3a1f2c', '--theme-border-soft': '#2a1520', '--theme-border-input': '#3a1f2c',
                '--theme-gradient': 'linear-gradient(45deg, #ffa5b8 0%, #ffc8d4 100%)',
                '--theme-shadow': 'rgba(255, 165, 184, 0.28)', '--theme-shadow-soft': 'rgba(255, 165, 184, 0.20)',
                '--theme-nav-bg': 'rgba(26, 14, 20, 0.98)'
            }
        },
        nebula: {
            name: 'Nebula', sub: 'Cosmic · Sci-fi', emoji: '🌌',
            preview: { primary: '#7c3aed', gradient: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 50%, #ec4899 100%)' },
            light: {
                '--theme-primary': '#7c3aed', '--theme-accent': '#ec4899', '--theme-primary-dark': '#6d28d9',
                '--theme-primary-soft': '#2a1e4d', '--theme-primary-soft-2': '#150e26',
                '--theme-bg': '#0a0618', '--theme-bg-soft': '#120a24', '--theme-card': '#1a1030',
                '--theme-text': '#ede5ff', '--theme-text-muted': '#b8a8e0', '--theme-text-dim': '#8878b0', '--theme-text-faint': '#665a88',
                '--theme-border': '#2a1e4d', '--theme-border-soft': '#1a1229', '--theme-border-input': '#2a1e4d',
                '--theme-gradient': 'linear-gradient(45deg, #7c3aed 0%, #ec4899 100%)',
                '--theme-shadow': 'rgba(124, 58, 237, 0.35)', '--theme-shadow-soft': 'rgba(236, 72, 153, 0.25)',
                '--theme-nav-bg': 'rgba(10, 6, 24, 0.98)'
            },
            dark: {
                '--theme-primary': '#a78bfa', '--theme-accent': '#f472b6', '--theme-primary-dark': '#8b5cf6',
                '--theme-primary-soft': '#2a1e4d', '--theme-primary-soft-2': '#150e26',
                '--theme-bg': '#06030f', '--theme-bg-soft': '#0e0720', '--theme-card': '#150a28',
                '--theme-text': '#ede5ff', '--theme-text-muted': '#b8a8e0', '--theme-text-dim': '#8878b0', '--theme-text-faint': '#665a88',
                '--theme-border': '#2a1e4d', '--theme-border-soft': '#1a1229', '--theme-border-input': '#2a1e4d',
                '--theme-gradient': 'linear-gradient(45deg, #a78bfa 0%, #f472b6 100%)',
                '--theme-shadow': 'rgba(167, 139, 250, 0.4)', '--theme-shadow-soft': 'rgba(244, 114, 182, 0.28)',
                '--theme-nav-bg': 'rgba(6, 3, 15, 0.98)'
            }
        },
        ember: {
            name: 'Ember', sub: 'Intense · Fiery', emoji: '🔥',
            preview: { primary: '#f97316', gradient: 'linear-gradient(135deg, #7c2d12 0%, #f97316 50%, #dc2626 100%)' },
            light: {
                '--theme-primary': '#f97316', '--theme-accent': '#dc2626', '--theme-primary-dark': '#ea580c',
                '--theme-primary-soft': '#3d1a0a', '--theme-primary-soft-2': '#1e0e05',
                '--theme-bg': '#1a0f08', '--theme-bg-soft': '#241812', '--theme-card': '#2a1a10',
                '--theme-text': '#fbe8d9', '--theme-text-muted': '#c9b0a0', '--theme-text-dim': '#a58a78', '--theme-text-faint': '#7d6858',
                '--theme-border': '#3a2015', '--theme-border-soft': '#2a1a10', '--theme-border-input': '#3a2015',
                '--theme-gradient': 'linear-gradient(45deg, #f97316 0%, #dc2626 100%)',
                '--theme-shadow': 'rgba(249, 115, 22, 0.35)', '--theme-shadow-soft': 'rgba(220, 38, 38, 0.28)',
                '--theme-nav-bg': 'rgba(26, 15, 8, 0.98)'
            },
            dark: {
                '--theme-primary': '#fb923c', '--theme-accent': '#ef4444', '--theme-primary-dark': '#f97316',
                '--theme-primary-soft': '#3d1a0a', '--theme-primary-soft-2': '#1e0e05',
                '--theme-bg': '#0f0805', '--theme-bg-soft': '#1a0f0a', '--theme-card': '#1a0f0a',
                '--theme-text': '#fbe8d9', '--theme-text-muted': '#c9b0a0', '--theme-text-dim': '#a58a78', '--theme-text-faint': '#7d6858',
                '--theme-border': '#3a2015', '--theme-border-soft': '#2a1a10', '--theme-border-input': '#3a2015',
                '--theme-gradient': 'linear-gradient(45deg, #fb923c 0%, #ef4444 100%)',
                '--theme-shadow': 'rgba(251, 146, 60, 0.4)', '--theme-shadow-soft': 'rgba(239, 68, 68, 0.3)',
                '--theme-nav-bg': 'rgba(15, 8, 5, 0.98)'
            }
        },
        autumn: {
            name: 'Autumn', sub: 'Cozy · Harvest', emoji: '🍁',
            preview: { primary: '#ea580c', gradient: 'linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f59e0b 100%)' },
            light: {
                '--theme-primary': '#ea580c', '--theme-accent': '#f59e0b', '--theme-primary-dark': '#c2410c',
                '--theme-primary-soft': '#fee8d4', '--theme-primary-soft-2': '#fff5ea',
                '--theme-bg': '#fffbf5', '--theme-bg-soft': '#fdf5ea', '--theme-card': '#ffffff',
                '--theme-text': '#3a1f0f', '--theme-text-muted': '#6b4a30', '--theme-text-dim': '#a57852', '--theme-text-faint': '#d4b096',
                '--theme-border': '#f5e0c8', '--theme-border-soft': '#faecd8', '--theme-border-input': '#e8c8a8',
                '--theme-gradient': 'linear-gradient(45deg, #ea580c 0%, #f59e0b 100%)',
                '--theme-shadow': 'rgba(234, 88, 12, 0.18)', '--theme-shadow-soft': 'rgba(245, 158, 11, 0.22)',
                '--theme-nav-bg': 'rgba(255, 251, 245, 0.98)'
            },
            dark: {
                '--theme-primary': '#fb923c', '--theme-accent': '#fbbf24', '--theme-primary-dark': '#f97316',
                '--theme-primary-soft': '#3d2010', '--theme-primary-soft-2': '#1e1008',
                '--theme-bg': '#1a0f08', '--theme-bg-soft': '#241812', '--theme-card': '#241812',
                '--theme-text': '#fbe8d8', '--theme-text-muted': '#c9b0a0', '--theme-text-dim': '#a58a78', '--theme-text-faint': '#7d6858',
                '--theme-border': '#3a2015', '--theme-border-soft': '#2a1a10', '--theme-border-input': '#3a2015',
                '--theme-gradient': 'linear-gradient(45deg, #fb923c 0%, #fbbf24 100%)',
                '--theme-shadow': 'rgba(251, 146, 60, 0.3)', '--theme-shadow-soft': 'rgba(251, 191, 36, 0.22)',
                '--theme-nav-bg': 'rgba(26, 15, 8, 0.98)'
            }
        },
        glacier: {
            name: 'Glacier', sub: 'Clean · Sharp', emoji: '🧊',
            preview: { primary: '#67e8f9', gradient: 'linear-gradient(135deg, #67e8f9 0%, #bae6fd 100%)' },
            light: {
                '--theme-primary': '#0891b2', '--theme-accent': '#67e8f9', '--theme-primary-dark': '#0e7490',
                '--theme-primary-soft': '#e0f7fa', '--theme-primary-soft-2': '#f0fbfd',
                '--theme-bg': '#f8fdff', '--theme-bg-soft': '#effaff', '--theme-card': '#ffffff',
                '--theme-text': '#0f2a35', '--theme-text-muted': '#3d5c6a', '--theme-text-dim': '#6b8a99', '--theme-text-faint': '#a0bcc7',
                '--theme-border': '#d8f0f7', '--theme-border-soft': '#e8f7fb', '--theme-border-input': '#bfe6f0',
                '--theme-gradient': 'linear-gradient(45deg, #0891b2 0%, #67e8f9 100%)',
                '--theme-shadow': 'rgba(8, 145, 178, 0.15)', '--theme-shadow-soft': 'rgba(103, 232, 249, 0.22)',
                '--theme-nav-bg': 'rgba(248, 253, 255, 0.98)'
            },
            dark: {
                '--theme-primary': '#22d3ee', '--theme-accent': '#67e8f9', '--theme-primary-dark': '#06b6d4',
                '--theme-primary-soft': '#0f2a35', '--theme-primary-soft-2': '#08181e',
                '--theme-bg': '#061217', '--theme-bg-soft': '#0f1e24', '--theme-card': '#0f1e24',
                '--theme-text': '#e0f7fc', '--theme-text-muted': '#a0c4d0', '--theme-text-dim': '#7a9ca8', '--theme-text-faint': '#5a7c88',
                '--theme-border': '#1a3040', '--theme-border-soft': '#122028', '--theme-border-input': '#1a3040',
                '--theme-gradient': 'linear-gradient(45deg, #22d3ee 0%, #67e8f9 100%)',
                '--theme-shadow': 'rgba(34, 211, 238, 0.3)', '--theme-shadow-soft': 'rgba(103, 232, 249, 0.22)',
                '--theme-nav-bg': 'rgba(6, 18, 23, 0.98)'
            }
        },
        tropic: {
            name: 'Tropic', sub: 'Sunset · Island', emoji: '🌴',
            preview: { primary: '#f43f5e', gradient: 'linear-gradient(135deg, #f43f5e 0%, #fbbf24 100%)' },
            light: {
                '--theme-primary': '#f43f5e', '--theme-accent': '#fbbf24', '--theme-primary-dark': '#e11d48',
                '--theme-primary-soft': '#ffe4e6', '--theme-primary-soft-2': '#fff1f2',
                '--theme-bg': '#fffaf0', '--theme-bg-soft': '#fff5e6', '--theme-card': '#ffffff',
                '--theme-text': '#3a1f2b', '--theme-text-muted': '#6b4a50', '--theme-text-dim': '#9c7a80', '--theme-text-faint': '#c4a5aa',
                '--theme-border': '#ffe4d0', '--theme-border-soft': '#fff0e0', '--theme-border-input': '#fdd0b8',
                '--theme-gradient': 'linear-gradient(45deg, #f43f5e 0%, #fbbf24 100%)',
                '--theme-shadow': 'rgba(244, 63, 94, 0.18)', '--theme-shadow-soft': 'rgba(251, 191, 36, 0.22)',
                '--theme-nav-bg': 'rgba(255, 250, 240, 0.98)'
            },
            dark: {
                '--theme-primary': '#fb7185', '--theme-accent': '#fbbf24', '--theme-primary-dark': '#f43f5e',
                '--theme-primary-soft': '#3d1f2b', '--theme-primary-soft-2': '#1e0f15',
                '--theme-bg': '#1a0f10', '--theme-bg-soft': '#241818', '--theme-card': '#241818',
                '--theme-text': '#fbe5e8', '--theme-text-muted': '#c9a0a5', '--theme-text-dim': '#a57a82', '--theme-text-faint': '#7d5a62',
                '--theme-border': '#3a1f26', '--theme-border-soft': '#2a151b', '--theme-border-input': '#3a1f26',
                '--theme-gradient': 'linear-gradient(45deg, #fb7185 0%, #fbbf24 100%)',
                '--theme-shadow': 'rgba(251, 113, 133, 0.3)', '--theme-shadow-soft': 'rgba(251, 191, 36, 0.22)',
                '--theme-nav-bg': 'rgba(26, 15, 16, 0.98)'
            }
        },
        moonlit: {
            name: 'Moonlit', sub: 'Serene · Coastal', emoji: '🌙',
            preview: { primary: '#94a3b8', gradient: 'linear-gradient(135deg, #1e293b 0%, #94a3b8 50%, #e2e8f0 100%)' },
            light: {
                '--theme-primary': '#64748b', '--theme-accent': '#94a3b8', '--theme-primary-dark': '#475569',
                '--theme-primary-soft': '#e2e8f0', '--theme-primary-soft-2': '#f1f5f9',
                '--theme-bg': '#f8fafc', '--theme-bg-soft': '#f1f5f9', '--theme-card': '#ffffff',
                '--theme-text': '#1e293b', '--theme-text-muted': '#475569', '--theme-text-dim': '#94a3b8', '--theme-text-faint': '#cbd5e1',
                '--theme-border': '#e2e8f0', '--theme-border-soft': '#eef2f6', '--theme-border-input': '#cbd5e1',
                '--theme-gradient': 'linear-gradient(45deg, #64748b 0%, #94a3b8 100%)',
                '--theme-shadow': 'rgba(100, 116, 139, 0.15)', '--theme-shadow-soft': 'rgba(148, 163, 184, 0.22)',
                '--theme-nav-bg': 'rgba(248, 250, 252, 0.98)'
            },
            dark: {
                '--theme-primary': '#cbd5e1', '--theme-accent': '#e2e8f0', '--theme-primary-dark': '#94a3b8',
                '--theme-primary-soft': '#1e293b', '--theme-primary-soft-2': '#0f172a',
                '--theme-bg': '#0a1020', '--theme-bg-soft': '#141c30', '--theme-card': '#141c30',
                '--theme-text': '#e2e8f0', '--theme-text-muted': '#a0aec4', '--theme-text-dim': '#7a8aa0', '--theme-text-faint': '#5a6a80',
                '--theme-border': '#1f2a44', '--theme-border-soft': '#162036', '--theme-border-input': '#1f2a44',
                '--theme-gradient': 'linear-gradient(45deg, #cbd5e1 0%, #e2e8f0 100%)',
                '--theme-shadow': 'rgba(203, 213, 225, 0.25)', '--theme-shadow-soft': 'rgba(226, 232, 240, 0.18)',
                '--theme-nav-bg': 'rgba(10, 16, 32, 0.98)'
            }
        },
        aurora: {
            name: 'Aurora', sub: 'Alpine · Ethereal', emoji: '🌠',
            preview: { primary: '#34d399', gradient: 'linear-gradient(135deg, #0f172a 0%, #34d399 50%, #a78bfa 100%)' },
            light: {
                '--theme-primary': '#10b981', '--theme-accent': '#a78bfa', '--theme-primary-dark': '#059669',
                '--theme-primary-soft': '#0f2a25', '--theme-primary-soft-2': '#08181a',
                '--theme-bg': '#061414', '--theme-bg-soft': '#0f1e24', '--theme-card': '#0f1e24',
                '--theme-text': '#e0fff4', '--theme-text-muted': '#a0d4c4', '--theme-text-dim': '#7aa89c', '--theme-text-faint': '#5a7c72',
                '--theme-border': '#1a3028', '--theme-border-soft': '#122019', '--theme-border-input': '#1a3028',
                '--theme-gradient': 'linear-gradient(45deg, #10b981 0%, #a78bfa 100%)',
                '--theme-shadow': 'rgba(16, 185, 129, 0.3)', '--theme-shadow-soft': 'rgba(167, 139, 250, 0.25)',
                '--theme-nav-bg': 'rgba(6, 20, 20, 0.98)'
            },
            dark: {
                '--theme-primary': '#34d399', '--theme-accent': '#c4b5fd', '--theme-primary-dark': '#10b981',
                '--theme-primary-soft': '#0f2a25', '--theme-primary-soft-2': '#08181a',
                '--theme-bg': '#04100f', '--theme-bg-soft': '#0a1818', '--theme-card': '#0a1818',
                '--theme-text': '#e0fff4', '--theme-text-muted': '#a0d4c4', '--theme-text-dim': '#7aa89c', '--theme-text-faint': '#5a7c72',
                '--theme-border': '#1a3028', '--theme-border-soft': '#122019', '--theme-border-input': '#1a3028',
                '--theme-gradient': 'linear-gradient(45deg, #34d399 0%, #c4b5fd 100%)',
                '--theme-shadow': 'rgba(52, 211, 153, 0.4)', '--theme-shadow-soft': 'rgba(196, 181, 253, 0.3)',
                '--theme-nav-bg': 'rgba(4, 16, 15, 0.98)'
            }
        },
        matcha: {
            name: 'Matcha', sub: 'Zen · Balanced', emoji: '🍵',
            preview: { primary: '#84cc16', gradient: 'linear-gradient(135deg, #65a30d 0%, #a3e635 100%)' },
            light: {
                '--theme-primary': '#65a30d', '--theme-accent': '#a3e635', '--theme-primary-dark': '#4d7c0f',
                '--theme-primary-soft': '#ecfccb', '--theme-primary-soft-2': '#f7fee7',
                '--theme-bg': '#fefdf7', '--theme-bg-soft': '#f7f8ed', '--theme-card': '#ffffff',
                '--theme-text': '#1f2a0f', '--theme-text-muted': '#4a5c2a', '--theme-text-dim': '#7a8a5c', '--theme-text-faint': '#b5c096',
                '--theme-border': '#e8f0d0', '--theme-border-soft': '#f0f5e0', '--theme-border-input': '#d4e0a8',
                '--theme-gradient': 'linear-gradient(45deg, #65a30d 0%, #a3e635 100%)',
                '--theme-shadow': 'rgba(101, 163, 13, 0.15)', '--theme-shadow-soft': 'rgba(163, 230, 53, 0.22)',
                '--theme-nav-bg': 'rgba(254, 253, 247, 0.98)'
            },
            dark: {
                '--theme-primary': '#a3e635', '--theme-accent': '#bef264', '--theme-primary-dark': '#84cc16',
                '--theme-primary-soft': '#1a2810', '--theme-primary-soft-2': '#0d1a08',
                '--theme-bg': '#0a1408', '--theme-bg-soft': '#131f10', '--theme-card': '#131f10',
                '--theme-text': '#e8f7d9', '--theme-text-muted': '#a8c490', '--theme-text-dim': '#7a9c60', '--theme-text-faint': '#5a7c40',
                '--theme-border': '#1f3518', '--theme-border-soft': '#162510', '--theme-border-input': '#1f3518',
                '--theme-gradient': 'linear-gradient(45deg, #a3e635 0%, #bef264 100%)',
                '--theme-shadow': 'rgba(163, 230, 53, 0.3)', '--theme-shadow-soft': 'rgba(190, 242, 100, 0.22)',
                '--theme-nav-bg': 'rgba(10, 20, 8, 0.98)'
            }
        }
    };

    window.DEFAULT_THEME = { preset: 'ocean', mode: 'light' };
    window.selectedTheme = { ...window.DEFAULT_THEME };

    window.injectThemeShapes = function (presetKey) {
        const container = document.getElementById('themeBgShapes');
        if (!container) return;
        if (!presetKey || !window.THEME_SHAPES[presetKey]) {
            console.warn('injectThemeShapes: unknown preset "' + presetKey + '"');
            return;
        }
        if (container.dataset.activeTheme !== presetKey) {
            container.innerHTML = window.THEME_SHAPES[presetKey];
            container.dataset.activeTheme = presetKey;
        }
    };

    window.applyTheme = function (theme) {
        const safeTheme = (theme && typeof theme === 'object') ? theme : {};
        const presetKey = (safeTheme.preset && window.THEMES[safeTheme.preset])
            ? safeTheme.preset
            : window.DEFAULT_THEME.preset;
        const mode = safeTheme.mode === 'dark' ? 'dark' : 'light';
        const preset = window.THEMES[presetKey];
        const palette = preset[mode];
        const root = document.documentElement;
        Object.keys(palette).forEach(key => {
            root.style.setProperty(key, palette[key]);
        });
        root.setAttribute('data-timawa-theme', presetKey);
        root.setAttribute('data-timawa-mode', mode);
        window.injectThemeShapes(presetKey);
        let meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'theme-color';
            document.head.appendChild(meta);
        }
        meta.content = palette['--theme-bg'];
        window.selectedTheme = { preset: presetKey, mode };
    };

    window.readThemeFromStorage = function () {
        try {
            const raw = localStorage.getItem(window.THEME_STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (parsed && parsed.preset && window.THEMES[parsed.preset]) {
                return { preset: parsed.preset, mode: parsed.mode === 'dark' ? 'dark' : 'light' };
            }
        } catch (e) { /* ignore */ }
        return null;
    };

    window.persistThemeLocally = function (theme) {
        if (!theme || typeof theme !== 'object') return;
        if (!theme.preset || !window.THEMES[theme.preset]) return;
        try {
            localStorage.setItem(window.THEME_STORAGE_KEY, JSON.stringify({
                preset: theme.preset,
                mode: theme.mode === 'dark' ? 'dark' : 'light'
            }));
        } catch (e) { /* ignore */ }
    };

    window.broadcastThemeChange = function (theme) {
        if (!theme || typeof theme !== 'object') return;
        if (!theme.preset || !window.THEMES[theme.preset]) return;
        const safe = {
            preset: theme.preset,
            mode: theme.mode === 'dark' ? 'dark' : 'light'
        };
        try {
            if ('BroadcastChannel' in window) {
                const bc = new BroadcastChannel('timawa_theme_sync');
                bc.postMessage({ type: 'theme-change', theme: safe });
                bc.close();
            }
        } catch (e) { /* ignore */ }
        try {
            window.dispatchEvent(new CustomEvent(window.THEME_EVENT, { detail: safe }));
        } catch (e) { /* ignore */ }
    };

    (function bootTheme() {
        const cached = window.readThemeFromStorage();
        if (cached) window.selectedTheme = cached;
        window.applyTheme(window.selectedTheme);
    })();

    try {
        if ('BroadcastChannel' in window) {
            const bc = new BroadcastChannel('timawa_theme_sync');
            bc.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'theme-change' && event.data.theme) {
                    const incoming = event.data.theme;
                    if (!incoming.preset || !window.THEMES[incoming.preset]) return;
                    window.selectedTheme = {
                        preset: incoming.preset,
                        mode: incoming.mode === 'dark' ? 'dark' : 'light'
                    };
                    window.applyTheme(window.selectedTheme);
                    try {
                        localStorage.setItem(window.THEME_STORAGE_KEY, JSON.stringify(window.selectedTheme));
                    } catch (e) { /* ignore */ }
                }
            });
        }
    } catch (e) { /* ignore */ }

    function ensureShapesInjected() {
        const container = document.getElementById('themeBgShapes');
        if (!container) return;
        const currentPreset = document.documentElement.getAttribute('data-timawa-theme')
            || window.selectedTheme.preset
            || window.DEFAULT_THEME.preset;
        const currentMode = document.documentElement.getAttribute('data-timawa-mode')
            || window.selectedTheme.mode
            || window.DEFAULT_THEME.mode;
        container.dataset.activeTheme = '';
        window.applyTheme({ preset: currentPreset, mode: currentMode });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureShapesInjected);
    } else {
        ensureShapesInjected();
    }

    window.addEventListener('load', () => {
        setTimeout(ensureShapesInjected, 100);
    });
})();