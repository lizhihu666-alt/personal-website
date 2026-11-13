// 生活页的强调色：琥珀黄。CSS 里统一用 var(--life-accent) / var(--life-on-accent)（定义在 index.css，
// 并由它派生出 -hi / -deep / -ink），只有画布、GSAP 这类读不了 CSS 变量的地方才用这里的色值。
// 以后要换色：改这里和 index.css 里的 --life-accent 两处即可。
export const LIFE_ACCENT = '#FFC83D';
