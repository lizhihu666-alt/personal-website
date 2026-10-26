import React, { Suspense, lazy, useId, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { METHOD_SLIDE_VH, METHOD_TOTAL_VH } from './methodTraceTiming';

// 方法板块：电脑上是三维线条汇合的滚动动画（约 600KB 的 three.js，单独拆成一个包，宽屏才下载），
// 手机上是一张静态示意图加同样的文案——钉住滚动在触屏上又长又卡，竖屏上线条也只剩几根细线。
const WorkMethodTraceDesktop = lazy(() => import('./WorkMethodTraceDesktop'));

const LABELS = ['项目管理', 'IT 拉通', '供应链协同', 'AI 提效'];

// 手绘的四条汇合曲线（不用三维库、不做数学计算）。
const STATIC_PATHS = [
  'M0 30 C 320 30, 540 150, 860 150',
  'M0 110 C 320 110, 580 150, 860 150',
  'M0 190 C 320 190, 580 150, 860 150',
  'M0 270 C 320 270, 540 150, 860 150',
];

const TRACE_COLOR = '#279E5A';
const HIGHLIGHT_DOT_COLOR = '#34D378';

export const WorkMethodTrace: React.FC = () => {
  const headingId = useId();
  const [isCompact] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  if (isCompact) {
    return (
      <section
        id="work-method-trace"
        aria-labelledby={headingId}
        className="method-trace-section relative -mt-[100dvh] bg-[#0A0B0D] px-6"
      >
        <div className="relative flex min-h-dvh flex-col justify-center py-16">
          <div className="mx-auto w-full max-w-md">
            <svg
              viewBox="0 0 1000 300"
              preserveAspectRatio="none"
              className="h-36 w-full"
              role="img"
              aria-label="项目管理、IT 拉通、供应链协同与 AI 提效四条绿色路径汇成一条"
            >
              {STATIC_PATHS.map((path, index) => (
                <path
                  key={path}
                  d={path}
                  fill="none"
                  stroke={TRACE_COLOR}
                  strokeWidth={index === 0 ? 1.6 : 1.25}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <circle cx={860} cy={150} r={12} fill={HIGHLIGHT_DOT_COLOR} />
            </svg>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#A8B0BC]" role="list">
              {LABELS.map((label) => (
                <li key={label} className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#34D378]" />
                  {label}
                </li>
              ))}
            </ul>
            <h2 id={headingId} className="type-section-sm mt-10 text-[#F3F5F8]">
              四条路径，
              <br />
              <span className="text-[#34D378]">汇成一套可运行的中台</span>
            </h2>
            <p className="type-body mt-4 text-[#A8B0BC]">
              从招商入驻、SaaS 迁站到自研商家中心，再用 AI 工具补上最后一段提效
            </p>
            <a
              href="#work-about"
              className="mt-6 inline-flex min-h-11 items-center gap-2 border-b border-[#34D378] pb-1 text-sm font-semibold text-[#F3F5F8]"
            >
              <span>了解更多关于我</span>
              <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    );
  }

  // 三维包还没下载完时，先占住同样的位置和高度（深色底），页面布局和滚动位置不会跳。
  return (
    <Suspense
      fallback={
        <section
          id="work-method-trace"
          aria-hidden="true"
          className="method-trace-section relative -mt-[100dvh] bg-[#0A0B0D]"
          style={{ height: `calc(100dvh * ${1 + METHOD_TOTAL_VH - METHOD_SLIDE_VH})` }}
        />
      }
    >
      <WorkMethodTraceDesktop />
    </Suspense>
  );
};
