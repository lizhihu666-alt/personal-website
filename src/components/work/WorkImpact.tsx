import React, { useRef, useLayoutEffect } from 'react';
import { gsap, ScrollTrigger, SplitText, isReducedMotion } from '../../utils/gsapSetup';
import { revealLines } from '../../utils/textReveal';

const PIXEL_TO_COLOR = '#0A0B0D';
const PIXEL_CELL_SIZE = 80;
// 数字全部念完之后先空出一段纯滚动、什么都不发生的"停顿"，再触发变黑——
// 不然快速下滑时惯性一冲，文字刚出现完变黑动画就跟上了，根本来不及读。
const HOLD_UNITS_AFTER_TEXT = 1;
// 变黑这一段在时间线上固定占几个单位——不能让 GSAP 的 stagger 按方块
// 数量自动撑时长：方块数量是屏幕宽高换算出来的，屏幕越大格子越多，
// stagger 累计出来的时长越长，会把这段变黑动画在整段滚动进度里占的
// 比例悄悄变大，连带把前面数字行揭示的节奏也跟着压缩。改成固定单位
// 数占位，实际每个方块的透明度改由下面 onUpdate 里按滚动进度直接算
// （用法跟 WorkMethodTrace 里同一套黑变白转场完全一致）。
const PIXEL_PHASE_UNITS = 1;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export const WorkImpact: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const pixelGridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    let revertHeading = () => {};
    const splits: InstanceType<typeof SplitText>[] = [];

    // 数字文字全部显现之后，紧接着（同一个 pin、同一根时间线）再加一段
    // 像素方块随机铺开盖住整个钉住的画面，变成下一板块（方法区）的
    // 深色——不能另起一段正常滚动经过的区域来做这件事：那样鼠标下滑
    // 会先把页面滚到一块空白区域，再在空白区域上变黑，观感上就是
    // "先滚走、再变黑"，而不是"当前画面直接被黑方块盖住"。铺在同一个
    // 钉住的容器里，滚动驱动的还是同一根时间线，行为上就是原地覆盖。
    const pixelGridEl = pixelGridRef.current;
    const pixelEls: Array<{ el: HTMLElement; threshold: number }> = [];

    // 格子按容器当下的实际宽高来建——列数按目标格子边长四舍五入后，
    // 宽度不一定正好是它的整数倍，实际格子宽度会跟 80px 有出入；行数
    // 如果还是拿 80px 去除高度，跟这个"实际"格子宽度对不上，最终格子
    // 就会明显偏矮或偏高。改成拿宽度除出来的实际格子宽度去算行数，
    // 行数确定后格子高度自然贴近这个实际宽度，误差只剩下不到 2% 的
    // 四舍五入余量，肉眼看不出来。抽成函数是因为窗口宽度变化后（用户
    // 拖拽调整浏览器窗口）容器尺寸会变，格子如果还是挂载时建的那一批，
    // 百分比宽高会被拉伸到新的容器尺寸上，重新变回长方形——所以要能
    // 在 resize 时原地清空重建，而不是只建一次。这段不涉及 GSAP 补间，
    // 不需要放进下面的 gsap.context。
    const buildPixelGrid = () => {
      if (!pixelGridEl) return;
      const pixelRect = pixelGridEl.getBoundingClientRect();
      const cols = Math.max(1, Math.round(pixelRect.width / PIXEL_CELL_SIZE));
      const actualCellWidth = pixelRect.width / cols;
      const pixelRows = Math.max(1, Math.round(pixelRect.height / actualCellWidth));
      pixelGridEl.innerHTML = '';
      pixelEls.length = 0;
      const colSize = 100 / cols;
      const rowSize = 100 / pixelRows;
      for (let row = 0; row < pixelRows; row++) {
        for (let col = 0; col < cols; col++) {
          const pixel = document.createElement('div');
          pixel.style.position = 'absolute';
          pixel.style.backgroundColor = PIXEL_TO_COLOR;
          pixel.style.width = `${colSize}%`;
          pixel.style.height = `${rowSize}%`;
          pixel.style.left = `${col * colSize}%`;
          pixel.style.top = `${row * rowSize}%`;
          pixel.style.opacity = '0';
          pixelGridEl.appendChild(pixel);
          pixelEls.push({ el: pixel, threshold: Math.random() });
        }
      }
    };

    buildPixelGrid();

    // 直接监听 window resize 会跟 GSAP 自己的 resize 处理抢跑——resize
    // 时 ScrollTrigger 也要重新计算 pin 的位置/尺寸，如果在它算完之前
    // 就量 pixelGridEl 的宽高，量到的是还没定型的中间状态，格子反而会
    // 比不重建更不成正方形。改成监听 ScrollTrigger 自己的 'refresh'
    // 事件——resize（以及别处手动调用的 ScrollTrigger.refresh()）之后，
    // 它会在所有 pin 的位置/尺寸都重新算完、真正定型了才触发一次。
    ScrollTrigger.addEventListener('refresh', buildPixelGrid);

    const ctx = gsap.context(() => {
      revertHeading = revealLines(headingRef.current, {
        trigger: containerRef.current,
        start: 'top 82%',
      });

      const rows = gsap.utils.toArray<HTMLElement>('.impact-metric-row');

      // 整块（标题 + 数字列表）钉住不动，用一根时间线把"每一行的数字
      // 和文字"绑在同一个时间点上一起播——鼠标下滑驱动的是这根时间线
      // 的进度（scrub），不是页面本身的滚动位置，所以在全部行播完之前
      // 页面看起来就是"卡住不动"，播完时间线自然结束，pin 一松开，
      // 页面才继续往下滚。多留出来的这一份距离是给上面像素覆盖用的。
      const totalUnits = rows.length + HOLD_UNITS_AFTER_TEXT + PIXEL_PHASE_UNITS;
      const pixelStartFraction = (rows.length + HOLD_UNITS_AFTER_TEXT) / totalUnits;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: gridRef.current,
          // 顶栏是 sticky + z-40，会盖在钉住的内容上面——钉在 'top top'
          // 会让第一行数字卡在顶栏底下被挡住一截，往下错开顶栏的高度
          // (64px / h-16) 再钉，内容才会乖乖露在顶栏下面。
          start: 'top 64px',
          end: `+=${totalUnits * 480}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (!pixelEls.length) return;
            // 跟 WorkMethodTrace 的黑变白转场同一套算法：每个方块按
            // 自己的随机 threshold 在这一段局部进度里错开显现，时长
            // 只取决于滚动进度（0~1），不取决于方块数量。
            const local = clamp01((self.progress - pixelStartFraction) / (1 - pixelStartFraction));
            pixelEls.forEach(({ el, threshold }) => {
              const cellStart = threshold * 0.85;
              el.style.opacity = String(smoothstep(cellStart, cellStart + 0.15, local));
            });
          },
        },
      });

      rows.forEach((row, index) => {
        const number = row.querySelector<HTMLElement>('.impact-metric-number');
        const title = row.querySelector<HTMLElement>('h3');
        const context = row.querySelector<HTMLElement>('.impact-context');
        if (!number || !title || !context) return;

        const titleSplit = SplitText.create(title, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'reveal-line',
        });
        const contextSplit = SplitText.create(context, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'reveal-line',
        });
        splits.push(titleSplit, contextSplit);

        gsap.set(number, { opacity: 0 });
        gsap.set(titleSplit.lines, { yPercent: 120 });
        gsap.set(contextSplit.lines, { yPercent: 120 });

        const at = index; // 每一行在时间线上占 1 个单位

        tl.to(number, { opacity: 1, duration: 0.25, ease: 'none' }, at);
        tl.to(
          titleSplit.lines,
          { yPercent: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out' },
          at
        );
        tl.to(
          contextSplit.lines,
          { yPercent: 0, duration: 0.5, stagger: 0.03, ease: 'power2.out' },
          at + 0.05
        );

        // 分割线跟这一行的文字同一个节奏淡入，不是从一开始就摆在那儿——
        // 不然还没显现的行下面先挂着条线，感觉这行内容已经在了。初始的
        // 隐藏状态也放在这里用 gsap.set 设置，而不是写死在 JSX 的行内
        // style 上——reduced motion 时这整段 effect 根本不会跑，写死在
        // JSX 里的 opacity:0 就会永久生效，分割线变成怎么都不出现。
        const divider = row.querySelector<HTMLElement>('.impact-divider');
        if (divider) {
          gsap.set(divider, { opacity: 0 });
          tl.to(divider, { opacity: 1, duration: 0.3, ease: 'none' }, at);
        }

        const finalText = number.dataset.final ?? number.textContent ?? '';
        const match = finalText.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
        if (!match) return;

        const [, prefix, valueText, suffix] = match;
        const target = Number(valueText);
        const decimals = valueText.includes('.') ? valueText.split('.')[1].length : 0;
        const proxy = { value: 0 };

        tl.to(
          proxy,
          {
            value: target,
            duration: 0.5,
            ease: 'power1.out',
            onUpdate: () => {
              const current = decimals > 0 ? proxy.value.toFixed(decimals) : String(Math.round(proxy.value));
              number.textContent = `${prefix}${current}${suffix}`;
            },
            onComplete: () => {
              number.textContent = finalText;
            },
          },
          at
        );
      });

      // 纯占位，不改任何属性——只是把时间线的总时长精确撑到
      // totalUnits，这样上面 onUpdate 里用 self.progress 换算出来的
      // pixelStartFraction 才跟时间线本身的 scrub 节奏对得上。
      tl.to({}, { duration: PIXEL_PHASE_UNITS }, rows.length + HOLD_UNITS_AFTER_TEXT);
    }, containerRef);

    return () => {
      ScrollTrigger.removeEventListener('refresh', buildPixelGrid);
      revertHeading();
      splits.forEach((split) => split.revert());
      ctx.revert();
    };
  }, []);

  const metrics = [
    {
      num: '30%',
      title: '入驻周期缩短',
      context: '重构资质预审、报关合规与商品主数据映射流程，核心链路提速更明显。',
    },
    {
      num: '10+',
      title: '零宕机系统割接',
      context: '在第三方 API 突然废弃的危机中完成替代过渡与数据对账，客户侧零感知。',
    },
    {
      num: '9',
      title: '可复用流程框架',
      context: '把准入、退换货、库存对账与接口异常处理沉淀成可复用 SOP。',
    },
    {
      num: '2M+',
      title: '季度GMV支撑',
      context: '高韧性库存履约中台承受大促并发压力，保障海外业务不中断。',
    },
  ];

  return (
    <section
      id="work-impact"
      ref={containerRef}
      className="relative px-6 sm:px-10 lg:px-16 bg-[#F3F5F8] shadow-[0_-40px_60px_-30px_rgba(0,0,0,0.45)]"
    >
      {/* 钉住的时候这一整块用 position: fixed 贴在视口里——之前内容
          比屏幕高，用 flex 居中会把上面顶出屏幕，标题被切掉；但内容
          比屏幕矮的话，居中才是让上下留白配平的正确做法。所以两头
          一起改：这里用 flex 居中撑满顶栏以下的可视高度，同时把每行
          的内边距、数字字号都收窄一档，保证四行加标题真的能一屏
          放下——放得下，居中撑满这件事才有意义。 */}
      <div
        ref={gridRef}
        className="relative min-h-[calc(100dvh-4rem)] flex items-center py-8"
      >
        <div className="max-w-6xl mx-auto w-full lg:grid lg:grid-cols-12 lg:gap-10">
          {/* 标题跟右边数字列表一起正常滚动，不再钉住——钉住会导致两边
              顶部只在刚进入这一屏时对得上，往下滚标题不动、数字往上滚，
              两边顶部立刻就错开了。第一行数字自己有上下内边距，文字是
              从内边距下面才开始的，标题这边没有内边距会直接从格子最
              顶上开始，所以标题也要加同样的上内边距，两边文字才会在
              同一条线上开始，滚动过程中也是同步移动、一直对齐。 */}
          <div className="lg:col-span-4 mb-10 lg:mb-0 pt-4 sm:pt-5">
            <h2 ref={headingRef} className="type-section text-[#0A0B0D] max-w-sm">
              系统交付，<br className="sm:hidden" />
              最终要被结果验证。
            </h2>
          </div>

          <div className="lg:col-span-8">
            {metrics.map((item, index) => (
              <div
                key={index}
                className="impact-metric-row relative py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-8 items-center"
              >
                {index < metrics.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="impact-divider absolute left-0 -bottom-px h-px w-full bg-[#DBDFE5]"
                  />
                )}
                <div className="lg:col-span-3">
                  <span
                    className="impact-metric-number type-number text-4xl font-normal text-[#0E7C3D] sm:text-5xl lg:text-6xl"
                    data-final={item.num}
                  >
                    {item.num}
                  </span>
                </div>
                <div className="lg:col-span-4">
                  <h3 className="text-2xl sm:text-3xl lg:text-[2rem] font-semibold text-[#0A0B0D] tracking-[-0.02em]">
                    {item.title}
                  </h3>
                </div>
                <div className="impact-context text-base sm:text-lg lg:text-xl leading-relaxed lg:col-span-5 text-[#5B6472]">
                  {item.context}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 数字文字全部显现后，紧接着在同一个钉住的画面上盖一层随机
            铺开的黑色像素块，直接完成到下一板块（深色）的转场——铺在
            这里而不是另起一段普通滚动区域，画面才不会"先滚走一段空白
            再变黑"。GSAP 的 pin 是靠给这一层的父元素加 transform 实现
            的，transform 会让 fixed 定位的子元素也只相对这个父元素
            定位（CSS 规范如此），所以这里没法用 fixed 直接铺满视口——
            改用"满宽出血"的老办法：left/right 50% 配合负的视口宽度
            margin，把方块层撑出父元素本来那圈左右内边距，盖住整个
            视口宽度。 */}
        <div
          ref={pixelGridRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 right-1/2 z-10"
          style={{
            width: '100vw',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            top: 0,
            // 底边多探出去几个 px：pin 是靠给父元素加 transform 做的，
            // 父元素高度（100dvh 换算出来）经常是带小数的，跟 pin
            // 占位用的整数高度对不上，交界处会露一条几乎看不见但很
            // 扎眼的浅色细线。方块层的最后一排本来就是纯色块，往下
            // 多铺一点点盖过这条缝，不会露出破绽。
            bottom: -4,
          }}
        />
      </div>
    </section>
  );
};
