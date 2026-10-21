import React, { useEffect, useRef } from 'react';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';
import { FACE_VIEWBOX, FACE_PATH, LEO_PATH } from './loadingIntroPaths';

// 整站唯一一次加载页：先看到这个人脸 <-> LEO 字形来回变形的全屏页面，
// 加载"完成"（这里用固定时长模拟）之后才淡出，露出首页的职业/生活
// 二选一——不是叠在首页上面的装饰角标，这段时间首页本身还没有挂载。
const HOLD_DURATION = 1.9;
const FADE_DURATION = 0.5;

interface LoadingScreenProps {
  onDone: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onDone }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (isReducedMotion()) {
      onDone();
      return;
    }

    const ctx = gsap.context(() => {
      // 人脸和 LEO 字形来回变形，往返循环，直到固定时长到了才停手，
      // 停在哪个形状都行——反正下一拍整块就淡出了，不需要专门收尾到
      // 某个"终态"。
      gsap.to(pathRef.current, {
        morphSVG: LEO_PATH,
        duration: 0.9,
        ease: 'power2.inOut',
        repeat: -1,
        yoyo: true,
        repeatDelay: 0.25,
      });

      gsap.to(wrapperRef.current, {
        opacity: 0,
        duration: FADE_DURATION,
        delay: HOLD_DURATION,
        ease: 'power1.in',
        onComplete: onDone,
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, [onDone]);

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0B0D]"
      role="status"
      aria-label="页面加载中"
    >
      <svg style={{ overflow: "visible" }} width={280} height={280} viewBox={FACE_VIEWBOX} fill="#F3F5F8" aria-hidden="true">
        <path ref={pathRef} d={FACE_PATH} fillRule="evenodd" />
      </svg>
    </div>
  );
};
