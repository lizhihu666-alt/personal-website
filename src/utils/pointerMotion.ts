import type { PointerEvent as ReactPointerEvent } from 'react';

const setShift = (element: HTMLElement, x: number, y: number) => {
  element.style.setProperty('--pointer-shift-x', `${x.toFixed(2)}px`);
  element.style.setProperty('--pointer-shift-y', `${y.toFixed(2)}px`);
  element.style.setProperty('--pointer-shift-soft-x', `${(x * 0.55).toFixed(2)}px`);
  element.style.setProperty('--pointer-shift-soft-y', `${(y * 0.55).toFixed(2)}px`);
};

export const updatePointerMotion = (event: ReactPointerEvent<HTMLElement>) => {
  if (event.pointerType !== 'mouse') return;

  const rect = event.currentTarget.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  // getBoundingClientRect 包含了元素此刻已经平移的距离，直接拿它算相对位置会形成反馈环：
  // 元素往光标方向挪 → 相对位置变化 → 目标位移再变 → 在边缘来回抖。
  // 这里先把当前的平移量减掉，只用元素自己的布局位置来算。
  const matrix = new DOMMatrixReadOnly(getComputedStyle(event.currentTarget).transform);
  const layoutLeft = rect.left - matrix.m41;
  const layoutTop = rect.top - matrix.m42;

  // 悬停区域比按钮本身略大，鼠标可能落在按钮外沿，夹在 ±0.5 内避免位移超出预期。
  const relativeX = Math.max(-0.5, Math.min(0.5, (event.clientX - layoutLeft) / rect.width - 0.5));
  const relativeY = Math.max(-0.5, Math.min(0.5, (event.clientY - layoutTop) / rect.height - 0.5));

  setShift(event.currentTarget, relativeX * 6, relativeY * 4);
};

export const resetPointerMotion = (event: ReactPointerEvent<HTMLElement>) => {
  setShift(event.currentTarget, 0, 0);
};
