import React, { useState, useEffect } from 'react';
import { ArrowDown, FileText, Mail, ArrowUpRight } from 'lucide-react';
import { LeoCharacter } from '../character/LeoCharacter';

interface WorkHeroProps {
  onOpenResume?: () => void;
}

export const WorkHero: React.FC<WorkHeroProps> = ({ onOpenResume }) => {
  const [cstTime, setCstTime] = useState('');

  // Real-time Shenzhen CST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Shanghai',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setCstTime(new Intl.DateTimeFormat('en-GB', options).format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
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
      className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between pt-10 pb-12 px-6 sm:px-10 lg:px-16 border-b border-[#232A33] bg-[#0A0B0D] text-[#F3F5F8]"
    >
      {/* Top Metadata Bar */}
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#232A33]">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#002FA7]/10 text-[#5B89FF] text-xs font-mono font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B89FF]" />
              SYSTEM & PRODUCT ARCHITECTURE
            </span>
            <span className="text-xs font-mono text-[#A8B0BC] hidden sm:inline">
              LEO HU · 2026 WORK PORTFOLIO
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-[#A8B0BC]">
            <span className="hidden md:inline">SHENZHEN, CHINA · CST (UTC+8)</span>
            <span className="text-[#A8B0BC] hidden md:inline">/</span>
            <button
              id="hero-top-contact-btn"
              onClick={() => scrollToSection('work-contact')}
              className="text-[#5B89FF] hover:text-[#5B89FF] font-medium transition-colors flex items-center gap-1 focus:outline-none"
            >
              <span>联系交流</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Hero Content: Clean, Asymmetrical 2-Column Grid */}
      <div className="max-w-7xl mx-auto w-full my-auto py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Clear, High-Contrast Typography & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">

            {/* 手机端身份条：让第一屏先出现「人」，再进入系统术语 */}
            <div className="lg:hidden flex items-center gap-4">
              <div className="shrink-0 w-20 h-20 rounded-xl bg-[#0A0B0D] border border-[#232A33] flex items-center justify-center overflow-hidden">
                <LeoCharacter action="sit-desk" className="w-16 h-16" />
              </div>
              <div className="min-w-0">
                <div className="text-base font-semibold text-[#F3F5F8] leading-tight">
                  Leo Hu · 胡子
                </div>
                <div className="text-xs font-mono text-[#A8B0BC] mt-1 leading-relaxed">
                  资深出海产品经理 · 深圳
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono tracking-widest text-[#5B89FF] uppercase font-semibold">
                Cross-Border PM & System Builder
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F3F5F8] leading-[1.12]">
                以系统化思维
                <br />
                做跨境中台
                <br className="sm:hidden" />
                与业务架构
              </h1>
              <p className="text-lg sm:text-xl text-[#C3CAD5] font-normal leading-snug">
                Connecting business logic to <span className="text-[#5B89FF] font-semibold italic">working systems</span>.
              </p>
            </div>

            <p className="text-sm sm:text-base text-[#A8B0BC] leading-relaxed max-w-2xl">
              深耕跨境出海领域，将错综复杂的业务诉求拆解为标准化 SOP、容错接口与高可用履约中台。践行敏捷全栈 Vibe Coding，以天为单位交付高保真原型，消除部门协同摩擦，驱动商业落地。
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-primary-contact-btn"
                onClick={() => scrollToSection('work-contact')}
                className="px-5 py-3 rounded-lg bg-[#002FA7] hover:bg-[#002585] text-white text-xs font-mono font-medium tracking-wider uppercase transition-colors flex items-center gap-2 shadow-xs focus:outline-none"
              >
                <Mail className="w-4 h-4" />
                <span>发起交流 · Contact</span>
              </button>

              {onOpenResume && (
                <button
                  id="hero-open-resume-btn"
                  onClick={onOpenResume}
                  className="px-5 py-3 rounded-lg bg-[#111418] hover:bg-[#0A0B0D] text-[#F3F5F8] border border-[#2B323C] hover:border-[#3A424E] text-xs font-mono font-medium tracking-wider uppercase transition-colors flex items-center gap-2 shadow-xs focus:outline-none"
                >
                  <FileText className="w-4 h-4 text-[#5B89FF]" />
                  <span>查看履历 · Resume Sheet</span>
                </button>
              )}

              <button
                id="hero-view-method-btn"
                onClick={() => scrollToSection('work-method')}
                className="px-4 py-3 text-xs font-mono text-[#A8B0BC] hover:text-[#F3F5F8] tracking-wider uppercase transition-colors flex items-center gap-1.5 focus:outline-none"
              >
                <span>工作方法论</span>
                <ArrowDown className="w-3.5 h-3.5 text-[#5B89FF]" />
              </button>
            </div>
          </div>

          {/* Right Column: Architectural Profile Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#111418] border border-[#232A33] rounded-xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
              
              {/* Card Header with Live Status */}
              <div className="flex items-center justify-between border-b border-[#232A33] pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#5B89FF]" />
                  <span className="text-xs font-mono text-[#F3F5F8] font-semibold">LEO @ DESK</span>
                </div>
                <div className="text-xs font-mono text-[#5B89FF] font-semibold bg-[#002FA7]/10 px-2 py-0.5 rounded">
                  {cstTime || '18:00:00 CST'}
                </div>
              </div>

              {/* Central Visual: Leo Character at Desk */}
              <div className="hidden lg:flex flex-col items-center justify-center py-4 bg-[#0A0B0D] rounded-lg border border-[#232A33]">
                <LeoCharacter action="sit-desk" className="w-36 h-36" />
                <div className="text-center mt-2">
                  <div className="text-sm font-semibold text-[#F3F5F8]">Leo Hu · 胡子</div>
                  <div className="text-xs font-mono text-[#A8B0BC] mt-0.5">
                    威斯康星麦迪逊 MSBA · 资深出海产品经理
                  </div>
                </div>
              </div>

              {/* Key Domains Pills */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-[#A8B0BC] uppercase tracking-wider">
                  Core Practice Focus
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    '跨境中台架构',
                    '标准化 SOP 流程',
                    '数据对账规范',
                    '全栈原型交付',
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-[#0A0B0D] border border-[#232A33] text-xs font-mono text-[#C3CAD5]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verification Footer */}
              <div className="pt-3 border-t border-[#232A33] flex items-center justify-between text-xs font-mono text-[#A8B0BC]">
                <span>SHENZHEN / REMOTE</span>
                <span className="text-[#F3F5F8] font-medium">BILINGUAL (EN/ZH)</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Status Strip */}
      <div className="max-w-7xl mx-auto w-full pt-6 border-t border-[#232A33]">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#A8B0BC]">
          <div className="flex items-center gap-2">
            <span className="text-[#F3F5F8] font-semibold">LEO HU</span>
            <span>/</span>
            <span>CROSS-BORDER E-COMMERCE & DIGITAL SUPPLY CHAIN</span>
          </div>

          <button
            id="hero-scroll-cue-bottom"
            onClick={() => scrollToSection('work-signal')}
            className="flex items-center gap-2 text-[#5B89FF] hover:text-[#5B89FF] transition-colors focus:outline-none"
          >
            <span>向下浏览核心能力</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
