import React, { forwardRef, useLayoutEffect } from 'react';
import { ScrollTrigger, isReducedMotion } from '../../utils/gsapSetup';

// 板块之间的「方格子转场」：当前板块滚到底（底边对齐视口底）时被钉住，
// 一层随机顺序铺开的方块把它盖成下一个板块的颜色，盖满后钉住松开，下一个板块（同色）
// 无缝接上。跟方法板块收尾的那一套（WorkMethodTrace）是同一个手法，抽成可复用的
// hook，每个交界处只需要说明「盖成什么颜色」。
const CELL_SIZE = 80;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

/**
 * @param pinRef 被钉住的那一层（必须是 relative，高度至少一屏）；画布放在它里面。
 * @param canvasRef 画布。
 * @param color 方块的颜色，也就是下一个板块的背景色。
 * @param lengthVh 转场占用的滚动距离，单位是屏高的倍数。
 */
export function usePixelCover(
  pinRef: React.RefObject<HTMLElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  color: string,
  lengthVh = 0.45
) {
  useLayoutEffect(() => {
    const pinEl = pinRef.current;
    const canvas = canvasRef.current;
    if (!pinEl || !canvas || isReducedMotion()) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cells: Array<{ col: number; row: number; threshold: number }> = [];
    let cellW = 0;
    let cellH = 0;
    let width = 0;
    let height = 0;
    let progress = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      if (progress <= 0) return;
      ctx.fillStyle = color;
      cells.forEach(({ col, row, threshold }) => {
        const start = threshold * 0.85;
        const opacity = smoothstep(start, start + 0.15, progress);
        if (opacity <= 0) return;
        ctx.globalAlpha = opacity;
        ctx.fillRect(col * cellW, row * cellH, cellW + 1, cellH + 1);
      });
      ctx.globalAlpha = 1;
    };

    // 格子按画布当下的实际宽高来建，宽、高分开除，保证最后一列/行精确顶到边缘。
    const build = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const cols = Math.max(1, Math.round(rect.width / CELL_SIZE));
      const actualW = rect.width / cols;
      const rows = Math.max(1, Math.round(rect.height / actualW));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cellW = rect.width / cols;
      cellH = rect.height / rows;
      width = rect.width;
      height = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cells = [];
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          cells.push({ col, row, threshold: Math.random() });
        }
      }
      draw();
    };

    build();
    // 监听 ScrollTrigger 的 refresh：它把所有 pin 的位置/尺寸算定之后才重建，
    // 直接监听 window resize 会量到还没定型的尺寸。
    ScrollTrigger.addEventListener('refresh', build);

    const trigger = ScrollTrigger.create({
      trigger: pinEl,
      start: 'bottom bottom',
      end: () => `+=${window.innerHeight * lengthVh}`,
      pin: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        progress = self.progress;
        draw();
      },
    });

    return () => {
      ScrollTrigger.removeEventListener('refresh', build);
      trigger.kill();
    };
  }, [pinRef, canvasRef, color, lengthVh]);
}

/** 盖在被钉住那一层上的画布：左右「出血」到整个视口宽度，盖住父元素的左右内边距。 */
export const PixelCoverCanvas = forwardRef<HTMLCanvasElement>((_, ref) => (
  <canvas
    ref={ref}
    aria-hidden="true"
    className="pointer-events-none absolute left-1/2 right-1/2 top-0 z-10"
    style={{
      width: '100vw',
      marginLeft: '-50vw',
      marginRight: '-50vw',
      // canvas 是替换元素，要给明确的 height；多 4px 是为了盖住 pin 占位的小数取整缝。
      height: 'calc(100% + 4px)',
    }}
  />
));
PixelCoverCanvas.displayName = 'PixelCoverCanvas';
