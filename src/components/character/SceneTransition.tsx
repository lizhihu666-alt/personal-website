import React, { useEffect, useRef } from 'react';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';

interface SceneTransitionProps {
  targetMode: 'work' | 'life';
  onComplete: () => void;
  onCancel?: () => void;
}

// 首次访问某个模式时的转场——不再讲故事（不管是小人走路还是扫描光束
// 加终端读数），就是一次克制的纯色淡入淡出：盖住屏幕，切换页面，
// 再淡出露出目的地。重复访问会走 App.tsx 里那套 View Transition
// 卡片变形，这里只负责"没有变形素材可用"时的兜底，越安静越好。
export const SceneTransition: React.FC<SceneTransitionProps> = ({
  onComplete,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isReducedMotion()) {
      onComplete();
      return;
    }

    // App.tsx 那边只有一个 onComplete 回调，一调用就会同时切页面 +
    // 卸载这个遮罩，所以淡出没法在这个组件自己身上做——盖满全屏那一刻
    // 直接交还控制权，新页面在纯色遮罩消失的同一帧顶上来，观感上是一次
    // 干净的"淡入-切"，不强求淡出，也不需要再碰 App.tsx 的回调签名。
    const ctx = gsap.context(() => {
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.24,
        ease: 'power2.in',
        onComplete: () => onComplete(),
      });
    }, overlayRef);

    return () => {
      ctx.revert();
    };
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      id="transition-overlay"
      className="fixed inset-0 z-[130] bg-[#0A0B0D] opacity-0 pointer-events-none"
      aria-hidden="true"
    />
  );
};
