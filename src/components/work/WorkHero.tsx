import React, { useLayoutEffect, useRef } from 'react';
import { FileText, Mail, ArrowDown } from 'lucide-react';
import { LeoCharacter } from '../character/LeoCharacter';
import Topography from '../effects/Topography';
import { gsap, isReducedMotion, ScrollTrigger } from '../../utils/gsapSetup';
import { resetPointerMotion, updatePointerMotion } from '../../utils/pointerMotion';

interface WorkHeroProps {
  onOpenResume?: () => void;
  /** 点「发起交流」时弹出名片（背面是微信二维码）。 */
  onOpenContactCard?: () => void;
  /** 从首页"上班的我"卡片做 View Transition 变形跳转过来时传 true——
      标题的位置/大小已经由那次变形动画负责了，这里的入场滑入动画
      不用再叠一遍，直接以最终状态显示。 */
  skipIntro?: boolean;
}

export const WorkHero: React.FC<WorkHeroProps> = ({ onOpenResume, onOpenContactCard, skipIntro = false }) => {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      if (!skipIntro) {
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .fromTo(
            '.hero-headline-line',
            { yPercent: 115 },
            {
              yPercent: 0,
              duration: 0.85,
              stagger: 0.11,
              clearProps: 'transform',
            },
            0.05
          )
          .fromTo(
            '.hero-highlight',
            { clipPath: 'inset(0 100% 0 0)' },
            {
              clipPath: 'inset(0 0% 0 0)',
              duration: 0.55,
              ease: 'power2.inOut',
              clearProps: 'clipPath',
            },
            0.42
          )
          .fromTo(
            '.hero-subtitle',
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, clearProps: 'transform,opacity' },
            0.42
          )
          .fromTo(
            '.hero-actions',
            { y: 12, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, clearProps: 'transform,opacity' },
            0.54
          )
          .fromTo(
            '.hero-scroll-cue',
            { y: 8, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, clearProps: 'transform,opacity' },
            0.82
          );
      }

      // 开场钉住不动，让"成果"区块从下方整块滑上来盖住它——参考 GSAP
      // 官方 ScrollTrigger 的 layered-pinning 案例（pinSpacing 必须是
      // false）：pinSpacing 用默认的 true 会多留一段等长的占位空间，
      // 导致要多滚一倍距离才能看到下一屏盖上来，效果几乎感觉不到。
      // 设为 false 后不留占位，"成果"紧贴着 Hero 原来的位置起步，滚动
      // 一屏的距离就能看到它完整地盖上来。
      //
      // 只在 md 以上启用：移动端的 dvh 计算受地址栏收起/展开影响，
      // Hero 自身内容（含只在移动端显示的头像卡）也更容易比一屏高，
      // 这套叠层钉住在窄屏上曾经出现"成果"区块在还没滚动时就已经
      // 盖住 Hero，标题和 CTA 基本看不到的问题。移动端直接走正常的
      // 文档流滚动，不钉住、不叠层，更稳妥。
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          pin: true,
          pinSpacing: false,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="work-hero"
      ref={sectionRef}
      className="relative min-h-[calc(100dvh-4rem)] flex flex-col justify-between overflow-hidden pt-10 pb-12 px-6 sm:px-10 lg:px-16 bg-[#0A0B0D] text-[#F3F5F8]"
    >
      {/* 官方 React Bits Topography 组件（ogl 版）。背景层用 z-0（不用负数
          z-index，之前排查出来负数 z-index 在某些渲染链路下会让整层内容
          彻底不可见）。组件自己在 canvas 上监听 mousemove 做鼠标跟随，
          但前景内容的包裹 div 即使视觉上大片透明，它的布局盒子本身还是
          会整块拦截鼠标事件——之前忘了给前景包裹层加 pointer-events-none，
          导致鼠标一进入文字/按钮所在的那个大矩形范围，事件根本传不到
          下面的 canvas，图案自然看起来"不跟着鼠标动"。现在前景包裹层统一
          设为 pointer-events-none，只在真正需要点击的按钮上单独加回
          pointer-events-auto。 */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <Topography
          lowColor="#0A0B0D"
          midColor="#0E7C3D"
          highColor="#34D378"
          speed={0.35}
          morphAmount={2.0}
          morphSpeed={0.05}
          bands={2.0}
          thickness={0.01}
          scale={1.8}
          pixelSize={1.0}
          glow={0.5}
          colorMode="elevation"
          contrast={3.0}
          brightness={1.0}
          fillBands={false}
          opacity={1.0}
          grain={true}
          grainIntensity={0.05}
          mouseInteraction={true}
          mouseRadius={0.3}
          mouseStrength={0.4}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full my-auto py-10 sm:py-14 pointer-events-none">
        <div className="lg:hidden flex items-center gap-4 mb-10">
          <div className="shrink-0 w-20 h-20 rounded-xl bg-[#111418] border border-[#232A33] flex items-center justify-center overflow-hidden">
            <LeoCharacter action="sit-desk" className="w-16 h-16" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-semibold text-[#F3F5F8] leading-tight">Leo Hu · 胡利致</div>
            <div className="text-sm text-[#A8B0BC] mt-1">项目运营主管 · 深圳</div>
          </div>
        </div>

        <h1 id="work-hero-title" className="type-display text-[#F3F5F8]">
          <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
            <span className="hero-headline-line block">0-1 搭建商家入驻体系，</span>
          </span>
          <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
            <span className="hero-headline-line block">AI 赋能业务落地</span>
          </span>
        </h1>

        <div className="mt-10 sm:mt-14 space-y-7 max-w-[34rem]">
          <p className="hero-subtitle type-lead text-[#C3CAD5]">
            统筹项目、系统与供应链，<br />已推动<span className="hero-highlight inline-block text-[#34D378] font-semibold">20+ 品牌平稳入驻与迁移</span>。
          </p>

          <div className="hero-actions flex flex-wrap items-center gap-3">
            <button
              id="hero-primary-contact-btn"
              onClick={() => (onOpenContactCard ? onOpenContactCard() : scrollToSection('work-contact'))}
              onPointerMove={updatePointerMotion}
              onPointerLeave={resetPointerMotion}
              className="pointer-reactive pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0E7C3D] hover:bg-[#0A6631] px-5 py-3 text-sm font-medium text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>发起交流</span>
            </button>

            {onOpenResume && (
              <button
                id="hero-open-resume-btn"
                onClick={onOpenResume}
                className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#111418] hover:bg-[#0A0B0D] border border-[#2B323C] hover:border-[#3A424E] px-5 py-3 text-sm font-medium text-[#F3F5F8] transition-colors"
              >
                <FileText className="w-4 h-4 text-[#34D378]" />
                <span>查看履历</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full pointer-events-none">
        <button
          type="button"
          onClick={() => scrollToSection('work-impact')}
          className="hero-scroll-cue group pointer-events-auto inline-flex min-h-11 items-center gap-3 text-sm text-[#8C95A3] hover:text-[#F3F5F8] transition-colors"
        >
          <span className="h-px w-8 bg-[#3A424E] group-hover:bg-[#34D378] transition-colors" />
          <span>向下查看成果</span>
          <ArrowDown className="scroll-cue-drift w-4 h-4 text-[#34D378]" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
