import React, { useRef, useLayoutEffect, useState } from 'react';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';

export const WorkSignal: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(0);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.signal-fade',
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

  const capabilities = [
    {
      num: '01',
      title: 'Product Logic',
      zh: '业务理解与需求穿透',
      desc: '深入跨境供应链与品牌商业逻辑，穿透表象识别真实症结，不做被动接单的执行工具。',
      detail: 'The shape of the product before the screen. Defining real problem boundaries.',
    },
    {
      num: '02',
      title: 'Process Architecture',
      zh: '流程设计与方案解构',
      desc: '将模糊目标与零散经验拆解为高标准 SOP、异常预警流与状态机协议，沉淀可复用资产。',
      detail: 'Standardized workflows, SLA milestones and cross-border edge-case handling.',
    },
    {
      num: '03',
      title: 'System Orchestration',
      zh: '多方协同与系统割接',
      desc: '拉通产研、仓配、合规与外部合作伙伴，在权责不清时主动对齐共识并锁定交付里程碑。',
      detail: 'Connecting business logic to technical APIs, reconciliation rules and failover paths.',
    },
    {
      num: '04',
      title: 'Vibe Coding & AI',
      zh: '敏捷构建与原型交付',
      desc: '借助现代化 AI 工具链与现代全栈代码，以天为单位将业务设想快速打磨成高保真可用系统。',
      detail: 'Rapid functional prototypes built with modern full-stack code and AI intelligence.',
    },
  ];

  return (
    <section
      id="work-signal"
      ref={containerRef}
      className="relative py-20 sm:py-28 px-6 sm:px-10 lg:px-16 border-b border-[#232A33] bg-[#0A0B0D]"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#232A33] mb-12 sm:mb-16">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold tracking-widest text-[#5B89FF] bg-[#002FA7]/10 px-2.5 py-1 rounded-md uppercase">
              PRACTICE & PHILOSOPHY
            </span>
            <span className="text-xs font-mono tracking-widest text-[#A8B0BC] uppercase hidden sm:inline">
              FOCUS 0{activeTab + 1} / 04
            </span>
          </div>

          <span className="text-xs font-mono tracking-widest text-[#A8B0BC] uppercase">
            WHO I AM · WHAT I SHAPE
          </span>
        </div>

        {/* Headline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start pb-14 border-b border-[#232A33]">
          <div className="lg:col-span-7 signal-fade">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#F3F5F8] leading-[1.12]">
              Surface is what people see.
              <br />
              <span className="text-[#5B89FF]">System</span> is what makes it work.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#F3F5F8] font-medium">
              在不确定性与业务断层中，建立清晰的结构、流程与秩序。
            </p>
          </div>

          <div className="lg:col-span-5 signal-fade text-sm sm:text-base text-[#A8B0BC] leading-relaxed">
            <p className="mb-4">
              I shape both: the visible business workflow and the operating logic behind it.
            </p>
            <p>
              在跨境出海的多平台、多仓储与多时区协作中，我将模糊的目标拆解为权责清晰的推进路径；既能与技术研发定义高韧性接口与对账规范，也能向业务团队沉淀易于执行的双语 SOP。借助现代 AI 工具与 Vibe Coding，让想法跑通真实闭环。
            </p>
          </div>
        </div>

        {/* 4 Interactive Capability Pillars */}
        <div id="work-practice" className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {capabilities.map((cap, idx) => (
            <div
              key={cap.num}
              onClick={() => setActiveTab(idx)}
              className={`signal-fade flex flex-col justify-between p-5 pt-4 border-t-2 transition-all cursor-pointer rounded-b-lg group ${
                activeTab === idx
                  ? 'border-[#5B89FF] bg-[#111418] shadow-xs'
                  : 'border-[#2B323C] hover:border-[#3A424E] bg-transparent'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#A8B0BC] mb-3">
                  <span className="font-semibold text-[#F3F5F8]">{cap.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    activeTab === idx
                      ? 'bg-[#002FA7] text-white font-semibold'
                      : 'bg-[#232A33] text-[#F3F5F8] group-hover:bg-[#002FA7] group-hover:text-white'
                  }`}>
                    {cap.num}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[#F3F5F8] mb-2">
                  {cap.zh}
                </h3>
                <p className="text-xs sm:text-sm text-[#A8B0BC] leading-relaxed mb-3">
                  {cap.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#232A33] text-[11px] font-mono text-[#A8B0BC] leading-snug">
                {cap.detail}
              </div>
            </div>
          ))}
        </div>

        {/* SURFACE vs SYSTEM Comparison Grid */}
        <div className="mt-14 pt-8 border-t border-[#232A33] grid grid-cols-1 md:grid-cols-2 gap-8 signal-fade">
          <div className="p-6 bg-[#111418] border border-[#232A33] rounded-xl shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#A8B0BC]" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#F3F5F8]">
                SURFACE / 表层感知
              </span>
            </div>
            <p className="text-sm text-[#A8B0BC] leading-relaxed">
              清晰的界面交互、高质感双语 SOP 规范、跨部门协同协议与用户感知到的顺畅运转。不让混乱的内部逻辑暴露给使用者。
            </p>
          </div>

          <div className="p-6 bg-[#111418] border border-[#232A33] rounded-xl shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#5B89FF]" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#5B89FF]">
                SYSTEM / 底层架构
              </span>
            </div>
            <p className="text-sm text-[#A8B0BC] leading-relaxed">
              接口容错与自动重试机制、数据跨源对账规则、库存路由策略中台与高韧性容灾兜底。用严密的逻辑保证业务在高压下不崩盘。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
