import React, { useState } from 'react';
import { LeoCharacter } from '../character/LeoCharacter';
import { ArrowLeft, ArrowRight, Briefcase, Sparkles, Clock, Compass } from 'lucide-react';

interface HomeHeroProps {
  onChooseMode: (mode: 'work' | 'life') => void;
  isTransitioning?: boolean;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onChooseMode,
  isTransitioning = false,
}) => {
  const [hoveredDirection, setHoveredDirection] = useState<'none' | 'left' | 'right'>('none');

  // Character action based on hover state
  const characterAction =
    hoveredDirection === 'left' ? 'look-left' :
    hoveredDirection === 'right' ? 'look-right' : 'idle';

  return (
    <main className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-[#0A0B0D] transition-colors duration-500">
      {/* Background subtle atmospheric ambient tints based on hover */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          hoveredDirection === 'left' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(ellipse 60% 70% at 20% 50%, rgba(77, 127, 255, 0.06), transparent 70%)',
        }}
      />
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          hoveredDirection === 'right' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(ellipse 60% 70% at 80% 50%, rgba(77, 127, 255, 0.07), transparent 70%)',
        }}
      />

      {/* Top Meta Bar */}
      <div className="w-full max-w-6xl mx-auto px-6 pt-8 flex items-center justify-between text-xs tracking-wider text-[#A8B0BC] uppercase font-mono">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4A5361]" />
          <span className="font-medium text-[#F3F5F8]">PORTFOLIO & LIFE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#5B89FF]" />
          <span className="text-[#A8B0BC]">Based in Shenzhen · Open to opportunities</span>
        </div>
      </div>

      {/* Central Interactive Composition */}
      <div className="w-full max-w-5xl mx-auto px-6 py-6 flex-1 flex flex-col items-center justify-center relative">
        
        {/* Editorial Headline Group */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#98A1AF] font-mono mb-3">
            HELLO, I’M LEO
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F3F5F8] leading-tight mb-4 font-sans">
            今天，你想认识哪一个我？
          </h1>
          <p className="text-sm sm:text-base text-[#A8B0BC] leading-relaxed max-w-xl mx-auto font-light">
            一个把复杂项目理顺的人，也是一个认真生活、喜欢不断折腾新东西的人。
          </p>
        </div>

        {/* The Dual Interaction Hub: Left Work Door | Center Leo | Right Life Door */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 items-center gap-8 md:gap-4 my-2 relative">
          
          {/* ================= LEFT: WORK ENTRANCE ================= */}
          <div className="md:col-span-4 order-2 md:order-1 flex justify-center md:justify-end">
            <button
              id="home-work-door-btn"
              disabled={isTransitioning}
              onClick={() => onChooseMode('work')}
              onMouseEnter={() => setHoveredDirection('left')}
              onMouseLeave={() => setHoveredDirection('none')}
              onFocus={() => setHoveredDirection('left')}
              onBlur={() => setHoveredDirection('none')}
              className={`group w-full max-w-xs text-left p-5 sm:p-6 rounded-xl transition-all duration-300 relative border ${
                hoveredDirection === 'left'
                  ? 'bg-[#151A21] border-[#2B323C] shadow-sm translate-x-[-4px]'
                  : 'bg-transparent border-transparent hover:border-[#232A33]'
              }`}
            >
              {/* Badge & Time tag */}
              <div className="flex items-center justify-between text-xs text-[#A8B0BC] mb-3">
                <span className="font-mono tracking-wider flex items-center gap-1 text-[#5B89FF] font-medium">
                  <Briefcase className="w-3.5 h-3.5 text-[#5B89FF]" />
                  LEO AT WORK
                </span>
                <span className="flex items-center gap-1 font-mono text-[11px] text-[#98A1AF]">
                  <Clock className="w-3 h-3" />
                  09:30 - 18:30
                </span>
              </div>

              {/* Main Text */}
              <div className="flex items-baseline gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#F3F5F8] group-hover:text-[#5B89FF] transition-colors">
                  上班的我
                </h2>
                <ArrowLeft className="w-4 h-4 text-[#5B89FF] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </div>

              <p className="text-xs sm:text-sm text-[#A8B0BC] mt-1.5 font-light">
                项目经历 · 作品集 · 简历
              </p>

              {/* Editorial preview bullet */}
              <div className="mt-4 pt-3 border-t border-[#232A33]/80 text-[12px] text-[#A8B0BC] flex items-center justify-between">
                <span>跨境中台 · 流程设计 · Vibe Coding</span>
                <span className="text-[#5B89FF] font-medium text-xs">进入职业页 →</span>
              </div>
            </button>
          </div>

          {/* ================= CENTER: LITTLE LEO ================= */}
          <div className="md:col-span-4 order-1 md:order-2 flex flex-col items-center justify-center relative py-4">
            
            {/* Soft Focus Grounding Ring */}
            <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-dashed border-[#232A33]/60 absolute pointer-events-none -z-0" />
            
            {/* The Character (25% - 35% height footprint) */}
            <div className="w-40 h-52 sm:w-48 sm:h-64 relative z-10 flex items-center justify-center">
              <LeoCharacter
                action={characterAction}
                facing={hoveredDirection === 'left' ? 'left' : hoveredDirection === 'right' ? 'right' : 'front'}
                className="w-full h-full"
              />
            </div>

            {/* Hint badge under character */}
            <div className="mt-2 text-center text-xs text-[#98A1AF] font-mono tracking-tight flex items-center gap-1.5">
              <span>← 选择左侧</span>
              <span className="w-1 h-1 rounded-full bg-[#4A5361]" />
              <span>选择右侧 →</span>
            </div>
          </div>

          {/* ================= RIGHT: LIFE ENTRANCE ================= */}
          <div className="md:col-span-4 order-3 md:order-3 flex justify-center md:justify-start">
            <button
              id="home-life-door-btn"
              disabled={isTransitioning}
              onClick={() => onChooseMode('life')}
              onMouseEnter={() => setHoveredDirection('right')}
              onMouseLeave={() => setHoveredDirection('none')}
              onFocus={() => setHoveredDirection('right')}
              onBlur={() => setHoveredDirection('none')}
              className={`group w-full max-w-xs text-left p-5 sm:p-6 rounded-xl transition-all duration-300 relative border ${
                hoveredDirection === 'right'
                  ? 'bg-[#151A21] border-[#232A33] shadow-sm translate-x-[4px]'
                  : 'bg-transparent border-transparent hover:border-[#232A33]'
              }`}
            >
              {/* Badge & Time tag */}
              <div className="flex items-center justify-between text-xs text-[#A8B0BC] mb-3">
                <span className="font-mono tracking-wider flex items-center gap-1 text-[#5B89FF] font-medium">
                  <Compass className="w-3.5 h-3.5 text-[#5B89FF]" />
                  LEO OFF DUTY
                </span>
                <span className="flex items-center gap-1 font-mono text-[11px] text-[#98A1AF]">
                  <Clock className="w-3 h-3" />
                  19:00 - 23:30
                </span>
              </div>

              {/* Main Text */}
              <div className="flex items-baseline gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#F3F5F8] group-hover:text-[#5B89FF] transition-colors">
                  下班的我
                </h2>
                <ArrowRight className="w-4 h-4 text-[#5B89FF] opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </div>

              <p className="text-xs sm:text-sm text-[#A8B0BC] mt-1.5 font-light">
                兴趣爱好 · 摄影 · 旅行与生活
              </p>

              {/* Editorial preview bullet */}
              <div className="mt-4 pt-3 border-t border-[#232A33]/80 text-[12px] text-[#A8B0BC] flex items-center justify-between">
                <span>宠物肖像 · 羽毛球 · 个人手账</span>
                <span className="text-[#5B89FF] font-medium text-xs">进入生活页 →</span>
              </div>
            </button>
          </div>

        </div>

        {/* Bottom subtle quote / footnote */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#98A1AF] font-editorial italic">
            “工作是打磨认知的方式，生活是安放灵魂的地方。”
          </p>
        </div>

      </div>

      {/* Bottom Quiet Luxury Footer */}
      <div className="w-full max-w-6xl mx-auto px-6 pb-6 pt-4 border-t border-[#232A33]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-[#98A1AF] gap-2">
        <span>© {new Date().getFullYear()} Leo Hu. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <span>Not a template. Designed with intention.</span>
          <span className="w-1 h-1 rounded-full bg-[#2E3742]" />
          <span>Vibe Coding in Action</span>
        </div>
      </div>
    </main>
  );
};
