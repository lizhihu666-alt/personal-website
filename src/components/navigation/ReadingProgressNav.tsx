import React, { useEffect, useState } from 'react';
import { AppMode } from '../../types';
import { ScrollTrigger } from '../../utils/gsapSetup';
import { METHOD_TEXT_REVEAL_END } from '../work/methodTraceTiming';

interface NavItem {
  id: string;
  label: string;
}

const WORK_SECTIONS: NavItem[] = [
  { id: 'work-hero', label: '开场' },
  { id: 'work-impact', label: '成果' },
  { id: 'work-projects', label: '项目' },
  { id: 'work-experience', label: '经历' },
  { id: 'work-method-trace', label: '方法' },
  { id: 'work-about', label: '关于' },
  { id: 'work-contact', label: '联系' },
];

// 生活页目前是单屏「施工中」占位页，没有分节，不显示右侧阅读进度。
const LIFE_SECTIONS: NavItem[] = [];

const SECTIONS_BY_MODE: Record<AppMode, NavItem[]> = {
  home: [],
  work: WORK_SECTIONS,
  life: LIFE_SECTIONS,
};

// 每个圆点「填满」的滚动位置（px）。多数章节就是章节顶边；有钉住动画的章节要按动画进度算：
// - 成果：它从下方升起、完全盖住开场的那一刻（章节顶边到达视口顶）
// - 方法：「汇成一套可运行的中台」整句显现完（TEXT_REVEAL_END）之后
// - 项目：项目页钉住、案例刚开始横移的那一刻（钉住的起点）
const getMilestone = (id: string): number => {
  const el = document.getElementById(id);
  const fallback = el?.offsetTop ?? 0;
  const findTrigger = (target: Element | null) =>
    target ? ScrollTrigger.getAll().find((st) => st.trigger === target) : undefined;

  if (id === 'work-method-trace') {
    const st = findTrigger(el?.querySelector('.method-trace-sticky') ?? null);
    return st ? st.start + (st.end - st.start) * METHOD_TEXT_REVEAL_END : fallback;
  }
  if (id === 'work-projects') {
    const st = findTrigger(el?.querySelector('.project-rail') ?? null);
    return st ? st.start : fallback;
  }
  return fallback;
};

// 轨道高 192px、上下内边距 4px，每个圆点容器固定 24px：第 i 个圆点中心在轨道的这个比例处。
const TRACK_PX = 192;
const dotFraction = (index: number, count: number) =>
  count <= 1 ? 0 : (16 + (index * 160) / (count - 1)) / TRACK_PX;

interface ReadingProgressNavProps {
  currentMode: AppMode;
}

export const ReadingProgressNav: React.FC<ReadingProgressNavProps> = ({ currentMode }) => {
  const [activeId, setActiveId] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [fill, setFill] = useState<number>(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const sections = SECTIONS_BY_MODE[currentMode];
  // 深色底上的细线，用提亮版主色调才看得见——职业绿、生活蓝。
  const ACTIVE_COLOR = currentMode === 'life' ? '#4F8CFF' : '#34D378';

  useEffect(() => {
    if (sections.length === 0) return;

    let ticking = false;
    // 每个圆点对应的滚动位置只在布局变化时量一次（resize / ScrollTrigger refresh / 兜底定时器），
    // 滚动过程中直接用缓存值，不再每一帧遍历 ScrollTrigger。
    let tops: number[] = [];
    let totalScroll = 0;

    const measure = () => {
      totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      let prevTop = 0;
      tops = sections.map((sec) => {
        prevTop = Math.max(prevTop, Math.min(getMilestone(sec.id), Math.max(0, totalScroll)));
        return prevTop;
      });
      // 各章节 offsetTop 同样缓存，用于判断当前所在章节
      sectionTops = sections.map((sec) => document.getElementById(sec.id)?.offsetTop);
    };
    let sectionTops: Array<number | undefined> = [];

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (tops.length !== sections.length) measure();
        if (totalScroll > 0) {
          setProgress(Math.min(1, Math.max(0, scrollY / totalScroll)));
        }

        // Active section detection by viewport midpoint：从最后一节往前找，
        // 第一个 offsetTop 落在 midY 之前的就是当前所在的节。
        const midY = scrollY + window.innerHeight * 0.45;

        // 绿线按「圆点」分段推进：到第 i 节的起点时，正好停在第 i 个圆点上，
        // 两节之间按滚动比例在相邻圆点间插值。
        // 以视口顶边为基准：页面顶边滚到某一节的起点，这一节的圆点就刚好被填满；
        // 页面底部的几节可能永远滚不到起点，所以起点按最大滚动距离封顶。
        let fillFrac = dotFraction(0, sections.length);
        for (let i = 0; i < sections.length; i += 1) {
          if (scrollY < tops[i]) break;
          const from = dotFraction(i, sections.length);
          if (i === sections.length - 1) {
            fillFrac = from;
          } else {
            const span = Math.max(1, tops[i + 1] - tops[i]);
            const t = Math.min(1, (scrollY - tops[i]) / span);
            fillFrac = from + (dotFraction(i + 1, sections.length) - from) * t;
          }
        }
        setFill(fillFrac);
        const active = [...sections].reverse().find((sec) => {
          const top = sectionTops[sections.indexOf(sec)];
          return top !== undefined && top <= midY;
        });
        if (active) setActiveId(active.id);

        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const remeasure = () => {
      measure();
      handleScroll();
    };
    window.addEventListener('resize', remeasure);
    // 页面首次挂载时各个钉住区块的高度还没撑开，量到的滚动总长是错的，
    // 又没有滚动事件来重算，进度线会一直停在「全满」。等 ScrollTrigger
    // 把布局都算定（refresh）之后，以及稍后兜底，再重算一次。
    ScrollTrigger.addEventListener('refresh', remeasure);
    const timers = [300, 1000, 2500].map((ms) => window.setTimeout(remeasure, ms));
    measure();
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', remeasure);
      ScrollTrigger.removeEventListener('refresh', remeasure);
      timers.forEach((id) => window.clearTimeout(id));
    };
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
            style={{ height: `${fill * 100}%`, backgroundColor: ACTIVE_COLOR }}
          />

          {/* Chapter Tick Nodes：均匀摆开，不按各节实际滚动距离加权 */}
          {sections.map((sec, index) => {
            const isHovered = hoveredId === sec.id;
            // 绿线推进到这个圆点时，圆点变绿；已到达的最后一个圆点略大
            const isReached = fill >= dotFraction(index, sections.length) - 0.002;
            const isActive =
              isReached && !(index < sections.length - 1 && fill >= dotFraction(index + 1, sections.length) - 0.002);

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
                  className={`flex h-6 w-6 items-center justify-center focus:outline-none focus-visible:ring-2 rounded-full transition-transform ${
                    currentMode === 'life' ? 'focus-visible:ring-[#4F8CFF]' : 'focus-visible:ring-[#34D378]'
                  }`}
                >
                  <span
                    className={`block rounded-full transition-all duration-200 ${
                      isActive
                        ? 'w-2.5 h-2.5 shadow-xs'
                        : isReached
                          ? 'w-1.5 h-1.5'
                          : 'w-1.5 h-1.5 opacity-40 group-hover:opacity-80 group-hover:scale-125'
                    }`}
                    style={{ backgroundColor: isReached ? ACTIVE_COLOR : '#A1A1AA' }}
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
