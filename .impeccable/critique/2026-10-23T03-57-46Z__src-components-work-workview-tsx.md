---
target: work mode (WorkView)
total_score: 23
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\leohu\\Documents\\ChatGPT\\个人网站\\src\\components\\work\\WorkView.tsx"
target_fingerprint: "sha256:b3f33e91e19e501e6ea38e129e1847fcf931b85f21e124e2b9a5b1191c23cd64"
target_path: "C:\\Users\\leohu\\Documents\\ChatGPT\\个人网站\\src\\components\\work\\WorkView.tsx"
timestamp: 2026-10-23T03-57-46Z
slug: src-components-work-workview-tsx
---
Method: dual-agent (A: ac472d9e0c6566b7b · B: a74da064ad066718e)

# Critique: work mode (src/components/work/WorkView.tsx), 2026-10-23

## Design specificity
A: ~6/10. Content distinctive (home "which me" chooser, life impossible-switch joke, method convergence, evidence-first copy). Visual language is a stack of React-Bits-style effects (contour WebGL, pixel dissolve, particles, StaggeredMenu, ScrollFloat) in near-black + neon green; five unrelated motion vocabularies. English borrowed motto conflicts with Chinese-first rule. Life half is empty.
B: detector 3 findings, all real, none in core work page: 2x gradient-text (ProfileCard.css:410, :425), 1x layout-transition (LifeComingSoon.css:13). Browser injection: "No anti-patterns found." No console errors.

## Heuristics (23/36, heuristic 10 n/a)
1 Visibility 3 | 2 Match 3 | 3 Control 2 (4,000/9,000 scroll px pinned; Esc doesn't close nav drawer) | 4 Consistency 2 (项目 content x=201 vs x=137 elsewhere; disabled life items look live) | 5 Error prevention 3 | 6 Recognition 2 (hover-gated metric labels/GPA) | 7 Flexibility 2 (no skip link, no mailto, no resume/contact in menu) | 8 Minimalist 3 | 9 Recovery 3 | 10 n/a

## Cognitive load failures
Chunking (6 menu items + 7 dots duplicate nav); unranked 4 contact cards; working memory (method labels ~10px across ~1,800px); progressive disclosure inverted (facts hidden, decoration shown).

## Emotional journey
Strong hero and method payoff; valley in 成果 (3 near-empty screens) and ~450px blank after method dissolve; ends on English motto + "回到顶部", not conversion.

## Strengths
Evidence-first copy; row-based 项目/经历 lists + sound dialog behaviour; home chooser and life impossible-switch.

## Priority issues
[P1] Pacing: scroll-jacking (成果 ~2,100px, 方法 ~1,800px) buries evidence. Fix: show 4 numbers at once, cap pins at 1 viewport, labels >=14px. Commands: distill, animate.
[P1] Desktop hover-gating hides information (metric labels, subtitle, arrow, GPA). Fix: always render, persistent arrow, GPA inline, hover <=200ms. Commands: clarify, layout.
[P1] Desktop hero lacks name/role/city/availability. Fix: one quiet identity line; headshot earlier. Command: clarify.
[P2] A11y/touch: no skip link/main/footer; Esc doesn't close drawer; English aria on menu button, 20x16 target; motto heading read twice; stray sr-only h2; 11px caption ~4.6:1; .career-track-loc #6B7280 on #F3F5F8 = 4.43:1; #34D378 focus outline ~1.7:1 on light; mobile heading word-breaks. Commands: harden, audit.
[P2] Contact unranked, no mailto, ending wastes the peak; WeChat ID mismatch (data Hu-Leo-731 vs PRODUCT.md LeoHu_Connect). Commands: clarify, delight.

## Personas
Jordan (recruiter 30s), Casey (mobile), Sam (keyboard/SR) red flags as above.

## Minor
Hover row shift ~7px; 项目 top clipped by sticky header; green-on-green case title; light-weight 成果 numerals; "9套" mixed counter; mobile orphan lines; life menu disabled items look live; home promises 生活 stub; pixel dissolve covers method CTA; WebGL hero may render while covered; .career-track-* naming reused; case body copy fully gated by once-only ScrollTrigger with no fallback.

## Questions
Which of the four numbers survives a 90s visit? What real artifact could replace four glowing labels? If life never ships, should the chooser exist?
