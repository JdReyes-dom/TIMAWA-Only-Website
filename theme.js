/* ================================================================
   theme.js
   TIMAWA — Shared theme system
   Loaded SYNCHRONOUSLY in <head> after theme.css, before page render.

   ★ v8.1 ★ New scenes: Rainy "Porch", Spring "Picnic", Moonlit "Late Night Street", Nebula "Orbit Diner";
           Starry constellations now fade in/out in turn; Sakura tree is rooted on the bank.
   ★ v8.5 ★ Ember room, Glacier extras, Spring hills on mobile, Summer funfair, richer Rainy interior, Big Ben clock, cheerful Winter, fuller Aurora.
   ★ v8.4 ★ Fixes: Nebula planet/UFO motion + milkshake on counter, Ember mug on a table, Aurora/Winter mountains no longer cut off,
           Spring apple tree, Xmas cookies & milk on a table, grounded Big Ben, Rainy = modern home with a glass wall.
   ★ v8 ★  Desktop lag fix: cursor is now a native OS cursor (zero JS per move, never lags while dragging);
           performance tiers + frame-time governor (see perfHooks). Palettes and scenes unchanged.
   ★ v7 ★ Cozy "places" for forest / sunshine / starry / sakura / nebula / ember / autumn / tropic / moonlit / aurora (mobile-tuned),
   NEW themes: spring, summer, rainy, winter (Seasons) + xmas, halloween, easter, newyear (Holidays),
   THEME_GROUPS for the picker, and a rewritten smooth cursor engine (see cursorKit). Existing palettes unchanged.
   ★ v6.3 ★ Crimson = "Rose Park" (was Velvet Theatre), Maroon = "Wine Bar" (was Wine Cellar).
   EVERY theme now has its own unique animated cursor (THEME_CURSORS), and the cursor engine is
   zero-latency: the dot sits exactly on the pointer hotspot, the icon rides beside it (no easing).
   ★ v6.2 ★ Blossom = "Flower Conservatory" (places, like Café). Themed animated cursor
   (THEME_CURSORS + cursorKit; styles in theme.css).
   ★ v6.1 ★ NEW scenes for Blossom ("Bloom"), Sunshine ("Golden Hour") and Café ("Cozy Corner").
   Palettes unchanged; only their `sub` taglines were reworded.
   ★ v6 ★ Matches theme.css (modern depth layer: atmosphere, particles, colour grade).
   - NEW: soft scene cross-fade on theme switch, color-scheme sync, stricter lite-mode detection.
   ★ v5 ★ Matches theme.css.
   - THEME_SHAPES: every theme is a new scene, except forest / sakura / aurora
     (same concept, upgraded). Shapes are plain divs + tiny inline SVG.
   - Palettes (THEMES.light / THEMES.dark) are UNCHANGED; only the short `sub`
     taglines were reworded to describe the new scenes.
   - NEW (perf): animations pause while the tab is hidden (html[data-tw-paused])
     and are switched off on low-end / data-saver devices (html[data-tw-lite]).
   - applyTheme, storage, sync: UNCHANGED.
   ================================================================ */

