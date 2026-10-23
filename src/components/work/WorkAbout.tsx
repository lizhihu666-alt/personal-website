import React, { useRef, useLayoutEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';
import { resetPointerMotion, updatePointerMotion } from '../../utils/pointerMotion';
import leoHeadshot from '../../assets/photos/leo-headshot.jpg';
import { PixelCoverCanvas, usePixelCover } from './PixelCover';

interface WorkAboutProps {
  onSwitchToLife?: () => void;
}

export const WorkAbout: React.FC<WorkAboutProps> = ({ onSwitchToLife }) => {
  const containerRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLCanvasElement>(null);
  // 滚到底后被方块盖成下一个板块（联系，深色）的颜色。
  usePixelCover(pinRef, coverRef, '#0A0B0D');

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.about-reveal',
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.65,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'opacity,transform',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 78%',
            once: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="work-about"
      ref={containerRef}
      className="relative px-6 sm:px-10 lg:px-16 bg-[#F3F5F8]"
    >
      <div ref={pinRef} className="relative flex min-h-dvh flex-col justify-center py-12 sm:py-14">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-16 items-start">
          <div className="md:col-span-5 lg:col-span-4 xl:col-span-3 about-reveal">
            <div className="relative border border-[#D8DCE2] p-6 bg-white rounded-2xl shadow-[0_2px_18px_rgba(0,0,0,0.04)]">
              <img
                src={leoHeadshot}
                alt="Leo Hu 职业照"
                className="w-20 h-20 rounded-full object-cover object-top"
              />
              <h3 className="mt-6 text-xl font-semibold text-[#0A0B0D]">Leo Hu · 胡利致</h3>
              <p className="mt-1 text-base text-[#5B6470]">商家入驻 · 项目运营 · AI 提效</p>
            </div>
          </div>

          <div className="md:col-span-7 lg:col-span-8 xl:col-span-9 space-y-8 about-reveal">
            <h2 className="type-section-sm text-[#0A0B0D]">
              3 年跨境电商实战<br className="hidden xl:block" />
              <span className="whitespace-nowrap text-[#0E7C3D]">从 0-1 搭建招商中台体系</span>
            </h2>

            <div className="type-body space-y-5 max-w-[44rem] text-[#4B5563]">
              <p>
                擅长在复杂场景下统筹项目管理、IT 系统、供应链与商家运营，兼具业务理解与技术思维；英语可作为工作语言，长期与中美团队协作。
              </p>
              <p>
                用标准化 SOP 把品牌上线周期缩短 30%，在系统迁移中保障 20+ 品牌平稳过渡，也习惯用 AI 工具解决业务痛点、提升团队效率。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 about-reveal p-6 sm:p-8 bg-white border border-[#D8DCE2] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_2px_18px_rgba(0,0,0,0.04)]">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#0A0B0D]">
              工作之外，我也在认真体验世界
            </h3>
            <p className="type-body mt-3 max-w-[38rem] text-[#5B6470]">
              摄影、运动、在陌生城市走很远。如果感兴趣，欢迎看看工作之外的我
            </p>
          </div>

          <button
            id="work-to-life-cta-btn"
            onClick={onSwitchToLife}
            onPointerMove={updatePointerMotion}
            onPointerLeave={resetPointerMotion}
            className="pointer-reactive group inline-flex min-h-11 shrink-0 items-center gap-3 rounded-xl bg-[#0E7C3D] hover:bg-[#0A6631] px-6 py-3 text-sm font-medium text-white transition-colors"
          >
            <span>进入生活模式</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
        <PixelCoverCanvas ref={coverRef} />
      </div>
    </section>
  );
};
