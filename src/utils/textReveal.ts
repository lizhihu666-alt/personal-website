import { gsap, SplitText } from './gsapSetup';

interface RevealLinesOptions {
  /** ScrollTrigger 的 trigger 元素/选择器，默认用被拆分的元素本身。 */
  trigger?: Element | string;
  /** ScrollTrigger 的 start，默认 'top 85%'（元素顶部进入视口 85% 处触发）。 */
  start?: string;
  /** 行与行之间的错开时间（秒）。 */
  stagger?: number;
  /** 整体延迟（秒），用于跟同一时间线里的其它动画错开节奏。 */
  delay?: number;
}

/**
 * 逐行遮罩揭示：把标题按行拆开，每行套一层 overflow:hidden 的遮罩，
 * 文字从遮罩下方滑入。WorkHero 里那套手写的 `.hero-headline-line` +
 * yPercent 揭示用的是同一个视觉效果，这里用 SplitText 的
 * `mask: 'lines'` 自动生成遮罩结构，不用再手动拆 <span> 包 <span>，
 * 字体加载完成或窗口尺寸变化导致换行位置变化时也会自动重新拆分。
 *
 * 只处理"从下往上揭示"这一种用法；如果以后要做别的 split 效果
 * （按字/按词），直接在调用处另起一个函数，不要往这个函数里堆参数。
 *
 * 调用方负责在 useLayoutEffect/useEffect 里判断 isReducedMotion()
 * 决定要不要调用——这个函数本身不做这个判断，因为拆行本身（不揭示，
 * 直接可见）在减弱动效模式下也是可以接受的写法，交给调用方选择。
 *
 * @returns 清理函数：组件卸载 / 依赖变化时调用，会杀掉 ScrollTrigger、
 * 杀掉 tween，并调用 split.revert() 把 DOM 还原成拆分前的样子——
 * 一定要调用，否则重复调用这个函数会在同一个元素上叠加出多层遮罩。
 */
export function revealLines(
  element: HTMLElement | null,
  options: RevealLinesOptions = {}
): () => void {
  if (!element) return () => {};

  const split = SplitText.create(element, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'reveal-line',
  });

  gsap.set(split.lines, { yPercent: 110 });

  const tween = gsap.to(split.lines, {
    yPercent: 0,
    duration: 0.85,
    ease: 'power3.out',
    stagger: options.stagger ?? 0.08,
    delay: options.delay ?? 0,
    scrollTrigger: {
      trigger: options.trigger ?? element,
      start: options.start ?? 'top 85%',
      once: true,
    },
  });

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    split.revert();
  };
}
