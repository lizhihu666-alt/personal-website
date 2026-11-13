import React from 'react';

// 生活页每个栏目标题上方的那一行：编号 + 短横线 + 栏目名。
// 编号和菜单抽屉、首屏底部目录里的编号是同一套（01 宠物 / 02 摄影 / 03 旅行 / 04 运动）。
interface LifeChapterLabelProps {
  index: string;
  name: string;
  // 还没开放的栏目：编号不用强调色，后面跟一个状态说明
  note?: string;
  muted?: boolean;
  className?: string;
}

export const LifeChapterLabel: React.FC<LifeChapterLabelProps> = ({ index, name, note, muted = false, className = '' }) => (
  <p className={`flex items-center gap-3 text-sm text-[#8A8784] ${className}`}>
    <span className={`font-mono tabular-nums ${muted ? 'text-[#8A8784]' : 'text-(--life-accent)'}`}>{index}</span>
    <span className="h-px w-8 bg-[#333333]" aria-hidden="true" />
    <span>{name}</span>
    {note && <span className="rounded-full border border-[#333333] px-2.5 py-0.5 text-xs">{note}</span>}
  </p>
);
