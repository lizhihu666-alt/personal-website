import React, { useEffect, useState } from 'react';
import { AppMode } from '../../types';

interface NavItem {
  id: string;
  label: string;
}

const WORK_SECTIONS: NavItem[] = [
  { id: 'work-hero', label: '开场' },
  { id: 'work-impact', label: '成果' },
  { id: 'work-method-trace', label: '方法' },
  { id: 'work-projects', label: '项目' },
  { id: 'work-experience', label: '经历' },
  { id: 'work-about', label: '关于' },
  { id: 'work-contact', label: '联系' },
];

const LIFE_SECTIONS: NavItem[] = [
  { id: 'life-hero', label: '关于' },
  { id: 'life-values', label: '价值' },
  { id: 'life-photography', label: '摄影' },
  { id: 'life-badminton', label: '运动' },
  { id: 'life-travel', label: '旅行' },
  { id: 'life-tinkering', label: '近况' },
];

const SECTIONS_BY_MODE: Record<AppMode, NavItem[]> = {
  home: [],
  work: WORK_SECTIONS,
  life: LIFE_SECTIONS,
};

// 深色底上的细线，用提亮版绿色才看得见
const ACTIVE_COLOR = '#34D378';

interface ReadingProgressNavProps {
  currentMode: AppMode;
}

export const ReadingProgressNav: React.FC<ReadingProgressNavProps> = ({ currentMode }) => {
  const [activeId, setActiveId] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const sections = SECTIONS_BY_MODE[currentMode];

  useEffect(() => {
    if (sections.length === 0) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (totalScroll > 0) {
          setProgress(Math.min(1, Math.max(0, scrollY / totalScroll)));
        }

        // Active section detection by viewport midpoint：从最后一节往前找，
        // 第一个 offsetTop 落在 midY 之前的就是当前所在的节。
        const midY = scrollY + window.innerHeight * 0.45;
        const active = [...sections].reverse().find((sec) => {
          const top = document.getElementById(sec.id)?.offsetTop;
          return top !== undefined && top <= midY;
        });
        if (active) setActiveId(active.id);

        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  if (sections.length === 0) return null;

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Mobile Top Subtle Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none lg:hidden bg-transparent">
        <div
          className="h-full transition-all duration-150"
          style={{ width: `${progress * 100}%`, backgroundColor: ACTIVE_COLOR }}
        />
      </div>

      {/* Desktop Vertical Minimalist Navigation on Right Edge */}
      <aside
        aria-label="章节阅读进度"
        className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center py-4 select-none"
      >
        {/* Background Track Line */}
        <div className="relative w-[2px] h-48 bg-[#232A33] rounded-full flex flex-col justify-between py-1">
          {/* Animated Active Progress Fill Line：滚动事件本身已经用 rAF
              节流过一次，高度上不再叠 CSS transition/ease-out——那样相当
              于追着一个持续在动的目标做二次缓动，连续滚动时看起来忽快
              忽慢、不跟手。直接让填充高度严格跟 scrollY 同步。 */}
          <div
            className="absolute top-0 left-0 w-full rounded-full"
            style={{ height: `${progress * 100}%`, backgroundColor: ACTIVE_COLOR }}
          />

          {/* Chapter Tick Nodes：均匀摆开，不按各节实际滚动距离加权 */}
          {sections.map((sec, index) => {
            const isActive = activeId === sec.id || (!activeId && index === 0);
            const isHovered = hoveredId === sec.id;

            return (
              <div
                key={sec.id}
                className="relative flex items-center justify-center -mx-2 group"
                onMouseEnter={() => setHoveredId(sec.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <button
                  onClick={() => scrollToSection(sec.id)}
                  aria-label={`跳转到${sec.label}`}
                  className="p-[9px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#34D378] rounded-full transition-transform"
                >
                  <span
                    className={`block rounded-full transition-all duration-200 ${
                      isActive
                        ? 'w-2.5 h-2.5 shadow-xs'
                        : 'w-1.5 h-1.5 opacity-40 group-hover:opacity-80 group-hover:scale-125'
                    }`}
                    style={{ backgroundColor: isActive ? ACTIVE_COLOR : '#A1A1AA' }}
                  />
                </button>

                {/* Chapter Label Tooltip on Hover / Active */}
                <div
                  className={`absolute right-6 px-2.5 py-1 rounded-lg text-sm whitespace-nowrap pointer-events-none transition-all duration-150 shadow-2xs border ${
                    isHovered
                      ? 'opacity-100 translate-x-0 bg-[#111418] border-[#232A33] text-[#F3F5F8]'
                      : 'opacity-0 translate-x-2'
                  }`}
                >
                  {sec.label}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};
