---
target: Work 页
total_score: 25
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\leohu\\Documents\\ChatGPT\\个人网站\\src\\components\\work\\WorkView.tsx"
target_fingerprint: "sha256:ecd78d75c0b1effa78e1360c3fb8a8b73ce72c9fc7c4ad588f2a1ed42e1128b1"
target_path: "C:\\Users\\leohu\\Documents\\ChatGPT\\个人网站\\src\\components\\work\\WorkView.tsx"
timestamp: 2026-09-16T07-02-07Z
slug: src-components-work-workview-tsx
closed: true
---
#### Design Specificity Verdict

This reads as Leo Hu's own system: dark ground, Klein blue, mono metadata, real-time CST clock, Leo character, work/life mode switch, and numbered chapters. The cross-border operations language is also grounded in the page's actual experience.

The weakest specificity point is the project deep-dive: its 1背景/2角色/3行动/4系统/5成果 skeleton and the generic tool grid are very close to a category-generic PM portfolio. It would be stronger if at least one artifact or concrete system diagram were shown directly instead of a generic schematic.

#### Overall Impression

After the last distill pass the page is much cleaner. It now reads as a direct portfolio: hero → impact → projects → experience → about → contact. Visual rhythm is good, the copy is specific, and the contact section is honest.

The biggest opportunity is interaction consistency. Two similar expandable surfaces behave differently, and one is not keyboard/screen-reader friendly. A second opportunity is to smooth the visual transition from hero into impact after the method and bottom status strip were removed.

#### What's Working

1. The dark Klein blue language, numbered navigation, and mono metadata give the page a coherent identity.
2. Impact and project content is unusually specific: 30%, 10+, 9, $2M+, zero downtime, SOP counts, and concrete failure modes make the work credible.
3. Work/Life separation gives the page a distinct emotional shape. The bridge to “下班后的视角” is a nice end-of-story move before contact.

#### Priority Issues

| # | Severity | Issue | Fix | Suggested command |
|---|---|---|---|---|
| 1 | P1 | WorkExperience rows use click-only expandable `<div>`s. The “查看成果细节” control is a non-focusable `<span>`, so keyboard/screen-reader users do not get a real button state. | Convert the row-level toggle to a real button or role=button/tabIndex=0, with aria-expanded/aria-controls and visible keyboard state. | `$impeccable harden` |
| 2 | P1 | WorkSelectedProjects works better, but its aria affordance is indirect: the visible “展开详情” button has no click handler and relies on event bubbling from the parent row. It is functional but fragile. | Put the click handler directly on the button and use it as the semantic control, then let the row remain visual. Add aria-controls when practical. | `$impeccable harden` |
| 3 | P2 | Hero now jumps almost directly into WorkImpact after removing the top/bottom strips. It is cleaner, but the lack of a minimal scroll cue may make some first-time readers feel the page has ended too early. | Add a very small “向下” cue or make the Impact heading arrive with more visual weight; keep it quieter than the old strip. | `$impeccable clarify` |
| 4 | P2 | WorkContact reports “已复制到剪贴板” even when `navigator.clipboard` is unavailable or rejects. This can break trust on some browsers/contexts. | Make copy state conditional on actual success and add a select-and-copy fallback or explicit failure state. | `$impeccable harden` |
| 5 | P2 | Section rhythm is inconsistent after deletion: WorkImpact no longer has a marker, while WorkSelectedProjects/WorkExperience/WorkAbout/WorkContact retain their own marker patterns. | Pick one hierarchy: either restore a quiet marker for Impact or consciously make Impact the first unmarked “proof” section and adjust Projects to match. | `$impeccable distill` |

#### Cognitive Load

Most decision points are controlled: 2 hero CTAs, 4 impact metrics, 4 projects, 2 experience entries, 3 focus areas, and 4 contact channels. The project deep-dive is dense, but the 5-pillar structure and metric grid keep it navigable. No failed decision-point checks.

#### Heuristic Scores

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3/4 | Copy state and menu/modal states are visible; some clipboard feedback is not truthful on failure. |
| 2 | Match System / Real World | 4/4 | Cross-border PM language is concrete and user-appropriate. |
| 3 | User Control and Freedom | 3/4 | Expand/collapse and mode switching are good; some interaction control is inconsistent. |
| 4 | Consistency and Standards | 3/4 | Strong visual consistency, but interaction patterns differ between Projects and Experience. |
| 5 | Error Prevention | 3/4 | Contact placeholders are honest; clipboard error prevention is weak. |
| 6 | Recognition Rather Than Recall | 3/4 | Section markers and right-edge navigation help orientation. |
| 7 | Flexibility and Efficiency | n/a | Persuade/experience surface. |
| 8 | Aesthetic and Minimalist Design | 4/4 | Strong, calm, and specific after distillation. |
| 9 | Error Recovery | 2/4 | Clipboard copy has a weak failure path. |
| 10 | Help and Documentation | n/a | Persuade/experience surface. |
| **Total** | | **25/32** | **Good with clear hardening priorities** |

#### Persona Red Flags

**Sam (Accessibility-Dependent)**: WorkExperience rows are not a real accessible disclosure. Projects use an indirect click-bubbling pattern. Clipboard failure is silent.

**Riley (Stress Tester)**: If clipboard is denied or unsupported, the UI still says “已复制到剪贴板.” That is the most concrete trust-breaking edge case.

**Jordan (First-Timer)**: The hero-to-impact transition may feel like a dead end after the scroll cue removal, though the huge impact heading still carries the flow.

#### Minor Observations

- The four impact metrics are strong, but “零宕机系统割接” would be even stronger if it named one concrete business risk that was avoided.
- The generic `LH` monogram in WorkAbout is safe but visually flat compared with the Leo character in the hero.
- The `Geist` overused-font warning is likely the site's one generic visual signal. It may be acceptable if the visual system depends on neutrality, but a more distinctive sans could raise the page's authored feel.
- WorkContact's `待补充` state is honest, but if LinkedIn/GitHub remain blank for long, that block may lower perceived completeness.

#### Questions to Consider

- What if the first project deep-dive showed a real system diagram or artifact instead of a schematic?
- What if WorkExperience used the same accessible disclosure pattern as WorkProjects?
- What if the top of the impact section established more visual gravity to compensate for the removed scroll cue?
