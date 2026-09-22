import React, { useRef, useLayoutEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';
import { resetPointerMotion, updatePointerMotion } from '../../utils/pointerMotion';
import leoHeadshot from '../../assets/photos/leo-headshot.jpg';

interface WorkAboutProps {
  onSwitchToLife?: () => void;
}

export const WorkAbout: React.FC<WorkAboutProps> = ({ onSwitchToLife }) => {
  const containerRef = useRef<HTMLElement>(null);

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
      className="relative py-20 sm:py-28 px-6 sm:px-10 lg:px-16 bg-[#F3F5F8]"
    >
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
              <p className="mt-1 text-base text-[#5B6470]">产品经理 · 构建者 · 摄影师</p>
            </div>
          </div>

          <div className="md:col-span-7 lg:col-span-8 xl:col-span-9 space-y-8 about-reveal">
            <h2 className="type-section-sm text-[#0A0B0D]">
              在严谨的系统设计中保持人性，<br className="hidden xl:block" />
              在代码与业务之外<span className="text-[#0E7C3D]">保持对世界的真实感知</span>。
            </h2>

            <div className="type-body space-y-5 max-w-[44rem] text-[#4B5563]">
              <p>
                我的背景横跨商业数据分析与出海一线业务。我习惯在复杂制约中找到清晰路径，既能在架构层面梳理流程与接口，也能深入仓配现场对齐交付细节。
              </p>
              <p>
                当 AI 成为新的原型工具，我更看重把洞察推进到底：先验证方向，再让系统真正进入业务。
              </p>
              <p className="pt-2 border-t border-[#D8DCE2]">
                <span className="text-[#0A0B0D] font-medium">当前关注：</span>跨境履约 · AI 原型 · 高韧性 SOP
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 about-reveal p-8 sm:p-12 bg-white border border-[#D8DCE2] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_2px_18px_rgba(0,0,0,0.04)]">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#0A0B0D]">
              工作之外，我也在认真体验世界。
            </h3>
            <p className="type-body mt-3 max-w-[38rem] text-[#5B6470]">
              拍狗、击球、在陌生城市走很远。如果感兴趣，欢迎看看工作之外的我。
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
    </section>
  );
};
