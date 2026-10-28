import React, { useRef, useLayoutEffect } from 'react';
import { gsap, SplitText, isReducedMotion } from '../../utils/gsapSetup';
import { revealLines } from '../../utils/textReveal';
import { PixelCoverCanvas, usePixelCover } from './PixelCover';

// 四个成果数字不再钉住屏幕、逐行靠滚动来揭示（原来要滚约 2,100px 才看全）。
// 现在板块进入视野时一次性播放：四行依次浮现，数字同时从 0 数到目标值，
// 约 1.6 秒播完，滚动全程保持自由，整块一屏内就能看全。
const REVEAL_ROW_STAGGER = 0.28;

export const WorkImpact: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLCanvasElement>(null);
  // 滚到底后被方块盖成下一个板块（项目，深色）的颜色。
  usePixelCover(gridRef, coverRef, '#0A0B0D', undefined, 6);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    let revertHeading = () => {};
    const splits: InstanceType<typeof SplitText>[] = [];

    const ctx = gsap.context(() => {
      revertHeading = revealLines(headingRef.current, {
        trigger: containerRef.current,
        start: 'top 82%',
      });

      const rows = gsap.utils.toArray<HTMLElement>('.impact-metric-row');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 72%',
          once: true,
        },
      });

      // 手机上不拆行遮罩：SplitText 会把没有空格的中文整句当成一个词，窄屏上整句被推到下一行，
      // 留下「从 SaaS」这样的孤行。手机直接整块淡入上移。
      const compact = window.innerWidth < 768;

      rows.forEach((row, index) => {
        const number = row.querySelector<HTMLElement>('.impact-metric-number');
        const title = row.querySelector<HTMLElement>('h3');
        const context = row.querySelector<HTMLElement>('.impact-context');
        if (!number || !title || !context) return;

        const at = index * REVEAL_ROW_STAGGER;
        gsap.set(number, { opacity: 0 });
        tl.to(number, { opacity: 1, duration: 0.3, ease: 'none' }, at);

        if (compact) {
          gsap.set([title, context], { opacity: 0, y: 14 });
          tl.to(title, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, at);
          tl.to(context, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, at + 0.06);
        } else {
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
          gsap.set(titleSplit.lines, { yPercent: 120 });
          gsap.set(contextSplit.lines, { yPercent: 120 });
          tl.to(
            titleSplit.lines,
            { yPercent: 0, duration: 0.7, stagger: 0.04, ease: 'power3.out' },
            at
          );
          tl.to(
            contextSplit.lines,
            { yPercent: 0, duration: 0.7, stagger: 0.03, ease: 'power3.out' },
            at + 0.06
          );
        }

        // 分割线跟这一行同一个节奏淡入。初始隐藏放在这里用 gsap.set，
        // 而不是写死在 JSX 的行内 style 上——reduced motion 时这段 effect
        // 不会跑，写死的 opacity:0 会让分割线永远不出现。
        const divider = row.querySelector<HTMLElement>('.impact-divider');
        if (divider) {
          gsap.set(divider, { opacity: 0 });
          tl.to(divider, { opacity: 1, duration: 0.4, ease: 'none' }, at);
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
            duration: 0.9,
            ease: 'power2.out',
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
    }, containerRef);

    return () => {
      revertHeading();
      splits.forEach((split) => split.revert());
      ctx.revert();
    };
  }, []);

  const metrics = [
    {
      num: '40%',
      title: '品牌上线周期缩短',
      context: '入驻 SOP + 招商 Pipeline，6 个月内平均缩短',
    },
    {
      num: '20+',
      title: '品牌平稳过渡',
      context: '表格 → 外采 SaaS → 自研系统，逐个把握切流',
    },
    {
      num: '6套',
      title: '可复用运营方案',
      context: '上线 4 个月沉淀方案，成功跑通 6 套',
    },
    {
      num: '$2M',
      title: '迁站后单季度 GMV',
      context: '端到端完成 6 个品牌 API 集成，0 起重大事故',
    },
  ];

  return (
    <section
      id="work-impact"
      ref={containerRef}
      className="relative px-6 sm:px-10 lg:px-16 bg-[#F3F5F8] shadow-[0_-40px_60px_-30px_rgba(0,0,0,0.45)]"
    >
      <div
        ref={gridRef}
        className="relative flex items-center py-12 md:min-h-dvh md:py-8"
      >
        <div className="mx-auto w-full max-w-6xl lg:grid lg:grid-cols-12 lg:gap-10">
          <div className="mb-10 pt-4 sm:pt-5 lg:col-span-4 lg:mb-0">
            <h2 ref={headingRef} className="type-section text-[#0A0B0D]">
              中台落地，<br />
              <span className="text-[#0E7C3D]">用结果说话</span>
            </h2>
            <p className="type-lead mt-6 max-w-[62ch] text-[#5B6472]">
              把中台建设，落成可衡量的业务结果
            </p>
          </div>

          <div className="lg:col-span-8">
            {metrics.map((item, index) => (
              <div
                key={index}
                className="impact-metric-row relative grid grid-cols-1 items-center gap-2 py-6 sm:py-7 lg:grid-cols-12 lg:gap-8"
              >
                {index < metrics.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="impact-divider absolute -bottom-px left-0 h-px w-full bg-[#DBDFE5]"
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
                <div className="lg:col-span-9">
                  <h3 className="text-2xl font-semibold tracking-[-0.02em] text-[#0A0B0D] sm:text-3xl lg:text-[2rem]">
                    {item.title}
                  </h3>
                  <div className="impact-context mt-1.5 text-pretty text-base leading-relaxed text-[#5B6472] sm:text-lg">
                    {item.context.split('\n').map((part, i) => (
                      <React.Fragment key={part}>
                        {i > 0 && <br />}
                        {part}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <PixelCoverCanvas ref={coverRef} background="#F3F5F8" cue={{ label: '下滑查看项目', tone: 'light' }} />
      </div>
    </section>
  );
};
