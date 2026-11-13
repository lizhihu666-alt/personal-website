import React, { useLayoutEffect, useRef } from 'react';
import { TIANDIAN } from '../../data/portfolioData';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';
import { LifeChapterLabel } from './LifeChapterLabel';

// 生活页「小甜点」：先认识我的狗，再往下看我给别的毛孩子拍的肖像。
// 左边是我和它的合影；右边是名字、一行小档案（只用细线分隔，不套框），
// 以及「在外 / 在家」两副面孔——一个整体劈成两半，和首页「上班的我 / 下班的我」是同一个意思。
export const LifeTiandian: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      const trigger = { trigger: sectionRef.current, start: 'top 72%', once: true };

      gsap.fromTo(
        '.tiandian-photo',
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'power4.out', clearProps: 'clipPath', scrollTrigger: trigger }
      );
      gsap.fromTo(
        '.tiandian-reveal',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.08, delay: 0.15, ease: 'power3.out', clearProps: 'opacity,transform', scrollTrigger: trigger }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const { together } = TIANDIAN;
  const [outside, home] = TIANDIAN.moods;

  return (
    <section
      id="life-tiandian"
      ref={sectionRef}
      aria-labelledby="life-tiandian-title"
      className="relative border-t border-[#1F1F1F] px-6 py-20 sm:px-10 sm:py-28 lg:px-16"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-12 md:gap-10 lg:gap-0">
        <figure className="tiandian-photo mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-[#161616] md:col-span-5 md:max-w-none">
          <img
            src={together.src}
            alt={together.alt}
            width={together.width}
            height={together.height}
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] h-auto w-full object-cover object-[50%_35%]"
          />
        </figure>

        <div className="md:col-span-7 lg:col-span-6 lg:col-start-7">
          <LifeChapterLabel index="01" name="宠物" className="tiandian-reveal" />
          <h2
            id="life-tiandian-title"
            className="tiandian-reveal mt-5 text-3xl font-bold leading-[1.2] tracking-tight text-[#F5F4F2] sm:text-[2.6rem]"
          >
            这是<span className="text-(--life-accent)">{TIANDIAN.name}</span>
          </h2>

          {/* 小档案：上下两条细线夹着一行，项与项之间用竖线分开 */}
          <dl className="tiandian-reveal mt-9 grid grid-cols-2 gap-y-6 border-y border-[#262626] py-6 sm:grid-cols-4">
            {TIANDIAN.facts.map((fact, index) => (
              <div
                key={fact.label}
                className={`${index % 2 === 1 ? 'border-l border-[#262626] pl-5' : ''} ${
                  index > 0 ? 'sm:border-l sm:border-[#262626] sm:pl-5' : ''
                }`}
              >
                <dt className="text-xs text-[#8A8784]">{fact.label}</dt>
                <dd className="mt-2 text-xl font-semibold text-[#F5F4F2]">{fact.value}</dd>
              </div>
            ))}
          </dl>

          {/* 两副面孔：同一个框劈成两半，在外是冷的一半，在家是暖的一半 */}
          <div className="tiandian-reveal mt-6 grid overflow-hidden rounded-2xl border border-[#262626] sm:grid-cols-2">
            <div className="bg-[#101010] p-6">
              <p className="text-sm text-[#8A8784]">{outside.where}</p>
              <p className="mt-3 text-xl font-semibold leading-snug text-[#B4B0AB] sm:text-2xl">{outside.what}</p>
            </div>
            <div className="border-t border-[#262626] bg-(--life-accent)/[0.08] p-6 sm:border-l sm:border-t-0">
              <p className="text-sm text-(--life-accent)">{home.where}</p>
              <p className="mt-3 text-xl font-semibold leading-snug text-[#F5F4F2] sm:text-2xl">{home.what}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
