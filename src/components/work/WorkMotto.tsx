import React, { useLayoutEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';
import ScrollFloat from '../effects/ScrollFloat';
import './WorkMotto.css';

// 座右铭：深色整屏，两行大字错位排开，字符随滚动逐个"浮"上来（ScrollFloat），
// 背后叠一层几乎看不见的虚影，滚动时和主字往相反方向慢慢错开，形成景深。
// 放在整页最末，连同版权、回到顶部一起收尾。
const LINES = [
  { text: 'STAY HUNGRY', offset: 'ml-[3vw]' },
  { text: 'STAY FOOLISH', offset: 'ml-[3vw] lg:ml-[12vw]' },
];

export const WorkMotto: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (isReducedMotion()) {
      gsap.set(captionRef.current, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        captionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 55%', once: true },
        }
      );

      // 虚影与主字反向慢移，滚过整屏的过程中拉开一点错位。
      gsap.fromTo(
        ghostRef.current,
        { xPercent: 3, yPercent: 6 },
        {
          xPercent: -3,
          yPercent: -4,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        }
      );
      gsap.fromTo(
        mainRef.current,
        { xPercent: -1.5 },
        {
          xPercent: 1.5,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const textClass =
    'text-[clamp(2.6rem,10.5vw,8.5rem)] font-bold uppercase leading-[1.3] tracking-[-0.03em]';

  return (
    <section
      id="work-motto"
      ref={sectionRef}
      aria-label="座右铭：Stay hungry, stay foolish"
      className="relative overflow-hidden bg-[#050506] px-6 pb-6 pt-16 sm:px-10 sm:pt-24 lg:px-16"
    >
      <div className="relative mx-auto w-full max-w-6xl">
        <div ref={ghostRef} aria-hidden="true" className={`absolute inset-0 select-none ${textClass}`}>
          {LINES.map((line) => (
            <div key={line.text} className={`pb-[0.06em] text-white/[0.06] ${line.offset}`}>
              {line.text}
            </div>
          ))}
        </div>
        <div ref={mainRef} className={`relative text-[#F3F5F8] ${textClass}`}>
          {LINES.map((line) => (
            <div key={line.text} className={line.offset}>
              <ScrollFloat
                containerClassName="motto-float"
                effect="float"
                splitBy="chars"
                direction="up"
                order="start"
                fromColor="currentColor"
                animationDuration={1}
                ease="back.inOut(2)"
                scrollStart="center bottom+=50%"
                scrollEnd="bottom bottom-=40%"
                stagger={0.03}
                distance={120}
                stretch={2.3}
                smoothing={0}
              >
                {line.text}
              </ScrollFloat>
            </div>
          ))}
        </div>
      </div>

      <p
        ref={captionRef}
        className="mt-14 text-center font-mono text-[11px] uppercase tracking-[0.5em] text-[#6B7A99] opacity-0 sm:mt-20"
      >
        Personal Motto / 2026
      </p>

      {/* 页脚：版权和「回到顶部」放在整页最底部 */}
      <div className="type-meta mx-auto mt-20 flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 text-[#A8B0BC] sm:mt-28">
        <span>© 2026 LEO HU · 中国深圳</span>
        <button
          id="contact-back-to-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-flex min-h-11 items-center gap-2 text-[#A8B0BC] transition-colors hover:text-[#F3F5F8]"
        >
          <span>回到顶部</span>
          <ArrowUp className="h-4 w-4 text-[#34D378]" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
