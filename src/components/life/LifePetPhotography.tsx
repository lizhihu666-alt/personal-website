import React, { useLayoutEffect, useRef, useState } from 'react';
import { PET_PHOTOGRAPHY } from '../../data/portfolioData';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';
import { LifeChapterLabel } from './LifeChapterLabel';
import './LifePetPhotography.css';

// 三块背景布的颜色（蓝 / 红 / 黄）：做模块记号和照片下方的进度条，其余都服从生活页自己的风格。
const BRAND_COLORS = ['#1560A8', '#B3182B', '#F5B700'];

// 生活页「摄影」模块：左边是几句话，右边是一排竖幅肖像。
// 电脑上是「手风琴」：悬停 / 聚焦 / 点击哪张，哪张展开成完整的 2:3，其余收成一条色带；
// 手机上是横向滑动的相册，每张都完整显示。
export const LifePetPhotography: React.FC = () => {
  const { photos } = PET_PHOTOGRAPHY;
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      const trigger = { trigger: sectionRef.current, start: 'top 72%', once: true };

      gsap.fromTo(
        '.pet-reveal',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.08, ease: 'power3.out', clearProps: 'opacity,transform', scrollTrigger: trigger }
      );
      // 照片像一排背景布依次放下来。
      gsap.fromTo(
        '.pet-panel',
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 0.9, stagger: 0.07, ease: 'power4.out', clearProps: 'clipPath', scrollTrigger: trigger }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="life-photography"
      ref={sectionRef}
      aria-labelledby="life-photography-title"
      className="relative border-t border-[#1F1F1F] px-6 py-20 sm:px-10 sm:py-28 lg:px-16"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <LifeChapterLabel index="02" name="摄影" className="pet-reveal" />
          <h2
            id="life-photography-title"
            className="pet-reveal mt-5 text-3xl font-bold leading-[1.2] tracking-tight text-[#F5F4F2] sm:text-[2.6rem]"
          >
            为毛孩子，
            <br />
            认真拍一张<span className="text-(--life-accent)">肖像</span>
          </h2>

          <span className="pet-reveal mt-6 flex gap-1" aria-hidden="true">
            {BRAND_COLORS.map((color) => (
              <span key={color} className="h-[3px] w-4 rounded-full" style={{ backgroundColor: color }} />
            ))}
          </span>

          <p className="pet-reveal mt-6 max-w-md text-base leading-[1.85] text-[#D2CECA] sm:text-lg">
            {PET_PHOTOGRAPHY.intro}
          </p>

          <p className="pet-reveal mt-6 max-w-md text-sm leading-[1.9] text-[#8A8784]">
            {PET_PHOTOGRAPHY.timeMachine.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>

        <div className="min-w-0 lg:col-span-8">
          <div className="pet-strip" role="group" aria-label="宠物肖像照片">
            {photos.map((photo, index) => (
              <button
                key={photo.src}
                type="button"
                className="pet-panel"
                data-active={index === active}
                aria-pressed={index === active}
                aria-label={photo.alt}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => setActive(index)}
              >
                <img
                  src={photo.src}
                  alt=""
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </button>
            ))}
          </div>

          {/* 三色进度条：当前这张对应的那一段亮起，颜色就是那张照片的背景布颜色。 */}
          <div className="pet-progress" aria-hidden="true">
            {photos.map((photo, index) => (
              <span
                key={photo.src}
                data-active={index === active}
                style={{ ['--pet-color' as string]: BRAND_COLORS[index % BRAND_COLORS.length] } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
