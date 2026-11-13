import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { ImpossibleSwitch } from './ImpossibleSwitch/ImpossibleSwitch';
import { LifePetPhotography } from './LifePetPhotography';
import { LifeTiandian } from './LifeTiandian';
import { LifeTravel } from './LifeTravel';
import { LifeChapterLabel } from './LifeChapterLabel';
import { LIFE_ACCENT } from '../../utils/lifePalette';
import { TIANDIAN, TRAVEL } from '../../data/portfolioData';
import './LifeComingSoon.css';

interface LifeComingSoonProps {
  onSwitchToWork?: () => void;
}

// 进度条旁边轮换的"施工日志"
const STATUS_LINES = [
  '正在把灵感从口袋里掏出来…',
  '宠物和摄影模块：已经开门了，往下滑',
  '运动模块：去热身了，马上回来',
  '旅行模块：地图画好了，照片还在路上',
  'BGM 选了三天，还没选好',
  '版面已经改了七版，还差最后一版',
];

// 小熊的台词：开关每被拨回去一次，就换下一句（循环）
const BEAR_MESSAGES = [
  '不行，这页还在装修，Leo 说了不让开',
  '别按了，真的还没好',
  '再按他就要加班了',
  '好吧……其实我也想看它上线',
];

// 首屏底部的栏目目录：编号和菜单抽屉、各栏目标题上方的编号是同一套。
const CHAPTERS: Array<{ index: string; name: string; note: string; target?: string }> = [
  { index: '01', name: '宠物', note: `${TIANDIAN.name} · ${TIANDIAN.facts[0].value}`, target: 'life-tiandian' },
  { index: '02', name: '摄影', note: '给毛孩子拍肖像', target: 'life-photography' },
  {
    index: '03',
    name: '旅行',
    note: `${TRAVEL.filter((c) => c.route).length} 个国家 · ${TRAVEL.reduce((n, c) => n + c.cities.length, 0)} 个地方`,
    target: 'life-travel',
  },
  { index: '04', name: '运动', note: '即将开放' },
];

const TARGET_PERCENT = 99;
const BOOST_PERCENT = 100;