(function () {
    'use strict';

    window.THEME_STORAGE_KEY = 'timawa_theme';
    window.THEME_EVENT = 'timawa-theme-change';

    // ★ v6.3/v7 — one unique themed cursor per theme (v7 adds xmas / halloween / easter / spring / summer / winter / newyear / rainy) (styled by theme.css "THEMED CURSOR")
    // ocean = whale + spout; sunset = setting sun; pink = conservatory flower; forest = pine + fireflies; sunshine = sun; starry = sparkle; cafe = coffee mug; crimson = rose; maroon = wine glass; sakura = cherry blossom; nebula = ringed planet; ember = paper lantern; autumn = maple leaf; glacier = snowflake; tropic = palm tree; moonlit = crescent moon; aurora = aurora ribbons; matcha = matcha bowl
    window.THEME_CURSORS = {
        ocean: '<svg viewBox="0 0 34 34"><g class="spt"><path class="k1" d="M13 12V7M13 7Q10.5 4.5 8.5 6.5M13 7Q15.5 4.5 17.5 6.5"/></g><g class="bob"><path class="f1 o2" d="M3 22C3 15 10 12 18 13.6C23 14.6 25 18.4 31 16.4C31.6 21 29.6 25 25 26.6C19 29 6 28.6 3 22Z"/><path class="fw" opacity=".55" d="M6 24.4C12 27 20 26.8 25 25L24 26.6C19 28.6 9 28 6 24.4Z"/><circle class="f2" cx="9.5" cy="20.4" r="1.4"/></g></svg>',
        sunset: '<svg viewBox="0 0 34 34"><g class="ry"><path class="k1" d="M29.5 22H33M27.8 15.8L30.9 14M23.3 11.2L25 8.1M17 9.5V6M10.7 11.2L9 8.1M6.2 15.8L3.1 14M4.5 22H1"/></g><path class="f1 o2" d="M6 23A11 11 0 0 1 28 23Z"/><path class="k2" d="M2 26.5H32M7 30.5H27"/></svg>',
        pink: '<svg viewBox="0 0 34 34"><g class="spin"><g class="pet"><ellipse cx="17" cy="9" rx="4.6" ry="6.4" transform="rotate(0 17 17)"/><ellipse cx="17" cy="9" rx="4.6" ry="6.4" transform="rotate(60 17 17)"/><ellipse cx="17" cy="9" rx="4.6" ry="6.4" transform="rotate(120 17 17)"/><ellipse cx="17" cy="9" rx="4.6" ry="6.4" transform="rotate(180 17 17)"/><ellipse cx="17" cy="9" rx="4.6" ry="6.4" transform="rotate(240 17 17)"/><ellipse cx="17" cy="9" rx="4.6" ry="6.4" transform="rotate(300 17 17)"/></g><circle class="ct" cx="17" cy="17" r="3.8"/></g><circle class="tw" cx="30" cy="6" r="1.7"/><circle class="tw d" cx="4" cy="29" r="1.3"/></svg>',
        forest: '<svg viewBox="0 0 34 34"><g class="tsw"><rect class="f2" x="15" y="27" width="4" height="5" rx="1"/><path class="f1 o2" d="M17 2L24 12H20.5L26.5 20H21.5L28 28H6L12.5 20H7.5L13.5 12H10Z"/></g><circle class="fy stw" cx="29" cy="8" r="1.8"/><circle class="fy stw d" cx="5" cy="13" r="1.4"/></svg>',
        sunshine: '<svg viewBox="0 0 34 34"><g class="spin"><path class="k1" d="M27 17H31.5M24.07 9.93L27.26 6.74M17 7V2.5M9.93 9.93L6.74 6.74M7 17H2.5M9.93 24.07L6.74 27.26M17 27V31.5M24.07 24.07L27.26 27.26"/></g><circle class="f1 o2" cx="17" cy="17" r="6.5"/><circle class="fy" cx="17" cy="17" r="3"/></svg>',
        starry: '<svg viewBox="0 0 34 34"><path class="f1 ow sp1" d="M17 2Q18.4 15.6 32 17Q18.4 18.4 17 32Q15.6 18.4 2 17Q15.6 15.6 17 2Z"/><path class="fw stw" d="M28 3Q28.4 6.6 32 7Q28.4 7.4 28 11Q27.6 7.4 24 7Q27.6 6.6 28 3Z"/><path class="fw stw d" d="M6 24Q6.3 26.7 9 27Q6.3 27.3 6 30Q5.7 27.3 3 27Q5.7 26.7 6 24Z"/></svg>',
        cafe: '<svg viewBox="0 0 34 34"><g class="steam"><path d="M11 12C8 9 14 7 11 3"/><path d="M17 12C14 9 20 7 17 3"/><path d="M23 12C20 9 26 7 23 3"/></g><path class="hd" d="M25 18H27.5Q31.5 18 31.5 22T27.5 26H24"/><path class="bd" d="M5 15H26V23C26 28 22.5 31.5 15.5 31.5S5 28 5 23Z"/><ellipse class="cf" cx="15.5" cy="15" rx="10.5" ry="2.6"/><path class="ht" d="M15.5 25C11 22 12 19 14 19.5C15 19.8 15.5 20.6 15.5 20.6S16 19.8 17 19.5C19 19 20 22 15.5 25Z"/></svg>',
        crimson: '<svg viewBox="0 0 34 34"><ellipse class="fg o2" cx="8" cy="27" rx="6" ry="3" transform="rotate(-28 8 27)"/><ellipse class="fg o2" cx="26" cy="27" rx="6" ry="3" transform="rotate(28 26 27)"/><g class="rb"><circle class="f1 o2" cx="17.00" cy="8.00" r="6.2"/><circle class="f1 o2" cx="23.66" cy="12.84" r="6.2"/><circle class="f1 o2" cx="21.11" cy="20.66" r="6.2"/><circle class="f1 o2" cx="12.89" cy="20.66" r="6.2"/><circle class="f1 o2" cx="10.34" cy="12.84" r="6.2"/><circle class="f2 o2" cx="17" cy="15" r="6.4"/><circle class="f1 o2" cx="17" cy="15" r="3.8"/><path class="kt" d="M14.6 15.4Q15 12.6 17.8 13Q20 14 19 16.6Q17.4 18 15.4 17"/></g><ellipse class="f1 fp" cx="29" cy="5" rx="2.2" ry="1.4"/></svg>',
        maroon: '<svg viewBox="0 0 34 34"><defs><clipPath id="twcWine"><path d="M9 4H25C25 14.5 22 20.5 17 20.5S9 14.5 9 4Z"/></clipPath></defs><path class="gg" d="M9 4H25C25 14.5 22 20.5 17 20.5S9 14.5 9 4Z"/><g clip-path="url(#twcWine)"><g class="slosh"><path class="wn" d="M4 10Q10.5 7 17 10T30 10V26H4Z"/></g></g><path class="gb" d="M9 4H25C25 14.5 22 20.5 17 20.5S9 14.5 9 4Z"/><path class="gs" d="M17 20.5V29.5M11 30.5H23"/><circle class="tw" cx="29" cy="5" r="1.6"/><path class="hl" d="M12 6Q12.5 12 15 16"/></svg>',
        sakura: '<svg viewBox="0 0 34 34"><g class="sk"><path class="f1 ow" transform="rotate(0 17 17)" d="M17 17C11.6 12.6 11 5.6 14.6 4L17 6.6L19.4 4C23 5.6 22.4 12.6 17 17Z"/><path class="f1 ow" transform="rotate(72 17 17)" d="M17 17C11.6 12.6 11 5.6 14.6 4L17 6.6L19.4 4C23 5.6 22.4 12.6 17 17Z"/><path class="f1 ow" transform="rotate(144 17 17)" d="M17 17C11.6 12.6 11 5.6 14.6 4L17 6.6L19.4 4C23 5.6 22.4 12.6 17 17Z"/><path class="f1 ow" transform="rotate(216 17 17)" d="M17 17C11.6 12.6 11 5.6 14.6 4L17 6.6L19.4 4C23 5.6 22.4 12.6 17 17Z"/><path class="f1 ow" transform="rotate(288 17 17)" d="M17 17C11.6 12.6 11 5.6 14.6 4L17 6.6L19.4 4C23 5.6 22.4 12.6 17 17Z"/><circle class="fy" cx="17" cy="17" r="2.2"/></g><ellipse class="f1 fp" cx="29" cy="5" rx="2" ry="1.3"/></svg>',
        nebula: '<svg viewBox="0 0 34 34"><circle class="f1 o2" cx="17" cy="17" r="8"/><path class="fw" opacity=".3" d="M11 13.5A8 8 0 0 1 20 9.2Q13 11 11 13.5Z"/><ellipse class="ko" cx="17" cy="17" rx="15" ry="5" transform="rotate(-22 17 17)"/><g class="orb"><circle class="fa" cx="17" cy="1.8" r="1.8"/></g></svg>',
        ember: '<svg viewBox="0 0 34 34"><circle class="gwl" cx="17" cy="16" r="15"/><path class="k2" d="M17 1V5"/><g class="lsw"><rect class="fo o2" x="11" y="4.6" width="12" height="3.4" rx="1"/><ellipse class="f1 o2" cx="17" cy="16" rx="10" ry="8.6"/><path class="kt" d="M17 7.4C12.4 11 12.4 21 17 24.6M17 7.4C21.6 11 21.6 21 17 24.6M8 16H26"/><rect class="fo o2" x="11" y="24" width="12" height="3.4" rx="1"/><path class="k1" d="M17 27.4V31"/><circle class="fy" cx="17" cy="31.6" r="1.6"/></g></svg>',
        autumn: '<svg viewBox="0 0 34 34"><g class="lfs"><path class="f1 o2" d="M17 2L19.8 8.5L24.5 6.5L23.3 13L29.5 11.5L26 17.5L30 20L22 22L22.3 24.5L17.8 23.5V31H16.2V23.5L11.7 24.5L12 22L4 20L8 17.5L4.5 11.5L10.7 13L9.5 6.5L14.2 8.5Z"/><path class="kt" d="M17 24V9M17 18L11 14M17 18L23 14M17 21L9 20M17 21L25 20"/></g></svg>',
        glacier: '<svg viewBox="0 0 34 34"><g class="spin"><path class="k1" transform="rotate(0 17 17)" d="M17 3V31M12.5 7.5L17 12L21.5 7.5M12.5 26.5L17 22L21.5 26.5"/><path class="k1" transform="rotate(60 17 17)" d="M17 3V31M12.5 7.5L17 12L21.5 7.5M12.5 26.5L17 22L21.5 26.5"/><path class="k1" transform="rotate(120 17 17)" d="M17 3V31M12.5 7.5L17 12L21.5 7.5M12.5 26.5L17 22L21.5 26.5"/><circle class="fw o2" cx="17" cy="17" r="2.4"/></g></svg>',
        tropic: '<svg viewBox="0 0 34 34"><path class="tk" d="M15.6 32Q19 23 17 14"/><g class="psw"><path class="fgn o2" d="M17 14C12.5 5 5.5 5.5 2.5 10C8.5 8.4 13.5 10.4 17 14Z"/><path class="fgn o2" d="M17 14C21.5 5 28.5 5.5 31.5 10C25.5 8.4 20.5 10.4 17 14Z"/><path class="fgn o2" d="M17 14C14 7 15.4 3 17 1.5C18.6 3 20 7 17 14Z"/><path class="fgn o2" d="M17 14C10 12.6 6 16.6 5 21C9.4 17.2 13 16 17 14Z"/><path class="fgn o2" d="M17 14C24 12.6 28 16.6 29 21C24.6 17.2 21 16 17 14Z"/><circle class="fb" cx="15.4" cy="15.6" r="1.7"/><circle class="fb" cx="18.8" cy="16" r="1.7"/></g></svg>',
        moonlit: '<svg viewBox="0 0 34 34"><defs><mask id="twcMoon"><rect width="34" height="34" fill="#fff"/><circle cx="23.5" cy="12" r="10.5" fill="#000"/></mask></defs><g class="bob"><circle class="f1" cx="15" cy="18" r="13" mask="url(#twcMoon)"/></g><path class="fy stw" d="M24 7Q24.4 10.6 28 11Q24.4 11.4 24 15Q23.6 11.4 20 11Q23.6 10.6 24 7Z"/><circle class="fy stw d" cx="30" cy="26" r="1.3"/></svg>',
        aurora: '<svg viewBox="0 0 34 34"><path class="wv k1" d="M2 11Q9.5 3 17 11T32 11"/><path class="wv ka w2" d="M2 18Q9.5 10 17 18T32 18"/><path class="wv k1 w3" d="M2 25Q9.5 17 17 25T32 25"/><circle class="fw stw" cx="28" cy="4" r="1.1"/><circle class="fw stw d" cx="5" cy="31" r="1"/></svg>',
        xmas: '<svg viewBox="0 0 34 34"><g class="tsw"><path class="fg o2" d="M17 6L25 16H21L28 26H6L13 16H9Z"/><rect class="f2" x="15" y="26" width="4" height="6" rx="1"/><circle class="f1" cx="14" cy="21" r="1.7"/><circle class="fy stw" cx="20" cy="17" r="1.5"/></g><path class="fy stw" d="M17 0L18.3 3.4L22 3.6L19 5.8L20 9.4L17 7.3L14 9.4L15 5.8L12 3.6L15.7 3.4Z"/></svg>',
        halloween: '<svg viewBox="0 0 34 34"><g class="bob"><path class="f1 o2" d="M17 8C8 6 2 12 3 20C4 28 11 31 17 30C23 31 30 28 31 20C32 12 26 6 17 8Z"/><path class="kt" d="M17 8C13 12 13 26 17 30M17 8C21 12 21 26 17 30"/><path class="fg" d="M16 8Q16 3 20 2L21 4Q18 5 18 8Z"/><g class="ry"><path class="fy" d="M9 17L13 13L15 18ZM19 18L21 13L25 17Z"/><path class="fy" d="M10 22Q17 28 24 22L21 25L19 23L17 26L15 23L13 25Z"/></g></g></svg>',
        easter: '<svg viewBox="0 0 34 34"><g class="bob"><path class="f1 o2" d="M17 3C9 3 5 15 5 21C5 28 10 32 17 32S29 28 29 21C29 15 25 3 17 3Z"/><path class="fw" opacity=".85" d="M5.5 18L10 22L14 18L19 22L24 18L28.5 22V25L24 21L19 25L14 21L10 25L5.5 21Z"/><circle class="fy" cx="12" cy="12" r="1.8"/><circle class="fy" cx="22" cy="11" r="1.6"/></g><circle class="tw" cx="30" cy="5" r="1.7"/></svg>',
        spring: '<svg viewBox="0 0 34 34"><g class="tsw"><path class="k2" d="M17 14V32"/><path class="fg" d="M17 27C10 25 8 19 8 17C14 18 17 22 17 27Z"/><path class="fg" d="M17 29C24 27 26 22 26 20C20 21 17 25 17 29Z"/><path class="f1 o2" d="M9 5L12 13Q17 17 22 13L25 5L21 8L17 2L13 8Z"/></g><ellipse class="fa fp" cx="28" cy="6" rx="1.4" ry="2"/></svg>',
        summer: '<svg viewBox="0 0 34 34"><g class="bob"><path class="fo o2" d="M10 17L17 33L24 17Z"/><path class="kt" d="M12 21L19 24M14 26L20 21"/><circle class="f1 o2" cx="17" cy="14" r="8"/><circle class="fw o2" cx="17" cy="7.5" r="5.5"/><circle class="f2" cx="17" cy="2.6" r="1.6"/></g><circle class="fy stw" cx="30" cy="6" r="1.8"/><circle class="fy stw d" cx="4" cy="28" r="1.4"/></svg>',
        winter: '<svg viewBox="0 0 34 34"><g class="bob"><circle class="fw o2" cx="17" cy="25" r="8"/><circle class="fw o2" cx="17" cy="13" r="6"/><path class="f1" d="M10.5 18.5H23.5L22.6 21.6H11.4Z"/><path class="fo" d="M18 13L25 14.2L18 15.4Z"/><circle cx="15" cy="11.5" r="1" fill="#222"/><circle cx="19" cy="11.5" r="1" fill="#222"/><path class="f2" d="M12 8H22L21 5H13Z"/></g><circle class="tw" cx="29" cy="5" r="1.7"/><circle class="tw d" cx="4" cy="12" r="1.3"/></svg>',
        newyear: '<svg viewBox="0 0 34 34"><g class="spin"><path class="k1" d="M17 3V10M17 24V31M3 17H10M24 17H31M7 7L12 12M22 22L27 27M27 7L22 12M12 22L7 27"/></g><circle class="fy" cx="17" cy="17" r="3.2"/><circle class="tw" cx="29" cy="29" r="1.7"/><circle class="tw d" cx="5" cy="4" r="1.3"/></svg>',
        rainy: '<svg viewBox="0 0 34 34"><g class="tsw"><path class="f1 o2" d="M3 17C3 8 10 3 17 3S31 8 31 17Q28 14 24.5 17Q21 14 17 17Q13 14 9.5 17Q6 14 3 17Z"/><path class="k2" d="M17 17V27Q17 31 13 31"/></g><ellipse class="fa fp" cx="27" cy="6" rx="1.3" ry="2"/><ellipse class="fa fp" style="animation-delay:-1.4s" cx="6" cy="8" rx="1.3" ry="2"/></svg>',
        matcha: '<svg viewBox="0 0 34 34"><g class="steam"><path d="M12 11C9.6 8.6 14 7.2 12 4"/><path d="M19 11C16.6 8.6 21 7.2 19 4"/></g><path class="bowl o2" d="M4 15H30C30 24.6 24.6 29.6 17 29.6S4 24.6 4 15Z"/><ellipse class="f1 o2" cx="17" cy="15" rx="13" ry="3.2"/><circle class="fw" opacity=".6" cx="11" cy="15.2" r="1"/><circle class="fw" opacity=".6" cx="17.5" cy="16" r="1.3"/><circle class="fw" opacity=".6" cx="23" cy="14.8" r=".9"/><path class="f2" d="M12.5 29.5H21.5V32H12.5Z"/></svg>'
    };

    window.THEME_SHAPES = {

        // ★ OCEAN — "Deep Dive"
        ocean: `
<div class="shape oc-rays"></div><div class="shape oc-whale"><svg viewBox="0 0 400 170"><path class="wb" d="M8 96C30 44 120 16 214 42C262 56 300 82 346 90C358 70 376 46 396 34C398 60 392 80 380 96C392 112 398 134 398 156C376 146 358 120 346 106C300 118 250 134 200 138C120 146 40 142 8 96Z"/><path class="wl" d="M20 104C80 126 180 134 250 126C290 120 320 108 346 106C310 118 250 140 190 142C110 146 44 134 20 104Z"/><path class="wb" d="M140 124C150 148 172 160 196 162C186 146 180 134 178 126Z"/><circle class="we" cx="48" cy="90" r="3.4"/></svg></div><svg class="shape oc-jelly opt" viewBox="0 0 60 110"><path d="M8 42C8 8 52 8 52 42Z"/><path class="t" d="M16 44C12 64 20 70 15 96M26 44C24 66 32 74 27 104M36 44C38 66 30 72 35 100M45 44C48 62 40 72 46 92"/></svg><div class="shape oc-bubbles"></div><svg class="shape oc-kelp k1" viewBox="0 0 100 300" preserveAspectRatio="xMinYMax meet"><path d="M22 300C8 250 36 214 20 168S34 88 24 30"/><path class="b" d="M50 300C40 262 64 232 52 190S62 120 54 84"/><path d="M76 300C68 270 84 248 76 214S84 170 80 150"/></svg><svg class="shape oc-kelp k2" viewBox="0 0 100 300" preserveAspectRatio="xMaxYMax meet"><path d="M30 300C20 262 44 230 32 192S44 124 36 90"/><path class="b" d="M62 300C52 250 80 214 64 164S74 78 66 36"/></svg><div class="shape oc-floor"></div>
        `,

        // ★ SUNSET — "Savanna Sunset"
        sunset: `
<div class="shape sy-glow"></div><div class="shape sy-sun"></div><svg class="shape sy-birds" viewBox="0 0 160 60"><path d="M4 20Q10 10 16 20Q22 10 28 20M44 8Q50 -2 56 8Q62 -2 68 8M70 34Q76 24 82 34Q88 24 94 34M104 16Q110 6 116 16Q122 6 128 16M130 42Q136 32 142 42Q148 32 154 42"/></svg><div class="shape sy-ground"></div><svg class="shape sy-tree t2" viewBox="0 0 160 124"><path d="M6 40Q30 20 80 24Q130 20 154 40Q120 52 80 46Q40 52 6 40ZM76 46Q80 74 70 120H88Q84 76 84 46ZM80 64Q60 54 38 46L36 50Q60 60 78 72Z"/></svg><svg class="shape sy-tree t1" viewBox="0 0 160 124"><path d="M6 40Q30 20 80 24Q130 20 154 40Q120 52 80 46Q40 52 6 40ZM76 46Q80 74 70 120H88Q84 76 84 46ZM80 64Q60 54 38 46L36 50Q60 60 78 72Z"/></svg><svg class="shape sy-tree t3 opt" viewBox="0 0 160 124"><path d="M6 40Q30 20 80 24Q130 20 154 40Q120 52 80 46Q40 52 6 40ZM76 46Q80 74 70 120H88Q84 76 84 46ZM80 64Q60 54 38 46L36 50Q60 60 78 72Z"/></svg><div class="shape sy-grass"></div>
        `,

        // ★ PINK — "Flower Conservatory" (glazed arches, hanging baskets, potted flowers, tiled floor; light shafts = ::before, petals = ::after)
        pink: `
<svg class="shape bl-arch" viewBox="0 0 300 200" preserveAspectRatio="none"><path class="pn" d="M3 200V64C3 22 26 5 50 5S97 22 97 64V200Z"/><path class="fr" d="M3 200V64C3 22 26 5 50 5S97 22 97 64V200Z"/><path class="fr" d="M50 5V200M3 78H97M3 140H97"/><path class="pn" d="M103 200V64C103 22 126 5 150 5S197 22 197 64V200Z"/><path class="fr" d="M103 200V64C103 22 126 5 150 5S197 22 197 64V200Z"/><path class="fr" d="M150 5V200M103 78H197M103 140H197"/><path class="pn" d="M203 200V64C203 22 226 5 250 5S297 22 297 64V200Z"/><path class="fr" d="M203 200V64C203 22 226 5 250 5S297 22 297 64V200Z"/><path class="fr" d="M250 5V200M203 78H297M203 140H297"/></svg><svg class="shape bl-hang h1" viewBox="0 0 120 200"><path class="cd" d="M60 0V30M60 30L14 70M60 30L106 70"/><path class="vn" d="M22 104Q16 140 20 182M40 116Q36 148 40 172M82 116Q88 150 84 190M100 104Q106 134 102 168"/><g class="lf"><ellipse cx="19" cy="130" rx="8" ry="3.4" transform="rotate(-50 19 130)"/><ellipse cx="22" cy="156" rx="8" ry="3.4" transform="rotate(50 22 156)"/><ellipse cx="38" cy="140" rx="7" ry="3" transform="rotate(-50 38 140)"/><ellipse cx="86" cy="140" rx="8" ry="3.4" transform="rotate(50 86 140)"/><ellipse cx="87" cy="168" rx="8" ry="3.4" transform="rotate(-50 87 168)"/><ellipse cx="102" cy="150" rx="7" ry="3" transform="rotate(50 102 150)"/></g><circle class="f1" cx="20" cy="184" r="5"/><circle class="f3" cx="40" cy="174" r="4.2"/><circle class="f2" cx="84" cy="192" r="5"/><circle class="f1" cx="102" cy="170" r="4.2"/><path class="po" d="M8 68H112C112 106 88 128 60 128S8 106 8 68Z"/><path class="po2" d="M10 80Q60 92 110 80M14 94Q60 108 106 94M24 108Q60 120 96 108" fill="none"/><rect class="po2" x="5" y="64" width="110" height="9" rx="4"/><g class="lf"><ellipse cx="26" cy="62" rx="12" ry="5" transform="rotate(-25 26 62)"/><ellipse cx="94" cy="62" rx="12" ry="5" transform="rotate(25 94 62)"/><ellipse cx="60" cy="58" rx="10" ry="4"/></g><circle class="f1" cx="30" cy="54" r="14"/><circle class="f3" cx="90" cy="54" r="14"/><circle class="f2" cx="60" cy="44" r="16"/><circle class="f4" cx="44" cy="36" r="10"/><circle class="f1" cx="78" cy="34" r="10"/><circle class="fc" cx="60" cy="44" r="4.4"/><circle class="fc" cx="30" cy="54" r="3.4"/><circle class="fc" cx="90" cy="54" r="3.4"/></svg><svg class="shape bl-hang h2" viewBox="0 0 120 200"><path class="cd" d="M60 0V30M60 30L14 70M60 30L106 70"/><path class="vn" d="M22 104Q16 140 20 182M40 116Q36 148 40 172M82 116Q88 150 84 190M100 104Q106 134 102 168"/><g class="lf"><ellipse cx="19" cy="130" rx="8" ry="3.4" transform="rotate(-50 19 130)"/><ellipse cx="22" cy="156" rx="8" ry="3.4" transform="rotate(50 22 156)"/><ellipse cx="38" cy="140" rx="7" ry="3" transform="rotate(-50 38 140)"/><ellipse cx="86" cy="140" rx="8" ry="3.4" transform="rotate(50 86 140)"/><ellipse cx="87" cy="168" rx="8" ry="3.4" transform="rotate(-50 87 168)"/><ellipse cx="102" cy="150" rx="7" ry="3" transform="rotate(50 102 150)"/></g><circle class="f1" cx="20" cy="184" r="5"/><circle class="f3" cx="40" cy="174" r="4.2"/><circle class="f2" cx="84" cy="192" r="5"/><circle class="f1" cx="102" cy="170" r="4.2"/><path class="po" d="M8 68H112C112 106 88 128 60 128S8 106 8 68Z"/><path class="po2" d="M10 80Q60 92 110 80M14 94Q60 108 106 94M24 108Q60 120 96 108" fill="none"/><rect class="po2" x="5" y="64" width="110" height="9" rx="4"/><g class="lf"><ellipse cx="26" cy="62" rx="12" ry="5" transform="rotate(-25 26 62)"/><ellipse cx="94" cy="62" rx="12" ry="5" transform="rotate(25 94 62)"/><ellipse cx="60" cy="58" rx="10" ry="4"/></g><circle class="f1" cx="30" cy="54" r="14"/><circle class="f3" cx="90" cy="54" r="14"/><circle class="f2" cx="60" cy="44" r="16"/><circle class="f4" cx="44" cy="36" r="10"/><circle class="f1" cx="78" cy="34" r="10"/><circle class="fc" cx="60" cy="44" r="4.4"/><circle class="fc" cx="30" cy="54" r="3.4"/><circle class="fc" cx="90" cy="54" r="3.4"/></svg><svg class="shape bl-hang h3 opt" viewBox="0 0 120 200"><path class="cd" d="M60 0V30M60 30L14 70M60 30L106 70"/><path class="vn" d="M22 104Q16 140 20 182M40 116Q36 148 40 172M82 116Q88 150 84 190M100 104Q106 134 102 168"/><g class="lf"><ellipse cx="19" cy="130" rx="8" ry="3.4" transform="rotate(-50 19 130)"/><ellipse cx="22" cy="156" rx="8" ry="3.4" transform="rotate(50 22 156)"/><ellipse cx="38" cy="140" rx="7" ry="3" transform="rotate(-50 38 140)"/><ellipse cx="86" cy="140" rx="8" ry="3.4" transform="rotate(50 86 140)"/><ellipse cx="87" cy="168" rx="8" ry="3.4" transform="rotate(-50 87 168)"/><ellipse cx="102" cy="150" rx="7" ry="3" transform="rotate(50 102 150)"/></g><circle class="f1" cx="20" cy="184" r="5"/><circle class="f3" cx="40" cy="174" r="4.2"/><circle class="f2" cx="84" cy="192" r="5"/><circle class="f1" cx="102" cy="170" r="4.2"/><path class="po" d="M8 68H112C112 106 88 128 60 128S8 106 8 68Z"/><path class="po2" d="M10 80Q60 92 110 80M14 94Q60 108 106 94M24 108Q60 120 96 108" fill="none"/><rect class="po2" x="5" y="64" width="110" height="9" rx="4"/><g class="lf"><ellipse cx="26" cy="62" rx="12" ry="5" transform="rotate(-25 26 62)"/><ellipse cx="94" cy="62" rx="12" ry="5" transform="rotate(25 94 62)"/><ellipse cx="60" cy="58" rx="10" ry="4"/></g><circle class="f1" cx="30" cy="54" r="14"/><circle class="f3" cx="90" cy="54" r="14"/><circle class="f2" cx="60" cy="44" r="16"/><circle class="f4" cx="44" cy="36" r="10"/><circle class="f1" cx="78" cy="34" r="10"/><circle class="fc" cx="60" cy="44" r="4.4"/><circle class="fc" cx="30" cy="54" r="3.4"/><circle class="fc" cx="90" cy="54" r="3.4"/></svg><svg class="shape bl-pots l" viewBox="0 0 260 200"><g class="lf2"><path d="M75 146Q70 108 74 74"/><path d="M70 146Q54 120 46 98"/><path d="M80 146Q96 120 104 96"/><path d="M151 154Q148 120 150 92"/><path d="M146 155Q132 130 128 108"/><path d="M156 155Q170 128 174 106"/><path d="M214 168Q206 142 206 116"/><path d="M220 168Q228 134 226 102"/></g><g class="lf"><ellipse cx="62" cy="120" rx="12" ry="4.6" transform="rotate(-35 62 120)"/><ellipse cx="90" cy="118" rx="12" ry="4.6" transform="rotate(35 90 118)"/><ellipse cx="72" cy="100" rx="10" ry="4" transform="rotate(-20 72 100)"/><path d="M151 158Q130 142 124 124Q146 134 151 158Z"/><path d="M151 158Q172 142 178 124Q156 134 151 158Z"/><ellipse cx="210" cy="140" rx="9" ry="3.6" transform="rotate(-40 210 140)"/><ellipse cx="224" cy="132" rx="9" ry="3.6" transform="rotate(40 224 132)"/></g><rect class="po2" x="40" y="142" width="70" height="11" rx="3"/><path class="po" d="M45 152H105L99 200H51Z"/><rect class="po2" x="124" y="152" width="58" height="10" rx="3"/><path class="po" d="M128 161H178L173 200H133Z"/><rect class="po2" x="194" y="166" width="44" height="9" rx="3"/><path class="po" d="M198 174H234L230 200H202Z"/><circle class="p1" cx="74" cy="70" r="21"/><circle class="p2" cx="74" cy="70" r="14.7"/><circle class="p3" cx="74" cy="70" r="8.4"/><circle class="p1" cx="45" cy="94" r="17"/><circle class="p2" cx="45" cy="94" r="11.9"/><circle class="p3" cx="45" cy="94" r="6.8"/><circle class="p1" cx="104" cy="92" r="17"/><circle class="p2" cx="104" cy="92" r="11.9"/><circle class="p3" cx="104" cy="92" r="6.8"/><path class="f1" transform="translate(150 92) rotate(0)" d="M0 0C-10 -2 -11 -18 -6 -27L-2 -19L0 -29L2 -19L6 -27C11 -18 10 -2 0 0Z"/><path class="f2" transform="translate(128 108) rotate(-14)" d="M0 0C-10 -2 -11 -18 -6 -27L-2 -19L0 -29L2 -19L6 -27C11 -18 10 -2 0 0Z"/><path class="f4" transform="translate(174 106) rotate(14)" d="M0 0C-10 -2 -11 -18 -6 -27L-2 -19L0 -29L2 -19L6 -27C11 -18 10 -2 0 0Z"/><g class="f2" transform="translate(206 114)"><ellipse rx="3.6" ry="8" cy="-8.5" transform="rotate(0)"/><ellipse rx="3.6" ry="8" cy="-8.5" transform="rotate(45)"/><ellipse rx="3.6" ry="8" cy="-8.5" transform="rotate(90)"/><ellipse rx="3.6" ry="8" cy="-8.5" transform="rotate(135)"/><ellipse rx="3.6" ry="8" cy="-8.5" transform="rotate(180)"/><ellipse rx="3.6" ry="8" cy="-8.5" transform="rotate(225)"/><ellipse rx="3.6" ry="8" cy="-8.5" transform="rotate(270)"/><ellipse rx="3.6" ry="8" cy="-8.5" transform="rotate(315)"/></g><circle class="fc" cx="206" cy="114" r="4.5"/><g class="f2" transform="translate(226 100)"><ellipse rx="3.1" ry="6.8" cy="-7.2" transform="rotate(0)"/><ellipse rx="3.1" ry="6.8" cy="-7.2" transform="rotate(45)"/><ellipse rx="3.1" ry="6.8" cy="-7.2" transform="rotate(90)"/><ellipse rx="3.1" ry="6.8" cy="-7.2" transform="rotate(135)"/><ellipse rx="3.1" ry="6.8" cy="-7.2" transform="rotate(180)"/><ellipse rx="3.1" ry="6.8" cy="-7.2" transform="rotate(225)"/><ellipse rx="3.1" ry="6.8" cy="-7.2" transform="rotate(270)"/><ellipse rx="3.1" ry="6.8" cy="-7.2" transform="rotate(315)"/></g><circle class="fc" cx="226" cy="100" r="3.8"/></svg><svg class="shape bl-pots r opt" viewBox="0 0 260 200"><g class="lf2"><path d="M75 146Q70 108 74 74"/><path d="M70 146Q54 120 46 98"/><path d="M80 146Q96 120 104 96"/><path d="M151 154Q148 120 150 92"/><path d="M146 155Q132 130 128 108"/><path d="M156 155Q170 128 174 106"/><path d="M214 168Q206 142 206 116"/><path d="M220 168Q228 134 226 102"/></g><g class="lf"><ellipse cx="62" cy="120" rx="12" ry="4.6" transform="rotate(-35 62 120)"/><ellipse cx="90" cy="118" rx="12" ry="4.6" transform="rotate(35 90 118)"/><ellipse cx="72" cy="100" rx="10" ry="4" transform="rotate(-20 72 100)"/><path d="M151 158Q130 142 124 124Q146 134 151 158Z"/><path d="M151 158Q172 142 178 124Q156 134 151 158Z"/><ellipse cx="210" cy="140" rx="9" ry="3.6" transform="rotate(-40 210 140)"/><ellipse cx="224" cy="132" rx="9" ry="3.6" transform="rotate(40 224 132)"/></g><rect class="po2" x="40" y="142" width="70" height="11" rx="3"/><path class="po" d="M45 152H105L99 200H51Z"/><rect class="po2" x="124" y="152" width="58" height="10" rx="3"/><path class="po" d="M128 161H178L173 200H133Z"/><rect class="po2" x="194" y="166" width="44" height="9" rx="3"/><path class="po" d="M198 174H234L230 200H202Z"/><circle class="p1" cx="74" cy="70" r="21"/><circle class="p2" cx="74" cy="70" r="14.7"/><circle class="p3" cx="74" cy="70" r="8.4"/><circle class="p1" cx="45" cy="94" r="17"/><circle class="p2" cx="45" cy="94" r="11.9"/><circle class="p3" cx="45" cy="94" r="6.8"/><circle class="p1" cx="104" cy="92" r="17"/><circle class="p2" cx="104" cy="92" r="11.9"/><circle class="p3" cx="104" cy="92" r="6.8"/><path class="f1" transform="translate(150 92) rotate(0)" d="M0 0C-10 -2 -11 -18 -6 -27L-2 -19L0 -29L2 -19L6 -27C11 -18 10 -2 0 0Z"/><path class="f2" transform="translate(128 108) rotate(-14)" d="M0 0C-10 -2 -11 -18 -6 -27L-2 -19L0 -29L2 -19L6 -27C11 -18 10 -2 0 0Z"/><path class="f4" transform="translate(174 106) rotate(14)" d="M0 0C-10 -2 -11 -18 -6 -27L-2 -19L0 -29L2 -19L6 -27C11 -18 10 -2 0 0Z"/><g class="f2" transform="translate(206 114)"><ellipse rx="3.6" ry="8" cy="-8.5" transform="rotate(0)"/><ellipse rx="3.6" ry="8" cy="-8.5" transform="rotate(45)"/><ellipse rx="3.6" ry="8" cy="-8.5" transform="rotate(90)"/><ellipse rx="3.6" ry="8" cy="-8.5" transform="rotate(135)"/><ellipse rx="3.6" ry="8" cy="-8.5" transform="rotate(180)"/><ellipse rx="3.6" ry="8" cy="-8.5" transform="rotate(225)"/><ellipse rx="3.6" ry="8" cy="-8.5" transform="rotate(270)"/><ellipse rx="3.6" ry="8" cy="-8.5" transform="rotate(315)"/></g><circle class="fc" cx="206" cy="114" r="4.5"/><g class="f2" transform="translate(226 100)"><ellipse rx="3.1" ry="6.8" cy="-7.2" transform="rotate(0)"/><ellipse rx="3.1" ry="6.8" cy="-7.2" transform="rotate(45)"/><ellipse rx="3.1" ry="6.8" cy="-7.2" transform="rotate(90)"/><ellipse rx="3.1" ry="6.8" cy="-7.2" transform="rotate(135)"/><ellipse rx="3.1" ry="6.8" cy="-7.2" transform="rotate(180)"/><ellipse rx="3.1" ry="6.8" cy="-7.2" transform="rotate(225)"/><ellipse rx="3.1" ry="6.8" cy="-7.2" transform="rotate(270)"/><ellipse rx="3.1" ry="6.8" cy="-7.2" transform="rotate(315)"/></g><circle class="fc" cx="226" cy="100" r="3.8"/></svg><div class="shape bl-floor"></div><svg class="shape bl-fly opt" viewBox="0 0 40 30"><g class="wg"><path class="w1" d="M20 15C14 2 2 2 3 11C4 18 14 19 20 15Z"/><path class="w1" d="M20 15C26 2 38 2 37 11C36 18 26 19 20 15Z"/><path class="w2" d="M20 16C13 18 6 24 10 28C14 30 19 24 20 16Z"/><path class="w2" d="M20 16C27 18 34 24 30 28C26 30 21 24 20 16Z"/></g><path class="bd" d="M20 10V24"/></svg>
        `,




        // ★ CAFE — "Cozy Corner" (lamps, string lights, shelf, counter, latte, sleeping cat; light spill = ::before)
        cafe: `
<div class="shape cf-panel"></div><div class="shape cf-lights"></div><svg class="shape cf-shelf opt" viewBox="0 0 240 150"><rect class="w" x="0" y="116" width="240" height="12" rx="3"/><path class="w" d="M20 128V146L44 128ZM196 128V146L220 128Z"/><rect x="14" y="52" width="17" height="64" rx="2" fill="#b5543c"/><rect x="33" y="64" width="14" height="52" rx="2" fill="#5f7f6a"/><rect x="49" y="46" width="18" height="70" rx="2" fill="#d9a441"/><rect x="69" y="60" width="13" height="56" rx="2" fill="#7a5a8c"/><rect x="86" y="56" width="13" height="60" rx="2" fill="#c97c5d" transform="rotate(-14 98 116)"/><path d="M152 116L188 116L182 88L158 88Z" fill="#c9784f"/><g fill="#5f9a5a"><ellipse cx="170" cy="62" rx="7" ry="24" transform="rotate(-24 170 88)"/><ellipse cx="170" cy="60" rx="7" ry="26"/><ellipse cx="170" cy="62" rx="7" ry="24" transform="rotate(26 170 88)"/><ellipse cx="170" cy="70" rx="6" ry="18" transform="rotate(52 170 88)" fill="#74b06b"/></g><rect x="204" y="98" width="22" height="18" rx="4" fill="#f3e9db"/><path d="M226 103H232C238 103 238 113 230 113H226" fill="none" stroke="#f3e9db" stroke-width="3"/></svg><div class="shape cf-lamp l1"></div><div class="shape cf-lamp l2 opt"></div><div class="shape cf-lamp l3"></div><div class="shape cf-counter"></div><svg class="shape cf-cat" viewBox="0 0 250 120"><path class="cu" d="M8 98C8 84 32 80 125 80C218 80 242 84 242 98C242 112 218 118 125 118C32 118 8 112 8 98Z"/><circle class="cu2" cx="125" cy="99" r="3"/><g class="b"><path class="tl" d="M208 90C238 88 240 62 214 56"/><path class="c" d="M34 90C34 56 82 40 134 46C188 52 220 70 214 90C206 96 64 98 34 90Z"/><path class="s" d="M104 47Q110 62 102 78M130 46Q136 62 128 80M156 49Q162 64 154 80M182 56Q186 68 180 82"/><path class="c" d="M44 56L42 32L62 48ZM72 48L88 32L84 58Z"/><circle class="c" cx="62" cy="72" r="24"/><ellipse class="c" cx="48" cy="92" rx="13" ry="7"/><ellipse class="c" cx="74" cy="94" rx="11" ry="6"/><path class="e" d="M50 72Q55 77 60 72M66 72Q71 77 76 72"/><path d="M60 80L65 80L62.5 83Z" fill="#d98a8a"/></g></svg><svg class="shape cf-mug" viewBox="0 0 230 130"><ellipse cx="52" cy="119" rx="48" ry="8" fill="#f3e9db"/><path d="M18 112C20 88 46 80 62 84C80 88 90 100 88 112C78 106 70 102 60 102C46 102 30 106 18 112Z" fill="#d79a4b"/><path d="M34 100L38 108M48 96L50 106M62 98L62 106M74 102L72 108" stroke="#a8692a" stroke-width="2" stroke-linecap="round" fill="none"/><ellipse cx="150" cy="120" rx="62" ry="9" fill="#f3e9db"/><path class="m" d="M104 52H196V88C196 108 182 118 150 118C118 118 104 108 104 88Z"/><path class="h" d="M196 62H208C226 62 226 98 204 98H196"/><ellipse class="c" cx="150" cy="52" rx="46" ry="9"/><path d="M140 52C140 47 148 47 150 51C152 47 160 47 160 52C160 56 150 60 150 60C150 60 140 56 140 52Z" fill="#f4e2c4" fill-opacity=".85"/><path d="M114 62V88" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/></svg><div class="shape cf-steam"></div>
        `,

        // ★ CRIMSON — "Rose Park" (rose arbour, flowering hedge, rose bushes, blossom trees, lamp posts, bench, stone path; petals = ::after)
        crimson: `
<svg class="shape" width="0" height="0" style="position:absolute"><defs><g id="rpRa" class="rr-a"><circle class="o" r="10"/><circle class="m" r="7"/><circle class="o" r="4.2"/><path class="v" d="M-3.5 .5Q-2 -4 2.5 -2.2Q4.5 1.5 0 3Q-3.5 3 -2.5 -.5"/></g><g id="rpRb" class="rr-b"><circle class="o" r="10"/><circle class="m" r="7"/><circle class="o" r="4.2"/><path class="v" d="M-3.5 .5Q-2 -4 2.5 -2.2Q4.5 1.5 0 3Q-3.5 3 -2.5 -.5"/></g><g id="rpRc" class="rr-c"><circle class="o" r="10"/><circle class="m" r="7"/><circle class="o" r="4.2"/><path class="v" d="M-3.5 .5Q-2 -4 2.5 -2.2Q4.5 1.5 0 3Q-3.5 3 -2.5 -.5"/></g><path id="rpL" d="M0 0C4 -6 12 -6 16 0C12 6 4 6 0 0Z"/></defs></svg><div class="shape rp-sun"></div><div class="shape rp-hill h1"></div><div class="shape rp-hill h2"></div><svg class="shape rp-tree t2" viewBox="0 0 120 170"><rect class="tk" x="54" y="96" width="12" height="74" rx="3"/><circle class="cn" cx="60" cy="58" r="44"/><circle class="cn" cx="32" cy="84" r="30"/><circle class="cn" cx="88" cy="84" r="30"/><circle class="cs" cx="70" cy="92" r="28"/><circle class="bl" cx="45" cy="50" r="3.6"/><circle class="bl" cx="78" cy="66" r="3.6"/><circle class="bl" cx="60" cy="84" r="3.6"/><circle class="bl" cx="34" cy="88" r="3.6"/><circle class="bl" cx="90" cy="92" r="3.6"/><circle class="bl" cx="70" cy="40" r="3.6"/></svg><svg class="shape rp-tree t1 opt" viewBox="0 0 120 170"><rect class="tk" x="54" y="96" width="12" height="74" rx="3"/><circle class="cn" cx="60" cy="58" r="44"/><circle class="cn" cx="32" cy="84" r="30"/><circle class="cn" cx="88" cy="84" r="30"/><circle class="cs" cx="70" cy="92" r="28"/><circle class="bl" cx="40" cy="46" r="3.6"/><circle class="bl" cx="82" cy="58" r="3.6"/><circle class="bl" cx="58" cy="80" r="3.6"/><circle class="bl" cx="30" cy="84" r="3.6"/><circle class="bl" cx="92" cy="90" r="3.6"/></svg><div class="shape rp-hedge"></div><div class="shape rp-ground"></div><div class="shape rp-path"></div><svg class="shape rp-lamp l2 opt" viewBox="0 0 60 260"><circle class="gw a" cx="30" cy="38" r="66"/><circle class="gw b" cx="30" cy="38" r="42"/><circle class="gw c" cx="30" cy="38" r="24"/><path class="ir" d="M30 2L17 16H43Z"/><path class="gl" d="M19 18H41L44 54H16Z"/><path class="ir2" d="M19 18L16 54M41 18L44 54M30 18V54"/><path class="ir" d="M14 54H46L42 62H18Z"/><rect class="ir" x="28.5" y="62" width="3" height="186"/><circle class="ir" cx="30" cy="68" r="3.4"/><path class="ir" d="M20 248H40L44 258H16Z"/></svg><svg class="shape rp-lamp l1" viewBox="0 0 60 260"><circle class="gw a" cx="30" cy="38" r="66"/><circle class="gw b" cx="30" cy="38" r="42"/><circle class="gw c" cx="30" cy="38" r="24"/><path class="ir" d="M30 2L17 16H43Z"/><path class="gl" d="M19 18H41L44 54H16Z"/><path class="ir2" d="M19 18L16 54M41 18L44 54M30 18V54"/><path class="ir" d="M14 54H46L42 62H18Z"/><rect class="ir" x="28.5" y="62" width="3" height="186"/><circle class="ir" cx="30" cy="68" r="3.4"/><path class="ir" d="M20 248H40L44 258H16Z"/></svg><svg class="shape rp-arb" viewBox="0 0 200 300"><rect class="pt" x="10" y="92" width="12" height="208" rx="2"/><rect class="pt" x="178" y="92" width="12" height="208" rx="2"/><path class="ar" d="M16 100C16 24 184 24 184 100"/><use href="#rpL" class="rp-lf" transform="translate(14 118) rotate(-70) scale(1)"/><use href="#rpL" class="rp-lf" transform="translate(22 150) rotate(20) scale(1)"/><use href="#rpL" class="rp-lf" transform="translate(12 176) rotate(-100) scale(1)"/><use href="#rpL" class="rp-lf" transform="translate(22 206) rotate(30) scale(1)"/><use href="#rpL" class="rp-lf" transform="translate(14 240) rotate(-80) scale(1)"/><use href="#rpL" class="rp-lf" transform="translate(30 78) rotate(-80) scale(1)"/><use href="#rpL" class="rp-lf" transform="translate(52 52) rotate(-50) scale(1)"/><use href="#rpL" class="rp-lf" transform="translate(86 36) rotate(-20) scale(1)"/><use href="#rpL" class="rp-lf" transform="translate(114 34) rotate(20) scale(1)"/><use href="#rpL" class="rp-lf" transform="translate(148 44) rotate(45) scale(1)"/><use href="#rpL" class="rp-lf" transform="translate(170 64) rotate(75) scale(1)"/><use href="#rpL" class="rp-lf" transform="translate(186 120) rotate(-110) scale(1)"/><use href="#rpL" class="rp-lf" transform="translate(178 160) rotate(-150) scale(1)"/><use href="#rpL" class="rp-lf" transform="translate(188 196) rotate(-80) scale(1)"/><use href="#rpL" class="rp-lf" transform="translate(176 230) rotate(-30) scale(1)"/><use href="#rpL" class="rp-lf" transform="translate(186 262) rotate(-100) scale(1)"/><use href="#rpRa" transform="translate(17 132) scale(1.1)"/><use href="#rpRb" transform="translate(19 196) scale(1)"/><use href="#rpRc" transform="translate(15 252) scale(0.95)"/><use href="#rpRb" transform="translate(34 70) scale(1)"/><use href="#rpRa" transform="translate(66 44) scale(1.15)"/><use href="#rpRc" transform="translate(100 32) scale(1.2)"/><use href="#rpRa" transform="translate(134 42) scale(1.1)"/><use href="#rpRb" transform="translate(166 66) scale(1)"/><use href="#rpRc" transform="translate(183 128) scale(1)"/><use href="#rpRa" transform="translate(181 190) scale(1.15)"/><use href="#rpRb" transform="translate(186 250) scale(1)"/></svg><svg class="shape rp-bench opt" viewBox="0 0 200 110"><rect class="bw" x="12" y="10" width="176" height="9" rx="3"/><rect class="bw" x="12" y="24" width="176" height="9" rx="3"/><rect class="bw" x="12" y="38" width="176" height="9" rx="3"/><rect class="bw2" x="6" y="58" width="188" height="9" rx="3"/><rect class="bw2" x="6" y="70" width="188" height="9" rx="3"/><path class="bi" d="M22 8V104M178 8V104M22 56Q6 56 6 44"/></svg><svg class="shape rp-bush b3 opt" viewBox="0 0 220 140"><circle class="bs" cx="48" cy="102" r="40"/><circle class="bs" cx="110" cy="84" r="50"/><circle class="bs" cx="172" cy="102" r="40"/><circle class="bs" cx="78" cy="120" r="30"/><circle class="bs" cx="142" cy="120" r="30"/><circle class="bs" cx="110" cy="118" r="36"/><ellipse class="bs2" cx="110" cy="134" rx="104" ry="12"/><use href="#rpL" class="rp-lf" transform="translate(18 96) rotate(-150) scale(1.1)"/><use href="#rpL" class="rp-lf" transform="translate(202 98) rotate(-30) scale(1.1)"/><use href="#rpRc" transform="translate(44 90) scale(1.1)"/><use href="#rpRa" transform="translate(82 60) scale(1.2)"/><use href="#rpRb" transform="translate(118 74) scale(1.2)"/><use href="#rpRb" transform="translate(150 56) scale(1.1)"/><use href="#rpRa" transform="translate(176 88) scale(1.1)"/><use href="#rpRb" transform="translate(64 112) scale(0.95)"/><use href="#rpRc" transform="translate(130 108) scale(1)"/><use href="#rpRa" transform="translate(102 40) scale(0.9)"/><use href="#rpRc" transform="translate(156 112) scale(0.95)"/></svg><svg class="shape rp-bush b1" viewBox="0 0 220 140"><circle class="bs" cx="48" cy="102" r="40"/><circle class="bs" cx="110" cy="84" r="50"/><circle class="bs" cx="172" cy="102" r="40"/><circle class="bs" cx="78" cy="120" r="30"/><circle class="bs" cx="142" cy="120" r="30"/><circle class="bs" cx="110" cy="118" r="36"/><ellipse class="bs2" cx="110" cy="134" rx="104" ry="12"/><use href="#rpL" class="rp-lf" transform="translate(18 96) rotate(-150) scale(1.1)"/><use href="#rpL" class="rp-lf" transform="translate(202 98) rotate(-30) scale(1.1)"/><use href="#rpRa" transform="translate(40 88) scale(1.1)"/><use href="#rpRb" transform="translate(80 62) scale(1.2)"/><use href="#rpRa" transform="translate(114 76) scale(1.25)"/><use href="#rpRc" transform="translate(146 54) scale(1.1)"/><use href="#rpRb" transform="translate(178 86) scale(1.1)"/><use href="#rpRc" transform="translate(62 110) scale(0.95)"/><use href="#rpRb" transform="translate(128 106) scale(1)"/><use href="#rpRc" transform="translate(100 42) scale(0.9)"/><use href="#rpRa" transform="translate(158 112) scale(0.95)"/><use href="#rpRb" transform="translate(22 112) scale(0.8)"/></svg><svg class="shape rp-bush b2" viewBox="0 0 220 140"><circle class="bs" cx="48" cy="102" r="40"/><circle class="bs" cx="110" cy="84" r="50"/><circle class="bs" cx="172" cy="102" r="40"/><circle class="bs" cx="78" cy="120" r="30"/><circle class="bs" cx="142" cy="120" r="30"/><circle class="bs" cx="110" cy="118" r="36"/><ellipse class="bs2" cx="110" cy="134" rx="104" ry="12"/><use href="#rpL" class="rp-lf" transform="translate(18 96) rotate(-150) scale(1.1)"/><use href="#rpL" class="rp-lf" transform="translate(202 98) rotate(-30) scale(1.1)"/><use href="#rpRb" transform="translate(36 92) scale(1.1)"/><use href="#rpRa" transform="translate(76 66) scale(1.2)"/><use href="#rpRc" transform="translate(112 80) scale(1.2)"/><use href="#rpRa" transform="translate(148 58) scale(1.1)"/><use href="#rpRc" transform="translate(180 90) scale(1.05)"/><use href="#rpRa" transform="translate(58 112) scale(0.95)"/><use href="#rpRa" transform="translate(130 108) scale(1)"/><use href="#rpRb" transform="translate(98 44) scale(0.9)"/><use href="#rpRb" transform="translate(160 114) scale(0.95)"/><use href="#rpRa" transform="translate(200 112) scale(0.8)"/></svg>
        `,

        // ★ MAROON — "Wine Bar" (brick wall, back-bar shelves of wine + a few spirits, pendant lamps, neon wine glass, wooden counter, stools; dust = ::after)
        maroon: `
<svg class="shape" width="0" height="0" style="position:absolute"><defs><g id="wbW"><path d="M-6 0V-31Q-6 -37 -2.3 -41V-53H2.3V-41Q6 -37 6 -31V0Z"/><rect class="wb-cap" x="-2.6" y="-55" width="5.2" height="9" rx="1"/><rect class="wb-lb" x="-6" y="-24" width="12" height="13"/><path class="wb-hl" d="M-4 -30V-4H-2.4V-30Z"/></g><g id="wbC"><path d="M-7 0V-26Q-7 -33 -3 -38V-52H3V-38Q7 -33 7 -26V0Z"/><rect class="wb-gold" x="-3.4" y="-53" width="6.8" height="15" rx="1"/><rect class="wb-lb" x="-7" y="-20" width="14" height="12"/><path class="wb-hl" d="M-5 -26V-3H-3.4V-26Z"/></g><g id="wbS"><path d="M-8 0V-27Q-8 -30 -5 -31V-36H5V-31Q8 -30 8 -27V0Z"/><rect class="wb-cork" x="-3.6" y="-41" width="7.2" height="6" rx="1"/><rect class="wb-lb" x="-8" y="-22" width="16" height="14"/><path class="wb-hl" d="M-6 -26V-3H-4.4V-26Z"/></g><g id="wbT"><path d="M-5 0V-34Q-5 -40 -2.4 -43V-56H2.4V-43Q5 -40 5 -34V0Z"/><rect class="wb-cork" x="-2.8" y="-60" width="5.6" height="5" rx="1"/><rect class="wb-lb" x="-5" y="-28" width="10" height="16"/><path class="wb-hl" d="M-3.6 -33V-3H-2.2V-33Z"/></g><g id="wbR"><path d="M-9 0V-20Q-9 -29 -3.4 -32V-44H3.4V-32Q9 -29 9 -20V0Z"/><rect class="wb-cork" x="-3.2" y="-48" width="6.4" height="5" rx="1"/><rect class="wb-lb" x="-9" y="-18" width="18" height="12"/><path class="wb-hl" d="M-7 -20V-3H-5.4V-20Z"/></g><g id="wbG"><path class="wb-gs" d="M-8 0H8M0 0V-10"/><path class="wb-gb" d="M-13 -46H13C13 -24 8 -10 0 -10S-13 -24 -13 -46Z"/><path class="wb-liq" d="M-11.6 -32H11.6C10.8 -20 7 -12.6 0 -12.6S-10.8 -20 -11.6 -32Z"/></g><g id="wbD"><path class="wb-gb" d="M-10 0H10L12 -26H-12Z"/><path class="wb-liq" d="M-10.4 -3H10.4L11.2 -15H-11.2Z"/><rect class="wb-cube" x="-6" y="-19" width="7" height="7" rx="1.4" transform="rotate(-12 -3 -15)"/></g></defs></svg><div class="shape wb-wall"></div><svg class="shape wb-shelf l" viewBox="0 0 300 230"><rect class="sp" x="6" y="0" width="288" height="220"/><rect class="sl" x="6" y="65" width="288" height="3"/><rect class="sl" x="6" y="135" width="288" height="3"/><rect class="sl" x="6" y="205" width="288" height="3"/><use href="#wbW" class="bw1" transform="translate(25 70)"/><use href="#wbW" class="bw2" transform="translate(50 70)"/><use href="#wbW" class="bw3" transform="translate(75 70)"/><use href="#wbW" class="bw1" transform="translate(100 70)"/><use href="#wbW" class="bw4" transform="translate(125 70)"/><use href="#wbW" class="bw2" transform="translate(150 70)"/><use href="#wbW" class="bw1" transform="translate(175 70)"/><use href="#wbW" class="bw3" transform="translate(200 70)"/><use href="#wbW" class="bw2" transform="translate(225 70)"/><use href="#wbW" class="bw1" transform="translate(250 70)"/><use href="#wbW" class="bw4" transform="translate(275 70)"/><use href="#wbW" class="bw2" transform="translate(25 140)"/><use href="#wbW" class="bw1" transform="translate(50 140)"/><use href="#wbW" class="bw3" transform="translate(75 140)"/><use href="#wbW" class="bw1" transform="translate(100 140)"/><use href="#wbC" class="bw4" transform="translate(125 140)"/><use href="#wbW" class="bw2" transform="translate(150 140)"/><use href="#wbW" class="bw1" transform="translate(175 140)"/><use href="#wbW" class="bw3" transform="translate(200 140)"/><use href="#wbW" class="bw1" transform="translate(225 140)"/><use href="#wbW" class="bw2" transform="translate(250 140)"/><use href="#wbW" class="bw3" transform="translate(275 140)"/><use href="#wbW" class="bw1" transform="translate(25 210)"/><use href="#wbW" class="bw3" transform="translate(50 210)"/><use href="#wbW" class="bw1" transform="translate(75 210)"/><use href="#wbS" class="bs1" transform="translate(100 210)"/><use href="#wbT" class="bs2" transform="translate(125 210)"/><use href="#wbR" class="bs5" transform="translate(150 210)"/><use href="#wbS" class="bs4" transform="translate(175 210)"/><use href="#wbT" class="bs3" transform="translate(200 210)"/><use href="#wbW" class="bw2" transform="translate(225 210)"/><use href="#wbW" class="bw1" transform="translate(250 210)"/><use href="#wbW" class="bw3" transform="translate(275 210)"/><rect class="sb" x="2" y="70" width="296" height="8" rx="2"/><rect class="sh" x="2" y="70" width="296" height="2"/><rect class="sb" x="2" y="140" width="296" height="8" rx="2"/><rect class="sh" x="2" y="140" width="296" height="2"/><rect class="sb" x="2" y="210" width="296" height="8" rx="2"/><rect class="sh" x="2" y="210" width="296" height="2"/><rect class="sf" x="0" y="0" width="7" height="232"/><rect class="sf" x="293" y="0" width="7" height="232"/><rect class="sf" x="0" y="0" width="300" height="6"/></svg><svg class="shape wb-shelf r" viewBox="0 0 300 230"><rect class="sp" x="6" y="0" width="288" height="220"/><rect class="sl" x="6" y="65" width="288" height="3"/><rect class="sl" x="6" y="135" width="288" height="3"/><rect class="sl" x="6" y="205" width="288" height="3"/><use href="#wbT" class="bs2" transform="translate(25 70)"/><use href="#wbS" class="bs1" transform="translate(50 70)"/><use href="#wbR" class="bs5" transform="translate(75 70)"/><use href="#wbT" class="bs3" transform="translate(100 70)"/><use href="#wbS" class="bs4" transform="translate(125 70)"/><use href="#wbR" class="bs6" transform="translate(150 70)"/><use href="#wbS" class="bs1" transform="translate(175 70)"/><use href="#wbW" class="bw1" transform="translate(200 70)"/><use href="#wbW" class="bw2" transform="translate(225 70)"/><use href="#wbW" class="bw3" transform="translate(250 70)"/><use href="#wbW" class="bw1" transform="translate(275 70)"/><use href="#wbW" class="bw1" transform="translate(25 140)"/><use href="#wbW" class="bw3" transform="translate(50 140)"/><use href="#wbW" class="bw2" transform="translate(75 140)"/><use href="#wbW" class="bw4" transform="translate(100 140)"/><use href="#wbW" class="bw1" transform="translate(125 140)"/><use href="#wbC" class="bw4" transform="translate(150 140)"/><use href="#wbW" class="bw2" transform="translate(175 140)"/><use href="#wbW" class="bw1" transform="translate(200 140)"/><use href="#wbW" class="bw3" transform="translate(225 140)"/><use href="#wbW" class="bw1" transform="translate(250 140)"/><use href="#wbW" class="bw2" transform="translate(275 140)"/><use href="#wbW" class="bw2" transform="translate(25 210)"/><use href="#wbW" class="bw1" transform="translate(50 210)"/><use href="#wbW" class="bw3" transform="translate(75 210)"/><use href="#wbW" class="bw1" transform="translate(100 210)"/><use href="#wbW" class="bw4" transform="translate(125 210)"/><use href="#wbW" class="bw1" transform="translate(150 210)"/><use href="#wbW" class="bw2" transform="translate(175 210)"/><use href="#wbW" class="bw3" transform="translate(200 210)"/><use href="#wbW" class="bw1" transform="translate(225 210)"/><use href="#wbW" class="bw2" transform="translate(250 210)"/><use href="#wbW" class="bw1" transform="translate(275 210)"/><rect class="sb" x="2" y="70" width="296" height="8" rx="2"/><rect class="sh" x="2" y="70" width="296" height="2"/><rect class="sb" x="2" y="140" width="296" height="8" rx="2"/><rect class="sh" x="2" y="140" width="296" height="2"/><rect class="sb" x="2" y="210" width="296" height="8" rx="2"/><rect class="sh" x="2" y="210" width="296" height="2"/><rect class="sf" x="0" y="0" width="7" height="232"/><rect class="sf" x="293" y="0" width="7" height="232"/><rect class="sf" x="0" y="0" width="300" height="6"/></svg><svg class="shape wb-neon opt" viewBox="0 0 90 116"><g class="halo"><path d="M20 12H70C70 38 60 54 45 54S20 38 20 12ZM45 54V90M30 94H60M12 106Q45 114 78 106"/></g><g class="tube"><path d="M20 12H70C70 38 60 54 45 54S20 38 20 12Z"/><path d="M45 54V90M30 94H60"/><path d="M24 26Q34 22 45 26T66 26"/><path d="M12 106Q45 114 78 106"/><circle cx="38" cy="38" r="1.6"/><circle cx="50" cy="42" r="1.3"/><circle cx="45" cy="33" r="1.1"/></g></svg><svg class="shape wb-lamp p1" viewBox="0 0 80 130"><circle class="gw a" cx="40" cy="98" r="74"/><circle class="gw b" cx="40" cy="98" r="48"/><circle class="gw c" cx="40" cy="98" r="26"/><path class="cd" d="M40 0V46"/><path class="shd" d="M14 88L27 46H53L66 88Z"/><rect class="rim" x="12" y="86" width="56" height="5" rx="2.5"/><circle class="bu" cx="40" cy="96" r="6"/></svg><svg class="shape wb-lamp p2" viewBox="0 0 80 130"><circle class="gw a" cx="40" cy="98" r="74"/><circle class="gw b" cx="40" cy="98" r="48"/><circle class="gw c" cx="40" cy="98" r="26"/><path class="cd" d="M40 0V46"/><path class="shd" d="M14 88L27 46H53L66 88Z"/><rect class="rim" x="12" y="86" width="56" height="5" rx="2.5"/><circle class="bu" cx="40" cy="96" r="6"/></svg><div class="shape wb-counter"></div><svg class="shape wb-ice opt" viewBox="0 0 120 130"><use href="#wbW" class="bw1" transform="translate(88 76) rotate(13) scale(1.25)"/><use href="#wbC" class="bw4" transform="translate(54 74) scale(1.3)"/><path class="bk" d="M20 66H100L92 124H28Z"/><path class="bk2" d="M20 66H100L99 72H21Z"/><rect class="bk2" x="16" y="62" width="88" height="8" rx="3"/><rect class="ic" x="26" y="56" width="13" height="11" rx="2.4" transform="rotate(-10 32 61)"/><rect class="ic" x="42" y="58" width="12" height="10" rx="2.4" transform="rotate(8 48 63)"/><rect class="ic" x="66" y="57" width="13" height="11" rx="2.4" transform="rotate(-6 72 62)"/><rect class="ic" x="82" y="58" width="12" height="10" rx="2.4" transform="rotate(12 88 63)"/><path class="bhl" d="M34 76L38 116"/></svg><svg class="shape wb-pour" viewBox="0 0 260 110"><use href="#wbW" class="bw1" transform="translate(34 104) scale(1.7)"/><use href="#wbS" class="bs1" transform="translate(78 104) scale(1.7)"/><use href="#wbG" class="gw1" transform="translate(132 104) scale(1.5)"/><use href="#wbG" class="gw2" transform="translate(170 104) scale(1.5)"/><use href="#wbD" class="gw3" transform="translate(220 104) scale(1.5)"/></svg><div class="shape wb-stools"></div>
        `,





        // ★ GLACIER — "Alpine Gondola"
        glacier: `
<div class="shape gl-sun"></div><div class="shape gl-mtn m1"></div><div class="shape gl-mtn m2"></div><div class="shape gl-cable"><i class="gl-gond"><svg viewBox="0 0 40 46"><path class="w" d="M20 0V10"/><rect class="b" x="6" y="10" width="28" height="22" rx="4"/><rect class="g" x="10" y="15" width="8" height="8" rx="1.5"/><rect class="g" x="22" y="15" width="8" height="8" rx="1.5"/></svg></i></div><div class="shape gl-py" style="--x:22vw"></div><div class="shape gl-py" style="--x:50vw"></div><div class="shape gl-py" style="--x:78vw"></div><div class="shape gl-chalet"><svg viewBox="0 0 220 170"><rect class="wl" x="34" y="84" width="152" height="82"/><path class="rf" d="M20 90L110 22L200 90Z"/><path class="sn" d="M20 90L110 22L200 90Q110 70 20 90Z"/><rect class="wl" x="138" y="30" width="18" height="34"/><rect class="sn" x="136" y="26" width="22" height="8" rx="3"/><rect class="wd" x="52" y="102" width="34" height="30" rx="3"/><rect class="wd" x="134" y="102" width="34" height="30" rx="3"/><path d="M69 102V132M52 117H86M151 102V132M134 117H168" style="stroke:var(--gl-wd);stroke-width:3"/><rect x="96" y="124" width="28" height="42" rx="3" style="fill:#3a2418"/></svg><i class="sm"></i></div><div class="shape gl-snow"></div><svg class="shape gl-man" viewBox="0 0 70 100"><circle cx="35" cy="76" r="22" style="fill:#fff;stroke:#cfe0ef;stroke-width:1.5"/><circle cx="35" cy="46" r="16" style="fill:#fff;stroke:#cfe0ef;stroke-width:1.5"/><circle cx="35" cy="22" r="11" style="fill:#fff;stroke:#cfe0ef;stroke-width:1.5"/><rect x="25" y="4" width="20" height="9" rx="2" style="fill:#3a4a66"/><rect x="21" y="12" width="28" height="4" rx="2" style="fill:#3a4a66"/><path d="M24 32Q35 38 46 32L46 38Q35 44 24 38Z" style="fill:#e0523c"/><path d="M35 22L44 25L35 27Z" style="fill:#ff9f43"/><circle cx="31" cy="20" r="1.4" style="fill:#222"/><circle cx="39" cy="20" r="1.4" style="fill:#222"/><path d="M20 48L4 38M50 48L66 38" style="stroke:#6b4a30;stroke-width:2.4;stroke-linecap:round"/></svg><svg class="shape gl-pine p1" viewBox="0 0 120 160"><path d="M60 4L86 50H72L98 96H78L110 148H10L42 96H22L48 50H34Z"/></svg><svg class="shape gl-pine p2" viewBox="0 0 120 160"><path d="M60 4L86 50H72L98 96H78L110 148H10L42 96H22L48 50H34Z"/></svg><svg class="shape gl-pine p3 opt" viewBox="0 0 120 160"><path d="M60 4L86 50H72L98 96H78L110 148H10L42 96H22L48 50H34Z"/></svg><svg class="shape gl-ice" viewBox="0 0 240 90"><path d="M0 90V52L26 22L52 46L84 12L118 50L150 30L176 58L210 38L240 62V90Z" style="fill:var(--gl-ice)"/><path d="M26 22L52 46L40 90H14ZM84 12L118 50L96 90H66ZM150 30L176 58L160 90H138Z" style="fill:#fff;fill-opacity:.35"/></svg><svg class="shape gl-ski opt" viewBox="0 0 40 40"><path d="M2 34L36 30M4 38L38 35" style="stroke:#3a4a66;stroke-width:2.2;stroke-linecap:round"/><path d="M20 12L18 26L24 30M18 26L12 30" style="stroke:#e0523c;stroke-width:3.4;stroke-linecap:round;fill:none"/><circle cx="21" cy="8" r="4.4" style="fill:#f4c9a0"/><path d="M16 6Q21 0 26 6Z" style="fill:#2f6af0"/><path d="M26 16L34 22" style="stroke:#3a4a66;stroke-width:1.6"/></svg><div class="shape gl-flakes"></div>
        `,




        // ★ MATCHA — "Zen Garden"
        matcha: `
<div class="shape mt-enso"></div><div class="shape mt-sand"></div><div class="shape mt-ripple r1"></div><div class="shape mt-ripple r2"></div><div class="shape mt-rock k1"></div><div class="shape mt-rock k2"></div><div class="shape mt-rock k3 opt"></div><div class="shape mt-bamboo b1"></div><div class="shape mt-bamboo b2"></div><div class="shape mt-bamboo b3 opt"></div><i class="shape mt-leaf a"></i><i class="shape mt-leaf b opt"></i>
        `,

        // ★ FOREST — Forest · Treehouse · Nook
        forest: `
<div class="shape fr-wall"></div><svg class="shape fr-view" viewBox="0 0 200 200"><defs><clipPath id="frC"><circle cx="100" cy="100" r="86"/></clipPath><linearGradient id="frG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--fs1)"/><stop offset="1" style="stop-color:var(--fs2)"/></linearGradient></defs><g clip-path="url(#frC)"><rect width="200" height="200" fill="url(#frG)"/><circle cx="134" cy="66" r="34" style="fill:#fff6c8;fill-opacity:.55"/><circle cx="134" cy="66" r="15" style="fill:#fffbe2"/><path class="q10" d="M0 118L22 90L40 116L62 82L84 114L106 88L130 118L156 86L180 116L200 94V200H0Z"/><path class="q11" d="M0 150L18 122L34 146L56 116L78 148L100 124L124 150L150 118L176 148L200 128V200H0Z"/><path class="q10" fill-opacity=".45" d="M0 140H200V200H0Z"/></g><circle class="z4" cx="100" cy="100" r="86" stroke-width="13"/><path class="z4" d="M100 14V186M14 100H186" stroke-width="6"/><rect class="q3" x="6" y="184" width="188" height="10" rx="4"/></svg><div class="shape fr-lights"></div><div class="shape fr-lantern l1"><svg viewBox="0 0 50 80"><path class="q4" d="M10 16L25 3L40 16Z"/><rect x="9" y="16" width="32" height="46" rx="7" style="fill:#ffe7a0;fill-opacity:.75;stroke:var(--q4);stroke-width:3"/><ellipse cx="25" cy="42" rx="6" ry="10" style="fill:#ffbf3f"/><ellipse cx="25" cy="44" rx="3" ry="6" style="fill:#fff3c0"/><rect class="q4" x="8" y="62" width="34" height="7" rx="3"/></svg></div><div class="shape fr-lantern l2 opt"><svg viewBox="0 0 50 80"><path class="q4" d="M10 16L25 3L40 16Z"/><rect x="9" y="16" width="32" height="46" rx="7" style="fill:#ffe7a0;fill-opacity:.75;stroke:var(--q4);stroke-width:3"/><ellipse cx="25" cy="42" rx="6" ry="10" style="fill:#ffbf3f"/><ellipse cx="25" cy="44" rx="3" ry="6" style="fill:#fff3c0"/><rect class="q4" x="8" y="62" width="34" height="7" rx="3"/></svg></div><svg class="shape fr-shelf opt" viewBox="0 0 220 140"><rect class="q3" y="106" width="220" height="12" rx="3"/><path class="q3" d="M18 118V138L42 118ZM178 118V138L202 118Z"/><rect x="14" y="50" width="16" height="56" rx="2" style="fill:#b5543c"/><rect x="32" y="62" width="13" height="44" rx="2" style="fill:#4f7f62"/><rect x="47" y="44" width="17" height="62" rx="2" style="fill:#d9a441"/><rect x="66" y="58" width="12" height="48" rx="2" style="fill:#6c5a8c"/><path d="M100 106V70Q100 62 108 62H138Q146 62 146 70V106Z" style="fill:#fff;fill-opacity:.4;stroke:var(--q4);stroke-width:2"/><rect class="q4" x="104" y="56" width="38" height="7" rx="2"/><circle cx="116" cy="84" r="2.6" style="fill:#ffe27a"/><circle cx="130" cy="94" r="2.2" style="fill:#ffe27a"/><circle cx="122" cy="76" r="1.8" style="fill:#ffe27a"/><path class="q9" d="M158 106L162 84H192L196 106Z"/><ellipse class="q5" cx="170" cy="66" rx="6" ry="22" transform="rotate(-24 177 84)"/><ellipse class="q6" cx="177" cy="62" rx="6" ry="24"/><ellipse class="q5" cx="184" cy="66" rx="6" ry="22" transform="rotate(26 177 84)"/></svg><div class="shape fr-floor"></div><svg class="shape fr-rug" viewBox="0 0 360 80"><ellipse class="q9" cx="180" cy="42" rx="172" ry="34"/><ellipse cx="180" cy="42" rx="142" ry="26" style="fill:none;stroke:#fff;stroke-opacity:.4;stroke-width:3"/><ellipse class="q6" cx="180" cy="42" rx="104" ry="19" fill-opacity=".55"/><ellipse class="q8" cx="180" cy="42" rx="60" ry="10" fill-opacity=".5"/></svg><svg class="shape fr-fox" viewBox="0 0 220 110"><path class="q7" d="M160 82C202 86 216 58 194 42C190 60 176 66 156 66Z"/><path class="q8" d="M194 42C203 48 207 56 203 64C198 58 195 50 194 42Z"/><g class="b"><ellipse class="q7" cx="108" cy="78" rx="66" ry="26"/><circle class="q7" cx="52" cy="76" r="24"/><path class="q7" d="M34 62L28 36L52 50ZM58 52L74 32L76 62Z"/><path class="q8" d="M28 82Q52 102 76 82Q62 90 52 90Q42 90 28 82Z"/><ellipse cx="52" cy="82" rx="4" ry="3" style="fill:#3a2a1b"/><path d="M38 72Q43 76 48 72M58 72Q63 76 68 72" style="fill:none;stroke:#3a2a1b;stroke-width:2.2;stroke-linecap:round"/><ellipse class="q8" cx="86" cy="100" rx="14" ry="6"/></g></svg><svg class="shape fr-fern" viewBox="0 0 160 190"><path class="q9" d="M44 190L54 130H106L116 190Z"/><rect class="q4" x="48" y="124" width="64" height="12" rx="4"/><g class="f"><path class="q5" d="M80 128C40 120 14 84 10 40C44 62 70 90 80 128Z"/><path class="q6" d="M80 128C120 120 146 84 150 40C116 62 90 90 80 128Z"/><path class="q6" d="M80 128C58 100 56 54 74 8C98 44 96 94 80 128Z"/><path class="q5" d="M80 128C30 128 6 112 2 84C38 90 66 104 80 128Z"/><path class="q5" d="M80 128C130 128 154 112 158 84C122 90 94 104 80 128Z"/></g></svg>
        `,

        // ★ SUNSHINE — Sunshine · Porch · Sunflowers
        sunshine: `
<div class="shape sh-sun"></div><div class="shape sh-hill h1"></div><div class="shape sh-hill h2"></div><svg class="shape sh-barn opt" viewBox="0 0 150 110"><rect class="q12" x="64" y="20" width="22" height="86" rx="3"/><path class="q9" d="M10 106V56L50 24L90 56V106Z"/><path class="q12" d="M4 60L50 20L96 60L90 66L50 32L10 66Z"/><rect class="q8" x="36" y="64" width="28" height="42" rx="2"/><path class="z2" d="M36 64L64 106M64 64L36 106M50 64V106" stroke-width="2.4"/><circle class="q8" cx="50" cy="46" r="5"/><path class="q12" d="M60 20Q75 8 90 20Z"/></svg><div class="shape sh-floor"></div><div class="shape sh-rail"></div><svg class="shape sh-bunt" viewBox="0 0 400 60" preserveAspectRatio="none"><path class="z2" d="M0 12Q200 52 400 12" stroke-width="2.4"/><path class="q6" d="M20 26L40 26L30 46Z"/><path class="q9" d="M58 26L78 26L68 46Z"/><path class="q6" d="M96 26L116 26L106 46Z"/><path class="q9" d="M134 26L154 26L144 46Z"/><path class="q6" d="M172 26L192 26L182 46Z"/><path class="q9" d="M210 26L230 26L220 46Z"/><path class="q6" d="M248 26L268 26L258 46Z"/><path class="q9" d="M286 26L306 26L296 46Z"/><path class="q6" d="M324 26L344 26L334 46Z"/><path class="q9" d="M362 26L382 26L372 46Z"/></svg><svg class="shape sh-flw l" viewBox="0 0 150 190"><path class="z5" d="M46 76V150" stroke-width="5"/><ellipse class="q5" cx="32" cy="120" rx="14" ry="6" transform="rotate(-28 32 120)"/><ellipse class="q5" cx="60" cy="138" rx="14" ry="6" transform="rotate(28 60 138)"/><ellipse class="q6" cx="46" cy="12.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(0.0 46 42)"/><ellipse class="q6" cx="46" cy="12.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(36.0 46 42)"/><ellipse class="q6" cx="46" cy="12.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(72.0 46 42)"/><ellipse class="q6" cx="46" cy="12.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(108.0 46 42)"/><ellipse class="q6" cx="46" cy="12.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(144.0 46 42)"/><ellipse class="q6" cx="46" cy="12.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(180.0 46 42)"/><ellipse class="q6" cx="46" cy="12.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(216.0 46 42)"/><ellipse class="q6" cx="46" cy="12.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(252.0 46 42)"/><ellipse class="q6" cx="46" cy="12.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(288.0 46 42)"/><ellipse class="q6" cx="46" cy="12.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(324.0 46 42)"/><ellipse class="q10" cx="46" cy="18.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(18.0 46 42)"/><ellipse class="q10" cx="46" cy="18.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(54.0 46 42)"/><ellipse class="q10" cx="46" cy="18.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(90.0 46 42)"/><ellipse class="q10" cx="46" cy="18.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(126.0 46 42)"/><ellipse class="q10" cx="46" cy="18.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(162.0 46 42)"/><ellipse class="q10" cx="46" cy="18.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(198.0 46 42)"/><ellipse class="q10" cx="46" cy="18.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(234.0 46 42)"/><ellipse class="q10" cx="46" cy="18.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(270.0 46 42)"/><ellipse class="q10" cx="46" cy="18.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(306.0 46 42)"/><ellipse class="q10" cx="46" cy="18.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(342.0 46 42)"/><circle class="q7" cx="46" cy="42" r="17.68"/><circle cx="46" cy="42" r="10.2" style="fill:#000;fill-opacity:.18"/><path class="z5" d="M106 88V150" stroke-width="5"/><ellipse class="q5" cx="92" cy="132" rx="14" ry="6" transform="rotate(-28 92 132)"/><ellipse class="q5" cx="120" cy="150" rx="14" ry="6" transform="rotate(28 120 150)"/><ellipse class="q6" cx="106" cy="39.64" rx="5.2" ry="11.96" transform="rotate(0.0 106 62)"/><ellipse class="q6" cx="106" cy="39.64" rx="5.2" ry="11.96" transform="rotate(40.0 106 62)"/><ellipse class="q6" cx="106" cy="39.64" rx="5.2" ry="11.96" transform="rotate(80.0 106 62)"/><ellipse class="q6" cx="106" cy="39.64" rx="5.2" ry="11.96" transform="rotate(120.0 106 62)"/><ellipse class="q6" cx="106" cy="39.64" rx="5.2" ry="11.96" transform="rotate(160.0 106 62)"/><ellipse class="q6" cx="106" cy="39.64" rx="5.2" ry="11.96" transform="rotate(200.0 106 62)"/><ellipse class="q6" cx="106" cy="39.64" rx="5.2" ry="11.96" transform="rotate(240.0 106 62)"/><ellipse class="q6" cx="106" cy="39.64" rx="5.2" ry="11.96" transform="rotate(280.0 106 62)"/><ellipse class="q6" cx="106" cy="39.64" rx="5.2" ry="11.96" transform="rotate(320.0 106 62)"/><ellipse class="q10" cx="106" cy="43.8" rx="4.68" ry="10.4" transform="rotate(20.0 106 62)"/><ellipse class="q10" cx="106" cy="43.8" rx="4.68" ry="10.4" transform="rotate(60.0 106 62)"/><ellipse class="q10" cx="106" cy="43.8" rx="4.68" ry="10.4" transform="rotate(100.0 106 62)"/><ellipse class="q10" cx="106" cy="43.8" rx="4.68" ry="10.4" transform="rotate(140.0 106 62)"/><ellipse class="q10" cx="106" cy="43.8" rx="4.68" ry="10.4" transform="rotate(180.0 106 62)"/><ellipse class="q10" cx="106" cy="43.8" rx="4.68" ry="10.4" transform="rotate(220.0 106 62)"/><ellipse class="q10" cx="106" cy="43.8" rx="4.68" ry="10.4" transform="rotate(260.0 106 62)"/><ellipse class="q10" cx="106" cy="43.8" rx="4.68" ry="10.4" transform="rotate(300.0 106 62)"/><ellipse class="q10" cx="106" cy="43.8" rx="4.68" ry="10.4" transform="rotate(340.0 106 62)"/><circle class="q7" cx="106" cy="62" r="13.52"/><circle cx="106" cy="62" r="7.8" style="fill:#000;fill-opacity:.18"/></svg><svg class="shape sh-flw r opt" viewBox="0 0 150 190"><path class="z5" d="M40 82V150" stroke-width="5"/><ellipse class="q5" cx="26" cy="126" rx="14" ry="6" transform="rotate(-28 26 126)"/><ellipse class="q5" cx="54" cy="144" rx="14" ry="6" transform="rotate(28 54 144)"/><ellipse class="q6" cx="40" cy="33.64" rx="5.2" ry="11.96" transform="rotate(0.0 40 56)"/><ellipse class="q6" cx="40" cy="33.64" rx="5.2" ry="11.96" transform="rotate(40.0 40 56)"/><ellipse class="q6" cx="40" cy="33.64" rx="5.2" ry="11.96" transform="rotate(80.0 40 56)"/><ellipse class="q6" cx="40" cy="33.64" rx="5.2" ry="11.96" transform="rotate(120.0 40 56)"/><ellipse class="q6" cx="40" cy="33.64" rx="5.2" ry="11.96" transform="rotate(160.0 40 56)"/><ellipse class="q6" cx="40" cy="33.64" rx="5.2" ry="11.96" transform="rotate(200.0 40 56)"/><ellipse class="q6" cx="40" cy="33.64" rx="5.2" ry="11.96" transform="rotate(240.0 40 56)"/><ellipse class="q6" cx="40" cy="33.64" rx="5.2" ry="11.96" transform="rotate(280.0 40 56)"/><ellipse class="q6" cx="40" cy="33.64" rx="5.2" ry="11.96" transform="rotate(320.0 40 56)"/><ellipse class="q10" cx="40" cy="37.8" rx="4.68" ry="10.4" transform="rotate(20.0 40 56)"/><ellipse class="q10" cx="40" cy="37.8" rx="4.68" ry="10.4" transform="rotate(60.0 40 56)"/><ellipse class="q10" cx="40" cy="37.8" rx="4.68" ry="10.4" transform="rotate(100.0 40 56)"/><ellipse class="q10" cx="40" cy="37.8" rx="4.68" ry="10.4" transform="rotate(140.0 40 56)"/><ellipse class="q10" cx="40" cy="37.8" rx="4.68" ry="10.4" transform="rotate(180.0 40 56)"/><ellipse class="q10" cx="40" cy="37.8" rx="4.68" ry="10.4" transform="rotate(220.0 40 56)"/><ellipse class="q10" cx="40" cy="37.8" rx="4.68" ry="10.4" transform="rotate(260.0 40 56)"/><ellipse class="q10" cx="40" cy="37.8" rx="4.68" ry="10.4" transform="rotate(300.0 40 56)"/><ellipse class="q10" cx="40" cy="37.8" rx="4.68" ry="10.4" transform="rotate(340.0 40 56)"/><circle class="q7" cx="40" cy="56" r="13.52"/><circle cx="40" cy="56" r="7.8" style="fill:#000;fill-opacity:.18"/><path class="z5" d="M96 74V150" stroke-width="5"/><ellipse class="q5" cx="82" cy="118" rx="14" ry="6" transform="rotate(-28 82 118)"/><ellipse class="q5" cx="110" cy="136" rx="14" ry="6" transform="rotate(28 110 136)"/><ellipse class="q6" cx="96" cy="10.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(0.0 96 40)"/><ellipse class="q6" cx="96" cy="10.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(36.0 96 40)"/><ellipse class="q6" cx="96" cy="10.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(72.0 96 40)"/><ellipse class="q6" cx="96" cy="10.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(108.0 96 40)"/><ellipse class="q6" cx="96" cy="10.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(144.0 96 40)"/><ellipse class="q6" cx="96" cy="10.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(180.0 96 40)"/><ellipse class="q6" cx="96" cy="10.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(216.0 96 40)"/><ellipse class="q6" cx="96" cy="10.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(252.0 96 40)"/><ellipse class="q6" cx="96" cy="10.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(288.0 96 40)"/><ellipse class="q6" cx="96" cy="10.760000000000002" rx="6.800000000000001" ry="15.64" transform="rotate(324.0 96 40)"/><ellipse class="q10" cx="96" cy="16.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(18.0 96 40)"/><ellipse class="q10" cx="96" cy="16.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(54.0 96 40)"/><ellipse class="q10" cx="96" cy="16.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(90.0 96 40)"/><ellipse class="q10" cx="96" cy="16.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(126.0 96 40)"/><ellipse class="q10" cx="96" cy="16.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(162.0 96 40)"/><ellipse class="q10" cx="96" cy="16.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(198.0 96 40)"/><ellipse class="q10" cx="96" cy="16.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(234.0 96 40)"/><ellipse class="q10" cx="96" cy="16.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(270.0 96 40)"/><ellipse class="q10" cx="96" cy="16.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(306.0 96 40)"/><ellipse class="q10" cx="96" cy="16.200000000000003" rx="6.12" ry="13.600000000000001" transform="rotate(342.0 96 40)"/><circle class="q7" cx="96" cy="40" r="17.68"/><circle cx="96" cy="40" r="10.2" style="fill:#000;fill-opacity:.18"/></svg><svg class="shape sh-chair" viewBox="0 0 180 170"><g class="rk"><path class="z2" d="M40 20L34 120M40 20Q70 14 96 24L88 116" stroke-width="9"/><path class="q9" d="M44 70Q70 80 92 74L96 96Q70 104 44 96Z"/><path class="z2" d="M34 120H112L132 62" stroke-width="8"/><path class="z2" d="M24 150Q80 170 150 146" stroke-width="7"/><path class="z2" d="M46 26L40 66M62 22L56 66M78 24L74 66" stroke-width="3"/></g></svg><svg class="shape sh-table" viewBox="0 0 200 150"><ellipse class="q1" cx="100" cy="60" rx="86" ry="14"/><path class="z2" d="M100 72V140M60 142H140" stroke-width="7"/><path d="M26 58Q100 90 174 58L170 66Q100 96 30 66Z" style="fill:#fff;fill-opacity:.55"/><path d="M60 58L56 14H92L88 58Z" style="fill:#fff;fill-opacity:.55;stroke:var(--q2);stroke-width:2"/><path class="q10" d="M58 36H90L88 58H60Z"/><path d="M100 58L97 30H121L118 58Z" style="fill:#fff;fill-opacity:.5;stroke:var(--q2);stroke-width:2"/><path class="q10" d="M99 42H119L118 58H100Z"/><path class="z9" d="M110 24L120 6" stroke-width="2"/><circle class="q10" cx="148" cy="48" r="9"/><circle cx="148" cy="48" r="9" style="fill:none;stroke:#fff;stroke-opacity:.6;stroke-width:2"/></svg>
        `,

        // ★ STARRY — Starry · Rooftop · Stargazing
        starry: `
<div class="shape sr-milky"></div><div class="shape sr-stars"></div><div class="shape sr-stars t"></div><svg class="shape sr-moon" viewBox="0 0 100 100"><path class="q8" d="M62 10A42 42 0 1 0 90 66A34 34 0 1 1 62 10Z"/></svg><svg class="shape sr-c c1" viewBox="0 0 220 110"><path class="z9" d="M10 40L50 34L92 44L160 50L156 88L104 84L92 44" stroke-width="1.2" stroke-dasharray="3 4" opacity=".6"/><g class="q9"><circle cx="10" cy="40" r="2.2"/><circle cx="50" cy="34" r="2.7"/><circle cx="92" cy="44" r="3.2"/><circle cx="160" cy="50" r="2.2"/><circle cx="156" cy="88" r="2.7"/><circle cx="104" cy="84" r="3.2"/></g></svg><svg class="shape sr-c c2" viewBox="0 0 170 130"><path class="z9" d="M62 18L84 66L66 112M140 24L120 58L146 108M84 66L120 58M62 18L100 6L140 24" stroke-width="1.2" stroke-dasharray="3 4" opacity=".6"/><g class="q9"><circle cx="62" cy="18" r="2.2"/><circle cx="140" cy="24" r="2.7"/><circle cx="84" cy="66" r="3.2"/><circle cx="102" cy="62" r="2.2"/><circle cx="120" cy="58" r="2.7"/><circle cx="66" cy="112" r="3.2"/><circle cx="146" cy="108" r="2.2"/><circle cx="100" cy="6" r="2.7"/></g></svg><svg class="shape sr-c c3" viewBox="0 0 180 90"><path class="z9" d="M8 40L48 72L90 36L128 70L170 22" stroke-width="1.2" stroke-dasharray="3 4" opacity=".6"/><g class="q9"><circle cx="8" cy="40" r="2.2"/><circle cx="48" cy="72" r="2.7"/><circle cx="90" cy="36" r="3.2"/><circle cx="128" cy="70" r="2.2"/><circle cx="170" cy="22" r="2.7"/></g></svg><svg class="shape sr-c c4" viewBox="0 0 160 120"><path class="z9" d="M10 18L38 34L60 60L80 92L110 106L138 96L148 70L136 50" stroke-width="1.2" stroke-dasharray="3 4" opacity=".6"/><g class="q9"><circle cx="10" cy="18" r="2.2"/><circle cx="38" cy="34" r="2.7"/><circle cx="60" cy="60" r="3.2"/><circle cx="80" cy="92" r="2.2"/><circle cx="110" cy="106" r="2.7"/><circle cx="138" cy="96" r="3.2"/><circle cx="148" cy="70" r="2.2"/><circle cx="136" cy="50" r="2.7"/></g></svg><div class="shape sr-shoot"></div><div class="shape sr-city c1"></div><div class="shape sr-city c2"></div><div class="shape sr-wall"></div><div class="shape sr-lights"></div><div class="shape sr-deck"></div><svg class="shape sr-scope" viewBox="0 0 170 210"><path class="z10" d="M84 92L40 204M84 92L84 206M84 92L132 204" stroke-width="6"/><g transform="rotate(-38 84 82)"><rect class="q9" x="14" y="68" width="124" height="28" rx="6"/><rect class="q10" x="6" y="64" width="14" height="36" rx="3"/><rect class="q10" x="64" y="66" width="8" height="32"/><rect class="q10" x="106" y="66" width="8" height="32"/><rect class="q10" x="136" y="74" width="18" height="16" rx="3"/><circle class="q10" cx="84" cy="96" r="9"/></g></svg><svg class="shape sr-blanket" viewBox="0 0 300 120"><path class="q7" d="M30 106L58 60H290L262 106Z"/><path d="M58 60L30 106M104 60L76 106M150 60L122 106M196 60L168 106M242 60L214 106" style="stroke:#fff;stroke-opacity:.28;stroke-width:5"/><rect class="q8" x="84" y="30" width="62" height="38" rx="14" transform="rotate(-8 115 49)"/><rect class="q11" x="150" y="38" width="56" height="34" rx="13" transform="rotate(6 178 55)"/><path d="M226 60V38H252V60Z" style="fill:#fff"/><path d="M252 44H262Q268 50 262 56H252" style="fill:none;stroke:#fff;stroke-width:3.2"/><rect x="226" y="38" width="26" height="5" style="fill:#5a3520"/><rect class="q10" x="262" y="46" width="22" height="22" rx="3" style="fill:#c99a3e"/><rect x="266" y="50" width="14" height="14" rx="2" style="fill:#ffd27a"/></svg><div class="shape sr-steam"></div>
        `,

        // ★ SAKURA — Sakura · Shrine · Dawn
        sakura: `
<div class="shape sa-sun"></div><svg class="shape sa-mount" viewBox="0 0 400 120"><path class="q10" d="M0 120L110 52Q150 16 200 12Q250 16 290 52L400 120Z"/><path class="q11" d="M200 12Q170 16 150 36L168 30L182 44L198 30L214 44L230 30L250 38Q230 16 200 12Z"/></svg><div class="shape sa-mist"></div><div class="shape sa-water"></div><svg class="shape sa-ref" viewBox="0 0 200 190"><path class="q3" d="M0 20Q100 38 200 20L192 6Q100 22 8 6Z"/><path class="q1" d="M14 24Q100 40 186 24V36Q100 52 14 36Z"/><rect class="q1" x="28" y="30" width="15" height="150"/><rect class="q1" x="157" y="30" width="15" height="150"/><rect class="q1" x="16" y="64" width="168" height="12" rx="2"/><rect class="q3" x="92" y="40" width="16" height="22" rx="2"/><rect class="q3" x="24" y="172" width="23" height="18" rx="2"/><rect class="q3" x="153" y="172" width="23" height="18" rx="2"/></svg><div class="shape sa-ripples"></div><svg class="shape sa-koi" viewBox="0 0 200 60"><g class="q12"><path d="M20 20C34 10 54 12 62 22C54 32 34 34 20 24L8 14L10 30Z"/><path d="M130 40C144 32 160 34 166 42C160 50 144 52 130 44L120 36L122 50Z"/></g><circle class="q9" cx="42" cy="21" r="5" style="fill:#fff;fill-opacity:.85"/><circle cx="146" cy="42" r="4" style="fill:#fff;fill-opacity:.85"/></svg><svg class="shape sa-torii" viewBox="0 0 200 190"><path class="q3" d="M0 20Q100 38 200 20L192 6Q100 22 8 6Z"/><path class="q1" d="M14 24Q100 40 186 24V36Q100 52 14 36Z"/><rect class="q1" x="28" y="30" width="15" height="150"/><rect class="q1" x="157" y="30" width="15" height="150"/><rect class="q1" x="16" y="64" width="168" height="12" rx="2"/><rect class="q3" x="92" y="40" width="16" height="22" rx="2"/><rect class="q3" x="24" y="172" width="23" height="18" rx="2"/><rect class="q3" x="153" y="172" width="23" height="18" rx="2"/></svg><svg class="shape sa-bank" viewBox="0 0 400 120"><path d="M0 120V60Q80 20 180 50Q260 74 300 120Z" style="fill:var(--q13)"/><ellipse class="q7" cx="236" cy="104" rx="20" ry="6"/><ellipse class="q7" cx="276" cy="112" rx="15" ry="5"/><ellipse class="q7" cx="204" cy="112" rx="14" ry="5"/><g class="q8"><path d="M96 74h30v-8H96zM104 66h14V30H104z"/><path d="M86 30h50V10H86z"/><path d="M80 12L111 -6L142 12z"/><circle cx="111" cy="-9" r="5"/></g><rect x="96" y="14" width="30" height="12" style="fill:#ffd27a"/></svg><svg class="shape sa-tree" viewBox="0 0 400 440"><path class='q4' d='M30 384Q54 366 64 356L92 356Q104 368 118 384Z'/><path class='q4' d='M44 382C52 340 50 300 62 262C70 236 90 214 120 196L132 208C106 226 96 244 92 268C88 304 92 344 100 382Z'/><path class='z4' d='M96 236L180 176' stroke-width='14'/><path class='z4' d='M180 176L262 150' stroke-width='9'/><path class='z4' d='M112 214L100 150' stroke-width='10'/><path class='z4' d='M100 150L60 112' stroke-width='7'/><path class='z4' d='M84 250L20 214' stroke-width='9'/><path class='z4' d='M150 196L190 120' stroke-width='7'/><circle class='q5' cx='230.5' cy='113' r='13.5'/><circle class='q6' cx='212.9' cy='159.7' r='19.6'/><circle class='q5' cx='88.3' cy='98.9' r='18.5'/><circle class='q6' cx='49.5' cy='99.7' r='14.4'/><circle class='q5' cx='52.9' cy='146.9' r='19.5'/><circle class='q6' cx='234.9' cy='128' r='17.9'/><circle class='q5' cx='62.5' cy='141.3' r='13.3'/><circle class='q6' cx='199.3' cy='137.5' r='15.9'/><circle class='q5' cx='38.8' cy='171.4' r='17.7'/><circle class='q6' cx='66.8' cy='118.5' r='13.2'/><circle class='q5' cx='100.2' cy='151.1' r='17.6'/><circle class='q6' cx='216.9' cy='129.6' r='14.6'/><circle class='q5' cx='202.6' cy='94.6' r='19.6'/><circle class='q6' cx='205.8' cy='99' r='20.1'/><circle class='q5' cx='49.1' cy='180.4' r='21.7'/><circle class='q6' cx='174.3' cy='177.1' r='19.4'/><circle class='q5' cx='36.6' cy='141.2' r='17.4'/><circle class='q6' cx='194.4' cy='109.4' r='20.5'/><circle class='q5' cx='52.6' cy='177.8' r='21.1'/><circle class='q6' cx='33.7' cy='141.7' r='21.3'/><circle class='q5' cx='106.5' cy='86' r='15'/><circle class='q6' cx='75.4' cy='177.7' r='14.5'/><circle class='q5' cx='237.9' cy='162.2' r='16'/><circle class='q6' cx='245.6' cy='158.1' r='16'/><circle class='q5' cx='287.4' cy='133.2' r='19.7'/><circle class='q6' cx='244.5' cy='177.4' r='14.8'/><circle class='q5' cx='246' cy='160.9' r='14.1'/><circle class='q6' cx='290' cy='134.8' r='20.1'/><circle class='q5' cx='245' cy='134.1' r='15.1'/><circle class='q6' cx='196.6' cy='126.7' r='20.5'/><circle class='q5' cx='250.2' cy='142.3' r='18.1'/><circle class='q6' cx='213.8' cy='126.2' r='13.8'/><circle class='q5' cx='216.5' cy='151.9' r='21.3'/><circle class='q6' cx='268.4' cy='129' r='15'/><circle class='q5' cx='70.2' cy='90.1' r='16.9'/><circle class='q6' cx='57.9' cy='118.7' r='18.6'/><circle class='q5' cx='15.2' cy='123.2' r='15.7'/><circle class='q6' cx='61.3' cy='101.4' r='20'/><circle class='q5' cx='53.9' cy='97.6' r='17.4'/><circle class='q6' cx='48.9' cy='105.2' r='17.5'/><circle class='q5' cx='66.7' cy='102.5' r='20'/><circle class='q6' cx='39.9' cy='91' r='15.4'/><circle class='q5' cx='95.3' cy='133.8' r='20'/><circle class='q5' cx='192.3' cy='136.9' r='13.3'/><circle class='q6' cx='179.3' cy='89.4' r='14.5'/><circle class='q5' cx='210.5' cy='99.9' r='18.4'/><circle class='q6' cx='146.2' cy='106.5' r='16.9'/><circle class='q5' cx='202.8' cy='132.4' r='12.9'/><circle class='q6' cx='184.8' cy='105.3' r='14.7'/><circle class='q5' cx='137.9' cy='119.8' r='15.8'/><circle class='q6' cx='206.3' cy='112.7' r='21.9'/><circle class='q5' cx='226.1' cy='111.6' r='15.8'/><circle class='q6' cx='166.1' cy='81.3' r='18.9'/><circle class='q5' cx='10.4' cy='201.2' r='17.8'/><circle class='q6' cx='43.8' cy='228.8' r='20.2'/><circle class='q5' cx='24.9' cy='200.1' r='17.2'/><circle class='q6' cx='24.6' cy='218.6' r='21.5'/><circle class='q5' cx='42.4' cy='207.9' r='20.6'/><circle class='q6' cx='14.3' cy='199' r='14.8'/><circle class='q5' cx='240.8' cy='148.1' r='18.7'/><circle class='q6' cx='261.6' cy='147.3' r='15.7'/><circle class='q5' cx='256.7' cy='160.2' r='18.9'/><circle class='q6' cx='245.6' cy='138.9' r='18.6'/></svg><div class="shape sa-petal p1"></div><div class="shape sa-petal p2 opt"></div>
        `,

        // ★ NEBULA — Nebula · Space · Diner
        nebula: `
<div class="shape ne-wall"></div>
<div class="shape ne-win"><i class="st"></i><i class="pl"></i><i class="uf"></i></div>
<svg class="shape ne-neon" viewBox="0 0 160 120"><g fill="none" stroke-linecap="round"><circle cx="60" cy="60" r="26" stroke="var(--q6)" stroke-opacity=".25" stroke-width="10"/><circle cx="60" cy="60" r="26" stroke="var(--q6)" stroke-width="3.4"/><ellipse cx="60" cy="60" rx="50" ry="13" transform="rotate(-18 60 60)" stroke="var(--q7)" stroke-opacity=".25" stroke-width="9"/><ellipse cx="60" cy="60" rx="50" ry="13" transform="rotate(-18 60 60)" stroke="var(--q7)" stroke-width="3"/><path d="M128 14l5 12 13 1-10 9 3 13-11-7-11 7 3-13-10-9 13-1z" stroke="var(--q10)" stroke-width="3" stroke-linejoin="round"/></g></svg>
<div class="shape ne-lamp" style="--x:58%;--c:5vh"></div><div class="shape ne-lamp" style="--x:78%;--c:10vh"></div>
<div class="shape ne-counter"></div><div class="shape ne-floor"></div>
<svg class="shape ne-stool " style="left:6%" viewBox="0 0 60 130"><rect class="q4" x="4" y="16" width="52" height="14"/><ellipse class="q4" cx="30" cy="16" rx="26" ry="9"/><rect class="q3" x="4" y="30" width="52" height="4" rx="2"/><rect class="q3" x="27" y="34" width="6" height="80"/><ellipse class="q3" cx="30" cy="118" rx="24" ry="7"/></svg><svg class="shape ne-stool " style="left:15%" viewBox="0 0 60 130"><rect class="q4" x="4" y="16" width="52" height="14"/><ellipse class="q4" cx="30" cy="16" rx="26" ry="9"/><rect class="q3" x="4" y="30" width="52" height="4" rx="2"/><rect class="q3" x="27" y="34" width="6" height="80"/><ellipse class="q3" cx="30" cy="118" rx="24" ry="7"/></svg><svg class="shape ne-stool opt" style="left:24%" viewBox="0 0 60 130"><rect class="q4" x="4" y="16" width="52" height="14"/><ellipse class="q4" cx="30" cy="16" rx="26" ry="9"/><rect class="q3" x="4" y="30" width="52" height="4" rx="2"/><rect class="q3" x="27" y="34" width="6" height="80"/><ellipse class="q3" cx="30" cy="118" rx="24" ry="7"/></svg>
<svg class="shape ne-treat" viewBox="0 0 160 100"><path class="q8" d="M10 22H50L44 86H16Z" opacity=".92"/><path class="q6" d="M13 34H47L44 86H16Z" opacity=".85"/><ellipse class="q8" cx="30" cy="20" rx="22" ry="9"/><circle class="q4" cx="30" cy="9" r="6"/><path class="z7" d="M38 20L50 0" stroke-width="4"/><ellipse class="q8" cx="112" cy="90" rx="44" ry="7"/><path class="q10" d="M76 86L112 52L148 86Z"/><path class="z4" d="M88 74L136 74" stroke-width="3"/></svg>
        `,
        // ★ EMBER — Ember · Hearth · Glow
        ember: `
<div class="shape eh-wall"></div><div class="shape eh-pan"></div><div class="shape eh-beam"></div><div class="shape eh-gar"></div><div class="shape eh-sc" style="--x:30%;--y:44%"></div><div class="shape eh-sc opt" style="--x:62%;--y:36%"></div><svg class="shape eh-shelf" viewBox="0 0 240 140"><rect class="q3" x="0" y="124" width="240" height="10" rx="3"/><rect class="q3" x="0" y="62" width="240" height="10" rx="3"/><rect x="10" y="72" width="14" height="52" rx="1.5" style="fill:#b5543c"/><rect x="26" y="80" width="12" height="44" rx="1.5" style="fill:#4f7a64"/><rect x="40" y="66" width="16" height="58" rx="1.5" style="fill:#d9a441"/><rect x="58" y="76" width="13" height="48" rx="1.5" style="fill:#6f5a8c"/><rect x="73" y="70" width="15" height="54" rx="1.5" style="fill:#c97c5d"/><rect x="90" y="82" width="12" height="42" rx="1.5" style="fill:#3f6a8c"/><rect x="108" y="86" width="14" height="38" rx="1.5" transform="rotate(14 115 124)" style="fill:#e8c36a"/><path d="M168 124L176 98H204L212 124Z" style="fill:#c9784f"/><g style="fill:#5fae6a"><ellipse cx="190" cy="82" rx="7" ry="18" transform="rotate(-22 190 98)"/><ellipse cx="190" cy="78" rx="7" ry="20"/><ellipse cx="190" cy="82" rx="7" ry="18" transform="rotate(22 190 98)"/></g><rect x="16" y="40" width="30" height="22" rx="2" style="fill:#fff4e0;stroke:#8a5a33;stroke-width:3"/><path d="M20 58L28 48L34 54L40 46L44 58Z" style="fill:#b5543c"/><path d="M80 62V42Q80 32 90 32T100 42V62Z" style="fill:#d9a441"/><rect x="146" y="40" width="10" height="22" rx="2" style="fill:#fff4e0"/><path d="M151 40Q146 32 151 26Q156 32 151 40Z" style="fill:#ffb347"/></svg><svg class="shape eh-win opt" viewBox="0 0 160 230"><rect class="q2" x="10" y="14" width="140" height="200" rx="6"/><rect x="20" y="24" width="120" height="180" rx="3" style="fill:var(--q10)"/><path class="q7" d="M104 54A22 22 0 1 0 122 92A17 17 0 1 1 104 54Z"/><circle cx="40" cy="60" r="1.6" style="fill:#fff"/><circle cx="62" cy="96" r="1.3" style="fill:#fff"/><circle cx="90" cy="40" r="1.4" style="fill:#fff"/><path class="z2" d="M80 24V204M20 114H140" stroke-width="5"/><path class="q4" d="M0 6C20 40 22 150 4 226H44C32 160 36 60 52 6Z"/><path class="q4" d="M160 6C140 40 138 150 156 226H116C128 160 124 60 108 6Z"/></svg><div class="shape eh-floor"></div><svg class="shape eh-rug" viewBox="0 0 400 70"><ellipse class="q4" cx="200" cy="36" rx="196" ry="32"/><ellipse cx="200" cy="36" rx="164" ry="25" style="fill:none;stroke:#fff;stroke-opacity:.3;stroke-width:3"/><ellipse class="q9" cx="200" cy="36" rx="110" ry="16" fill-opacity=".5"/></svg><div class="shape eh-glow"></div><svg class="shape eh-art opt" viewBox="0 0 120 90"><rect class="q2" x="2" y="2" width="116" height="86" rx="4"/><rect x="10" y="10" width="100" height="70" style="fill:#f6c88e"/><path d="M10 80L40 44L62 66L82 38L110 80Z" style="fill:#8a5a3c"/><circle cx="86" cy="28" r="9" style="fill:#fff1c0"/></svg><svg class="shape eh-fire" viewBox="0 0 300 270"><rect class="q1" x="4" y="42" width="292" height="228" rx="10"/><rect x="14" y="70" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="50" y="70" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="86" y="70" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="122" y="70" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="158" y="70" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="194" y="70" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="230" y="70" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="32" y="90" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="68" y="90" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="104" y="90" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="140" y="90" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="176" y="90" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="212" y="90" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="248" y="90" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="14" y="110" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="50" y="110" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="86" y="110" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="122" y="110" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="158" y="110" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="194" y="110" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="230" y="110" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="32" y="130" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="68" y="130" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="104" y="130" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="140" y="130" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="176" y="130" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="212" y="130" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="248" y="130" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="14" y="150" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="50" y="150" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="86" y="150" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="122" y="150" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="158" y="150" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="194" y="150" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="230" y="150" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="32" y="170" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="68" y="170" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="104" y="170" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="140" y="170" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="176" y="170" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="212" y="170" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="248" y="170" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="14" y="190" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="50" y="190" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="86" y="190" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="122" y="190" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="158" y="190" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="194" y="190" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="230" y="190" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="32" y="210" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="68" y="210" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="104" y="210" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="140" y="210" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="176" y="210" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="212" y="210" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect x="248" y="210" width="32" height="16" rx="2" style="fill:var(--q2);fill-opacity:.55"/><rect class="q2" x="0" y="26" width="300" height="22" rx="6"/><rect class="q3" x="86" y="120" width="128" height="150" rx="52"/><rect x="96" y="132" width="108" height="138" rx="46" style="fill:#120805"/><g class="fl1"><path class="q5" d="M150 236C108 236 104 196 126 172C128 190 140 190 142 176C140 150 156 140 160 120C176 150 198 170 190 206C186 226 172 236 150 236Z"/></g><g class="fl2"><path class="q6" d="M150 236C128 236 126 212 142 198C146 208 156 208 158 196C168 210 176 224 168 232C164 236 158 236 150 236Z"/></g><rect class="q8" x="100" y="226" width="100" height="14" rx="7" transform="rotate(-6 150 233)"/><rect class="q8" x="104" y="236" width="94" height="14" rx="7" transform="rotate(5 150 243)"/><rect class="q7" x="40" y="-4" width="10" height="30" rx="3"/><rect class="q7" x="66" y="4" width="10" height="22" rx="3"/><rect x="38" y="-14" width="14" height="14" rx="7" class="cn" style="fill:#ffd27a"/><circle cx="238" cy="6" r="18" style="fill:#fff;stroke:var(--q2);stroke-width:4"/><path d="M238 -4V6L246 10" style="fill:none;stroke:#5a3520;stroke-width:2.4;stroke-linecap:round"/></svg><svg class="shape eh-chair" viewBox="0 0 230 190"><path class="q11" d="M22 70Q22 24 62 24H168Q208 24 208 70V150H22Z"/><path class="q12" d="M44 78H186V132H44Z"/><path class="q11" d="M6 94Q6 76 24 76H44V162H6Z"/><path class="q11" d="M224 94Q224 76 206 76H186V162H224Z"/><path class="q9" d="M52 90L130 150L52 150Z"/><path d="M52 100L120 150M52 120L96 150" style="stroke:#fff;stroke-opacity:.3;stroke-width:4;fill:none"/><rect class="q3" x="22" y="162" width="14" height="24" rx="3"/><rect class="q3" x="194" y="162" width="14" height="24" rx="3"/><path class="q6" d="M70 100H168V128H70Z" fill-opacity="0"/></svg><svg class="shape eh-mug" viewBox="0 0 120 150"><path d="M20 94H100" style="stroke:#6e4020;stroke-width:0"/><path d="M30 96L22 148M90 96L98 148M60 100V148" style="stroke:#5a3820;stroke-width:6;stroke-linecap:round"/><ellipse cx="60" cy="90" rx="52" ry="9" style="fill:#8a5a33"/><ellipse cx="60" cy="87" rx="52" ry="9" style="fill:#b07a46"/><ellipse cx="60" cy="84" rx="30" ry="5" style="fill:#f3e9db"/><path d="M38 40H82V64Q82 82 60 82T38 64Z" style="fill:#fbf3e6"/><path d="M82 46H92Q100 54 92 62H82" style="fill:none;stroke:#fbf3e6;stroke-width:5"/><ellipse cx="60" cy="40" rx="22" ry="4.5" style="fill:#5a3520"/></svg><div class="shape eh-steam"></div>
        `,

        // ★ AUTUMN — Autumn · Porch · Harvest
        autumn: `
<div class="shape at-sun"></div><div class="shape at-hill"></div><div class="shape at-trees"></div><svg class="shape at-tree l" viewBox="0 0 300 380"><path class="q11" d="M138 380C142 300 130 250 122 190C170 150 150 100 150 60L170 60C170 110 196 150 154 196C170 250 172 310 176 380Z"/><circle class="q6" cx="145" cy="66" r="39"/><circle class="q6" cx="177" cy="69" r="51"/><circle class="q6" cx="150" cy="58" r="34"/><circle class="q7" cx="174" cy="67" r="37"/><circle class="q6" cx="174" cy="79" r="42"/><circle class="q8" cx="105" cy="116" r="42"/><circle class="q7" cx="92" cy="129" r="46"/><circle class="q7" cx="63" cy="131" r="36"/><circle class="q6" cx="87" cy="122" r="40"/><circle class="q7" cx="70" cy="127" r="42"/><circle class="q6" cx="186" cy="97" r="46"/><circle class="q8" cx="224" cy="122" r="44"/><circle class="q8" cx="186" cy="113" r="44"/><circle class="q7" cx="193" cy="129" r="50"/><circle class="q7" cx="198" cy="130" r="43"/><circle class="q7" cx="88" cy="165" r="34"/><circle class="q6" cx="41" cy="180" r="52"/><circle class="q6" cx="60" cy="172" r="47"/><circle class="q6" cx="64" cy="162" r="52"/><circle class="q6" cx="42" cy="155" r="40"/><circle class="q7" cx="231" cy="174" r="40"/><circle class="q6" cx="221" cy="189" r="37"/><circle class="q7" cx="233" cy="178" r="46"/><circle class="q8" cx="266" cy="166" r="52"/><circle class="q8" cx="245" cy="187" r="43"/><circle class="q7" cx="159" cy="159" r="38"/><circle class="q8" cx="126" cy="153" r="48"/><circle class="q7" cx="125" cy="131" r="49"/><circle class="q8" cx="138" cy="136" r="37"/><circle class="q6" cx="171" cy="146" r="37"/></svg><svg class="shape at-tree r opt" viewBox="0 0 300 380"><path class="q11" d="M138 380C142 300 130 250 122 190C170 150 150 100 150 60L170 60C170 110 196 150 154 196C170 250 172 310 176 380Z"/><circle class="q6" cx="164" cy="69" r="39"/><circle class="q8" cx="151" cy="80" r="35"/><circle class="q6" cx="172" cy="64" r="37"/><circle class="q7" cx="156" cy="67" r="44"/><circle class="q7" cx="139" cy="72" r="39"/><circle class="q8" cx="63" cy="128" r="51"/><circle class="q6" cx="77" cy="112" r="38"/><circle class="q8" cx="86" cy="128" r="48"/><circle class="q6" cx="69" cy="102" r="36"/><circle class="q6" cx="98" cy="133" r="35"/><circle class="q6" cx="219" cy="94" r="44"/><circle class="q7" cx="204" cy="127" r="45"/><circle class="q6" cx="192" cy="105" r="47"/><circle class="q8" cx="224" cy="115" r="43"/><circle class="q8" cx="225" cy="123" r="34"/><circle class="q7" cx="80" cy="166" r="44"/><circle class="q8" cx="45" cy="190" r="45"/><circle class="q8" cx="34" cy="165" r="40"/><circle class="q7" cx="78" cy="183" r="43"/><circle class="q8" cx="38" cy="174" r="43"/><circle class="q8" cx="230" cy="171" r="39"/><circle class="q8" cx="241" cy="173" r="35"/><circle class="q7" cx="267" cy="164" r="40"/><circle class="q7" cx="218" cy="151" r="35"/><circle class="q7" cx="240" cy="190" r="46"/><circle class="q8" cx="147" cy="141" r="41"/><circle class="q7" cx="126" cy="119" r="46"/><circle class="q6" cx="136" cy="149" r="49"/><circle class="q8" cx="146" cy="153" r="41"/><circle class="q7" cx="149" cy="146" r="51"/></svg><div class="shape at-floor"></div><div class="shape at-rail"></div><div class="shape at-lantern"><svg viewBox="0 0 50 80"><path class="q11" d="M10 16L25 3L40 16Z"/><rect x="9" y="16" width="32" height="46" rx="7" style="fill:#ffe7a0;fill-opacity:.75;stroke:var(--q11);stroke-width:3"/><ellipse cx="25" cy="42" rx="6" ry="10" style="fill:#ffbf3f"/><ellipse cx="25" cy="44" rx="3" ry="6" style="fill:#fff3c0"/><rect class="q11" x="8" y="62" width="34" height="7" rx="3"/></svg></div><svg class="shape at-pump" viewBox="0 0 240 150"><g><ellipse class="q4" cx="66" cy="112" rx="58" ry="38"/><ellipse class="q3" cx="52" cy="112" rx="32" ry="37"/><ellipse class="q3" cx="82" cy="112" rx="30" ry="37"/><path class="z5" d="M66 76Q70 62 82 58" stroke-width="7"/></g><g><ellipse class="q4" cx="168" cy="126" rx="44" ry="28"/><ellipse class="q3" cx="156" cy="126" rx="24" ry="27"/><ellipse class="q3" cx="180" cy="126" rx="22" ry="27"/><path class="z5" d="M168 98Q170 88 180 84" stroke-width="6"/></g><g><ellipse class="q3" cx="120" cy="70" rx="32" ry="22" transform="rotate(-10 120 70)"/><path class="z5" d="M118 50Q120 40 128 38" stroke-width="5"/></g></svg><svg class="shape at-hay opt" viewBox="0 0 180 120"><rect class="q10" x="8" y="30" width="164" height="84" rx="14"/><path d="M20 48H160M16 70H164M20 92H160" style="stroke:var(--q2);stroke-width:3;opacity:.5;fill:none"/><path class="z2" d="M56 30V114M124 30V114" stroke-width="5"/></svg><svg class="shape at-chair" viewBox="0 0 180 170"><g class="rk"><path class="z2" d="M40 20L34 120M40 20Q70 14 96 24L88 116" stroke-width="9"/><path class="q9" d="M44 60Q70 72 92 64L100 104Q70 112 44 104Z"/><path d="M52 70L88 104M52 84L72 104" style="stroke:#fff;stroke-opacity:.35;stroke-width:4;fill:none"/><path class="z2" d="M34 120H112L132 62M24 150Q80 170 150 146" stroke-width="8"/></g></svg><svg class="shape at-mug" viewBox="0 0 120 80"><ellipse cx="60" cy="72" rx="46" ry="7" style="fill:#e6d3b5"/><path d="M34 28H88V52Q88 70 61 70T34 52Z" class="q12"/><path d="M88 34H98Q106 42 98 50H88" style="fill:none;stroke:#fbf3e6;stroke-width:5"/></svg><div class="shape at-steam"></div><svg class="shape at-leaf a" viewBox="0 0 34 34"><g class="q6"><path d="M17 2L19.8 8.5L24.5 6.5L23.3 13L29.5 11.5L26 17.5L30 20L22 22L22.3 24.5L17.8 23.5V31H16.2V23.5L11.7 24.5L12 22L4 20L8 17.5L4.5 11.5L10.7 13L9.5 6.5L14.2 8.5Z"/></g></svg><svg class="shape at-leaf b opt" viewBox="0 0 34 34"><g class="q8"><path d="M17 2L19.8 8.5L24.5 6.5L23.3 13L29.5 11.5L26 17.5L30 20L22 22L22.3 24.5L17.8 23.5V31H16.2V23.5L11.7 24.5L12 22L4 20L8 17.5L4.5 11.5L10.7 13L9.5 6.5L14.2 8.5Z"/></g></svg>
        `,

        // ★ TROPIC — Tropic · Tiki · Beach Bar
        tropic: `
<div class="shape tp-sun"></div><div class="shape tp-sea"></div><div class="shape tp-waves"></div><div class="shape tp-sand"></div><svg class="shape tp-palm l" viewBox="0 0 200 300"><path class="z7" d="M80 300C84 230 76 150 94 70" stroke-width="12"/><g class="fr"><path class="q5" d="M94 70C60 20 14 28 -6 60C30 46 66 52 94 70Z"/><path class="q6" d="M94 70C128 20 176 26 198 60C160 46 124 52 94 70Z"/><path class="q5" d="M94 70C70 30 76 -6 98 -14C112 14 110 46 94 70Z"/><path class="q6" d="M94 70C50 62 20 86 18 118C50 98 74 86 94 70Z"/><path class="q5" d="M94 70C140 62 170 86 172 118C140 98 114 86 94 70Z"/></g><circle class="q7" cx="86" cy="76" r="7"/><circle class="q7" cx="102" cy="78" r="7"/></svg><svg class="shape tp-palm r opt" viewBox="0 0 200 300"><path class="z7" d="M80 300C84 230 76 150 94 70" stroke-width="12"/><g class="fr"><path class="q5" d="M94 70C60 20 14 28 -6 60C30 46 66 52 94 70Z"/><path class="q6" d="M94 70C128 20 176 26 198 60C160 46 124 52 94 70Z"/><path class="q5" d="M94 70C70 30 76 -6 98 -14C112 14 110 46 94 70Z"/><path class="q6" d="M94 70C50 62 20 86 18 118C50 98 74 86 94 70Z"/><path class="q5" d="M94 70C140 62 170 86 172 118C140 98 114 86 94 70Z"/></g><circle class="q7" cx="86" cy="76" r="7"/><circle class="q7" cx="102" cy="78" r="7"/></svg><svg class="shape tp-surf opt" viewBox="0 0 120 190"><g transform="rotate(-8 40 100)"><path class="q11" d="M40 4Q68 60 64 150Q40 176 16 150Q12 60 40 4Z"/><path d="M40 10V160" style="stroke:#fff;stroke-width:3;opacity:.7"/></g><g transform="rotate(10 90 100)"><path class="q9" d="M92 20Q118 70 114 156Q92 180 70 156Q66 70 92 20Z"/><path d="M92 30V166" style="stroke:#fff;stroke-width:3;opacity:.7"/></g></svg><svg class="shape tp-bar" viewBox="0 0 340 280"><path class="q2" d="M10 90L170 8L330 90Z"/><path class="q1" d="M10 90L170 8L330 90L330 100Q300 118 270 100Q240 118 210 100Q180 118 150 100Q120 118 90 100Q60 118 30 100L10 100Z"/><rect class="q4" x="30" y="100" width="12" height="170"/><rect class="q4" x="298" y="100" width="12" height="170"/><rect class="q3" x="20" y="190" width="300" height="84" rx="6"/><path d="M20 214H320M20 238H320" style="stroke:var(--q4);stroke-width:3;fill:none"/><rect class="q4" x="14" y="182" width="312" height="14" rx="5"/><path class="q12" d="M70 182L64 150H100L94 182Z" fill-opacity=".9"/><path class="z11" d="M82 150L96 126" stroke-width="3"/><circle class="q11" cx="98" cy="124" r="6"/><path class="q10" d="M150 182L146 148H180L176 182Z" fill-opacity=".85"/><path class="z5" d="M164 148L172 124" stroke-width="3"/><path class="q11" d="M168 118L194 126L172 136Z"/><circle class="q7" cx="250" cy="170" r="14"/><path d="M243 170h14M250 163v14" style="stroke:var(--q4);stroke-width:2"/><path class="q4" d="M135 100Q170 82 205 100V130Q170 148 135 130Z" fill-opacity="0"/></svg><div class="shape tp-lights"></div><svg class="shape tp-parrot" viewBox="0 0 90 120"><path class="z7" d="M10 112H80" stroke-width="6"/><g class="hd"><path d="M40 108C22 96 22 52 42 38C60 26 76 44 66 64C60 80 62 98 40 108Z" style="fill:#e33b3b"/><circle cx="52" cy="42" r="15" style="fill:#e33b3b"/><path d="M60 40C74 38 78 52 66 54Z" style="fill:#f6c343"/><circle cx="54" cy="38" r="3.4" style="fill:#fff"/><circle cx="55" cy="38" r="1.6" style="fill:#222"/><path d="M34 70C20 80 18 98 26 110C34 100 40 86 34 70Z" style="fill:#2fa3d9"/></g></svg><svg class="shape tp-hib opt" viewBox="0 0 80 80"><g><ellipse class="q11" cx="40" cy="24" rx="11" ry="16" transform="rotate(0.0 40 40)"/><ellipse class="q11" cx="40" cy="24" rx="11" ry="16" transform="rotate(72.0 40 40)"/><ellipse class="q11" cx="40" cy="24" rx="11" ry="16" transform="rotate(144.0 40 40)"/><ellipse class="q11" cx="40" cy="24" rx="11" ry="16" transform="rotate(216.0 40 40)"/><ellipse class="q11" cx="40" cy="24" rx="11" ry="16" transform="rotate(288.0 40 40)"/></g><circle class="q12" cx="40" cy="40" r="5"/></svg>
        `,

        // ★ MOONLIT — Moonlit · Street · Late Night
        moonlit: `
<div class="shape ml-stars"></div><div class="shape ml-glow"></div><div class="shape ml-moon"></div><div class="shape ml-beam"></div><div class="shape ml-far"></div>
<svg class="shape ml-b l" viewBox="0 0 300 520"><rect class='q1' x='0' y='50' width='120' height='470'/><rect class='q3' x='-4' y='42' width='128' height='10'/><rect class='q4' x='13' y='76' width='14' height='24' rx='2'/><rect class='q5' x='53' y='76' width='14' height='24' rx='2'/><rect class='q5' x='93' y='76' width='14' height='24' rx='2'/><rect class='q5' x='13' y='132' width='14' height='24' rx='2'/><rect class='q5' x='53' y='132' width='14' height='24' rx='2'/><rect class='q4' x='93' y='132' width='14' height='24' rx='2'/><rect class='q4' x='13' y='188' width='14' height='24' rx='2'/><rect class='q5' x='53' y='188' width='14' height='24' rx='2'/><rect class='q4' x='93' y='188' width='14' height='24' rx='2'/><rect class='q4' x='13' y='244' width='14' height='24' rx='2'/><rect class='q5' x='53' y='244' width='14' height='24' rx='2'/><rect class='q5' x='93' y='244' width='14' height='24' rx='2'/><rect class='q5' x='13' y='300' width='14' height='24' rx='2'/><rect class='q5' x='53' y='300' width='14' height='24' rx='2'/><rect class='q5' x='93' y='300' width='14' height='24' rx='2'/><rect class='q4' x='13' y='356' width='14' height='24' rx='2'/><rect class='q5' x='53' y='356' width='14' height='24' rx='2'/><rect class='q5' x='93' y='356' width='14' height='24' rx='2'/><rect class='q5' x='13' y='412' width='14' height='24' rx='2'/><rect class='q5' x='53' y='412' width='14' height='24' rx='2'/><rect class='q5' x='93' y='412' width='14' height='24' rx='2'/><rect class='q1' x='120' y='140' width='92' height='380'/><rect class='q3' x='116' y='132' width='100' height='10'/><rect class='q4' x='136' y='166' width='14' height='24' rx='2'/><rect class='q5' x='182' y='166' width='14' height='24' rx='2'/><rect class='q5' x='136' y='222' width='14' height='24' rx='2'/><rect class='q5' x='182' y='222' width='14' height='24' rx='2'/><rect class='q4' x='136' y='278' width='14' height='24' rx='2'/><rect class='q5' x='182' y='278' width='14' height='24' rx='2'/><rect class='q5' x='136' y='334' width='14' height='24' rx='2'/><rect class='q5' x='182' y='334' width='14' height='24' rx='2'/><rect class='q5' x='136' y='390' width='14' height='24' rx='2'/><rect class='q5' x='182' y='390' width='14' height='24' rx='2'/><rect class='q2' x='212' y='230' width='88' height='290'/><rect class='q3' x='208' y='222' width='96' height='10'/><rect class='q5' x='227' y='256' width='14' height='24' rx='2'/><rect class='q5' x='271' y='256' width='14' height='24' rx='2'/><rect class='q5' x='227' y='312' width='14' height='24' rx='2'/><rect class='q5' x='271' y='312' width='14' height='24' rx='2'/><rect class='q5' x='227' y='368' width='14' height='24' rx='2'/><rect class='q5' x='271' y='368' width='14' height='24' rx='2'/><rect class='q4' x='227' y='424' width='14' height='24' rx='2'/><rect class='q4' x='271' y='424' width='14' height='24' rx='2'/><rect class='q3' x='86' y='24' width='16' height='28'/><path class='q3' d='M26 520V500Q39 486 52 500V520Z'/></svg><svg class="shape ml-b r" viewBox="0 0 300 520"><rect class='q1' x='0' y='50' width='120' height='470'/><rect class='q3' x='-4' y='42' width='128' height='10'/><rect class='q4' x='13' y='76' width='14' height='24' rx='2'/><rect class='q5' x='53' y='76' width='14' height='24' rx='2'/><rect class='q4' x='93' y='76' width='14' height='24' rx='2'/><rect class='q5' x='13' y='132' width='14' height='24' rx='2'/><rect class='q4' x='53' y='132' width='14' height='24' rx='2'/><rect class='q4' x='93' y='132' width='14' height='24' rx='2'/><rect class='q5' x='13' y='188' width='14' height='24' rx='2'/><rect class='q4' x='53' y='188' width='14' height='24' rx='2'/><rect class='q5' x='93' y='188' width='14' height='24' rx='2'/><rect class='q5' x='13' y='244' width='14' height='24' rx='2'/><rect class='q5' x='53' y='244' width='14' height='24' rx='2'/><rect class='q5' x='93' y='244' width='14' height='24' rx='2'/><rect class='q4' x='13' y='300' width='14' height='24' rx='2'/><rect class='q5' x='53' y='300' width='14' height='24' rx='2'/><rect class='q4' x='93' y='300' width='14' height='24' rx='2'/><rect class='q4' x='13' y='356' width='14' height='24' rx='2'/><rect class='q4' x='53' y='356' width='14' height='24' rx='2'/><rect class='q4' x='93' y='356' width='14' height='24' rx='2'/><rect class='q5' x='13' y='412' width='14' height='24' rx='2'/><rect class='q5' x='53' y='412' width='14' height='24' rx='2'/><rect class='q5' x='93' y='412' width='14' height='24' rx='2'/><rect class='q1' x='120' y='140' width='92' height='380'/><rect class='q3' x='116' y='132' width='100' height='10'/><rect class='q4' x='136' y='166' width='14' height='24' rx='2'/><rect class='q4' x='182' y='166' width='14' height='24' rx='2'/><rect class='q5' x='136' y='222' width='14' height='24' rx='2'/><rect class='q4' x='182' y='222' width='14' height='24' rx='2'/><rect class='q5' x='136' y='278' width='14' height='24' rx='2'/><rect class='q5' x='182' y='278' width='14' height='24' rx='2'/><rect class='q5' x='136' y='334' width='14' height='24' rx='2'/><rect class='q5' x='182' y='334' width='14' height='24' rx='2'/><rect class='q5' x='136' y='390' width='14' height='24' rx='2'/><rect class='q5' x='182' y='390' width='14' height='24' rx='2'/><rect class='q2' x='212' y='230' width='88' height='290'/><rect class='q3' x='208' y='222' width='96' height='10'/><rect class='q5' x='227' y='256' width='14' height='24' rx='2'/><rect class='q5' x='271' y='256' width='14' height='24' rx='2'/><rect class='q5' x='227' y='312' width='14' height='24' rx='2'/><rect class='q4' x='271' y='312' width='14' height='24' rx='2'/><rect class='q4' x='227' y='368' width='14' height='24' rx='2'/><rect class='q5' x='271' y='368' width='14' height='24' rx='2'/><rect class='q5' x='227' y='424' width='14' height='24' rx='2'/><rect class='q4' x='271' y='424' width='14' height='24' rx='2'/><rect class='q3' x='86' y='24' width='16' height='28'/><path class='q3' d='M26 520V500Q39 486 52 500V520Z'/></svg>
<div class="shape ml-lg"></div><svg class="shape ml-lamp" viewBox="0 0 80 300"><rect class="q6" x="36" y="40" width="8" height="260"/><rect class="q6" x="28" y="280" width="24" height="20" rx="3"/><path class="z6" d="M40 44Q40 20 62 20" stroke-width="6"/><path class="q6" d="M52 18H76L72 32H56Z"/><rect class="q4" x="57" y="30" width="14" height="10" rx="3"/></svg>
<div class="shape ml-road"></div><div class="shape ml-wet"></div><div class="shape ml-fog"></div>
<svg class="shape ml-cat" viewBox="0 0 60 70"><path class="z7" d="M44 62C58 60 60 40 50 34" stroke-width="6"/><ellipse class="q7" cx="30" cy="52" rx="18" ry="17"/><circle class="q7" cx="30" cy="26" r="13"/><path class="q7" d="M19 18L20 4L30 13ZM41 18L40 4L30 13Z"/><circle fill="#ffe27a" cx="25" cy="25" r="2.2"/><circle fill="#ffe27a" cx="35" cy="25" r="2.2"/></svg>
        `,
        // ★ AURORA — Aurora · Arctic · Cabin
        aurora: `
<div class="shape ar-stars"></div><div class="shape ar-stars t"></div><svg class="shape ar-rib a1" viewBox="0 0 1200 500" preserveAspectRatio="none"><defs><linearGradient id="a1g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--ra);stop-opacity:.95"/><stop offset=".5" style="stop-color:var(--rb);stop-opacity:.45"/><stop offset="1" style="stop-color:var(--rb);stop-opacity:0"/></linearGradient></defs><path fill="url(#a1g)" d="M0 190C150 80 300 260 450 160S750 30 900 150S1130 240 1200 110V500H0Z"/></svg><svg class="shape ar-rib a2" viewBox="0 0 1200 500" preserveAspectRatio="none"><defs><linearGradient id="a2g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--rc);stop-opacity:.95"/><stop offset=".5" style="stop-color:var(--ra);stop-opacity:.45"/><stop offset="1" style="stop-color:var(--ra);stop-opacity:0"/></linearGradient></defs><path fill="url(#a2g)" d="M0 120C180 230 330 60 520 150S820 250 1000 120S1140 70 1200 150V500H0Z"/></svg><svg class="shape ar-mtn f" viewBox="0 0 1000 200" preserveAspectRatio="none"><polygon class="q5" points="0,200 70,120 130,150 200,70 280,140 360,90 450,150 540,60 630,140 720,100 810,150 900,80 1000,200"/><path class="q9" d="M200 70L178 98L196 92L212 104L226 88ZM540 60L516 92L536 86L552 98L566 82ZM900 80L880 106L896 100L910 110Z" fill-opacity=".85"/></svg><svg class="shape ar-mtn n" viewBox="0 0 1000 200" preserveAspectRatio="none"><polygon class="q4" points="0,200 40,140 110,170 190,100 270,160 340,120 410,170 500,110 580,170 660,126 760,172 850,120 940,160 1000,200"/><path class="q9" d="M190 100L170 124L186 118L202 128L214 112ZM500 110L482 132L498 128L512 136L524 120ZM850 120L832 142L846 138L860 146Z" fill-opacity=".7"/></svg><div class="shape ar-trees"></div><svg class='shape ar-lake' viewBox='0 0 1000 200' preserveAspectRatio='none'><defs><linearGradient id='arLk' x1='0' y1='0' x2='0' y2='1'><stop offset='0' style='stop-color:var(--lk1)'/><stop offset='1' style='stop-color:var(--lk2)'/></linearGradient><linearGradient id='arRf' x1='0' y1='0' x2='1' y2='0'><stop offset='0' style='stop-color:var(--ra);stop-opacity:0'/><stop offset='.3' style='stop-color:var(--ra);stop-opacity:.55'/><stop offset='.6' style='stop-color:var(--rc);stop-opacity:.5'/><stop offset='1' style='stop-color:var(--rc);stop-opacity:0'/></linearGradient></defs><path fill='url(#arLk)' d='M0 70C120 30 300 24 500 30S880 26 1000 66V200H0Z'/><path fill='url(#arRf)' opacity='.45' d='M0 70C120 30 300 24 500 30S880 26 1000 66V120C760 150 240 150 0 120Z'/><path d='M300 110L340 130L380 118M600 96L650 122L700 108M440 150L470 168' style='stroke:#fff;stroke-opacity:.3;stroke-width:1.6;fill:none'/></svg><svg class='shape ar-hill' viewBox='0 0 1000 200' preserveAspectRatio='none'><path style='fill:var(--sh)' d='M0 200V118C60 80 160 58 260 78C320 90 380 118 420 200ZM556 200C616 128 720 78 820 72C900 68 960 84 1000 104V200Z'/><path class='q7' d='M0 200V108C60 70 160 48 260 68C320 80 380 108 420 200ZM560 200C620 120 720 70 820 64C900 60 960 76 1000 96V200Z'/></svg><svg class="shape ar-pines l" viewBox="0 0 210 100"><g transform='translate(0 20) scale(0.8)'><path class='q6' d='M30 2L46 34H38L52 58H42L58 90H2L18 58H8L22 34H14Z'/><rect class='q6' x='26' y='88' width='8' height='12'/><path class='q9' d='M30 2L38 18H22ZM22 34L30 48L38 34ZM16 58L30 72L44 58Z' fill-opacity='.9'/></g><g transform='translate(34 0) scale(1.0)'><path class='q6' d='M30 2L46 34H38L52 58H42L58 90H2L18 58H8L22 34H14Z'/><rect class='q6' x='26' y='88' width='8' height='12'/><path class='q9' d='M30 2L38 18H22ZM22 34L30 48L38 34ZM16 58L30 72L44 58Z' fill-opacity='.9'/></g><g transform='translate(78 28) scale(0.72)'><path class='q6' d='M30 2L46 34H38L52 58H42L58 90H2L18 58H8L22 34H14Z'/><rect class='q6' x='26' y='88' width='8' height='12'/><path class='q9' d='M30 2L38 18H22ZM22 34L30 48L38 34ZM16 58L30 72L44 58Z' fill-opacity='.9'/></g><g transform='translate(112 8) scale(0.92)'><path class='q6' d='M30 2L46 34H38L52 58H42L58 90H2L18 58H8L22 34H14Z'/><rect class='q6' x='26' y='88' width='8' height='12'/><path class='q9' d='M30 2L38 18H22ZM22 34L30 48L38 34ZM16 58L30 72L44 58Z' fill-opacity='.9'/></g><g transform='translate(150 34) scale(0.66)'><path class='q6' d='M30 2L46 34H38L52 58H42L58 90H2L18 58H8L22 34H14Z'/><rect class='q6' x='26' y='88' width='8' height='12'/><path class='q9' d='M30 2L38 18H22ZM22 34L30 48L38 34ZM16 58L30 72L44 58Z' fill-opacity='.9'/></g></svg><svg class="shape ar-pines r" viewBox="0 0 210 100"><g transform='translate(0 30) scale(0.7)'><path class='q6' d='M30 2L46 34H38L52 58H42L58 90H2L18 58H8L22 34H14Z'/><rect class='q6' x='26' y='88' width='8' height='12'/><path class='q9' d='M30 2L38 18H22ZM22 34L30 48L38 34ZM16 58L30 72L44 58Z' fill-opacity='.9'/></g><g transform='translate(36 0) scale(1.0)'><path class='q6' d='M30 2L46 34H38L52 58H42L58 90H2L18 58H8L22 34H14Z'/><rect class='q6' x='26' y='88' width='8' height='12'/><path class='q9' d='M30 2L38 18H22ZM22 34L30 48L38 34ZM16 58L30 72L44 58Z' fill-opacity='.9'/></g><g transform='translate(80 22) scale(0.78)'><path class='q6' d='M30 2L46 34H38L52 58H42L58 90H2L18 58H8L22 34H14Z'/><rect class='q6' x='26' y='88' width='8' height='12'/><path class='q9' d='M30 2L38 18H22ZM22 34L30 48L38 34ZM16 58L30 72L44 58Z' fill-opacity='.9'/></g><g transform='translate(118 5) scale(0.95)'><path class='q6' d='M30 2L46 34H38L52 58H42L58 90H2L18 58H8L22 34H14Z'/><rect class='q6' x='26' y='88' width='8' height='12'/><path class='q9' d='M30 2L38 18H22ZM22 34L30 48L38 34ZM16 58L30 72L44 58Z' fill-opacity='.9'/></g><g transform='translate(156 40) scale(0.6)'><path class='q6' d='M30 2L46 34H38L52 58H42L58 90H2L18 58H8L22 34H14Z'/><rect class='q6' x='26' y='88' width='8' height='12'/><path class='q9' d='M30 2L38 18H22ZM22 34L30 48L38 34ZM16 58L30 72L44 58Z' fill-opacity='.9'/></g></svg><svg class="shape ar-deer" viewBox="0 0 100 90"><g class="q6"><ellipse cx="46" cy="50" rx="24" ry="13"/><path d="M62 44L74 24L84 28L76 50Z"/><ellipse cx="84" cy="24" rx="9" ry="6"/><path d="M28 58L24 86H30L36 62ZM40 62L38 86H44L48 62ZM58 60L58 86H64L66 58ZM68 56L72 86H78L74 54Z"/></g><path d="M86 18L82 4M86 18L96 8M82 4L76 2M82 4L86 -2" style="stroke:var(--q6);stroke-width:2.4;stroke-linecap:round;fill:none"/></svg><svg class="shape ar-fire" viewBox="0 0 100 80"><path d="M20 74L80 62M24 62L76 74" style="stroke:#6b4630;stroke-width:6;stroke-linecap:round"/><path class="fl q10" d="M50 62C30 62 26 44 40 28C42 38 48 40 50 34C48 22 56 12 62 4C62 20 76 30 70 48C68 56 60 62 50 62Z"/><path class="fl q11" d="M50 62C40 62 38 52 46 44C48 50 52 50 54 46C58 52 60 62 50 62Z"/></svg><div class="shape ar-cabin"><svg viewBox="0 0 120 100"><rect class="q1" x="14" y="46" width="92" height="52"/><path class="q2" d="M6 50L60 12L114 50Z"/><path class="q7" d="M6 50L60 12L114 50Q60 36 6 50Z"/><rect class="q2" x="84" y="14" width="12" height="26"/><rect class="q8" x="26" y="62" width="22" height="18" rx="2"/><rect class="q8" x="70" y="62" width="22" height="18" rx="2"/><rect class="q2" x="52" y="68" width="16" height="30" rx="2"/></svg><i class="sm"></i></div>
        `,
        // ★ XMAS — Xmas · Christmas · Eve
        xmas: `
<div class="shape xm-wall"></div><svg class="shape xm-win opt" viewBox="0 0 180 240"><rect class="q5" x="8" y="14" width="164" height="212" rx="6"/><rect x="18" y="24" width="144" height="192" rx="3" style="fill:#142544"/><path class="q9" d="M18 190Q60 170 100 184T162 176V216H18Z"/><path d="M110 56A22 22 0 1 0 128 94A17 17 0 1 1 110 56Z" style="fill:#fff6d8"/><g class="q9"><circle cx="40" cy="60" r="2.4"/><circle cx="70" cy="110" r="2"/><circle cx="130" cy="140" r="2.4"/><circle cx="50" cy="150" r="2"/><circle cx="90" cy="40" r="1.8"/></g><path class="z5" d="M90 24V216M18 120H162" stroke-width="5"/><path class="q1" d="M0 6C20 40 22 150 4 232H44C32 160 36 60 52 6Z"/><path class="q1" d="M180 6C160 40 158 150 176 232H136C148 160 144 60 128 6Z"/></svg><div class="shape xm-garland"></div><div class="shape xm-parol"><svg viewBox="0 0 200 240"><path class="q3" d="M100 6L116 56L170 36L134 80L190 100L134 118L170 164L116 144L100 196L84 144L30 164L66 118L10 100L66 80L30 36L84 56Z"/><path class="q1" d="M100 40L110 80L150 90L110 104L100 150L90 104L50 90L90 80Z"/><circle class="q3" cx="100" cy="95" r="12"/><path class="q1" d="M92 196L84 238L100 224L116 238L108 196Z"/><path class="q3" d="M84 196L66 232L88 218ZM116 196L134 232L112 218Z"/></svg></div><div class="shape xm-floor"></div><svg class="shape xm-rug" viewBox="0 0 400 70"><ellipse class="q1" cx="200" cy="36" rx="196" ry="32"/><ellipse cx="200" cy="36" rx="160" ry="24" style="fill:none;stroke:#fff;stroke-opacity:.45;stroke-width:3"/><ellipse class="q2" cx="200" cy="36" rx="110" ry="16" fill-opacity=".7"/></svg><svg class="shape xm-tree" viewBox="0 0 220 300"><rect class="q8" x="98" y="270" width="24" height="22"/><path class="q6" d="M110 14L170 96H50Z"/><path class="q7" d="M110 70L186 170H34Z"/><path class="q6" d="M110 130L204 252H16Z"/><path class="z3" d="M64 112Q110 128 156 104M46 190Q110 214 176 184M34 248Q110 276 188 240" stroke-width="4" opacity=".9"/><g class="tl"><circle cx="76" cy="98" r="4" style="fill:#ff5d5d"/><circle cx="130" cy="86" r="4" style="fill:#ffd45c"/><circle cx="98" cy="150" r="4" style="fill:#5db7ff"/><circle cx="148" cy="164" r="4" style="fill:#ff5d5d"/><circle cx="60" cy="214" r="4" style="fill:#ffd45c"/><circle cx="112" cy="208" r="4" style="fill:#5db7ff"/><circle cx="168" cy="226" r="4" style="fill:#ff5d5d"/></g><circle class="q1" cx="92" cy="122" r="8"/><circle class="q10" cx="140" cy="132" r="8"/><circle class="q3" cx="76" cy="176" r="8"/><circle class="q1" cx="148" cy="196" r="8"/><circle class="q10" cx="88" cy="238" r="8"/><circle class="q3" cx="150" cy="248" r="8"/><circle class="q1" cx="116" cy="60" r="6"/><path class="q3" d="M110 -6L116 8L132 8L120 18L124 34L110 25L96 34L100 18L88 8L104 8Z"/></svg><svg class="shape xm-gifts" viewBox="0 0 220 112"><rect class="q1" x="0" y="50" width="74" height="60" rx="3"/><rect class="q3" x="30" y="50" width="14" height="60"/><path class="q3" d="M37 50C20 30 8 40 20 48ZM37 50C54 30 66 40 54 48Z"/><rect class="q2" x="84" y="26" width="60" height="84" rx="3"/><rect class="q9" x="106" y="26" width="12" height="84"/><rect class="q10" x="152" y="62" width="66" height="48" rx="3"/><rect class="q3" x="176" y="62" width="12" height="48"/><rect class="q12" x="40" y="0" width="46" height="50" rx="3"/><rect class="q3" x="58" y="0" width="10" height="50"/></svg><svg class="shape xm-treat opt" viewBox="0 0 200 150"><path d="M46 112L38 148M154 112L162 148M100 116V148" style="stroke:#6e4020;stroke-width:7;stroke-linecap:round"/><path d="M8 100H192V108Q100 122 8 108Z" style="fill:#7e4c26"/><ellipse cx="100" cy="100" rx="92" ry="12" style="fill:#b07a46"/><g transform="translate(0 20)"><ellipse cx="60" cy="78" rx="52" ry="9" style="fill:#fff"/><circle cx="46" cy="66" r="12" style="fill:#c98a4a"/><circle cx="74" cy="64" r="12" style="fill:#c98a4a"/><circle cx="42" cy="62" r="2" style="fill:#5a3520"/><circle cx="50" cy="68" r="2" style="fill:#5a3520"/><circle cx="72" cy="60" r="2" style="fill:#5a3520"/><path d="M130 82V34Q130 26 138 26H172Q180 26 180 34V82Z" style="fill:#fff;fill-opacity:.8;stroke:var(--q5);stroke-width:2"/><path d="M130 46H180V82H130Z" style="fill:#fff"/></g></svg>
        `,

        // ★ HALLOWEEN — Halloween · Haunted · Patch
        halloween: `
<div class="shape hw-stars"></div><div class="shape hw-moon"></div><div class="shape hw-hill"></div><svg class="shape hw-house" viewBox="0 0 260 260"><path class="q1" d="M30 250V120L70 70L110 120V90L150 30L190 90V250ZM190 250V130L230 100V250Z"/><path class="q1" d="M60 120V30L74 8L88 30V120Z"/><g class="q6 wf"><rect x="86" y="140" width="22" height="30" rx="10"/><rect x="136" y="110" width="22" height="30" rx="10"/><rect x="136" y="170" width="22" height="30" rx="10"/><rect x="46" y="160" width="20" height="28" rx="9"/><path d="M70 38V60H78V38Z"/></g><rect class="q2" x="90" y="210" width="34" height="40" rx="16"/><path class="z8" d="M110 30L150 6L190 30" stroke-width="4"/></svg><svg class="shape hw-tree" viewBox="0 0 220 320"><path class="z8" d="M110 320C108 250 100 200 96 160C70 140 50 110 30 90M96 160C130 150 160 120 190 80M100 200C70 190 50 200 30 224M104 224C140 214 170 224 196 250M62 126C54 100 62 80 80 66M160 108C172 84 168 60 150 44" stroke-width="12"/></svg><svg class="shape hw-bats" viewBox="0 0 200 60"><g class="q8"><path d="M20 30Q28 14 40 22Q46 10 52 22Q64 14 72 30Q60 26 56 36Q46 28 36 36Q32 26 20 30Z"/><path d="M110 40Q116 28 126 34Q132 24 138 34Q148 28 154 40Q146 36 142 44Q134 38 126 44Q122 36 110 40Z"/></g></svg><svg class="shape hw-ghost" viewBox="0 0 100 130"><path d="M10 120V52Q10 6 50 6T90 52V120L74 106L62 122L50 106L38 122L26 106Z" style="fill:#fff;fill-opacity:.92"/><circle cx="36" cy="52" r="7" style="fill:#2a1a44"/><circle cx="64" cy="52" r="7" style="fill:#2a1a44"/><ellipse cx="50" cy="76" rx="8" ry="10" style="fill:#2a1a44"/></svg><div class="shape hw-fog"></div><div class="shape hw-ground"></div><svg class="shape hw-graves opt" viewBox="0 0 360 100"><g class="q10"><path d="M10 100V50Q10 30 30 30T50 50V100Z"/><path d="M110 100V40Q110 20 134 20T158 40V100Z"/><path d="M230 100V56Q230 36 250 36T270 56V100Z"/><path d="M310 100V44Q310 26 328 26T346 44V100Z"/></g><path class="z8" d="M26 56V76M18 64H34M134 48V72M126 56H142" stroke-width="3"/></svg><svg class="shape hw-pumps l" viewBox="0 0 320 120"><g transform="translate(70 76) scale(1.0)"><ellipse class="q4" cx="0" cy="0" rx="46" ry="34"/><ellipse class="q3" cx="-16" cy="0" rx="22" ry="33"/><ellipse class="q3" cx="16" cy="0" rx="22" ry="33"/><ellipse class="q3" cx="0" cy="0" rx="18" ry="34"/><path class="z5" d="M0 -32Q2 -44 12 -48" stroke-width="7"/><g class="f1"><path class="q6" d="M-26 -10L-14 -22L-4 -8ZM6 -8L16 -22L28 -10Z"/><path class="q6" d="M-26 8Q-14 24 0 14Q14 24 26 8L20 20L12 14L4 22L-4 14L-12 20Z"/></g></g><g transform="translate(176 88) scale(0.74)"><ellipse class="q4" cx="0" cy="0" rx="46" ry="34"/><ellipse class="q3" cx="-16" cy="0" rx="22" ry="33"/><ellipse class="q3" cx="16" cy="0" rx="22" ry="33"/><ellipse class="q3" cx="0" cy="0" rx="18" ry="34"/><path class="z5" d="M0 -32Q2 -44 12 -48" stroke-width="7"/><g class="fs"><path class="q6" d="M-26 -10L-14 -22L-4 -8ZM6 -8L16 -22L28 -10Z"/><path class="q6" d="M-26 8Q-14 24 0 14Q14 24 26 8L20 20L12 14L4 22L-4 14L-12 20Z"/></g></g><g transform="translate(250 92) scale(0.56)"><ellipse class="q4" cx="0" cy="0" rx="46" ry="34"/><ellipse class="q3" cx="-16" cy="0" rx="22" ry="33"/><ellipse class="q3" cx="16" cy="0" rx="22" ry="33"/><ellipse class="q3" cx="0" cy="0" rx="18" ry="34"/><path class="z5" d="M0 -32Q2 -44 12 -48" stroke-width="7"/><g class="fs"><path class="q6" d="M-26 -10L-14 -22L-4 -8ZM6 -8L16 -22L28 -10Z"/><path class="q6" d="M-26 8Q-14 24 0 14Q14 24 26 8L20 20L12 14L4 22L-4 14L-12 20Z"/></g></g></svg><svg class="shape hw-pumps r" viewBox="0 0 320 120"><g transform="translate(120 84) scale(0.84)"><ellipse class="q4" cx="0" cy="0" rx="46" ry="34"/><ellipse class="q3" cx="-16" cy="0" rx="22" ry="33"/><ellipse class="q3" cx="16" cy="0" rx="22" ry="33"/><ellipse class="q3" cx="0" cy="0" rx="18" ry="34"/><path class="z5" d="M0 -32Q2 -44 12 -48" stroke-width="7"/><g class="fs"><path class="q6" d="M-26 -10L-14 -22L-4 -8ZM6 -8L16 -22L28 -10Z"/><path class="q6" d="M-26 8Q-14 24 0 14Q14 24 26 8L20 20L12 14L4 22L-4 14L-12 20Z"/></g></g><g transform="translate(230 76) scale(1.0)"><ellipse class="q4" cx="0" cy="0" rx="46" ry="34"/><ellipse class="q3" cx="-16" cy="0" rx="22" ry="33"/><ellipse class="q3" cx="16" cy="0" rx="22" ry="33"/><ellipse class="q3" cx="0" cy="0" rx="18" ry="34"/><path class="z5" d="M0 -32Q2 -44 12 -48" stroke-width="7"/><g class="f1"><path class="q6" d="M-26 -10L-14 -22L-4 -8ZM6 -8L16 -22L28 -10Z"/><path class="q6" d="M-26 8Q-14 24 0 14Q14 24 26 8L20 20L12 14L4 22L-4 14L-12 20Z"/></g></g></svg>
        `,

        // ★ EASTER — Easter · Egg · Hunt
        easter: `
<div class="shape es-sun"></div><svg class="shape es-cloud c1" viewBox="0 0 110 52"><g class="q8"><path d="M14 46C4 46 2 34 12 31C12 20 26 16 33 24C38 12 58 12 62 24C70 16 88 20 88 32C100 30 108 44 94 46Z"/></g></svg><svg class="shape es-cloud c2 opt" viewBox="0 0 110 52"><g class="q8"><path d="M14 46C4 46 2 34 12 31C12 20 26 16 33 24C38 12 58 12 62 24C70 16 88 20 88 32C100 30 108 44 94 46Z"/></g></svg><div class="shape es-hill h1"></div><div class="shape es-hill h2"></div><div class="shape es-fence"></div><svg class="shape es-bunt" viewBox="0 0 400 70" preserveAspectRatio="none"><path class="z8" d="M0 12Q200 52 400 12" stroke-width="2.4"/><path class="q4" d="M14 24Q34 58 54 24Z"/><path class="q5" d="M54 28Q74 58 94 28Z"/><path class="q6" d="M94 24Q114 58 134 24Z"/><path class="q7" d="M134 28Q154 58 174 28Z"/><path class="q4" d="M174 24Q194 58 214 24Z"/><path class="q5" d="M214 28Q234 58 254 28Z"/><path class="q6" d="M254 24Q274 58 294 24Z"/><path class="q7" d="M294 28Q314 58 334 28Z"/><path class="q4" d="M334 24Q354 58 374 24Z"/><path class="q5" d="M374 28Q394 58 414 28Z"/></svg><svg class="shape es-bunny" viewBox="0 0 160 200"><ellipse class="q8" cx="86" cy="150" rx="52" ry="42"/><circle class="q8" cx="140" cy="124" r="14"/><g class="ear"><ellipse class="q8" cx="56" cy="40" rx="13" ry="40" transform="rotate(-10 56 70)"/><ellipse class="q9" cx="56" cy="42" rx="6" ry="30" transform="rotate(-10 56 70)"/><ellipse class="q8" cx="86" cy="36" rx="13" ry="40" transform="rotate(10 86 70)"/><ellipse class="q9" cx="86" cy="38" rx="6" ry="30" transform="rotate(10 86 70)"/></g><circle class="q8" cx="72" cy="94" r="34"/><circle cx="62" cy="90" r="3.4" style="fill:#3a2a2a"/><circle cx="84" cy="90" r="3.4" style="fill:#3a2a2a"/><path class="q9" d="M68 100L78 100L73 106Z"/><path d="M73 106Q68 114 62 112M73 106Q78 114 84 112" style="fill:none;stroke:#3a2a2a;stroke-width:2"/><ellipse class="q9" cx="54" cy="102" rx="6" ry="4" fill-opacity=".6"/><ellipse class="q9" cx="92" cy="102" rx="6" ry="4" fill-opacity=".6"/><path class="q11" d="M56 126L72 134L88 126L88 140L72 134L56 140Z"/><ellipse class="q8" cx="50" cy="186" rx="26" ry="10"/><ellipse class="q8" cx="104" cy="188" rx="22" ry="9"/></svg><svg class="shape es-basket" viewBox="0 0 200 120"><path class="z12" d="M28 70C28 6 172 6 172 70" stroke-width="7"/><g transform="translate(60 34) scale(.9)"><path class="q4" d="M20 2C10 2 3 18 3 31C3 43 10 50 20 50S37 43 37 31C37 18 30 2 20 2Z"/><path class="q8" d="M3 26L10 31L17 26L24 31L31 26L37 31V35L31 30L24 35L17 30L10 35L3 30Z"/></g><g transform="translate(96 30) scale(.95)"><path class="q6" d="M20 2C10 2 3 18 3 31C3 43 10 50 20 50S37 43 37 31C37 18 30 2 20 2Z"/><circle class="q8" cx="14" cy="22" r="3"/><circle class="q8" cx="26" cy="30" r="3"/><circle class="q8" cx="16" cy="38" r="3"/></g><g transform="translate(128 36) scale(.85)"><path class="q5" d="M20 2C10 2 3 18 3 31C3 43 10 50 20 50S37 43 37 31C37 18 30 2 20 2Z"/><path class="q4" d="M5 30H35V34H5Z"/><path class="q4" d="M7 22H33V25H7Z"/></g><path class="q10" d="M30 62Q60 44 100 58T170 62L168 76H32Z"/><path class="q12" d="M14 68H186L170 116H30Z"/><path d="M26 84H174M32 100H168" style="stroke:#fff;stroke-opacity:.35;stroke-width:4"/></svg><svg class="shape es-egg e1" viewBox="0 0 40 52"><path class="q5" d="M20 2C10 2 3 18 3 31C3 43 10 50 20 50S37 43 37 31C37 18 30 2 20 2Z"/><circle class="q4" cx="14" cy="22" r="3"/><circle class="q4" cx="26" cy="30" r="3"/><circle class="q4" cx="16" cy="38" r="3"/></svg><svg class="shape es-egg e2 opt" viewBox="0 0 40 52"><path class="q7" d="M20 2C10 2 3 18 3 31C3 43 10 50 20 50S37 43 37 31C37 18 30 2 20 2Z"/><path class="q8" d="M3 26L10 31L17 26L24 31L31 26L37 31V35L31 30L24 35L17 30L10 35L3 30Z"/></svg><svg class="shape es-egg e3" viewBox="0 0 40 52"><path class="q4" d="M20 2C10 2 3 18 3 31C3 43 10 50 20 50S37 43 37 31C37 18 30 2 20 2Z"/><path class="q5" d="M5 30H35V34H5Z"/><path class="q5" d="M7 22H33V25H7Z"/></svg><svg class="shape es-egg e4 opt" viewBox="0 0 40 52"><path class="q6" d="M20 2C10 2 3 18 3 31C3 43 10 50 20 50S37 43 37 31C37 18 30 2 20 2Z"/><path class="q5" d="M3 26L10 31L17 26L24 31L31 26L37 31V35L31 30L24 35L17 30L10 35L3 30Z"/></svg><svg class="shape es-tul l" viewBox="0 0 300 130"><path class="z5" d="M9 120V57" stroke-width="3"/><path class="q10" d="M9 112Q-3 104 -5 92Q7 96 9 112Z" style="fill:var(--q10)"/><path class="q5" d="M-0 51L4 63Q9 69 14 63L18 51L13 55L9 47L5 55Z"/><path class="z5" d="M51 120V59" stroke-width="3"/><path class="q10" d="M51 112Q39 104 37 92Q49 96 51 112Z" style="fill:var(--q10)"/><path class="q11" d="M42 53L46 65Q51 71 56 65L60 53L55 57L51 49L47 57Z"/><path class="z5" d="M82 120V45" stroke-width="3"/><path class="q10" d="M82 112Q70 104 68 92Q80 96 82 112Z" style="fill:var(--q10)"/><path class="q7" d="M73 39L77 51Q82 57 87 51L91 39L86 43L82 35L78 43Z"/><path class="z5" d="M113 120V67" stroke-width="3"/><path class="q10" d="M113 112Q101 104 99 92Q111 96 113 112Z" style="fill:var(--q10)"/><path class="q7" d="M104 61L108 73Q113 79 118 73L122 61L117 65L113 57L109 65Z"/><path class="z5" d="M150 120V56" stroke-width="3"/><path class="q10" d="M150 112Q138 104 136 92Q148 96 150 112Z" style="fill:var(--q10)"/><path class="q7" d="M141 50L145 62Q150 68 155 62L159 50L154 54L150 46L146 54Z"/><path class="z5" d="M186 120V69" stroke-width="3"/><path class="q10" d="M186 112Q174 104 172 92Q184 96 186 112Z" style="fill:var(--q10)"/><path class="q4" d="M177 63L181 75Q186 81 191 75L195 63L190 67L186 59L182 67Z"/><path class="z5" d="M223 120V57" stroke-width="3"/><path class="q10" d="M223 112Q211 104 209 92Q221 96 223 112Z" style="fill:var(--q10)"/><path class="q11" d="M214 51L218 63Q223 69 228 63L232 51L227 55L223 47L219 55Z"/><path class="z5" d="M256 120V72" stroke-width="3"/><path class="q10" d="M256 112Q244 104 242 92Q254 96 256 112Z" style="fill:var(--q10)"/><path class="q11" d="M247 66L251 78Q256 84 261 78L265 66L260 70L256 62L252 70Z"/><path class="z5" d="M286 120V73" stroke-width="3"/><path class="q10" d="M286 112Q274 104 272 92Q284 96 286 112Z" style="fill:var(--q10)"/><path class="q5" d="M277 67L281 79Q286 85 291 79L295 67L290 71L286 63L282 71Z"/></svg><svg class="shape es-tul r opt" viewBox="0 0 300 130"><path class="z5" d="M9 120V43" stroke-width="3"/><path class="q10" d="M9 112Q-3 104 -5 92Q7 96 9 112Z" style="fill:var(--q10)"/><path class="q5" d="M-0 37L4 49Q9 55 14 49L18 37L13 41L9 33L5 41Z"/><path class="z5" d="M43 120V73" stroke-width="3"/><path class="q10" d="M43 112Q31 104 29 92Q41 96 43 112Z" style="fill:var(--q10)"/><path class="q5" d="M34 67L38 79Q43 85 48 79L52 67L47 71L43 63L39 71Z"/><path class="z5" d="M78 120V42" stroke-width="3"/><path class="q10" d="M78 112Q66 104 64 92Q76 96 78 112Z" style="fill:var(--q10)"/><path class="q5" d="M69 36L73 48Q78 54 83 48L87 36L82 40L78 32L74 40Z"/><path class="z5" d="M114 120V73" stroke-width="3"/><path class="q10" d="M114 112Q102 104 100 92Q112 96 114 112Z" style="fill:var(--q10)"/><path class="q4" d="M105 67L109 79Q114 85 119 79L123 67L118 71L114 63L110 71Z"/><path class="z5" d="M149 120V58" stroke-width="3"/><path class="q10" d="M149 112Q137 104 135 92Q147 96 149 112Z" style="fill:var(--q10)"/><path class="q5" d="M140 52L144 64Q149 70 154 64L158 52L153 56L149 48L145 56Z"/><path class="z5" d="M189 120V61" stroke-width="3"/><path class="q10" d="M189 112Q177 104 175 92Q187 96 189 112Z" style="fill:var(--q10)"/><path class="q4" d="M180 55L184 67Q189 73 194 67L198 55L193 59L189 51L185 59Z"/><path class="z5" d="M216 120V73" stroke-width="3"/><path class="q10" d="M216 112Q204 104 202 92Q214 96 216 112Z" style="fill:var(--q10)"/><path class="q7" d="M207 67L211 79Q216 85 221 79L225 67L220 71L216 63L212 71Z"/><path class="z5" d="M254 120V59" stroke-width="3"/><path class="q10" d="M254 112Q242 104 240 92Q252 96 254 112Z" style="fill:var(--q10)"/><path class="q4" d="M245 53L249 65Q254 71 259 65L263 53L258 57L254 49L250 57Z"/><path class="z5" d="M291 120V53" stroke-width="3"/><path class="q10" d="M291 112Q279 104 277 92Q289 96 291 112Z" style="fill:var(--q10)"/><path class="q11" d="M282 47L286 59Q291 65 296 59L300 47L295 51L291 43L287 51Z"/></svg><svg class="shape es-bf" viewBox="0 0 40 30"><g class="wg"><path class="q7" d="M20 15C10 0 0 4 4 14C6 22 14 20 20 15Z"/><path class="q7" d="M20 15C30 0 40 4 36 14C34 22 26 20 20 15Z"/><path class="q4" d="M20 15C12 30 4 28 8 22C12 18 16 17 20 15Z"/><path class="q4" d="M20 15C28 30 36 28 32 22C28 18 24 17 20 15Z"/></g></svg>
        `,

        // ★ SPRING — Spring · Picnic · Meadow
        spring: `
<div class="shape sp-sun"></div><div class="shape sp-clouds"></div>
<div class="shape sp-hill" style="--l:-12%;--r:30%;--b:calc(var(--sp-nh) - 20px);--h:34%;--hc:46vw;--c:var(--q1)"></div><div class="shape sp-hill" style="--l:30%;--r:-14%;--b:calc(var(--sp-nh) - 20px);--h:28%;--hc:38vw;--c:var(--q2)"></div>
<div class="shape sp-near"></div>
<svg class="shape sp-tree" viewBox="0 0 260 350"><ellipse class='q3' cx='128' cy='342' rx='56' ry='8'/><path class='q4' d='M112 346C116 304 108 272 120 242C124 228 134 216 150 206L158 216C146 226 140 238 138 252C134 282 140 312 146 346Z'/><path class='z4' d='M124 238C100 216 78 202 52 198' stroke-width='8'/><path class='z4' d='M134 224C142 192 152 166 174 150' stroke-width='7'/><path class='z4' d='M122 252C98 248 78 252 62 264' stroke-width='6'/><circle class='q5' cx='157.3' cy='46.6' r='18.8'/><circle class='q6' cx='129.8' cy='121.8' r='21'/><circle class='q5' cx='34.1' cy='133.6' r='17.5'/><circle class='q6' cx='137.4' cy='76.5' r='22.6'/><circle class='q5' cx='120.9' cy='66.4' r='19.5'/><circle class='q6' cx='109.6' cy='86.4' r='19.6'/><circle class='q5' cx='149.6' cy='79.3' r='22.6'/><circle class='q6' cx='89.5' cy='49' r='17'/><circle class='q5' cx='213.5' cy='161.5' r='22.7'/><circle class='q6' cx='97.7' cy='128.7' r='15.4'/><circle class='q5' cx='90' cy='86' r='24.4'/><circle class='q6' cx='87.4' cy='100.1' r='20.9'/><circle class='q5' cx='60.9' cy='182.4' r='23.9'/><circle class='q6' cx='40.5' cy='113.8' r='21.4'/><circle class='q5' cx='167.8' cy='42' r='13.3'/><circle class='q6' cx='74' cy='169.8' r='16.7'/><circle class='q5' cx='101.6' cy='106.6' r='23.6'/><circle class='q6' cx='92.2' cy='115.5' r='21'/><circle class='q5' cx='111.1' cy='154.4' r='18.8'/><circle class='q6' cx='163.2' cy='149.4' r='23.4'/><circle class='q5' cx='126' cy='111.1' r='22.3'/><circle class='q6' cx='194.3' cy='125.2' r='23.9'/><circle class='q5' cx='84.9' cy='88.1' r='17.5'/><circle class='q6' cx='99.4' cy='139.2' r='25'/><circle class='q5' cx='198.7' cy='138.1' r='22'/><circle class='q6' cx='41.2' cy='169.8' r='15.9'/><circle class='q5' cx='234.9' cy='109.7' r='21'/><circle class='q6' cx='187.6' cy='84.1' r='23'/><circle class='q5' cx='153' cy='62.1' r='18.7'/><circle class='q6' cx='110.3' cy='68.3' r='14'/><circle class='q5' cx='128.7' cy='76.7' r='18.9'/><circle class='q6' cx='139.9' cy='85.9' r='13.3'/><circle class='q5' cx='191.4' cy='165.2' r='17.3'/><circle class='q6' cx='127' cy='176.4' r='24.1'/><circle class='q5' cx='127.9' cy='173.8' r='23.6'/><circle class='q6' cx='85.8' cy='91.8' r='18.7'/><circle class='q5' cx='39.8' cy='217.1' r='14.7'/><circle class='q6' cx='61.8' cy='212.7' r='19'/><circle class='q5' cx='67.8' cy='210.3' r='19.7'/><circle class='q6' cx='54.9' cy='211' r='17.5'/><circle class='q5' cx='53.4' cy='199.8' r='21.7'/><circle class='q6' cx='69.1' cy='223' r='14.3'/><circle class='q5' cx='27.3' cy='213.2' r='20.1'/><circle cx='135.5' cy='177' r='6' style='fill:#e0383e'/><circle cx='133.5' cy='175' r='1.5' style='fill:#fff;fill-opacity:.55'/><circle cx='77.9' cy='164.8' r='6' style='fill:#e0383e'/><circle cx='75.9' cy='162.8' r='1.5' style='fill:#fff;fill-opacity:.55'/><circle cx='112.3' cy='110.9' r='6' style='fill:#e0383e'/><circle cx='110.3' cy='108.9' r='1.5' style='fill:#fff;fill-opacity:.55'/><circle cx='219.4' cy='129.4' r='6' style='fill:#e0383e'/><circle cx='217.4' cy='127.4' r='1.5' style='fill:#fff;fill-opacity:.55'/><circle cx='127.2' cy='158.8' r='6' style='fill:#e0383e'/><circle cx='125.2' cy='156.8' r='1.5' style='fill:#fff;fill-opacity:.55'/><circle cx='197.2' cy='122.6' r='6' style='fill:#e0383e'/><circle cx='195.2' cy='120.6' r='1.5' style='fill:#fff;fill-opacity:.55'/><circle cx='165' cy='81.5' r='6' style='fill:#e0383e'/><circle cx='163' cy='79.5' r='1.5' style='fill:#fff;fill-opacity:.55'/><circle cx='105.6' cy='102.6' r='6' style='fill:#e0383e'/><circle cx='103.6' cy='100.6' r='1.5' style='fill:#fff;fill-opacity:.55'/><circle cx='69.6' cy='73.7' r='6' style='fill:#e0383e'/><circle cx='67.6' cy='71.7' r='1.5' style='fill:#fff;fill-opacity:.55'/><circle cx='46.5' cy='115' r='6' style='fill:#e0383e'/><circle cx='44.5' cy='113' r='1.5' style='fill:#fff;fill-opacity:.55'/><circle cx='118.2' cy='108' r='6' style='fill:#e0383e'/><circle cx='116.2' cy='106' r='1.5' style='fill:#fff;fill-opacity:.55'/><circle cx='133.9' cy='68.7' r='6' style='fill:#e0383e'/><circle cx='131.9' cy='66.7' r='1.5' style='fill:#fff;fill-opacity:.55'/><circle cx='124.5' cy='136' r='6' style='fill:#e0383e'/><circle cx='122.5' cy='134' r='1.5' style='fill:#fff;fill-opacity:.55'/><circle cx='174.7' cy='87' r='6' style='fill:#e0383e'/><circle cx='172.7' cy='85' r='1.5' style='fill:#fff;fill-opacity:.55'/><circle cx='112.1' cy='57.8' r='6' style='fill:#e0383e'/><circle cx='110.1' cy='55.8' r='1.5' style='fill:#fff;fill-opacity:.55'/><circle cx='96' cy='342' r='6' style='fill:#e0383e'/><circle cx='162' cy='345' r='6' style='fill:#e0383e'/><circle cx='150' cy='339' r='5' style='fill:#c92f35'/></svg>
<div class="shape sp-blanket"></div>
<svg class="shape sp-food" viewBox="0 0 300 120"><path class="q9" d="M40 110C40 70 48 52 80 52C112 52 120 70 120 110Z"/><path class="z9" d="M52 56C56 22 104 22 108 56" stroke-width="5"/><rect class="q8" x="56" y="70" width="48" height="8" opacity=".7"/><path class="q10" d="M150 110L158 52H196L204 110Z" opacity=".95"/><path class="q8" d="M150 66H204" opacity=".5" stroke="#fff"/><ellipse class="q8" cx="244" cy="108" rx="34" ry="7"/><path class="q10" d="M220 104L244 78L268 104Z"/></svg>
<svg class="shape sp-kite" viewBox="0 0 120 420"><path class="q11" d="M60 8L92 48L60 100L28 48Z"/><path class="z8" d="M60 8V100M28 48H92" stroke-width="1.6" opacity=".7"/><path class="q12" d="M60 100L52 118L60 112L68 124L60 138L52 150" opacity=".0"/><path class="z12" d="M60 100Q50 112 60 122Q70 132 58 144Q48 156 60 166" stroke-width="3"/><path class="z8" d="M60 100C60 190 52 300 60 418" stroke-width="1.4" opacity=".8"/></svg>
<svg class="shape sp-bf" viewBox="0 0 40 30"><path d="M20 15C12 1 1 5 4 14C6 21 15 21 20 15Z" fill="#ffd45c"/><path d="M20 15C28 1 39 5 36 14C34 21 25 21 20 15Z" fill="#ffd45c"/><path d="M20 15C13 25 6 29 10 23C12 20 18 19 20 15Z" fill="#ff9fc0"/><path d="M20 15C27 25 34 29 30 23C28 20 22 19 20 15Z" fill="#ff9fc0"/><ellipse cx="20" cy="15" rx="1.5" ry="6.5" fill="#5a3a2a"/></svg>
        `,
        // ★ SUMMER — Summer · Funfair · Sunny
        summer: `
<div class="shape sf-sun"></div><div class="shape sf-cloud" style="--x:34%;--y:12%"></div><div class="shape sf-cloud opt" style="--x:56%;--y:22%"></div><div class="shape sf-glow"></div><svg class="shape sf-legs" viewBox="0 0 200 260" preserveAspectRatio="none"><path d="M100 0L26 260M100 0L174 260M100 0V260" style="stroke:var(--sf-rim);stroke-width:7;stroke-linecap:round;fill:none"/><path d="M62 130H138" style="stroke:var(--sf-rim);stroke-width:4"/></svg><svg class="shape sf-wheel" viewBox="0 0 400 400"><g fill='none' stroke='var(--sf-rim)' stroke-width='5'><circle cx='200' cy='200' r='178'/><circle cx='200' cy='200' r='118' stroke-width='3'/></g><g stroke='var(--sf-rim)' stroke-width='2.6'><path d='M200 200L200 22'/><path d='M200 200L289 45.8'/><path d='M200 200L354.2 111'/><path d='M200 200L378 200'/><path d='M200 200L354.2 289'/><path d='M200 200L289 354.2'/><path d='M200 200L200 378'/><path d='M200 200L111 354.2'/><path d='M200 200L45.8 289'/><path d='M200 200L22 200'/><path d='M200 200L45.8 111'/><path d='M200 200L111 45.8'/></g><circle cx='200' cy='22' r='15' style='fill:#ff6b81'/><circle cx='200' cy='22' r='5' style='fill:#fff;fill-opacity:.7'/><circle cx='246.1' cy='28.1' r='3.6' style='fill:#fff3b0'/><circle cx='289' cy='45.8' r='15' style='fill:#ffd45c'/><circle cx='289' cy='45.8' r='5' style='fill:#fff;fill-opacity:.7'/><circle cx='325.9' cy='74.1' r='3.6' style='fill:#fff3b0'/><circle cx='354.2' cy='111' r='15' style='fill:#4fd3c4'/><circle cx='354.2' cy='111' r='5' style='fill:#fff;fill-opacity:.7'/><circle cx='371.9' cy='153.9' r='3.6' style='fill:#fff3b0'/><circle cx='378' cy='200' r='15' style='fill:#8f7bff'/><circle cx='378' cy='200' r='5' style='fill:#fff;fill-opacity:.7'/><circle cx='371.9' cy='246.1' r='3.6' style='fill:#fff3b0'/><circle cx='354.2' cy='289' r='15' style='fill:#ff9f43'/><circle cx='354.2' cy='289' r='5' style='fill:#fff;fill-opacity:.7'/><circle cx='325.9' cy='325.9' r='3.6' style='fill:#fff3b0'/><circle cx='289' cy='354.2' r='15' style='fill:#7bd66b'/><circle cx='289' cy='354.2' r='5' style='fill:#fff;fill-opacity:.7'/><circle cx='246.1' cy='371.9' r='3.6' style='fill:#fff3b0'/><circle cx='200' cy='378' r='15' style='fill:#ff6b81'/><circle cx='200' cy='378' r='5' style='fill:#fff;fill-opacity:.7'/><circle cx='153.9' cy='371.9' r='3.6' style='fill:#fff3b0'/><circle cx='111' cy='354.2' r='15' style='fill:#ffd45c'/><circle cx='111' cy='354.2' r='5' style='fill:#fff;fill-opacity:.7'/><circle cx='74.1' cy='325.9' r='3.6' style='fill:#fff3b0'/><circle cx='45.8' cy='289' r='15' style='fill:#4fd3c4'/><circle cx='45.8' cy='289' r='5' style='fill:#fff;fill-opacity:.7'/><circle cx='28.1' cy='246.1' r='3.6' style='fill:#fff3b0'/><circle cx='22' cy='200' r='15' style='fill:#8f7bff'/><circle cx='22' cy='200' r='5' style='fill:#fff;fill-opacity:.7'/><circle cx='28.1' cy='153.9' r='3.6' style='fill:#fff3b0'/><circle cx='45.8' cy='111' r='15' style='fill:#ff9f43'/><circle cx='45.8' cy='111' r='5' style='fill:#fff;fill-opacity:.7'/><circle cx='74.1' cy='74.1' r='3.6' style='fill:#fff3b0'/><circle cx='111' cy='45.8' r='15' style='fill:#7bd66b'/><circle cx='111' cy='45.8' r='5' style='fill:#fff;fill-opacity:.7'/><circle cx='153.9' cy='28.1' r='3.6' style='fill:#fff3b0'/><circle cx='200' cy='200' r='14' style='fill:var(--sf-rim)'/></svg><svg class="shape sf-tent" viewBox="0 0 300 220"><rect class="q2" x="30" y="100" width="240" height="116"/><rect class="q1" x="30" y="100" width="20" height="116"/><rect class="q1" x="70" y="100" width="20" height="116"/><rect class="q1" x="110" y="100" width="20" height="116"/><rect class="q1" x="150" y="100" width="20" height="116"/><rect class="q1" x="190" y="100" width="20" height="116"/><rect class="q1" x="230" y="100" width="20" height="116"/><path class="q1" d="M10 104L150 20L290 104Z"/><path class="q2" d="M10 104L150 20L45 104Z"/><path class="q2" d="M150 104L150 20L185 104Z"/><path d="M150 20V4" style="stroke:#7a5a3a;stroke-width:3"/><path d="M150 4L176 12L150 20Z" style="fill:#ffd45c"/><path d="M122 216V150Q150 122 178 150V216Z" style="fill:#3a2418"/></svg><div class="shape sf-ground"></div><div class="shape sf-path"></div><svg class="shape sf-cart" viewBox="0 0 260 200"><rect class="q7" x="30" y="90" width="200" height="70" rx="6"/><path class="q1" d="M16 90L36 44H224L244 90Z"/><path class="q2" d="M36 44H59L54 90H31Z"/><path class="q2" d="M83 44H106L101 90H78Z"/><path class="q2" d="M130 44H153L148 90H125Z"/><path class="q2" d="M177 44H200L195 90H172Z"/><circle cx="70" cy="170" r="22" style="fill:#3a3a44"/><circle cx="190" cy="170" r="22" style="fill:#3a3a44"/><circle cx="70" cy="170" r="8" style="fill:#d0d4dc"/><circle cx="190" cy="170" r="8" style="fill:#d0d4dc"/><circle cx="86" cy="64" r="20" style="fill:#ff9fc8"/><circle cx="130" cy="58" r="24" style="fill:#c9b6ff"/><circle cx="176" cy="64" r="20" style="fill:#ff9fc8"/><rect x="48" y="106" width="164" height="22" rx="4" style="fill:#fff;fill-opacity:.85"/></svg><svg class="shape sf-bal" viewBox="0 0 180 240"><g style="stroke:#fff;stroke-opacity:.75;stroke-width:1.4;fill:none"><path d="M60 80Q80 160 90 236M100 62Q94 150 90 236M140 82Q110 160 90 236M36 110Q70 170 90 236M120 120Q100 180 90 236"/></g><ellipse cx="60" cy="56" rx="26" ry="32" style="fill:#ff6b81"/><ellipse cx="102" cy="38" rx="26" ry="32" style="fill:#ffd45c"/><ellipse cx="142" cy="58" rx="26" ry="32" style="fill:#4fd3c4"/><ellipse cx="34" cy="94" rx="24" ry="30" style="fill:#8f7bff"/><ellipse cx="122" cy="98" rx="24" ry="30" style="fill:#ff9f43"/><g style="fill:#fff;fill-opacity:.4"><ellipse cx="52" cy="44" rx="6" ry="10"/><ellipse cx="94" cy="26" rx="6" ry="10"/><ellipse cx="134" cy="46" rx="6" ry="10"/></g></svg><div class="shape sf-flags"></div><div class="shape sf-lights"></div>
        `,
        // ★ WINTER — Winter · Snowy · Village
        winter: `
<div class="shape wn-stars"></div><div class="shape wn-moon"></div><div class="shape wn-sun"></div><svg class="shape wn-mt" viewBox="0 0 1000 200" preserveAspectRatio="none"><polygon class="q5" points="0,200 80,100 150,130 250,40 340,120 430,70 520,130 620,50 720,125 820,80 910,126 1000,200"/><path class="q9" d="M250 40L224 70L246 62L262 76L274 60L290 70ZM620 50L596 82L616 74L634 88L648 70L668 82Z" fill-opacity=".95"/></svg><svg class="shape wn-village" viewBox="0 0 600 200"><rect class="q2" x="30" y="130" width="86" height="70"/><path class="q1" d="M24 130L73.0 91.3L122 130Z"/><path class="q9" d="M24 130L73.0 91.3L122 130Q73.0 114.52 24 130Z"/><rect class="q8 w" x="38.0" y="144" width="16" height="18" rx="2"/><rect class="q8 w" x="100.0" y="144" width="16" height="18" rx="2"/><rect class="q4" x="65.0" y="176" width="16" height="24" rx="2"/><rect class="q4" x="94" y="104.2" width="10" height="22"/><rect class="q2" x="150" y="144" width="70" height="56"/><path class="q3" d="M144 144L185.0 112.5L226 144Z"/><path class="q9" d="M144 144L185.0 112.5L226 144Q185.0 131.4 144 144Z"/><rect class="q8 w" x="177.0" y="158" width="16" height="18" rx="2"/><rect class="q4" x="177.0" y="176" width="16" height="24" rx="2"/><rect class="q4" x="198" y="123.0" width="10" height="22"/><rect class="q10" x="250" y="120" width="96" height="80"/><path class="q1" d="M244 120L298.0 76.8L352 120Z"/><path class="q9" d="M244 120L298.0 76.8L352 120Q298.0 102.72 244 120Z"/><rect class="q8 w" x="258.0" y="134" width="16" height="18" rx="2"/><rect class="q8 w" x="330.0" y="134" width="16" height="18" rx="2"/><rect class="q4" x="290.0" y="176" width="16" height="24" rx="2"/><rect class="q4" x="324" y="91.2" width="10" height="22"/><g transform="translate(380 110.0) scale(0.9)"><path class="q6" d="M30 2L46 34H38L52 58H42L58 90H2L18 58H8L22 34H14Z"/><path class="q9" d="M30 2L38 18H22ZM22 34L30 48L38 34ZM16 58L30 72L44 58Z" fill-opacity=".9"/><rect class="q4" x="26" y="88" width="8" height="12"/></g><g transform="translate(430 130.0) scale(0.7)"><path class="q6" d="M30 2L46 34H38L52 58H42L58 90H2L18 58H8L22 34H14Z"/><path class="q9" d="M30 2L38 18H22ZM22 34L30 48L38 34ZM16 58L30 72L44 58Z" fill-opacity=".9"/><rect class="q4" x="26" y="88" width="8" height="12"/></g><rect class="q2" x="480" y="136" width="80" height="64"/><path class="q3" d="M474 136L520.0 100.0L566 136Z"/><path class="q9" d="M474 136L520.0 100.0L566 136Q520.0 121.6 474 136Z"/><rect class="q8 w" x="512.0" y="150" width="16" height="18" rx="2"/><rect class="q4" x="512.0" y="176" width="16" height="24" rx="2"/><rect class="q4" x="538" y="112.0" width="10" height="22"/></svg><div class="shape wn-smoke"></div><div class="shape wn-ground"></div><div class="shape wn-pond"></div><svg class="shape wn-lamp" viewBox="0 0 40 160"><rect class="q4" x="17" y="30" width="6" height="130"/><path class="q4" d="M8 30H32L28 12H12Z"/><rect x="12" y="14" width="16" height="16" rx="3" style="fill:#ffe9a8"/></svg><svg class="shape wn-sf" viewBox="0 0 160 110"><circle cx="46" cy="84" r="24" style="fill:#fff;stroke:#cfe0ef;stroke-width:1.5"/><circle cx="46" cy="52" r="17" style="fill:#fff;stroke:#cfe0ef;stroke-width:1.5"/><circle cx="46" cy="28" r="12" style="fill:#fff;stroke:#cfe0ef;stroke-width:1.5"/><rect x="36" y="6" width="20" height="10" rx="2" style="fill:#7c4dff"/><rect x="32" y="14" width="28" height="4" rx="2" style="fill:#7c4dff"/><path d="M33 38Q46 45 59 38L59 45Q46 52 33 45Z" style="fill:#ff5c8a"/><path d="M46 27L56 30L46 32Z" style="fill:#ff9f43"/><circle cx="42" cy="25" r="1.5" style="fill:#222"/><circle cx="50" cy="25" r="1.5" style="fill:#222"/><path d="M29 54L10 42M63 54L82 62" style="stroke:#6b4a30;stroke-width:2.6;stroke-linecap:round"/><circle cx="116" cy="92" r="17" style="fill:#fff;stroke:#cfe0ef;stroke-width:1.5"/><circle cx="116" cy="68" r="12" style="fill:#fff;stroke:#cfe0ef;stroke-width:1.5"/><path d="M104 56L116 38L128 56Z" style="fill:#2ec4b6"/><path d="M106 76Q116 82 126 76L126 82Q116 88 106 82Z" style="fill:#ffd45c"/><path d="M116 67L124 70L116 72Z" style="fill:#ff9f43"/><circle cx="112" cy="65" r="1.3" style="fill:#222"/><circle cx="120" cy="65" r="1.3" style="fill:#222"/><path d="M99 94L82 62" style="stroke:#6b4a30;stroke-width:2.4;stroke-linecap:round"/></svg><svg class="shape wn-sled opt" viewBox="0 0 80 50"><path d="M6 44Q4 36 12 36H70Q76 36 74 42" style="fill:none;stroke:#7a4a2a;stroke-width:3.4;stroke-linecap:round"/><rect x="14" y="30" width="52" height="7" rx="3" style="fill:#d9473f"/><circle cx="30" cy="16" r="7" style="fill:#f4c9a0"/><path d="M23 12Q30 2 37 12Z" style="fill:#ffd45c"/><rect x="24" y="22" width="14" height="10" rx="3" style="fill:#2ec4b6"/><circle cx="50" cy="20" r="6" style="fill:#f4c9a0"/><path d="M44 17Q50 8 56 17Z" style="fill:#ff5c8a"/><rect x="44" y="25" width="12" height="8" rx="3" style="fill:#7c4dff"/></svg><svg class="shape wn-pines l" viewBox="0 0 200 200"><g transform="translate(10 40.0) scale(1.6)"><path class="q6" d="M30 2L46 34H38L52 58H42L58 90H2L18 58H8L22 34H14Z"/><path class="q9" d="M30 2L38 18H22ZM22 34L30 48L38 34ZM16 58L30 72L44 58Z" fill-opacity=".9"/><rect class="q4" x="26" y="88" width="8" height="12"/></g><g transform="translate(80 80.0) scale(1.2)"><path class="q6" d="M30 2L46 34H38L52 58H42L58 90H2L18 58H8L22 34H14Z"/><path class="q9" d="M30 2L38 18H22ZM22 34L30 48L38 34ZM16 58L30 72L44 58Z" fill-opacity=".9"/><rect class="q4" x="26" y="88" width="8" height="12"/></g></svg><svg class="shape wn-pines r opt" viewBox="0 0 200 200"><g transform="translate(40 50.0) scale(1.5)"><path class="q6" d="M30 2L46 34H38L52 58H42L58 90H2L18 58H8L22 34H14Z"/><path class="q9" d="M30 2L38 18H22ZM22 34L30 48L38 34ZM16 58L30 72L44 58Z" fill-opacity=".9"/><rect class="q4" x="26" y="88" width="8" height="12"/></g><g transform="translate(110 10.0) scale(1.9)"><path class="q6" d="M30 2L46 34H38L52 58H42L58 90H2L18 58H8L22 34H14Z"/><path class="q9" d="M30 2L38 18H22ZM22 34L30 48L38 34ZM16 58L30 72L44 58Z" fill-opacity=".9"/><rect class="q4" x="26" y="88" width="8" height="12"/></g></svg><div class="shape wn-frost"></div>
        `,

        // ★ NEWYEAR — New Year · Countdown · Rooftop
        newyear: `
<div class="shape ny-stars"></div><svg class="shape ny-fw a" viewBox="-80 -80 160 160"><g class="oc"><path class="z5" d="M0 0L56 0" stroke-width="3"/><circle class="z5" cx="66" cy="0" r="3.4" style="stroke:none;fill:var(--q5)"/><path class="z5" d="M0 0L45 33" stroke-width="3"/><circle class="z5" cx="53" cy="39" r="3.4" style="stroke:none;fill:var(--q5)"/><path class="z5" d="M0 0L17 53" stroke-width="3"/><circle class="z5" cx="20" cy="63" r="3.4" style="stroke:none;fill:var(--q5)"/><path class="z5" d="M0 0L-17 53" stroke-width="3"/><circle class="z5" cx="-20" cy="63" r="3.4" style="stroke:none;fill:var(--q5)"/><path class="z5" d="M0 0L-45 33" stroke-width="3"/><circle class="z5" cx="-53" cy="39" r="3.4" style="stroke:none;fill:var(--q5)"/><path class="z5" d="M0 0L-56 0" stroke-width="3"/><circle class="z5" cx="-66" cy="0" r="3.4" style="stroke:none;fill:var(--q5)"/><path class="z5" d="M0 0L-45 -33" stroke-width="3"/><circle class="z5" cx="-53" cy="-39" r="3.4" style="stroke:none;fill:var(--q5)"/><path class="z5" d="M0 0L-17 -53" stroke-width="3"/><circle class="z5" cx="-20" cy="-63" r="3.4" style="stroke:none;fill:var(--q5)"/><path class="z5" d="M0 0L17 -53" stroke-width="3"/><circle class="z5" cx="20" cy="-63" r="3.4" style="stroke:none;fill:var(--q5)"/><path class="z5" d="M0 0L45 -33" stroke-width="3"/><circle class="z5" cx="53" cy="-39" r="3.4" style="stroke:none;fill:var(--q5)"/></g></svg><svg class="shape ny-fw b" viewBox="-80 -80 160 160"><g class="oc"><path class="z6" d="M0 0L56 0" stroke-width="3"/><circle class="z6" cx="66" cy="0" r="3.4" style="stroke:none;fill:var(--q6)"/><path class="z6" d="M0 0L40 40" stroke-width="3"/><circle class="z6" cx="47" cy="47" r="3.4" style="stroke:none;fill:var(--q6)"/><path class="z6" d="M0 0L0 56" stroke-width="3"/><circle class="z6" cx="0" cy="66" r="3.4" style="stroke:none;fill:var(--q6)"/><path class="z6" d="M0 0L-40 40" stroke-width="3"/><circle class="z6" cx="-47" cy="47" r="3.4" style="stroke:none;fill:var(--q6)"/><path class="z6" d="M0 0L-56 0" stroke-width="3"/><circle class="z6" cx="-66" cy="0" r="3.4" style="stroke:none;fill:var(--q6)"/><path class="z6" d="M0 0L-40 -40" stroke-width="3"/><circle class="z6" cx="-47" cy="-47" r="3.4" style="stroke:none;fill:var(--q6)"/><path class="z6" d="M0 0L-0 -56" stroke-width="3"/><circle class="z6" cx="-0" cy="-66" r="3.4" style="stroke:none;fill:var(--q6)"/><path class="z6" d="M0 0L40 -40" stroke-width="3"/><circle class="z6" cx="47" cy="-47" r="3.4" style="stroke:none;fill:var(--q6)"/></g></svg><svg class="shape ny-fw c opt" viewBox="-80 -80 160 160"><g class="oc"><path class="z7" d="M0 0L56 0" stroke-width="3"/><circle class="z7" cx="66" cy="0" r="3.4" style="stroke:none;fill:var(--q7)"/><path class="z7" d="M0 0L45 33" stroke-width="3"/><circle class="z7" cx="53" cy="39" r="3.4" style="stroke:none;fill:var(--q7)"/><path class="z7" d="M0 0L17 53" stroke-width="3"/><circle class="z7" cx="20" cy="63" r="3.4" style="stroke:none;fill:var(--q7)"/><path class="z7" d="M0 0L-17 53" stroke-width="3"/><circle class="z7" cx="-20" cy="63" r="3.4" style="stroke:none;fill:var(--q7)"/><path class="z7" d="M0 0L-45 33" stroke-width="3"/><circle class="z7" cx="-53" cy="39" r="3.4" style="stroke:none;fill:var(--q7)"/><path class="z7" d="M0 0L-56 0" stroke-width="3"/><circle class="z7" cx="-66" cy="0" r="3.4" style="stroke:none;fill:var(--q7)"/><path class="z7" d="M0 0L-45 -33" stroke-width="3"/><circle class="z7" cx="-53" cy="-39" r="3.4" style="stroke:none;fill:var(--q7)"/><path class="z7" d="M0 0L-17 -53" stroke-width="3"/><circle class="z7" cx="-20" cy="-63" r="3.4" style="stroke:none;fill:var(--q7)"/><path class="z7" d="M0 0L17 -53" stroke-width="3"/><circle class="z7" cx="20" cy="-63" r="3.4" style="stroke:none;fill:var(--q7)"/><path class="z7" d="M0 0L45 -33" stroke-width="3"/><circle class="z7" cx="53" cy="-39" r="3.4" style="stroke:none;fill:var(--q7)"/></g></svg><svg class="shape ny-city" viewBox="0 0 640 200" preserveAspectRatio="none"><g class="q2"><rect x="0" y="120" width="40" height="80"/><rect x="44" y="80" width="30" height="120"/><rect x="78" y="110" width="50" height="90"/><rect x="132" y="60" width="36" height="140"/><rect x="172" y="100" width="44" height="100"/><rect x="220" y="130" width="30" height="70"/><rect x="254" y="74" width="52" height="126"/><rect x="310" y="104" width="34" height="96"/><rect x="348" y="50" width="44" height="150"/><rect x="396" y="116" width="40" height="84"/><rect x="440" y="90" width="50" height="110"/><rect x="494" y="124" width="34" height="76"/><rect x="532" y="70" width="50" height="130"/><rect x="586" y="110" width="34" height="90"/></g><g class="wf"><rect class="q11" x="52" y="88" width="5" height="7"/><rect class="q11" x="60" y="104" width="5" height="7"/><rect class="q11" x="90" y="112" width="5" height="7"/><rect class="q11" x="104" y="96" width="5" height="7"/><rect class="q11" x="140" y="80" width="5" height="7"/><rect class="q11" x="150" y="100" width="5" height="7"/><rect class="q11" x="182" y="120" width="5" height="7"/><rect class="q11" x="194" y="96" width="5" height="7"/><rect class="q11" x="262" y="84" width="5" height="7"/><rect class="q11" x="276" y="110" width="5" height="7"/><rect class="q11" x="318" y="108" width="5" height="7"/><rect class="q11" x="356" y="72" width="5" height="7"/><rect class="q11" x="368" y="100" width="5" height="7"/><rect class="q11" x="404" y="118" width="5" height="7"/><rect class="q11" x="448" y="96" width="5" height="7"/><rect class="q11" x="462" y="124" width="5" height="7"/><rect class="q11" x="540" y="90" width="5" height="7"/><rect class="q11" x="556" y="110" width="5" height="7"/><rect class="q11" x="594" y="118" width="5" height="7"/></g></svg><svg class="shape ny-clock" viewBox="0 0 120 340"><rect class="q2" x="20" y="318" width="80" height="22"/><rect class="q2" x="30" y="152" width="60" height="170"/><rect x="52" y="176" width="8" height="14" rx="1" style="fill:#ffd98a"/><rect x="66" y="176" width="8" height="14" rx="1" style="fill:#ffd98a;fill-opacity:.55"/><rect x="52" y="208" width="8" height="14" rx="1" style="fill:#ffd98a"/><rect x="66" y="208" width="8" height="14" rx="1" style="fill:#ffd98a;fill-opacity:.55"/><rect x="52" y="240" width="8" height="14" rx="1" style="fill:#ffd98a"/><rect x="66" y="240" width="8" height="14" rx="1" style="fill:#ffd98a;fill-opacity:.55"/><rect x="52" y="272" width="8" height="14" rx="1" style="fill:#ffd98a"/><rect x="66" y="272" width="8" height="14" rx="1" style="fill:#ffd98a;fill-opacity:.55"/><rect class="q2" x="24" y="112" width="72" height="44"/><rect class="q2" x="32" y="80" width="56" height="36"/><path class="q2" d="M26 80L60 26L94 80Z"/><path d="M60 26V8" style="stroke:var(--q5);stroke-width:3.4"/><circle class="q5" cx="60" cy="7" r="4.5"/><circle cx="60" cy="134" r="24" style="fill:#fff6d8;stroke:var(--q5);stroke-width:4"/><path d="M60 134V117M60 134L72 141" style="stroke:#2a2144;stroke-width:3.2;stroke-linecap:round"/><circle cx="60" cy="134" r="2.6" style="fill:#2a2144"/></svg><svg class="shape ny-strm" viewBox="0 0 400 80" preserveAspectRatio="none"><path class="z5" d="M0 10Q100 50 200 10T400 10" stroke-width="4"/><path class="z6" d="M0 20Q100 60 200 20T400 20" stroke-width="4"/><path class="z7" d="M0 30Q100 70 200 30T400 30" stroke-width="4"/></svg><svg class="shape ny-bal l" viewBox="0 0 60 120"><ellipse class="q5" cx="30" cy="40" rx="24" ry="30"/><path class="z5" d="M30 70Q24 90 32 118" stroke-width="2" style="stroke:var(--q9)"/></svg><svg class="shape ny-bal r opt" viewBox="0 0 60 120"><ellipse class="q6" cx="30" cy="40" rx="24" ry="30"/><path class="z5" d="M30 70Q36 92 28 118" stroke-width="2" style="stroke:var(--q9)"/></svg><div class="shape ny-roof"></div><svg class="shape ny-glass" viewBox="0 0 200 150"><g transform="rotate(-12 60 120)"><path d="M40 20H80L72 80Q60 94 48 80Z" style="fill:#fff;fill-opacity:.45;stroke:var(--q9);stroke-width:3"/><path d="M44 36H76L72 80Q60 92 48 80Z" class="q5"/><rect class="q9" x="58" y="84" width="4" height="40"/><rect class="q9" x="44" y="124" width="32" height="5" rx="2"/></g><g transform="rotate(12 140 120)"><path d="M120 20H160L152 80Q140 94 128 80Z" style="fill:#fff;fill-opacity:.45;stroke:var(--q9);stroke-width:3"/><path d="M124 36H156L152 80Q140 92 128 80Z" class="q5"/><rect class="q9" x="138" y="84" width="4" height="40"/><rect class="q9" x="124" y="124" width="32" height="5" rx="2"/></g><circle class="q9 sp" cx="100" cy="52" r="3"/><circle class="q9 sp d" cx="92" cy="40" r="2"/></svg><svg class="shape ny-hat" viewBox="0 0 80 100"><path class="q6" d="M40 4L74 94H6Z"/><path d="M14 70L66 70M22 50L58 50" style="stroke:#fff;stroke-width:5;opacity:.7"/><circle class="q5" cx="40" cy="6" r="7"/></svg>
        `,

        // ★ RAINY — Rainy · Modern Home · Cozy
        rainy: `
<div class="shape rn-city"></div><div class="shape rn-far"></div><div class="shape rn-rain"></div><div class="shape rn-glass"></div><div class="shape rn-drops"></div><div class="shape rn-ceil"></div><div class="shape rn-floor"></div><div class="shape rn-cur"></div><div class="shape rn-rug"></div><div class="shape rn-slat"></div><svg class="shape rn-shelf" viewBox="0 0 120 220"><rect x="0" y="66" width="120" height="6" rx="2" style="fill:#2a2018"/><rect x="0" y="136" width="120" height="6" rx="2" style="fill:#2a2018"/><rect x="0" y="206" width="120" height="6" rx="2" style="fill:#2a2018"/><rect x="8" y="48" width="44" height="8" rx="1" style="fill:#c9784f"/><rect x="10" y="56" width="40" height="8" rx="1" style="fill:#4f7a64"/><rect x="12" y="40" width="36" height="8" rx="1" style="fill:#e8c36a"/><path d="M80 66L84 46H100L104 66Z" style="fill:#e8dcc6"/><g style="fill:#5fae6a"><ellipse cx="92" cy="32" rx="5" ry="14" transform="rotate(-20 92 46)"/><ellipse cx="92" cy="30" rx="5" ry="15"/><ellipse cx="92" cy="32" rx="5" ry="14" transform="rotate(20 92 46)"/></g><rect x="10" y="100" width="34" height="36" rx="2" style="fill:#fff6e6;stroke:#8a6a48;stroke-width:3"/><path d="M14 132L24 114L32 124L38 112L42 132Z" style="fill:#c9784f"/><ellipse cx="86" cy="124" rx="14" ry="12" style="fill:#d9c9aa"/><path d="M80 112Q86 96 92 112Z" style="fill:#d9c9aa"/><path d="M86 112V92M82 98L86 92L90 98" style="stroke:#6f8f7a;stroke-width:2.4;fill:none"/><rect x="12" y="176" width="22" height="30" rx="2" style="fill:#c9784f"/><rect x="38" y="170" width="18" height="36" rx="2" style="fill:#6f8f7a"/><rect x="60" y="180" width="26" height="26" rx="2" style="fill:#e8b45c"/><circle cx="102" cy="194" r="11" style="fill:#fff6e6"/></svg>
<svg class="shape rn-sofa" viewBox="0 0 380 160"><rect class="q3" x="30" y="132" width="10" height="22" rx="2"/><rect class="q3" x="340" y="132" width="10" height="22" rx="2"/><rect class="q8" x="22" y="28" width="336" height="66" rx="18"/><rect class="q8" x="8" y="70" width="364" height="64" rx="16"/><rect class="q9" x="44" y="72" width="98" height="46" rx="12"/><rect class="q9" x="146" y="72" width="98" height="46" rx="12"/><rect class="q9" x="248" y="72" width="88" height="46" rx="12"/><rect class="q8" x="0" y="54" width="36" height="82" rx="14"/><rect class="q8" x="344" y="54" width="36" height="82" rx="14"/><path class="q10" d="M300 60L372 66L368 136L316 130Z"/><path d="M312 62L316 130M334 64L338 132M354 66L358 134M304 96L370 100" style="stroke:#fff;stroke-opacity:.3;stroke-width:4;fill:none"/><rect class="q11" x="56" y="44" width="50" height="46" rx="10" transform="rotate(-6 81 67)"/><rect class="q12" x="108" y="48" width="44" height="42" rx="10" transform="rotate(5 130 69)"/></svg><div class="shape rn-lglow"></div><svg class="shape rn-lamp" viewBox="0 0 120 300"><ellipse class="q3" cx="60" cy="292" rx="30" ry="7"/><rect class="q3" x="57" y="70" width="6" height="222"/><path class="z3" d="M60 70C60 30 92 22 96 40" stroke-width="5"/><path d="M80 38H112L106 62H86Z" style="fill:#fff2c8"/></svg><svg class="shape rn-table" viewBox="0 0 240 120"><path d="M50 74L42 118M190 74L198 118" style="stroke:#15151a;stroke-width:6;stroke-linecap:round"/><ellipse cx="120" cy="70" rx="108" ry="16" style="fill:#2a2018"/><ellipse cx="120" cy="64" rx="108" ry="16" style="fill:#4a3a2e"/><path d="M52 60L88 50L128 58L92 70Z" style="fill:#fff6e6"/><path d="M92 70L128 58V62L92 74Z" style="fill:#d9c9aa"/><path d="M58 60L88 53M64 63L90 57" style="stroke:#b8a888;stroke-width:1.4"/><ellipse cx="172" cy="60" rx="20" ry="5" style="fill:#f3e9db"/><path d="M158 32H186V50Q186 62 172 62T158 50Z" style="fill:#fbf3e6"/><path d="M186 36H193Q198 42 193 48H186" style="fill:none;stroke:#fbf3e6;stroke-width:3.4"/><ellipse cx="172" cy="32" rx="14" ry="3" style="fill:#5a3520"/></svg><div class="shape rn-steam"></div><svg class="shape rn-plant opt" viewBox="0 0 120 280"><path d="M60 232C30 200 20 150 38 106C56 150 68 192 60 232Z" style="fill:#3f8a55"/><path d="M60 232C92 196 100 148 82 100C66 146 54 188 60 232Z" style="fill:#4fa56a"/><path d="M60 232C46 190 40 130 56 70C68 124 72 190 60 232Z" style="fill:#2f7a48"/><path d="M60 232C72 196 94 168 108 150C94 184 82 212 60 232Z" style="fill:#5fb87a"/><path d="M60 232C48 200 26 176 12 160C28 190 40 214 60 232Z" style="fill:#4fa56a"/><path d="M30 230H90L82 278H38Z" style="fill:#c9784f"/></svg><div class="shape rn-pend"></div><div class="shape rn-pend" style="left:62%;--c:clamp(62px,12vh,120px);width:clamp(26px,3vw,40px)"></div><div class="shape rn-pend opt" style="left:50%;--c:clamp(46px,9vh,92px);width:clamp(22px,2.6vw,34px)"></div><svg class="shape rn-pouf" viewBox="0 0 100 70"><ellipse cx="50" cy="58" rx="44" ry="10" style="fill:#000;fill-opacity:.18"/><rect class="q12" x="8" y="26" width="84" height="30" rx="10"/><ellipse class="q12" cx="50" cy="26" rx="42" ry="12"/><ellipse cx="50" cy="24" rx="34" ry="8" style="fill:#fff;fill-opacity:.22"/><path d="M20 30Q22 46 18 54M40 36Q42 48 40 56M60 36Q58 48 60 56M80 30Q78 46 82 54" style="stroke:#fff;stroke-opacity:.25;stroke-width:2;fill:none"/></svg>
        `,
    };

    // ================================================================
    // ===== THEMES (palettes) — UNCHANGED =====
    // ================================================================
    window.THEMES = {
        ocean: {
            name: 'Ocean', sub: 'Deep · Calm', emoji: '🌊', group: 'places',
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
            name: 'Sunset', sub: 'Savanna · Warm', emoji: '🌅', group: 'places',
            preview: { primary: '#f5576c', gradient: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)' },
            light: {
                '--theme-primary': '#f5576c', '--theme-accent': '#f093fb', '--theme-primary-dark': '#c73a52',
                '--theme-primary-soft': '#ffe4e6', '--theme-primary-soft-2': '#fff1f2',
                '--theme-bg': '#ffffff', '--theme-bg-soft': '#fff8f9', '--theme-card': '#ffffff',
                '--theme-text': '#3a1418', '--theme-text-muted': '#6b3038', '--theme-text-dim': '#8a5560', '--theme-text-faint': '#b08890',
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
            name: 'Blossom', sub: 'Conservatory · Dreamy', emoji: '🌸', group: 'places',
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
            name: 'Forest', sub: 'Treehouse · Nook', emoji: '🌲', group: 'places',
            preview: { primary: '#16a34a', gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' },
            light: {
                '--theme-primary': '#16a34a', '--theme-accent': '#22c55e', '--theme-primary-dark': '#15803d',
                '--theme-primary-soft': '#dcfce7', '--theme-primary-soft-2': '#f0fdf4',
                '--theme-bg': '#ffffff', '--theme-bg-soft': '#f8fdf9', '--theme-card': '#ffffff',
                '--theme-text': '#0a2418', '--theme-text-muted': '#2a5040', '--theme-text-dim': '#4a7a60', '--theme-text-faint': '#7aa890',
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
            name: 'Sunshine', sub: 'Porch · Sunflowers', emoji: '☀️', group: 'places',
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
            name: 'Starry', sub: 'Rooftop · Stargazing', emoji: '✨', group: 'places',
            preview: { primary: '#8b5cf6', gradient: 'linear-gradient(135deg, #1e1b4b 0%, #6d28d9 50%, #c4b5fd 100%)' },
            light: {
                '--theme-primary': '#a78bfa', '--theme-accent': '#c4b5fd', '--theme-primary-dark': '#8b5cf6',
                '--theme-primary-soft': '#2a1e3d', '--theme-primary-soft-2': '#150e26',
                '--theme-bg': '#0a0714', '--theme-bg-soft': '#0e0818', '--theme-card': '#17102a',
                '--theme-text': '#e8e0ff', '--theme-text-muted': '#cfc4f0', '--theme-text-dim': '#b0a2d8', '--theme-text-faint': '#9486c4',
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
            name: 'Café', sub: 'Lamplit · Cozy', emoji: '☕', group: 'places',
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
            name: 'Crimson', sub: 'Rose Park · Bold', emoji: '🌹', group: 'places',
            preview: { primary: '#dc2626', gradient: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)' },
            light: {
                '--theme-primary': '#dc2626', '--theme-accent': '#f87171', '--theme-primary-dark': '#b91c1c',
                '--theme-primary-soft': '#fee2e2', '--theme-primary-soft-2': '#fef2f2',
                '--theme-bg': '#ffffff', '--theme-bg-soft': '#fff5f5', '--theme-card': '#ffffff',
                '--theme-text': '#3a1018', '--theme-text-muted': '#6b2530', '--theme-text-dim': '#8a4550', '--theme-text-faint': '#b0808a',
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
            name: 'Maroon', sub: 'Wine Bar · Classic', emoji: '🍷', group: 'places',
            preview: { primary: '#800000', gradient: 'linear-gradient(135deg, #800000 0%, #a52a2a 100%)' },
            light: {
                '--theme-primary': '#800000', '--theme-accent': '#a52a2a', '--theme-primary-dark': '#5c0000',
                '--theme-primary-soft': '#f5e6e6', '--theme-primary-soft-2': '#faf0f0',
                '--theme-bg': '#fdf8f8', '--theme-bg-soft': '#f9f0f0', '--theme-card': '#ffffff',
                '--theme-text': '#3a1010', '--theme-text-muted': '#6b2525', '--theme-text-dim': '#8a4545', '--theme-text-faint': '#b08080',
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
            name: 'Sakura', sub: 'Shrine · Dawn', emoji: '🌸', group: 'places',
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
            name: 'Nebula', sub: 'Space · Diner', emoji: '🌌', group: 'places',
            preview: { primary: '#7c3aed', gradient: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 50%, #ec4899 100%)' },
            light: {
                '--theme-primary': '#7c3aed', '--theme-accent': '#ec4899', '--theme-primary-dark': '#6d28d9',
                '--theme-primary-soft': '#f3e8ff', '--theme-primary-soft-2': '#fdf2f8',
                '--theme-bg': '#fdf7ff', '--theme-bg-soft': '#f9f0ff', '--theme-card': '#ffffff',
                '--theme-text': '#2a1e4d', '--theme-text-muted': '#5a4b80', '--theme-text-dim': '#8a7ca8', '--theme-text-faint': '#beb5d4',
                '--theme-border': '#ecdff5', '--theme-border-soft': '#f5eafb', '--theme-border-input': '#dcc8ee',
                '--theme-gradient': 'linear-gradient(45deg, #7c3aed 0%, #ec4899 100%)',
                '--theme-shadow': 'rgba(124, 58, 237, 0.2)', '--theme-shadow-soft': 'rgba(236, 72, 153, 0.18)',
                '--theme-nav-bg': 'rgba(253, 247, 255, 0.98)'
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
            name: 'Ember', sub: 'Hearth · Glow', emoji: '🔥', group: 'places',
            preview: { primary: '#f97316', gradient: 'linear-gradient(135deg, #7c2d12 0%, #f97316 50%, #dc2626 100%)' },
            light: {
                '--theme-primary': '#ea580c', '--theme-accent': '#dc2626', '--theme-primary-dark': '#c2410c',
                '--theme-primary-soft': '#ffedd5', '--theme-primary-soft-2': '#fff7ed',
                '--theme-bg': '#fff8f2', '--theme-bg-soft': '#fef3e8', '--theme-card': '#ffffff',
                '--theme-text': '#3a1f0f', '--theme-text-muted': '#6b4a30', '--theme-text-dim': '#a57852', '--theme-text-faint': '#d4b096',
                '--theme-border': '#f5e0c8', '--theme-border-soft': '#faecd8', '--theme-border-input': '#e8c8a8',
                '--theme-gradient': 'linear-gradient(45deg, #ea580c 0%, #dc2626 100%)',
                '--theme-shadow': 'rgba(234, 88, 12, 0.2)', '--theme-shadow-soft': 'rgba(220, 38, 38, 0.18)',
                '--theme-nav-bg': 'rgba(255, 248, 242, 0.98)'
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
        glacier: {
            name: 'Glacier', sub: 'Alpine · Crisp', emoji: '🧊', group: 'places',
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
            name: 'Tropic', sub: 'Tiki · Beach Bar', emoji: '🌴', group: 'places',
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
            name: 'Moonlit', sub: 'Street · Late Night', emoji: '🌙', group: 'places',
            preview: { primary: '#94a3b8', gradient: 'linear-gradient(135deg, #1e293b 0%, #94a3b8 50%, #e2e8f0 100%)' },
            light: {
                '--theme-primary': '#64748b', '--theme-accent': '#94a3b8', '--theme-primary-dark': '#475569',
                '--theme-primary-soft': '#e2e8f0', '--theme-primary-soft-2': '#f1f5f9',
                '--theme-bg': '#f8fafc', '--theme-bg-soft': '#f1f5f9', '--theme-card': '#ffffff',
                '--theme-text': '#0f172a', '--theme-text-muted': '#3a4759', '--theme-text-dim': '#64748b', '--theme-text-faint': '#94a3b8',
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
            name: 'Aurora', sub: 'Arctic · Cabin', emoji: '🌠', group: 'places',
            preview: { primary: '#34d399', gradient: 'linear-gradient(135deg, #0f172a 0%, #34d399 50%, #a78bfa 100%)' },
            light: {
                '--theme-primary': '#059669', '--theme-accent': '#7c3aed', '--theme-primary-dark': '#047857',
                '--theme-primary-soft': '#d1fae5', '--theme-primary-soft-2': '#ecfdf5',
                '--theme-bg': '#f0fdfa', '--theme-bg-soft': '#f7fefb', '--theme-card': '#ffffff',
                '--theme-text': '#0f2a25', '--theme-text-muted': '#3d5c55', '--theme-text-dim': '#6b8a82', '--theme-text-faint': '#a0bcc4',
                '--theme-border': '#d5efe6', '--theme-border-soft': '#e6f6f0', '--theme-border-input': '#bfe4d8',
                '--theme-gradient': 'linear-gradient(45deg, #059669 0%, #7c3aed 100%)',
                '--theme-shadow': 'rgba(5, 150, 105, 0.18)', '--theme-shadow-soft': 'rgba(124, 58, 237, 0.15)',
                '--theme-nav-bg': 'rgba(240, 253, 250, 0.98)'
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
            name: 'Matcha', sub: 'Garden · Zen', emoji: '🍵', group: 'places',
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
        },
        spring: {
            name: 'Spring', sub: 'Picnic · Meadow', emoji: '🌷', group: 'seasons',
            preview: { primary: '#43a047', gradient: 'linear-gradient(135deg, #43a047 0%, #f06292 100%)' },
            light: {
                '--theme-primary': '#43a047',
                '--theme-accent': '#f06292',
                '--theme-primary-dark': '#2e7d32',
                '--theme-primary-soft': '#dff3e0',
                '--theme-primary-soft-2': '#f0faf0',
                '--theme-bg': '#ffffff',
                '--theme-bg-soft': '#f8fdf8',
                '--theme-card': '#ffffff',
                '--theme-text': '#16301a',
                '--theme-text-muted': '#3a5f3e',
                '--theme-text-dim': '#678a6b',
                '--theme-text-faint': '#9cb9a0',
                '--theme-border': '#e3f1e4',
                '--theme-border-soft': '#eef8ef',
                '--theme-border-input': '#cfe6d1',
                '--theme-gradient': 'linear-gradient(45deg, #43a047 0%, #f06292 100%)',
                '--theme-shadow': 'rgba(67,160,71,0.16)',
                '--theme-shadow-soft': 'rgba(240,98,146,0.18)',
                '--theme-nav-bg': 'rgba(255,255,255,0.98)'
            },
            dark: {
                '--theme-primary': '#7bd88a',
                '--theme-accent': '#f48fb1',
                '--theme-primary-dark': '#43a047',
                '--theme-primary-soft': '#16301c',
                '--theme-primary-soft-2': '#0c1a10',
                '--theme-bg': '#0c1620',
                '--theme-bg-soft': '#122028',
                '--theme-card': '#122028',
                '--theme-text': '#e6f4e8',
                '--theme-text-muted': '#a9c7ae',
                '--theme-text-dim': '#7f9d85',
                '--theme-text-faint': '#58705c',
                '--theme-border': '#1b3426',
                '--theme-border-soft': '#142a1e',
                '--theme-border-input': '#1b3426',
                '--theme-gradient': 'linear-gradient(45deg, #7bd88a 0%, #f48fb1 100%)',
                '--theme-shadow': 'rgba(123,216,138,0.2)',
                '--theme-shadow-soft': 'rgba(244,143,177,0.15)',
                '--theme-nav-bg': 'rgba(12,22,32,0.98)'
            }
        },
        summer: {
            name: 'Summer', sub: 'Funfair · Sunny', emoji: '🍦', group: 'seasons',
            preview: { primary: '#0891b2', gradient: 'linear-gradient(135deg, #0891b2 0%, #f59e0b 100%)' },
            light: {
                '--theme-primary': '#0891b2',
                '--theme-accent': '#f59e0b',
                '--theme-primary-dark': '#0e7490',
                '--theme-primary-soft': '#cffafe',
                '--theme-primary-soft-2': '#ecfeff',
                '--theme-bg': '#ffffff',
                '--theme-bg-soft': '#f5feff',
                '--theme-card': '#ffffff',
                '--theme-text': '#0b2f3a',
                '--theme-text-muted': '#2f5a68',
                '--theme-text-dim': '#5f8794',
                '--theme-text-faint': '#97b5bf',
                '--theme-border': '#d9f1f6',
                '--theme-border-soft': '#e8f8fb',
                '--theme-border-input': '#bde6ee',
                '--theme-gradient': 'linear-gradient(45deg, #0891b2 0%, #f59e0b 100%)',
                '--theme-shadow': 'rgba(8,145,178,0.16)',
                '--theme-shadow-soft': 'rgba(245,158,11,0.2)',
                '--theme-nav-bg': 'rgba(255,255,255,0.98)'
            },
            dark: {
                '--theme-primary': '#22d3ee',
                '--theme-accent': '#fbbf24',
                '--theme-primary-dark': '#0891b2',
                '--theme-primary-soft': '#0c2c38',
                '--theme-primary-soft-2': '#071a22',
                '--theme-bg': '#07141f',
                '--theme-bg-soft': '#0e222e',
                '--theme-card': '#0e222e',
                '--theme-text': '#e3f6fa',
                '--theme-text-muted': '#a3c8d2',
                '--theme-text-dim': '#7a9fab',
                '--theme-text-faint': '#557480',
                '--theme-border': '#143644',
                '--theme-border-soft': '#0f2a36',
                '--theme-border-input': '#143644',
                '--theme-gradient': 'linear-gradient(45deg, #22d3ee 0%, #fbbf24 100%)',
                '--theme-shadow': 'rgba(34,211,238,0.2)',
                '--theme-shadow-soft': 'rgba(251,191,36,0.15)',
                '--theme-nav-bg': 'rgba(7,20,31,0.98)'
            }
        },
        autumn: {
            name: 'Autumn', sub: 'Porch · Harvest', emoji: '🍁', group: 'seasons',
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
        rainy: {
            name: 'Rainy', sub: 'Modern Home · Cozy', emoji: '🌧️', group: 'seasons',
            preview: { primary: '#4a7fa8', gradient: 'linear-gradient(135deg, #4a7fa8 0%, #e0a24a 100%)' },
            light: {
                '--theme-primary': '#4a7fa8',
                '--theme-accent': '#e0a24a',
                '--theme-primary-dark': '#365f80',
                '--theme-primary-soft': '#dbe9f4',
                '--theme-primary-soft-2': '#eef5fa',
                '--theme-bg': '#ffffff',
                '--theme-bg-soft': '#f5f9fc',
                '--theme-card': '#ffffff',
                '--theme-text': '#14212c',
                '--theme-text-muted': '#3d5568',
                '--theme-text-dim': '#6a8498',
                '--theme-text-faint': '#9fb3c3',
                '--theme-border': '#dde7ef',
                '--theme-border-soft': '#ebf1f6',
                '--theme-border-input': '#c8d8e4',
                '--theme-gradient': 'linear-gradient(45deg, #4a7fa8 0%, #e0a24a 100%)',
                '--theme-shadow': 'rgba(74,127,168,0.16)',
                '--theme-shadow-soft': 'rgba(224,162,74,0.18)',
                '--theme-nav-bg': 'rgba(255,255,255,0.98)'
            },
            dark: {
                '--theme-primary': '#7fb3d9',
                '--theme-accent': '#f0b865',
                '--theme-primary-dark': '#4a7fa8',
                '--theme-primary-soft': '#14283a',
                '--theme-primary-soft-2': '#0b1822',
                '--theme-bg': '#0a1118',
                '--theme-bg-soft': '#101c26',
                '--theme-card': '#101c26',
                '--theme-text': '#e4eef6',
                '--theme-text-muted': '#a6bccb',
                '--theme-text-dim': '#7b93a4',
                '--theme-text-faint': '#546878',
                '--theme-border': '#1a2c3a',
                '--theme-border-soft': '#14232f',
                '--theme-border-input': '#1a2c3a',
                '--theme-gradient': 'linear-gradient(45deg, #7fb3d9 0%, #f0b865 100%)',
                '--theme-shadow': 'rgba(127,179,217,0.2)',
                '--theme-shadow-soft': 'rgba(240,184,101,0.15)',
                '--theme-nav-bg': 'rgba(10,17,24,0.98)'
            }
        },
        winter: {
            name: 'Winter', sub: 'Snowy · Village', emoji: '⛄', group: 'seasons',
            preview: { primary: '#3b82c4', gradient: 'linear-gradient(135deg, #3b82c4 0%, #7aa7e0 100%)' },
            light: {
                '--theme-primary': '#3b82c4',
                '--theme-accent': '#7aa7e0',
                '--theme-primary-dark': '#2c649c',
                '--theme-primary-soft': '#dbeafe',
                '--theme-primary-soft-2': '#eff6ff',
                '--theme-bg': '#ffffff',
                '--theme-bg-soft': '#f7faff',
                '--theme-card': '#ffffff',
                '--theme-text': '#10243d',
                '--theme-text-muted': '#3a5878',
                '--theme-text-dim': '#6783a3',
                '--theme-text-faint': '#9db3cc',
                '--theme-border': '#e0eaf7',
                '--theme-border-soft': '#edf3fb',
                '--theme-border-input': '#c9daef',
                '--theme-gradient': 'linear-gradient(45deg, #3b82c4 0%, #7aa7e0 100%)',
                '--theme-shadow': 'rgba(59,130,196,0.16)',
                '--theme-shadow-soft': 'rgba(122,167,224,0.2)',
                '--theme-nav-bg': 'rgba(255,255,255,0.98)'
            },
            dark: {
                '--theme-primary': '#7fb8f0',
                '--theme-accent': '#a9c9f5',
                '--theme-primary-dark': '#3b82c4',
                '--theme-primary-soft': '#14284a',
                '--theme-primary-soft-2': '#0a1630',
                '--theme-bg': '#07122a',
                '--theme-bg-soft': '#0d1d3d',
                '--theme-card': '#0d1d3d',
                '--theme-text': '#e8f0fb',
                '--theme-text-muted': '#aebfd8',
                '--theme-text-dim': '#8296b3',
                '--theme-text-faint': '#5a6c8a',
                '--theme-border': '#1a2f58',
                '--theme-border-soft': '#142547',
                '--theme-border-input': '#1a2f58',
                '--theme-gradient': 'linear-gradient(45deg, #7fb8f0 0%, #a9c9f5 100%)',
                '--theme-shadow': 'rgba(127,184,240,0.2)',
                '--theme-shadow-soft': 'rgba(169,201,245,0.15)',
                '--theme-nav-bg': 'rgba(7,18,42,0.98)'
            }
        },
        xmas: {
            name: 'Xmas', sub: 'Christmas · Eve', emoji: '🎄', group: 'holidays',
            preview: { primary: '#c62828', gradient: 'linear-gradient(135deg, #c62828 0%, #2e7d32 100%)' },
            light: {
                '--theme-primary': '#c62828',
                '--theme-accent': '#2e7d32',
                '--theme-primary-dark': '#9b1c1c',
                '--theme-primary-soft': '#fde2e0',
                '--theme-primary-soft-2': '#fff1f0',
                '--theme-bg': '#ffffff',
                '--theme-bg-soft': '#fffaf6',
                '--theme-card': '#ffffff',
                '--theme-text': '#3a1414',
                '--theme-text-muted': '#6d3a3a',
                '--theme-text-dim': '#936767',
                '--theme-text-faint': '#c3a2a2',
                '--theme-border': '#f6e2e0',
                '--theme-border-soft': '#fbefee',
                '--theme-border-input': '#f1d3d0',
                '--theme-gradient': 'linear-gradient(45deg, #c62828 0%, #2e7d32 100%)',
                '--theme-shadow': 'rgba(198,40,40,0.16)',
                '--theme-shadow-soft': 'rgba(46,125,50,0.18)',
                '--theme-nav-bg': 'rgba(255,255,255,0.98)'
            },
            dark: {
                '--theme-primary': '#ff6b63',
                '--theme-accent': '#58c06a',
                '--theme-primary-dark': '#e04a42',
                '--theme-primary-soft': '#3a1a1a',
                '--theme-primary-soft-2': '#1f0f0f',
                '--theme-bg': '#0c1a13',
                '--theme-bg-soft': '#12271d',
                '--theme-card': '#12271d',
                '--theme-text': '#f7ece2',
                '--theme-text-muted': '#c9b8a8',
                '--theme-text-dim': '#9d8e80',
                '--theme-text-faint': '#6f655a',
                '--theme-border': '#22392c',
                '--theme-border-soft': '#183024',
                '--theme-border-input': '#22392c',
                '--theme-gradient': 'linear-gradient(45deg, #ff6b63 0%, #58c06a 100%)',
                '--theme-shadow': 'rgba(255,107,99,0.2)',
                '--theme-shadow-soft': 'rgba(88,192,106,0.15)',
                '--theme-nav-bg': 'rgba(12,26,19,0.98)'
            }
        },
        halloween: {
            name: 'Halloween', sub: 'Haunted · Patch', emoji: '🎃', group: 'holidays',
            preview: { primary: '#ea6a0a', gradient: 'linear-gradient(135deg, #ea6a0a 0%, #8b5cf6 100%)' },
            light: {
                '--theme-primary': '#ea6a0a',
                '--theme-accent': '#8b5cf6',
                '--theme-primary-dark': '#c2540a',
                '--theme-primary-soft': '#ffe8d1',
                '--theme-primary-soft-2': '#fff4e8',
                '--theme-bg': '#ffffff',
                '--theme-bg-soft': '#fffaf3',
                '--theme-card': '#ffffff',
                '--theme-text': '#2e1a3d',
                '--theme-text-muted': '#573a6e',
                '--theme-text-dim': '#7f6697',
                '--theme-text-faint': '#ad9cc0',
                '--theme-border': '#f3e6f7',
                '--theme-border-soft': '#f8eefb',
                '--theme-border-input': '#e6d2ee',
                '--theme-gradient': 'linear-gradient(45deg, #ea6a0a 0%, #8b5cf6 100%)',
                '--theme-shadow': 'rgba(234,106,10,0.18)',
                '--theme-shadow-soft': 'rgba(139,92,246,0.2)',
                '--theme-nav-bg': 'rgba(255,255,255,0.98)'
            },
            dark: {
                '--theme-primary': '#fb923c',
                '--theme-accent': '#a78bfa',
                '--theme-primary-dark': '#ea6a0a',
                '--theme-primary-soft': '#33190a',
                '--theme-primary-soft-2': '#1a0d06',
                '--theme-bg': '#0b0618',
                '--theme-bg-soft': '#150d28',
                '--theme-card': '#150d28',
                '--theme-text': '#f4ecfa',
                '--theme-text-muted': '#c3b3d6',
                '--theme-text-dim': '#9684ac',
                '--theme-text-faint': '#6c5d82',
                '--theme-border': '#27183f',
                '--theme-border-soft': '#1b1030',
                '--theme-border-input': '#27183f',
                '--theme-gradient': 'linear-gradient(45deg, #fb923c 0%, #a78bfa 100%)',
                '--theme-shadow': 'rgba(251,146,60,0.22)',
                '--theme-shadow-soft': 'rgba(167,139,250,0.16)',
                '--theme-nav-bg': 'rgba(11,6,24,0.98)'
            }
        },
        easter: {
            name: 'Easter', sub: 'Egg · Hunt', emoji: '🐰', group: 'holidays',
            preview: { primary: '#d9609a', gradient: 'linear-gradient(135deg, #d9609a 0%, #7cc576 100%)' },
            light: {
                '--theme-primary': '#d9609a',
                '--theme-accent': '#7cc576',
                '--theme-primary-dark': '#b8447c',
                '--theme-primary-soft': '#fde4ef',
                '--theme-primary-soft-2': '#fff1f7',
                '--theme-bg': '#ffffff',
                '--theme-bg-soft': '#fffafc',
                '--theme-card': '#ffffff',
                '--theme-text': '#3a2038',
                '--theme-text-muted': '#6a4a68',
                '--theme-text-dim': '#917090',
                '--theme-text-faint': '#bda3bb',
                '--theme-border': '#f6e4ee',
                '--theme-border-soft': '#fbeff5',
                '--theme-border-input': '#efd2e1',
                '--theme-gradient': 'linear-gradient(45deg, #d9609a 0%, #7cc576 100%)',
                '--theme-shadow': 'rgba(217,96,154,0.16)',
                '--theme-shadow-soft': 'rgba(124,197,118,0.2)',
                '--theme-nav-bg': 'rgba(255,255,255,0.98)'
            },
            dark: {
                '--theme-primary': '#f08fbf',
                '--theme-accent': '#8fd98a',
                '--theme-primary-dark': '#d9609a',
                '--theme-primary-soft': '#3a1d30',
                '--theme-primary-soft-2': '#1f0f1a',
                '--theme-bg': '#0f1420',
                '--theme-bg-soft': '#151d2a',
                '--theme-card': '#151d2a',
                '--theme-text': '#f6ebf1',
                '--theme-text-muted': '#c9b3c1',
                '--theme-text-dim': '#9c8798',
                '--theme-text-faint': '#6e5d6b',
                '--theme-border': '#26302f',
                '--theme-border-soft': '#1b2a28',
                '--theme-border-input': '#26302f',
                '--theme-gradient': 'linear-gradient(45deg, #f08fbf 0%, #8fd98a 100%)',
                '--theme-shadow': 'rgba(240,143,191,0.2)',
                '--theme-shadow-soft': 'rgba(143,217,138,0.15)',
                '--theme-nav-bg': 'rgba(15,20,32,0.98)'
            }
        },
        newyear: {
            name: 'New Year', sub: 'Countdown · Rooftop', emoji: '🎆', group: 'holidays',
            preview: { primary: '#d9a21b', gradient: 'linear-gradient(135deg, #d9a21b 0%, #e0489a 100%)' },
            light: {
                '--theme-primary': '#d9a21b',
                '--theme-accent': '#e0489a',
                '--theme-primary-dark': '#a87a0c',
                '--theme-primary-soft': '#fdf0c4',
                '--theme-primary-soft-2': '#fff8de',
                '--theme-bg': '#ffffff',
                '--theme-bg-soft': '#fffcf2',
                '--theme-card': '#ffffff',
                '--theme-text': '#2e2208',
                '--theme-text-muted': '#5f4a16',
                '--theme-text-dim': '#8c7436',
                '--theme-text-faint': '#bda76e',
                '--theme-border': '#f7ecc9',
                '--theme-border-soft': '#fbf4de',
                '--theme-border-input': '#ecdca3',
                '--theme-gradient': 'linear-gradient(45deg, #d9a21b 0%, #e0489a 100%)',
                '--theme-shadow': 'rgba(217,162,27,0.18)',
                '--theme-shadow-soft': 'rgba(224,72,154,0.18)',
                '--theme-nav-bg': 'rgba(255,255,255,0.98)'
            },
            dark: {
                '--theme-primary': '#ffcf4a',
                '--theme-accent': '#ff7ab8',
                '--theme-primary-dark': '#e0a91c',
                '--theme-primary-soft': '#2e2208',
                '--theme-primary-soft-2': '#171004',
                '--theme-bg': '#08051c',
                '--theme-bg-soft': '#120a2c',
                '--theme-card': '#120a2c',
                '--theme-text': '#fbf3dc',
                '--theme-text-muted': '#cdbf94',
                '--theme-text-dim': '#a09470',
                '--theme-text-faint': '#6f6648',
                '--theme-border': '#251a4a',
                '--theme-border-soft': '#1b1238',
                '--theme-border-input': '#251a4a',
                '--theme-gradient': 'linear-gradient(45deg, #ffcf4a 0%, #ff7ab8 100%)',
                '--theme-shadow': 'rgba(255,207,74,0.22)',
                '--theme-shadow-soft': 'rgba(255,122,184,0.16)',
                '--theme-nav-bg': 'rgba(8,5,28,0.98)'
            }
        }
    };

    // ★ v7 — theme groups (picker): Cozy Places / Seasons / Holidays. Order of window.THEMES already follows the groups.
    window.THEME_GROUP_META = [
        { id: 'places', label: 'Cozy Places', emoji: '🏡' },
        { id: 'seasons', label: 'Seasons', emoji: '🍂' },
        { id: 'holidays', label: 'Holidays', emoji: '🎉' }
    ];
    window.THEME_GROUPS = window.THEME_GROUP_META.map(function (g) {
        return { id: g.id, label: g.label, emoji: g.emoji, keys: Object.keys(window.THEMES).filter(function (k) { return window.THEMES[k].group === g.id; }) };
    });


    // ── themed cursor (v7) — NATIVE, zero-lag ──
    // The pointer itself is now a real CSS cursor image (arrow + the theme badge from THEME_CURSORS),
    // drawn by the OS / compositor, not by the page. So it cannot lag, stutter under main-thread load,
    // or freeze while you drag. Hover and pressed states are pure CSS (:hover / :active) — no listeners.
    // The image is rebuilt in the current palette on every theme / mode change. Fine pointers only.
    (function cursorKit() {
        const root = document.documentElement;
        let fine = false;
        try { fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (e) { /* ignore */ }
        window.__twCursorSync = function () { };
        if (!fine) return;
        const ICON_CSS = '.f1{fill: @1}.f2{fill: @2}.fa{fill: @A}.fw{fill: #fff}.fg{fill: #3fae5f}.fo{fill: #e8b04a}.o2{stroke: @2;stroke-width: 1.5;stroke-linejoin: round;stroke-linecap: round}.ow{stroke: #fff;stroke-width: 1.1;stroke-linejoin: round}.k1, .k2, .ka, .kt, .ko{fill: none;stroke-linecap: round;stroke-linejoin: round}.k1{stroke: @1;stroke-width: 2.1}.k2{stroke: @2;stroke-width: 1.9}.ka{stroke: @A;stroke-width: 2.1}.kt{stroke: @2;stroke-width: 1.1;opacity: .8}.ko{stroke: @A;stroke-width: 2.2}.steam path{fill: none;stroke: @1;stroke-width: 1.8;stroke-linecap: round}.bd{fill: #fff7ea;stroke: @2;stroke-width: 1.8}.hd{fill: none;stroke: @2;stroke-width: 2.2;stroke-linecap: round}.cf{fill: #6b4226;stroke: @2;stroke-width: 1.4}.ht{fill: #ffd9c2}.pet ellipse{fill: @1;stroke: #fff;stroke-width: 1}.ct{fill: #ffd45c;stroke: #e0a12b;stroke-width: 1}.tw{fill: @1}.wn{fill: #7a1226}.gg{fill: rgba(255,255,255,.6)}.gb{fill: none;stroke: @2;stroke-width: 1.8;stroke-linejoin: round}.gs{fill: none;stroke: @2;stroke-width: 2;stroke-linecap: round}.hl{fill: none;stroke: rgba(255,255,255,.7);stroke-width: 1.4;stroke-linecap: round}.gwl{fill: @1;opacity: .22}.tk{fill: none;stroke: #8a5a30;stroke-width: 3;stroke-linecap: round}.fgn{fill: #2fa35f;stroke: #17703c}.fb{fill: #7a4a22}.wv{stroke-width: 3.2}.bowl{fill: #f4efdf}';
        const ARROW = 'M3 2V22.5L8.4 17.6L11.8 25.4L15.4 23.8L12 16L19.3 15.4Z';
        const HOVER = 'a[href],button:not(:disabled),summary,label[for],[role="button"],[role="tab"],[role="link"],[role="menuitem"],[role="switch"],input[type="button"],input[type="submit"],input[type="reset"],input[type="checkbox"],input[type="radio"],input[type="range"],[onclick],select,[tabindex]:not([tabindex="-1"])';
        const TEXT = 'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="file"]),textarea,[contenteditable=""],[contenteditable="true"]';
        let el = null;
        function svg(key, st, px, pal) {
            const c1 = pal['--theme-primary'], c2 = pal['--theme-primary-dark'], ac = pal['--theme-accent'];
            const css = ICON_CSS.replace(/@1/g, c1).replace(/@2/g, c2).replace(/@A/g, ac);
            const inner = (window.THEME_CURSORS[key] || '').replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
            const bs = [0.5, 0.56, 0.44][st], r = [8.6, 9.4, 7.8][st], cx = 23, cy = 23.2, o = 17 * bs;
            const fill = st === 1 ? ac : (st === 2 ? c2 : c1);
            return '<svg xmlns="http://www.w3.org/2000/svg" width="' + px + '" height="' + px + '" viewBox="0 0 32 32"><style>' + css + '</style>'
                + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#fff" fill-opacity=".96" stroke="' + c1 + '" stroke-width="1.2"/>'
                + '<g transform="translate(' + (cx - o) + ' ' + (cy - o) + ') scale(' + bs + ')">' + inner + '</g>'
                + '<path d="' + ARROW + '" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="3.4" stroke-linejoin="round"/>'
                + '<path d="' + ARROW + '" fill="' + fill + '" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
        }
        function decl(key, st, pal) {
            const u = (px) => 'url("data:image/svg+xml,' + encodeURIComponent(svg(key, st, px, pal)) + '")';
            return 'cursor:' + u(32) + ' 3 2,auto !important;cursor:-webkit-image-set(' + u(32) + ' 1x,' + u(64) + ' 2x) 3 2,auto !important;';
        }
        function sync(presetKey) {
            const ok = !!(window.THEME_CURSORS && window.THEME_CURSORS[presetKey] && window.THEMES && window.THEMES[presetKey]);
            if (!ok) { root.removeAttribute('data-tw-cursor'); if (el) el.textContent = ''; return; }
            const mode = root.getAttribute('data-timawa-mode') === 'dark' ? 'dark' : 'light';
            const pal = window.THEMES[presetKey][mode];
            if (!el) { el = document.createElement('style'); el.id = 'twCurStyle'; document.head.appendChild(el); }
            const P = 'html[data-tw-cursor]';
            el.textContent =
                P + ',' + P + ' *,' + P + ' *::before,' + P + ' *::after{' + decl(presetKey, 0, pal) + '}' +
                P + ' :is(' + HOVER + '){' + decl(presetKey, 1, pal) + '}' +
                P + ' :is(' + TEXT + '){cursor:text !important}' +
                P + ' :is(' + HOVER + '):active,' + P + ' *:active{' + decl(presetKey, 2, pal) + '}' +
                P + ' :is(' + TEXT + '):active{cursor:text !important}';
            root.setAttribute('data-tw-cursor', presetKey);
        }
        window.__twCursorSync = sync;
        { const t0 = root.getAttribute('data-timawa-theme'); if (t0) sync(t0); }   // theme may already be applied
    })();

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
            const hadScene = !!container.dataset.activeTheme;
            container.innerHTML = window.THEME_SHAPES[presetKey];
            container.dataset.activeTheme = presetKey;
            // v6: soft cross-fade when the user switches scenes (not on first paint)
            if (hadScene) {
                container.classList.remove('tw-swap');
                void container.offsetWidth;
                container.classList.add('tw-swap');
                setTimeout(() => container.classList.remove('tw-swap'), 900);
            }
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
        root.style.colorScheme = mode; // v6: native form controls / scrollbars follow the mode
        window.injectThemeShapes(presetKey);
        if (window.__twCursorSync) window.__twCursorSync(presetKey);
        if (window.__twPerfProbe) window.__twPerfProbe();
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

    // ── perf hooks (v8.3): pause when hidden + a GENTLE adaptive tier. Animations play by default. ──
    // Tiers (html[data-tw-perf]): full (default) > balanced > eco; lite = manual only. The sampler waits ~4s after load,
    // needs TWO slow readings in a row (p75 frame > 34ms) before stepping ONE tier down (never below eco on its own), and the
    // result lasts only for this browser session (sessionStorage) — so every new visit starts at full.
    // Controls (console):  TW_PERF.set('full'|'balanced'|'eco'|'lite')   TW_PERF.motion(true)  -> ignore the OS "reduce motion"
    // setting for these backgrounds (stored in localStorage tw_motion).   TW_PERF.reducedMotion tells you if the OS has it on.
    (function perfHooks() {
        const root = document.documentElement;
        const AUTO = ['full', 'balanced', 'eco'];
        try { localStorage.removeItem('tw_perf'); } catch (e) { /* old sticky key from earlier builds */ }
        let level = 'full';
        try { const s = sessionStorage.getItem('tw_perf2'); if (AUTO.indexOf(s) >= 0 || s === 'lite') level = s; } catch (e) { /* ignore */ }
        let motionOn = false;
        try { motionOn = localStorage.getItem('tw_motion') === 'on'; } catch (e) { /* ignore */ }
        function applyMotion() { if (motionOn) root.setAttribute('data-tw-motion', 'on'); else root.removeAttribute('data-tw-motion'); }
        function apply(l, remember) {
            level = l;
            root.setAttribute('data-tw-perf', l);
            if (l === 'lite') root.setAttribute('data-tw-lite', ''); else root.removeAttribute('data-tw-lite');
            if (remember) { try { sessionStorage.setItem('tw_perf2', l); } catch (e) { /* ignore */ } }
        }
        apply(level, false); applyMotion();
        window.TW_PERF = {
            get level() { return level; },
            get reducedMotion() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } },
            set: function (l) { if (AUTO.indexOf(l) >= 0 || l === 'lite') apply(l, true); },
            motion: function (on) { motionOn = !!on; try { localStorage.setItem('tw_motion', on ? 'on' : 'off'); } catch (e) { /* ignore */ } applyMotion(); }
        };

        let sampling = false, last = 0, strikes = 0;
        function probe() {
            if (sampling || level === 'lite' || level === 'eco' || document.hidden || Date.now() - last < 6000) return;
            sampling = true; last = Date.now();
            let prev = 0, n = 0; const d = [];
            (function tick(t) {
                if (document.hidden) { sampling = false; return; }
                if (prev) { const dt = t - prev; if (dt < 250) d.push(dt); }
                prev = t;
                if (++n < 66) { requestAnimationFrame(tick); return; }
                sampling = false;
                d.splice(0, 6);                         // ignore warm-up frames
                if (d.length < 30) return;
                d.sort((x, y) => x - y);
                if (d[Math.floor(d.length * 0.75)] > 34) {      // ~ under 30 fps
                    if (++strikes >= 2) { strikes = 0; apply(AUTO[Math.min(AUTO.indexOf(level) + 1, AUTO.length - 1)], true); }
                    setTimeout(probe, 6200);            // confirm / re-check
                } else strikes = 0;
            })(performance.now());
        }
        window.__twPerfProbe = function () { setTimeout(probe, 2500); };
        function first() { setTimeout(probe, 4000); }
        if (document.readyState === 'complete') first(); else window.addEventListener('load', first);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) root.setAttribute('data-tw-paused', '');
            else { root.removeAttribute('data-tw-paused'); window.__twPerfProbe(); }
        });
    })();
})();