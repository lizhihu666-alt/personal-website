import React, { useEffect, useState, useRef } from 'react';
import { AppMode } from '../../types';

interface NavItem {
  id: string;
  label: string;
}

const WORK_SECTIONS: NavItem[] = [
  { id: 'work-hero', label: '00 / HERO' },
  { id: 'work-signal', label: '01 / SIGNAL' },
  { id: 'work-impact', label: '02 / IMPACT' },
  { id: 'work-method', label: '03 / METHOD' },
  { id: 'work-projects', label: '04 / WORK' },
  { id: 'work-experience', label: '05 / EXP' },
  { id: 'work-about', label: '06 / ABOUT' },
  { id: 'work-contact', label: '07 / CONTACT' },
];

const LIFE_SECTIONS: NavItem[] = [
  { id: 'life-hero', label: 'About' },
  { id: 'life-values', label: 'Values' },
  { id: 'life-photography', label: 'Photography' },
  { id: 'life-badminton', label: 'Badminton' },
  { id: 'life-travel', label: 'Travel' },
  { id: 'life-tinkering', label: 'Now' },
];

interface ReadingProgressNavProps {
  currentMode: AppMode;
}

export const ReadingProgressNav: React.FC<ReadingProgressNavProps> = ({ currentMode }) => {
  const [activeId, setActiveId] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const sections = currentMode === 'work' ? WORK_SECTIONS : currentMode === 'life' ? LIFE_SECTIONS : [];

  useEffect(() => {
    if (currentMode === 'home') return;

    const currentSections = currentMode === 'work' ? WORK_SECTIONS : LIFE_SECTIONS;
    if (currentSections.length === 0) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
          if (totalScroll > 0) {
            setProgress(Math.min(1, Math.max(0, scrollY / totalScroll)));
          }

          // Active section detection by viewport midpoint
          const midY = scrollY + window.innerHeight * 0.45;
          for (let i = currentSections.length - 1; i >= 0; i--) {
            const el = document.getElementById(currentSections[i].id);
            if (el && el.offsetTop <= midY) {
              setActiveId(currentSections[i].id);
              break;
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentMode]);

  if (currentMode === 'home' || sections.length === 0) {
    return null;
  }

  // 进度条与当前章节节点：深色底上的细线，用提亮版克莱因蓝才看得见
  const activeColor = '#5B89FF';

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Mobile Top Subtle Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none lg:hidden bg-transparent">
        <div
          className="h-full transition-all duration-150"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: activeColor,
          }}
        />
      </div>

      {/* Desktop Vertical Minimalist Navigation on Right Edge */}
      <aside
        aria-label="Chapter Reading Progress"
        className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center py-4 select-none"
      >
        {/* Background Track Line */}
        <div className="relative w-[2px] h-48 bg-[#232A33] rounded-full flex flex-col justify-between py-1">
          {/* Animated Active Progress Fill Line */}
          <div
            className="absolute top-0 left-0 w-full rounded-full transition-all duration-100 ease-out"
            style={{
              height: `${progress * 100}%`,
              backgroundColor: activeColor,
            }}
          />

          {/* Chapter Tick Nodes */}
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
                  aria-label={`Scroll to ${sec.label}`}
                  className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B89FF] rounded-full transition-transform"
                >
                  <span
                    className={`block rounded-full transition-all duration-200 ${
                      isActive
                        ? 'w-2.5 h-2.5 shadow-xs'
                        : 'w-1.5 h-1.5 opacity-40 group-hover:opacity-80 group-hover:scale-125'
                    }`}
                    style={{
                      backgroundColor: isActive ? activeColor : '#A1A1AA',
                    }}
                  />
                </button>

                {/* Chapter Label Tooltip on Hover / Active */}
                <div
                  className={`absolute right-6 px-2.5 py-1 rounded-2xs text-[11px] font-mono whitespace-nowrap pointer-events-none transition-all duration-150 shadow-2xs border ${
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
