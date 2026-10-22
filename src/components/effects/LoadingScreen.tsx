import React, { useEffect, useRef } from 'react';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';
import { FACE_VIEWBOX, FACE_PATH, LEO_PATH } from './loadingIntroPaths';

// 整站唯一一次加载页：先看到这个人脸 <-> LEO 字形来回变形的全屏页面，
// 加载"完成"（这里用固定时长模拟）之后才淡出，露出首页的职业/生活
// 二选一——不是叠在首页上面的装饰角标，这段时间首页本身还没有挂载。
const FADE_DURATION = 0.5;

interface LoadingScreenProps {
  onDone: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onDone }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (isReducedMotion()) {
      onDone();
      return;
    }

    const ctx = gsap.context(() => {
      // 一次完整的登场：先用细线把人像轮廓一笔描出来，再填上白色，
      // 停一拍，变成 LEO 字形，再停一拍，整块淡出。路径用 pathLength=1
      // 归一化，所以 dashoffset 1 → 0 就是"从无到有画完"，变形后依然成立。
      const path = pathRef.current;
      gsap.set(path, { strokeDashoffset: 1, fillOpacity: 0 });

      const tl = gsap.timeline({ onComplete: onDone });
      tl.to(path, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' })
        .to(path, { fillOpacity: 1, duration: 0.45, ease: 'power1.out' }, '-=0.35')
        // 变成 LEO 的同时整体缩小一圈，字形比头像小，不那么压人。
        .to(path, { morphSVG: LEO_PATH, duration: 0.8, ease: 'power2.inOut' }, '+=0.3')
        .to(svgRef.current, { scale: 0.8, duration: 0.8, ease: 'power2.inOut' }, '<')
        .to(wrapperRef.current, { opacity: 0, duration: FADE_DURATION, ease: 'power1.in' }, '+=0.45');
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
      <svg ref={svgRef} style={{ overflow: "visible" }} width={280} height={280} viewBox={FACE_VIEWBOX} fill="#F3F5F8" aria-hidden="true">
        <path
          ref={pathRef}
          d={FACE_PATH}
          fillRule="evenodd"
          pathLength={1}
          stroke="#F3F5F8"
          strokeWidth={0.8}
          strokeLinejoin="round"
          strokeDasharray={1}
        />
      </svg>
    </div>
  );
};
