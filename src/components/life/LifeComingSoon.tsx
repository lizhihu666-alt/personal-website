import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ImpossibleSwitch } from './ImpossibleSwitch/ImpossibleSwitch';
import './LifeComingSoon.css';

interface LifeComingSoonProps {
  onSwitchToWork?: () => void;
}

// 进度条旁边轮换的"施工日志"
const STATUS_LINES = [
  '正在把灵感从口袋里掏出来…',
  '摄影模块：光线还不够好，再等等',
  '运动模块：去热身了，马上回来',
  '旅行模块：行李还没收完',
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
    <div className="relative w-full overflow-hidden bg-[#0A0B0D] text-[#F3F5F8] selection:bg-[#2F6FED] selection:text-white">
      <div className="life-soon-glow pointer-events-none absolute inset-0" aria-hidden="true" />

      <section
        id="life-hero"
        className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl flex-col justify-center px-6 py-14 sm:py-20"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
          <div>
            <h1
              id="life-hero-title"
              className="text-4xl font-bold leading-[1.2] tracking-tight text-[#F3F5F8] sm:text-6xl"
            >
              下班的我，
              <br />
              还在<span className="text-[#4F8CFF]">下班的路上</span>
            </h1>

            <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-[#A8B0BC] sm:text-lg">
              全速开发中，敬请期待
            </p>

            {onSwitchToWork && (
              <button
                type="button"
                onClick={onSwitchToWork}
                className="group mt-9 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#2F6FED] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2A62D1]"
              >
                <span>看看上班的 Leo</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>

          <div className="w-full max-w-md rounded-2xl border border-[#232A33] bg-[#111418]/80 p-6 shadow-[0_20px_60px_-30px_rgba(47,111,237,0.35)] sm:p-8 lg:justify-self-end">
            <div className="mb-6 flex items-center gap-2 border-b border-[#232A33] pb-4" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2B323C]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#2B323C]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#4F8CFF]" />
              <span className="ml-2 font-mono text-xs text-[#8C95A3]">off-duty.exe</span>
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between gap-4 text-sm" aria-live="polite">
                <span key={boosted ? 'boost' : lineIndex} className="life-soon-line min-w-0 text-[#C3CAD5]">
                  {boosted ? '咦，好像成了？' : STATUS_LINES[lineIndex]}
                </span>
                <span className="shrink-0 font-mono text-xs text-[#4F8CFF]">{boosted ? BOOST_PERCENT : percent}%</span>
              </div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full border border-[#232A33] bg-[#0A0B0D]"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={boosted ? BOOST_PERCENT : percent}
                aria-label="页面开发进度"
              >
                <div
                  className="life-soon-bar-fill h-full rounded-full bg-gradient-to-r from-[#2F6FED] to-[#4F8CFF]"
                  style={{
                    width: `${boosted ? BOOST_PERCENT : percent}%`,
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
                onColor="#4F8CFF"
                offColor="#2B323C"
                angerCount={3}
                onToggle={setBoosted}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
