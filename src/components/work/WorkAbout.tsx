import React, { useRef, useLayoutEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';

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
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.75,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'opacity,transform',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const toolStack = [
    { category: 'PROJECT & PROCESS', items: ['Jira', 'Notion', 'Miro', 'SOP Architecture', 'Risk Matrix'] },
    { category: 'ECOSYSTEM & OPS', items: ['Shopify Apps', 'WMS / ERP', 'API Protocols', 'Reverse Logistics'] },
    { category: 'AI & VIBE CODING', items: ['Gemini / Claude', 'Cursor', 'React / TypeScript', 'Tailwind CSS'] },
    { category: 'ANALYTICS & DATA', items: ['SQL', 'Python (Pandas)', 'PowerBI', 'Tableau', 'Excel Modeling'] },
  ];

  return (
    <section
      id="work-about"
      ref={containerRef}
      className="relative py-20 sm:py-28 px-6 sm:px-10 lg:px-16 border-b border-[#232A33] bg-[#0A0B0D]"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Marker */}
        <div className="flex items-center justify-between pb-5 border-b border-[#232A33] mb-12 sm:mb-16">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold tracking-widest text-[#5B89FF] bg-[#002FA7]/10 px-2.5 py-1 rounded-md uppercase">
              ABOUT & PERSPECTIVE
            </span>
            <span className="text-xs font-mono tracking-widest text-[#A8B0BC] uppercase">
              PERSPECTIVE & TOOLING
            </span>
          </div>
          <span className="text-xs font-mono tracking-widest text-[#A8B0BC] uppercase">
            WHO STANDS BEHIND THE WORK
          </span>
        </div>

        {/* Main Grid: Portrait & Story */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pb-16 border-b border-[#232A33]">
          {/* Natural Portrait / Frame (4 Cols) */}
          <div className="lg:col-span-4 about-reveal">
            <div className="relative border border-[#232A33] p-2 bg-[#111418] rounded-xl shadow-xs">
              <div className="aspect-[4/5] bg-[#0A0B0D] rounded-lg relative overflow-hidden flex flex-col items-center justify-center text-center p-6 border border-[#232A33]">
                {/* Visual Monogram */}
                <div className="w-20 h-20 rounded-full bg-[#002FA7] flex items-center justify-center text-2xl font-mono text-white font-bold mb-4 shadow-sm">
                  LH
                </div>
                <div className="text-sm font-semibold text-[#F3F5F8] uppercase tracking-wider">
                  LEO HU · 胡子
                </div>
                <div className="text-xs font-mono text-[#A8B0BC] mt-1">
                  PM · Builder · Photographer
                </div>
                <div className="mt-4 pt-3 border-t border-[#232A33] text-[11px] font-mono text-[#A8B0BC]">
                  “严谨建构系统，真诚体验世界。”
                </div>
              </div>
              <div className="mt-2 text-right text-[10px] font-mono text-[#A8B0BC] uppercase">
                SHENZHEN · 2026
              </div>
            </div>
          </div>

          {/* Narrative & Philosophy (8 Cols) */}
          <div className="lg:col-span-8 space-y-8 about-reveal">
            {/* Core Value Statement */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#F3F5F8] leading-snug">
              在严谨的系统设计中保持人性，
              <br />
              在代码与业务之外<span className="text-[#5B89FF] italic font-semibold">保持对世界的真实感知</span>。
            </h2>

            <div className="space-y-4 text-base text-[#C3CAD5] leading-relaxed">
              <p>
                我的背景横跨美国威斯康星麦迪逊分校的商业数据分析与出海一线业务。我习惯在错综复杂的制约中寻找最优解: 既能在架构层面梳理高韧性 SOP 与接口对账，也能躬身深入仓配现场与海外服务商对齐每一个交付细节。
              </p>
              <p>
                当 AI 浪潮来临，我坚信 <strong>Vibe Coding</strong> 赋予了非纯研发背景的 PM 极速原型落地的超能力。工具的迭代越快，我们越需要敏锐的问题洞察力与将事情真正推进到底的韧性。
              </p>
            </div>

            {/* Current Focus Areas */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 bg-[#111418] border border-[#232A33] rounded-xl shadow-xs">
                <div className="text-[#5B89FF] font-semibold mb-1">FOCUS // 01</div>
                <div className="text-[#F3F5F8] font-semibold">Cross-Border Fulfillment</div>
                <div className="text-[#A8B0BC] mt-0.5">全球履约与中台系统</div>
              </div>
              <div className="p-4 bg-[#111418] border border-[#232A33] rounded-xl shadow-xs">
                <div className="text-[#5B89FF] font-semibold mb-1">FOCUS // 02</div>
                <div className="text-[#F3F5F8] font-semibold">Vibe Coding Workflows</div>
                <div className="text-[#A8B0BC] mt-0.5">AI 驱动的极速产品验证</div>
              </div>
              <div className="p-4 bg-[#111418] border border-[#232A33] rounded-xl shadow-xs">
                <div className="text-[#5B89FF] font-semibold mb-1">FOCUS // 03</div>
                <div className="text-[#F3F5F8] font-semibold">High-Resilience SOP</div>
                <div className="text-[#A8B0BC] mt-0.5">跨团队标准化落地机制</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tool Stack */}
        <div className="mt-14 pb-16 border-b border-[#232A33]">
          <div className="text-xs font-mono tracking-widest text-[#A8B0BC] uppercase mb-6">
            TOOLKIT & COMPETENCIES
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {toolStack.map((stack, idx) => (
              <div key={idx} className="p-4 bg-[#111418] border border-[#232A33] rounded-xl shadow-xs">
                <div className="text-xs font-mono text-[#5B89FF] uppercase tracking-wider font-semibold mb-2">
                  {stack.category}
                </div>
                <div className="space-y-1 text-xs text-[#C3CAD5]">
                  {stack.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex items-center gap-1.5">
                      <span className="text-[#A8B0BC]">·</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bridge to Life Mode */}
        <div className="mt-16 p-8 sm:p-12 bg-[#111418] border border-[#232A33] rounded-xl flex flex-col md:flex-row items-center justify-between gap-8 about-reveal shadow-xs">
          <div>
            <div className="text-xs font-mono tracking-widest text-[#5B89FF] uppercase mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5B89FF]" />
              OFF-DUTY PERSPECTIVE
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#F3F5F8]">
              工作之外，我也在认真体验世界。
            </h3>
            <p className="text-sm text-[#A8B0BC] mt-2 max-w-xl leading-relaxed">
              拍狗、击球、在陌生城市走很远。如果想看看我如何度过没有 KPI 的日常，欢迎随时打卡下班。
            </p>
          </div>

          <button
            id="work-to-life-cta-btn"
            onClick={onSwitchToLife}
            className="group px-6 py-3.5 bg-[#002FA7] hover:bg-[#002585] text-white text-xs font-mono tracking-wider uppercase rounded-lg flex items-center gap-3 transition-colors shadow-xs shrink-0 focus:outline-none font-medium"
          >
            <span>进入生活模式 · Enter Life Mode</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
