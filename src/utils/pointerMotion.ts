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

  const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
  const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

  setShift(event.currentTarget, relativeX * 6, relativeY * 4);
};

export const resetPointerMotion = (event: ReactPointerEvent<HTMLElement>) => {
  setShift(event.currentTarget, 0, 0);
};