export const LifeComingSoon: React.FC<LifeComingSoonProps> = ({ onSwitchToWork }) => {
  const [percent, setPercent] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  // 开关被打开的那一瞬间，进度条冲到 100%，小熊把开关拨回去之后再掉回 99%
  const [boosted, setBoosted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setPercent(TARGET_PERCENT), 250);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setLineIndex((i) => (i + 1) % STATUS_LINES.length), 3200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-[#0B0B0B] text-[#F5F4F2] selection:bg-(--life-accent) selection:text-(--life-on-accent)">
      <section id="life-hero" className="relative px-6 sm:px-10 lg:px-16">
        <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl flex-col">
        <div className="grid flex-1 items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
          <div>
            <h1
              id="life-hero-title"
              className="text-4xl font-bold leading-[1.2] tracking-tight text-[#F5F4F2] sm:text-6xl"
            >
              下班的我，
              <br />
              还在<span className="text-(--life-accent)">下班的路上</span>
            </h1>

            <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-[#B4B0AB] sm:text-lg">
              全速开发中，敬请期待
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {onSwitchToWork && (
                <button
                  type="button"
                  onClick={onSwitchToWork}
                  className="group inline-flex min-h-11 items-center gap-2 rounded-xl bg-(--life-accent) px-5 py-3 text-sm font-semibold text-(--life-on-accent) transition-colors hover:bg-(--life-accent-hi)"
                >
                  <span>看看上班的 Leo</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              )}
            </div>
          </div>

          <div className="w-full max-w-md rounded-2xl border border-[#262626] bg-[#161616]/80 p-6 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.7)] sm:p-8 lg:justify-self-end">
            <div className="mb-6 flex items-center gap-2 border-b border-[#262626] pb-4" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#333333]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#333333]" />
              <span className="h-2.5 w-2.5 rounded-full bg-(--life-accent)" />
              <span className="ml-2 font-mono text-xs text-[#8A8784]">off-duty.exe</span>
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between gap-4 text-sm" aria-live="polite">
                <span key={boosted ? 'boost' : lineIndex} className="life-soon-line min-w-0 text-[#D2CECA]">
                  {boosted ? '咦，好像成了？' : STATUS_LINES[lineIndex]}
                </span>
                <span className="shrink-0 font-mono text-xs text-(--life-accent)">{boosted ? BOOST_PERCENT : percent}%</span>
              </div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full border border-[#262626] bg-[#0B0B0B]"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={boosted ? BOOST_PERCENT : percent}
                aria-label="页面开发进度"
              >
                <div
                  className="life-soon-bar-fill h-full rounded-full bg-gradient-to-r from-(--life-accent-deep) to-(--life-accent)"
                  style={{
                    width: '100%',
                    transform: `scaleX(${(boosted ? BOOST_PERCENT : percent) / 100})`,
                    transformOrigin: 'left center',
                    transitionDuration: boosted ? '0.45s' : '1.2s',
                  }}
                />
              </div>
            </div>

            <div className="mt-6">
              <ImpossibleSwitch
                label="一键加速"
                title="嘘……试试打开它？"
                messages={BEAR_MESSAGES}
                onColor={LIFE_ACCENT}
                offColor="#333333"
                angerCount={3}
                onToggle={setBoosted}
              />
            </div>
          </div>
        </div>

        {/* 栏目目录：压在首屏底边，点了滚到对应栏目；还没开放的那格是灰的 */}
        <nav aria-label="生活页栏目" className="grid grid-cols-2 border-t border-[#1F1F1F] md:grid-cols-4">
          {CHAPTERS.map((chapter, i) => {
            const cell = `group flex flex-col items-start py-6 text-left md:py-7 ${i % 2 === 1 ? 'border-l border-[#1F1F1F] pl-5' : ''} ${
              i >= 2 ? 'border-t border-[#1F1F1F] md:border-t-0' : ''
            } ${i > 0 ? 'md:border-l md:border-[#1F1F1F] md:pl-6' : ''}`;
            if (!chapter.target) {
              return (
                <div key={chapter.index} className={cell}>
                  <span className="font-mono text-xs tabular-nums text-[#6B6865]">{chapter.index}</span>
                  <span className="mt-2 text-lg font-semibold text-[#6B6865]">{chapter.name}</span>
                  <span className="mt-1 text-sm text-[#6B6865]">{chapter.note}</span>
                </div>
              );
            }
            return (
              <button
                key={chapter.index}
                type="button"
                onClick={() => document.getElementById(chapter.target!)?.scrollIntoView({ behavior: 'smooth' })}
                className={`${cell} focus-visible:outline-none`}
              >
                <span className="font-mono text-xs tabular-nums text-(--life-accent)">{chapter.index}</span>
                <span className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-[#F5F4F2] transition-colors duration-200 group-hover:text-(--life-accent) group-focus-visible:text-(--life-accent)">
                  {chapter.name}
                  <ArrowDown className="h-4 w-4 -translate-y-1 opacity-0 transition-[transform,opacity] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100" />
                </span>
                <span className="mt-1 text-sm text-[#8A8784]">{chapter.note}</span>
              </button>
            );
          })}
        </nav>
        </div>
      </section>

      {/* 已经开放的栏目。运动还锁着，做好一个放一个。 */}
      <LifeTiandian />
      <LifePetPhotography />
      <LifeTravel />

      {/* 收尾：还没开放的运动 + 回到职业页 */}
      <section
        id="life-sport"
        aria-labelledby="life-sport-title"
        className="relative border-t border-[#1F1F1F] px-6 py-16 sm:px-10 sm:py-20 lg:px-16"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <LifeChapterLabel index="04" name="运动" note="即将开放" muted />
            <h2 id="life-sport-title" className="mt-5 text-3xl font-bold leading-[1.2] tracking-tight text-[#6B6865] sm:text-[2.6rem]">
              去热身了，马上回来
            </h2>
          </div>
          {onSwitchToWork && (
            <button
              type="button"
              onClick={onSwitchToWork}
              className="group inline-flex min-h-11 items-center gap-2 self-start rounded-xl border border-[#333333] px-5 py-3 text-sm font-medium text-[#F5F4F2] transition-colors hover:border-(--life-accent) hover:text-(--life-accent) md:self-auto"
            >
              <span>看看上班的 Leo</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
