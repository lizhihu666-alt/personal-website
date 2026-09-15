import React, { useState, useRef, useLayoutEffect } from 'react';
import { WORK_DATA } from '../../data/portfolioData';
import { ProjectCaseStudy } from '../../types';
import { ChevronDown, ChevronUp, CheckCircle2, ArrowUpRight, ShieldCheck, Layers, Terminal, Sparkles } from 'lucide-react';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';

export const WorkSelectedProjects: React.FC = () => {
  const projects = WORK_DATA.projects;
  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id || 'engage-hub');
  const [expandedDetailsId, setExpandedDetailsId] = useState<string>(projects[0]?.id || 'engage-hub');

  const containerRef = useRef<HTMLElement>(null);
  const activeIndex = projects.findIndex((p) => p.id === activeProjectId);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.project-row',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: (_index: number, el: Element) => (el.classList.contains('opacity-75') ? 0.75 : 1),
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'opacity,transform',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const toggleExpand = (id: string) => {
    setActiveProjectId(id);
    setExpandedDetailsId((prev) => (prev === id ? '' : id));
  };

  // Preview Schematics for active project
  const renderProjectPreview = (proj: ProjectCaseStudy) => {
    if (proj.id === 'engage-hub') {
      return (
        <div className="bg-[#0A0A0A]/85 backdrop-blur-md text-white p-6 rounded-2xs font-mono text-xs border border-white/20 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/15 text-[11px] text-white/70">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5B89FF]" />
              ENGAGE-HUB // ROUTING ARCHITECTURE
            </span>
            <span>v2.4 STABLE</span>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-4">
              <div className="border-t border-white/15 pt-2.5">
                <div className="text-[10px] text-[#5B89FF] mb-1">INBOUND INGESTION</div>
                <div className="text-white font-medium text-xs">Qualification Pre-check</div>
                <div className="text-[10px] text-white/60 mt-1">Automated PDF / Tax parsing</div>
              </div>
              <div className="border-t border-white/15 pt-2.5">
                <div className="text-[10px] text-[#5B89FF] mb-1">MASTER DATA SYNC</div>
                <div className="text-white font-medium text-xs">SPU / SKU Cross-mapping</div>
                <div className="text-[10px] text-white/60 mt-1">Near real-time webhook sync</div>
              </div>
              <div className="border-t border-white/15 pt-2.5">
                <div className="text-[10px] text-[#5B89FF] mb-1">FULFILLMENT DISPATCH</div>
                <div className="text-white font-medium text-xs">Multi-warehouse Routing</div>
                <div className="text-[10px] text-white/60 mt-1">Rule-based allocation engine</div>
              </div>
            </div>
            <div className="border-t border-white/20 pt-3 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="text-white/90">→ Data Reconciliation Suite: 99.98% consistency</span>
              <span className="text-[#5B89FF] font-semibold">Latency: &lt;1.2s</span>
            </div>
          </div>
        </div>
      );
    }

    if (proj.id === 'system-migration') {
      return (
        <div className="bg-[#0A0A0A]/85 backdrop-blur-md text-white p-6 rounded-2xs font-mono text-xs border border-white/20 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/15 text-[11px] text-white/70">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5B89FF]" />
              CUTOVER & RISK DEFENSE MATRIX
            </span>
            <span>ZERO-DOWNTIME VALIDATED</span>
          </div>
          <div className="divide-y divide-white/10">
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-white/90">1. Dual-Track Running (Legacy vs Internal)</span>
              <span className="text-[#5B89FF] font-semibold">100% Audited</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-white/90">2. Shopify App Alternative Bridge</span>
              <span className="text-[#5B89FF] font-semibold">Active Proxy</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-white/90">3. Canary Traffic Shift (US / EU / CA)</span>
              <span className="text-[#5B89FF] font-semibold">Completed</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-white/90">4. Auto Rollback Sentinel</span>
              <span className="text-white/70">0 Incident Triggers</span>
            </div>
          </div>
        </div>
      );
    }

    if (proj.id === 'brand-onboarding') {
      return (
        <div className="bg-[#0A0A0A]/85 backdrop-blur-md text-white p-6 rounded-2xs font-mono text-xs border border-white/20 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/15 text-[11px] text-white/70">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5B89FF]" />
              STANDARDIZED SOP SUITE // 12 MODULES
            </span>
            <span>BILINGUAL DEPLOYMENT</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 text-[11px]">
            <div className="text-white/90 border-b border-white/10 py-2">SOP-01: 资质合规预审清单</div>
            <div className="text-white/90 border-b border-white/10 py-2">SOP-02: 条码与外箱贴标规范</div>
            <div className="text-white/90 border-b border-white/10 py-2">SOP-03: 海运头程入仓指引</div>
            <div className="text-white/90 border-b border-white/10 py-2">SOP-04: 海外仓逆向理赔闭环</div>
          </div>
          <div className="mt-3 text-[10px] text-white/70 pt-2 border-t border-white/10">
            周期缩短 30% · 返工率下降 45% · 9 个跨部门可复用 SOP
          </div>
        </div>
      );
    }

    // JustPet
    return (
      <div className="bg-[#0A0A0A]/85 backdrop-blur-md text-white p-6 rounded-2xs font-mono text-xs border border-white/20 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/15 text-[11px] text-white/70">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5B89FF]" />
            JUSTPET // LOCAL-FIRST ARCHITECTURE
          </span>
          <span>VIBE CODING PROTOTYPE</span>
        </div>
        <div className="divide-y divide-white/10">
          <div className="flex items-center justify-between gap-3 py-2.5">
            <span className="text-white/90">Local-First IndexedDB Engine</span>
            <span className="text-[#5B89FF]">0ms Latency</span>
          </div>
          <div className="flex items-center justify-between gap-3 py-2.5">
            <span className="text-white/90">Voice & Audio Time Capsule</span>
            <span className="text-[#5B89FF]">Opus Encoded</span>
          </div>
          <div className="flex items-center justify-between gap-3 py-2.5">
            <span className="text-white/90">AI Milestone Timeline Generator</span>
            <span className="text-[#5B89FF]">Rapid Iteration</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="work-projects"
      ref={containerRef}
      className="relative py-20 sm:py-28 px-6 sm:px-10 lg:px-16 bg-[#002FA7] text-white overflow-hidden transition-colors"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between pb-6 border-b border-white/20 mb-12 sm:mb-16 text-xs font-mono tracking-widest uppercase">
          <div className="flex items-center gap-3">
            <span className="bg-white text-[#002FA7] font-bold px-2.5 py-1 rounded-md">
              SELECTED WORK & ARCHITECTURE
            </span>
            <span className="text-white/80">
              CROSS-BORDER SYSTEMS
            </span>
          </div>

          <div className="flex items-center gap-4 text-white/80">
            <span>ACTIVE 0{activeIndex + 1} / 0{projects.length}</span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span className="hidden sm:inline">2024-2026 ARCHITECTURE</span>
          </div>
        </div>

        {/* Section Headline & Top Right Subtext */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-baseline mb-12 sm:mb-16">
          <div className="lg:col-span-7">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              Selected work,
              <br />
              shaped as systems.
            </h2>
          </div>

          <div className="lg:col-span-5 text-sm sm:text-base text-white/90 leading-relaxed">
            Cross-border fulfillment, architecture and workflows: resolved as one connected surface.
            <br />
            <span className="text-xs font-mono text-white/70 block mt-2">
              2024-2026 · CROSS-BORDER SYSTEM ARCHITECTURE · FULFILLMENT · VIBE CODING
            </span>
          </div>
        </div>

        {/* Specia1ne Project Catalogue List (00:05 - 00:10 in video) */}
        <div className="border-t border-white/25">
          {projects.map((proj, idx) => {
            const isSelected = proj.id === activeProjectId;
            const isExpanded = proj.id === expandedDetailsId;

            return (
              <div
                key={proj.id}
                className={`project-row border-b border-white/20 transition-colors duration-300 ${
                  isSelected ? 'bg-black/15' : 'hover:bg-black/10 opacity-75 hover:opacity-100'
                }`}
              >
                {/* Project Row Header */}
                <div
                  onClick={() => toggleExpand(proj.id)}
                  className="py-7 sm:py-9 px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center cursor-pointer select-none group"
                >
                  {/* Left: Index & Tag */}
                  <div className="md:col-span-1 flex items-center gap-2 font-mono text-xs sm:text-sm font-semibold text-white">
                    <span>0{idx + 1}</span>
                    <span className="text-white/40">/</span>
                  </div>

                  {/* Middle: Title & Subhead */}
                  <div className="md:col-span-7">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-white group-hover:translate-x-1.5 transition-transform">
                        {proj.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white text-[#002FA7]">
                        0{idx + 1}
                      </span>
                      <span className="text-xs font-mono text-white/70 uppercase tracking-wider">
                        {proj.category.split('·')[0]}
                      </span>
                    </div>

                    <p className="text-sm text-white/80 mt-2 font-sans flex items-center gap-2">
                      <span>{proj.subtitle}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors" />
                    </p>
                  </div>

                  {/* Right: State / Toggle Indicator */}
                  <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-6 text-xs font-mono text-white/80">
                    <span className="hidden lg:inline-block tracking-wider uppercase text-white/60">
                      {proj.period}
                    </span>
                    <button
                      type="button"
                      className="px-3 py-1 rounded-2xs border border-white/30 hover:border-white text-xs font-mono tracking-wider uppercase flex items-center gap-1.5 transition-colors focus:outline-none"
                    >
                      <span>{isExpanded ? 'CLOSE SYSTEM' : 'INSPECT SYSTEM'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Deep-Dive 5 Pillars Panel */}
                {isExpanded && (
                  <div className="px-4 sm:px-8 pb-12 pt-6 border-t border-white/20 bg-black/25">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left: 5 Pillars Breakdown (7 Cols) */}
                      <div className="lg:col-span-7 space-y-6">
                        {/* 1. Context */}
                        <div className="pl-4 border-l border-white/15">
                          <div className="text-xs font-mono tracking-widest text-white/70 uppercase mb-1.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            1. CONTEXT // 当时的问题与背景
                          </div>
                          <p className="text-sm text-white/90 leading-relaxed font-sans">
                            {proj.context}
                          </p>
                          <p className="text-sm text-white/80 mt-2 leading-relaxed">
                            <span className="font-semibold text-white">核心痛点：</span>{proj.problem}
                          </p>
                        </div>

                        {/* 2. Role */}
                        <div className="pl-4 border-l border-white/15">
                          <div className="text-xs font-mono tracking-widest text-white/70 uppercase mb-1.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            2. ROLE // 我的角色与职责
                          </div>
                          <p className="text-sm text-white/90 leading-relaxed">
                            {proj.myRole}
                          </p>
                        </div>

                        {/* 3. Action */}
                        <div className="pl-4 border-l border-white/15">
                          <div className="text-xs font-mono tracking-widest text-white/70 uppercase mb-1.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            3. ACTION // 关键推进动作
                          </div>
                          <ul className="space-y-2 text-sm text-white/90 leading-relaxed">
                            {proj.whatIDid.map((act, aIdx) => (
                              <li key={aIdx} className="flex items-start gap-2">
                                <span className="text-white/60 font-mono text-xs mt-1">↳</span>
                                <span>{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 4. System */}
                        {proj.system && (
                          <div className="pl-4 border-l border-[#5B89FF]/40">
                            <div className="text-xs font-mono tracking-widest text-white/90 uppercase mb-1.5 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#5B89FF]" />
                              4. SYSTEM // 沉淀的系统、工具与 SOP
                            </div>
                            <p className="text-sm text-white leading-relaxed">
                              {proj.system}
                            </p>
                          </div>
                        )}

                        {/* 5. Outcome */}
                        <div className="pl-4 border-l-2 border-[#5B89FF]">
                          <div className="text-xs font-mono tracking-widest text-[#5B89FF] uppercase mb-1.5 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#5B89FF]" />
                            5. OUTCOME // 商业与交付成果
                          </div>
                          <p className="text-sm text-white font-medium leading-relaxed">
                            {proj.result}
                          </p>
                          {proj.metrics && proj.metrics.length > 0 && (
                            <div className="mt-5 flex flex-wrap gap-x-10 gap-y-5">
                              {proj.metrics.map((metric) => (
                                <div key={metric.label} className="min-w-[8.5rem] border-t border-[#5B89FF]/40 pt-2.5">
                                  <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white tabular-nums">
                                    {metric.value}
                                  </div>
                                  <div className="mt-1 text-[10px] font-mono tracking-widest text-[#5B89FF] uppercase">
                                    {metric.label}
                                  </div>
                                  {metric.note && (
                                    <div className="mt-1 text-[11px] leading-snug text-white/70">
                                      {metric.note}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Reflection */}
                        <div className="pt-3 text-xs text-white/70 italic border-t border-white/15">
                          <span className="font-semibold not-italic text-white">PM 复盘心得：</span>“{proj.whatILearned}”
                        </div>
                      </div>

                      {/* Right: Architecture Schematic Preview (5 Cols) */}
                      <div className="lg:col-span-5 sticky top-24">
                        <div className="text-xs font-mono tracking-widest text-white/70 uppercase mb-2 flex items-center justify-between">
                          <span>SYSTEM SCHEMATIC</span>
                          <span>{proj.tags.slice(0, 2).join(' · ')}</span>
                        </div>
                        {renderProjectPreview(proj)}

                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {proj.tags.map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-mono text-white/90 bg-white/10 border border-white/15 px-2 py-0.5 rounded-2xs"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
