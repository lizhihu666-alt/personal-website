import React, { useRef, useLayoutEffect } from 'react';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';

export const WorkImpact: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.impact-metric-row',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.75,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'opacity,transform',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const metrics = [
    {
      num: '30%',
      label: 'ONBOARDING CYCLE REDUCTION',
      zh: '品牌准入全链路周期缩短',
      context: '重构资质预审、报关合规与商品主数据映射流程，部分核心链路准入提速达 60%。',
    },
    {
      num: '10+',
      label: 'BRANDS ZERO-DOWNTIME MIGRATION',
      zh: '出海品牌核心系统平稳割接',
      context: '在第三方 API 突然废弃危机中实施 Shopify App 替代过渡与数据对账，客户侧零感知。',
    },
    {
      num: '9',
      label: 'REUSABLE SOP & WORKFLOW FRAMEWORKS',
      zh: '沉淀端到端可复用系统解决方案',
      context: '输出覆盖品牌准入、逆向退换货、多仓配发库存对账与 API 异常重试的标准化机制。',
    },
    {
      num: '$2M+',
      label: 'QUARTERLY PEAK GMV SUPPORTED',
      zh: '支撑海外大促单季度峰值 GMV',
      context: '高韧性库存履约中台承受高频并发查询与下单冲击，保障海外电商大促期间零中断。',
    },
  ];

  return (
    <section
      id="work-impact"
      ref={containerRef}
      className="relative py-20 sm:py-28 px-6 sm:px-10 lg:px-16 border-b border-[#232A33] bg-[#0A0B0D]"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Marker */}
        <div className="flex items-center justify-between pb-5 border-b border-[#232A33] mb-12 sm:mb-16">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold tracking-widest text-[#5B89FF] bg-[#002FA7]/10 px-2.5 py-1 rounded-md uppercase">
              IMPACT & OUTCOMES
            </span>
            <span className="text-xs font-mono tracking-widest text-[#A8B0BC] uppercase">
              TANGIBLE BUSINESS OUTCOMES
            </span>
          </div>

          <span className="text-xs font-mono tracking-widest text-[#A8B0BC] uppercase">
            MEASURABLE VALUE DELIVERED
          </span>
        </div>

        {/* Section Sub-heading */}
        <div className="mb-12 sm:mb-16 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#F3F5F8] leading-tight">
            用可衡量的真实数字，
            <br />
            量化每一次系统交付的<span className="text-[#5B89FF] italic font-semibold">商业价值</span>。
          </h2>
        </div>

        {/* Big Numbers Grid */}
        <div className="border-t border-[#232A33]">
          {metrics.map((item, index) => (
            <div
              key={index}
              className="impact-metric-row py-8 sm:py-12 border-b border-[#232A33] grid grid-cols-1 lg:grid-cols-12 gap-6 items-baseline group hover:bg-black/[0.015] transition-colors px-2 sm:px-4"
            >
              {/* Metric Number */}
              <div className="lg:col-span-4">
                <span className="font-mono text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tighter text-[#F3F5F8] group-hover:text-[#5B89FF] transition-colors">
                  {item.num}
                </span>
              </div>

              {/* Metric Description */}
              <div className="lg:col-span-4">
                <div className="text-xs font-mono tracking-widest text-[#A8B0BC] uppercase mb-1">
                  {item.label}
                </div>
                <div className="text-base sm:text-lg font-semibold text-[#F3F5F8]">
                  {item.zh}
                </div>
              </div>

              {/* Metric Context */}
              <div className="lg:col-span-4 text-sm text-[#A8B0BC] leading-relaxed">
                {item.context}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
