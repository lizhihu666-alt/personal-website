import { gsap, isReducedMotion } from './gsapSetup';

// 弹窗从「点开它的那个按钮」长出来、关闭时收回去（和案例页从卡片展开是同一种连续性）。
// 全站只在捕获阶段记一下最近一次点击/回车的按钮位置，弹窗打开时取用，不用每个入口各传一遍。

interface TriggerOrigin {
  x: number;
  y: number;
  at: number;
}

let lastTrigger: TriggerOrigin | null = null;

const remember = (el: Element | null) => {
  const target = el?.closest('button, a, [role="button"]');
  if (!target) return;
  const rect = target.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  lastTrigger = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, at: performance.now() };
};

if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', (event) => remember(event.target as Element), true);
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Enter' || event.key === ' ') remember(document.activeElement);
    },
    true
  );
}

export type ModalOrigin = { x: number; y: number } | null;

// 打开前 2 秒内的那次点击才算触发源；超时（比如程序自己打开的）就走默认的轻微上浮。
export const getModalOrigin = (): ModalOrigin =>
  lastTrigger && performance.now() - lastTrigger.at < 2000 ? { x: lastTrigger.x, y: lastTrigger.y } : null;

interface ModalMotionTargets {
  panel: HTMLElement | null;
  // 面板之外需要跟着淡入淡出的层（遮罩）。
  backdrop?: HTMLElement | null;
}

// 起点：从触发按钮的位置出发，只走 85% 的路并缩小到 40%，面板仍然从它自己的位置「长出来」而不是飞过来。
const startState = (panel: HTMLElement, origin: ModalOrigin) => {
  const rect = panel.getBoundingClientRect();
  const dx = origin ? (origin.x - (rect.left + rect.width / 2)) * 0.85 : 0;
  const dy = origin ? (origin.y - (rect.top + rect.height / 2)) * 0.85 : 24;
  return { x: dx, y: dy, scale: origin ? 0.4 : 0.97, opacity: 0, transformOrigin: '50% 50%' };
};

export const playModalOpen = ({ panel, backdrop }: ModalMotionTargets, origin: ModalOrigin) => {
  if (!panel || isReducedMotion()) return;

  gsap.fromTo(panel, startState(panel, origin), {
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    duration: 0.55,
    ease: 'power4.out',
    clearProps: 'transform,opacity',
  });
  if (backdrop) {
    gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out', clearProps: 'opacity' });
  }
};

// 关闭比打开快：先收回到触发按钮，再通知外面卸载。
export const playModalClose = ({ panel, backdrop }: ModalMotionTargets, origin: ModalOrigin, onDone: () => void) => {
  if (!panel || isReducedMotion()) {
    onDone();
    return;
  }

  const { x, y, scale } = startState(panel, origin);
  gsap.to(panel, { x, y, scale, opacity: 0, duration: 0.28, ease: 'power3.in', onComplete: onDone });
  if (backdrop) gsap.to(backdrop, { opacity: 0, duration: 0.28, ease: 'power2.in' });
};
