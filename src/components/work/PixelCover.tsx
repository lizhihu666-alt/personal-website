import React, { forwardRef, useLayoutEffect } from 'react';
import { gsap, ScrollTrigger, isReducedMotion } from '../../utils/gsapSetup';

// 板块之间的「方格子转场」：当前板块滚到底（底边对齐视口底）时被钉住，
// 一层随机顺序铺开的方块把它盖成下一个板块的颜色，盖满后钉住松开，下一个板块（同色）
// 无缝接上。跟方法板块收尾的那一套（WorkMethodTrace）是同一个手法，抽成可复用的
// hook，每个交界处只需要说明「盖成什么颜色」。
const CELL_SIZE = 80;
// 钉住的前 40% 是「停留」：内容刚好完整露出来之后，要再往下滚一小段才开始变色，
// 给观众留出看完内容的缓冲，不会一到位就立刻开始转场。
const HOLD_FRACTION = 0.4;
// 方块盖满之后，这一层不是立刻消失，而是用这么长时间（秒）淡出，下一个板块的内容跟着渐显。
const REVEAL_DURATION = 0.6;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

/**
 * @param pinRef 被钉住的那一层（必须是 relative，高度至少一屏）；画布放在它里面。
 * @param canvasRef 画布。
 * @param color 方块的颜色，也就是下一个板块的背景色。
 * @param lengthVh 转场占用的滚动距离，单位是屏高的倍数（默认约 1 屏）。
 * @param refreshPriority 多个 pin 前后相接时，位置必须按页面从上到下的顺序依次算定：
 *   数字越大越先算。每个板块按它在页面里的次序递减传入，否则下面的板块会在上面的 pin 撑开
 *   之前就算好起点，位置错乱，整块内容被推到看不见的地方。
 */
export function usePixelCover(
  pinRef: React.RefObject<HTMLElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  color: string,
  lengthVh = 1,
  refreshPriority = 0
) {
  useLayoutEffect(() => {
    const pinEl = pinRef.current;
    const canvas = canvasRef.current;
    if (!pinEl || !canvas || isReducedMotion()) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 钉住的这一层要盖在「下一个板块」上面（下一个板块用负的 margin-top 提前叠到它后面），
    // 这样转场一结束、这一层隐藏，下一个板块的内容就直接出现在原地，不用再滑过一整屏空白。
    // z-index 按页面次序递减（refreshPriority 越大越靠上），上面的板块才始终盖在下面的板块之上。
    pinEl.style.zIndex = String(20 + refreshPriority * 10);
    let cells: Array<{ col: number; row: number; threshold: number }> = [];
    let cellW = 0;
    let cellH = 0;
    let width = 0;
    let height = 0;
    let progress = 0;
    let revealed = false;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const local = clamp01((progress - HOLD_FRACTION) / (1 - HOLD_FRACTION));
      if (local <= 0) return;
      ctx.fillStyle = color;
      cells.forEach(({ col, row, threshold }) => {
        const start = threshold * 0.85;
        const opacity = smoothstep(start, start + 0.15, local);
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
      refreshPriority,
      onUpdate: (self) => {
        progress = self.progress;
        draw();
        // 方块盖满之后整层淡出，露出叠在它后面的下一个板块（内容跟着渐显）；往回滚时立刻恢复。
        const done = self.progress >= 0.999;
        if (done && !revealed) {
          revealed = true;
          gsap.to(pinEl, {
            opacity: 0,
            duration: REVEAL_DURATION,
            ease: 'power1.out',
            overwrite: true,
            onComplete: () => {
              if (revealed) pinEl.style.visibility = 'hidden';
            },
          });
        } else if (!done && revealed) {
          revealed = false;
          gsap.killTweensOf(pinEl);
          gsap.set(pinEl, { opacity: 1 });
          pinEl.style.visibility = 'visible';
        }
      },
    });

    return () => {
      ScrollTrigger.removeEventListener('refresh', build);
      trigger.kill();
      gsap.killTweensOf(pinEl);
      pinEl.style.opacity = '';
      pinEl.style.visibility = '';
      pinEl.style.zIndex = '';
    };
  }, [pinRef, canvasRef, color, lengthVh, refreshPriority]);
}

/** 盖在被钉住那一层上的画布：左右「出血」到整个视口宽度，盖住父元素的左右内边距。 */
interface PixelCoverCanvasProps {
  /** 这一层自己的背景色：它盖在下一个板块上面，需要一个不透明的底，左右同样出血到整个视口宽度。 */
  background: string;
}

export const PixelCoverCanvas = forwardRef<HTMLCanvasElement, PixelCoverCanvasProps>(({ background }, ref) => (
  <>
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-0 -z-10"
      style={{ width: '100vw', marginLeft: '-50vw', height: 'calc(100% + 4px)', background }}
    />
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
  </>
));
PixelCoverCanvas.displayName = 'PixelCoverCanvas';
