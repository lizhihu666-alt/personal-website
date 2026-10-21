import React, { useEffect, useRef, useState } from 'react';
import AeroShards from '../effects/AeroShards';
import Topography from '../effects/Topography';
import { ArrowRight } from 'lucide-react';

interface HomeHeroProps {
  onChooseMode: (mode: 'work' | 'life', sourceEl?: HTMLElement | null) => void;
  isTransitioning?: boolean;
}

// 桌面端只挂一份贯穿全屏的 AeroShards，靠 shardColor/crossColor 表达左右
// 分区的差异：每个碎片按自己所在的屏幕水平位置，在两个颜色之间二选一——
// 在 AeroShards.jsx 的着色器里用 ndc.x 与 0 的关系做了近乎硬切的判断，
// 所以视觉上就是"越过中间分界线，颜色从绿变蓝"，而不是渐变过渡。
// 跟职业/生活页正文里用的主色调对齐（#34D378 / #4F8CFF），而不是自己
// 另挑一套偏暗的色号——不然背景和标题、CTA 的强调色对不上，显得发暗。
const WORK_COLOR = '#34D378';
const LIFE_COLOR = '#4F8CFF';

// 这两个只在桌面端（md+）生效，自己调整数值就行——改完存盘，Vite 会
// 热更新，不用重启。数值是 Tailwind 任意值，写成完整字符串常量只是为了
// 让编译器能扫描到，不要写成模板字符串插值（那样会被 Tailwind 的静态
// 扫描漏掉，导致样式不生效）。
// 标题距离顶部的距离，越大标题越往下。
const HEADLINE_TOP_OFFSET = 'md:pt-42';
// 两张卡片内容相对居中位置向下偏移的距离，'md:translate-y-0' 就是完全
// 居中，数值越大越往下。
const CARD_VERTICAL_OFFSET = 'md:translate-y-[25vh]';

const AERO_BASE = {
  backgroundColor: '#0A0B0D',
  accentColor: '#ffffff',
  placement: 'full',
  effect: 'none',
  flow: 'stream',
  material: 'pearl',
  detail: 'balanced',
  scale: 1,
  spread: 1,
  depth: 1,
  speed: 0.8,
  spin: 1,
  interaction: 'none',
  density: 1.5,
  shardSize: 1.1,
  stretch: 1,
  turbulence: 1,
  glow: 1.35,
  edgeSoftness: 2,
  bloom: 0.7,
  grain: 0.05,
  chromaticAberration: 0.0075,
  transitionDuration: 1,
  interactionRadius: 1.5,
  interactionStrength: 0.5,
  rippleIntensity: 1,
  holdToGather: true,
} as const;

// 桌面端把两份 AeroShards 叠成一块共享背景横跨两个分区；移动端两个分区
// 各自独立堆叠、没有"接缝"可言，所以干脆只挂一份对应模式的实例。用
// matchMedia 而不是纯 CSS 隐藏，是为了避免同时挂载四份 GPU 画布。
// AeroShards 依赖 WebGPU。浏览器太旧、关了硬件加速或显卡在黑名单里时 navigator.gpu 不存在，
// 或者初始化中途报错，这时候背景会整片空白。统一用 gpuFailed 切到 CSS 渐变兜底。
// 有的显卡/驱动上 WebGPU 初始化成功，但之后创建贴图、提交绘制时报校验错误，画面就一直是黑的，
// 而且动画库不会把它当成失败。这里给页面里创建的 GPUDevice 挂一个 uncapturederror 监听：
// 第一条错误原文打到控制台（方便定位是哪一步），并通知页面切换到兜底背景。
type GpuErrorListener = (error: unknown) => void;
const gpuErrorListeners = new Set<GpuErrorListener>();
let gpuErrorHookInstalled = false;

const installGpuErrorHook = () => {
  if (gpuErrorHookInstalled || typeof window === 'undefined') return;
  const adapterProto = (window as unknown as { GPUAdapter?: { prototype: Record<string, unknown> } }).GPUAdapter
    ?.prototype;
  const original = adapterProto?.requestDevice as ((...args: unknown[]) => Promise<EventTarget>) | undefined;
  if (!adapterProto || !original) return;
  gpuErrorHookInstalled = true;

  adapterProto.requestDevice = async function (this: unknown, ...args: unknown[]) {
    const device = await original.apply(this, args);
    let reported = false;

    // 记录这个设备创建过的所有贴图（名字/尺寸/格式/用途），出错时一起打印，
    // 动画库把最初那条创建失败的错误吞掉了，靠这个反推是哪一张贴图不合法。
    const textures: string[] = [];
    const rawDevice = device as unknown as {
      createTexture?: (descriptor: Record<string, unknown>) => unknown;
      limits?: { maxTextureDimension2D?: number };
    };
    const createTexture = rawDevice.createTexture;
    if (createTexture) {
      rawDevice.createTexture = function (descriptor: Record<string, unknown>) {
        textures.push(
          JSON.stringify({
            label: descriptor.label,
            size: descriptor.size,
            format: descriptor.format,
            usage: descriptor.usage,
            sampleCount: descriptor.sampleCount,
            mipLevelCount: descriptor.mipLevelCount,
          })
        );
        return createTexture.call(this, descriptor);
      };
    }

    device.addEventListener('uncapturederror', (event) => {
      if (reported) return;
      reported = true;
      const error = (event as unknown as { error?: { message?: string } }).error;
      console.error('[home] WebGPU 报错（第一条）：', error?.message ?? error);
      console.error(
        '[home] 已创建的贴图（maxTextureDimension2D=' + rawDevice.limits?.maxTextureDimension2D + '）：',
        textures.join(" ; ")
      );
      gpuErrorListeners.forEach((listener) => listener(error));
    });
    return device;
  };
};

// 必须在 AeroShards 创建设备之前装上（子组件的 effect 比父组件先跑），所以放在模块加载时执行。
installGpuErrorHook();

const useGpuFailed = () => {
  const [failed, setFailed] = useState(
    () => typeof navigator !== 'undefined' && !('gpu' in navigator)
  );
  const markFailed = useRef((error?: unknown) => {
    // 留一条日志，方便排查是哪一步失败的（F12 控制台里能看到）。
    console.error('[home] 背景动画初始化失败，已切换为静态柔光：', error);
    setFailed(true);
  }).current;

  useEffect(() => {
    installGpuErrorHook();
    const listener: GpuErrorListener = (error) => markFailed(error);
    gpuErrorListeners.add(listener);
    return () => {
      gpuErrorListeners.delete(listener);
    };
  }, [markFailed]);

  // 初始化既不成功也不报错（卡在编译着色器、设备丢失之类）时，8 秒后也算失败，避免一直是黑底。
  useEffect(() => {
    if (failed) return;
    const timer = window.setTimeout(() => {
      if (!document.querySelector('.aero-shards[data-ready="true"]')) {
        markFailed(new Error('AeroShards 8 秒内没有渲染出第一帧'));
      }
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [failed, markFailed]);

  return [failed, markFailed] as const;
};

// 兜底背景：WebGPU 画布在部分机器上（驱动问题）创建不出贴图，这时改用职业页同款的 WebGL
// 等高线动画（ogl），左绿右蓝对应两个分区；底下再垫一层柔光，万一 WebGL 也不可用也不至于黑屏。
const TOPO_PROPS = {
  speed: 0.35,
  morphAmount: 2.0,
  morphSpeed: 0.05,
  bands: 2.0,
  thickness: 0.01,
  scale: 1.8,
  pixelSize: 1.0,
  glow: 0.5,
  colorMode: 'elevation' as const,
  contrast: 3.0,
  brightness: 1.0,
  fillBands: false,
  opacity: 0.7,
  grain: true,
  grainIntensity: 0.05,
  mouseInteraction: false,
};

const FallbackBackdrop: React.FC<{ side?: 'full' | 'work' | 'life' }> = ({ side = 'full' }) => {
  const work = 'radial-gradient(60% 55% at 28% 62%, rgba(52,211,120,0.22) 0%, transparent 70%)';
  const life = 'radial-gradient(60% 55% at 72% 62%, rgba(79,140,255,0.22) 0%, transparent 70%)';
  const background = side === 'work' ? work : side === 'life' ? life : `${work}, ${life}`;

  const green = <Topography lowColor="#0A0B0D" midColor="#0E7C3D" highColor="#34D378" {...TOPO_PROPS} />;
  const blue = <Topography lowColor="#0A0B0D" midColor="#2F6FED" highColor="#4F8CFF" {...TOPO_PROPS} />;

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="home-fallback-glow absolute inset-0" style={{ background }} />
      {side === 'full' ? (
        <>
          <div className="absolute inset-y-0 left-0 w-1/2">{green}</div>
          <div className="absolute inset-y-0 right-0 w-1/2">{blue}</div>
        </>
      ) : (
        <div className="absolute inset-0">{side === 'work' ? green : blue}</div>
      )}
    </div>
  );
};

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
};

// 悬停/聚焦门卡片时就提前拉取目标模块，用户真正点击时懒加载多半已经
// 命中缓存——纯预取，不渲染任何东西，跟下面的 View Transition 变形
// 机制互相独立，出错也不影响点击本身能正常跳转。
const prefetchWork = () => {
  import('../work/WorkView').catch(() => {});
};
const prefetchLife = () => {
  import('../life/LifeComingSoon').catch(() => {});
};

export const HomeHero: React.FC<HomeHeroProps> = ({
  onChooseMode,
  isTransitioning = false,
}) => {
  const workHeadingRef = useRef<HTMLHeadingElement>(null);
  const lifeHeadingRef = useRef<HTMLHeadingElement>(null);
  const isDesktop = useIsDesktop();
  const [gpuFailed, markGpuFailed] = useGpuFailed();

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#0A0B0D]">
      {/* Brand mark：叠在两个分区上面，纯展示，不挡下面按钮的点击。 */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-2 px-6 sm:px-10 pt-6 sm:pt-8 pointer-events-none">
        <span className="font-bold text-lg sm:text-xl tracking-tight text-[#F3F5F8]">Leo Hu</span>
        <span className="ml-1 text-sm text-[#C7CDD6] hidden sm:inline-block">/ 胡利致</span>
      </div>

      {/* 中间悬浮的标题——桌面端两个分区的卡片内容都改成了垂直居中，
          标题如果还留在正中间会跟卡片打架，所以桌面端不再用 items-center
          居中定位，改成贴近顶部（items-start + pt-28），跟下面居中的
          卡片内容错开。移动端两个分区各自只有半屏高，改回正常文档流
          （撑开高度，允许整页滚动），只有桌面端才用 absolute 叠加。 */}
      <div
        className={`relative md:absolute md:inset-0 z-20 flex items-center md:items-start justify-center px-6 pt-24 pb-10 md:pb-0 pointer-events-none ${HEADLINE_TOP_OFFSET}`}
      >
        <div className="text-center max-w-xl">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F3F5F8] leading-tight mb-4 [text-shadow:0_2px_24px_rgba(0,0,0,0.65)]">
            今天，你想认识哪一个我？
          </h1>
          <p className="text-sm sm:text-base text-[#D5DAE1] leading-relaxed max-w-xl mx-auto font-light [text-shadow:0_2px_16px_rgba(0,0,0,0.65)]">
            一个把复杂项目理顺的人，也是一个认真生活、喜欢不断折腾新东西的人。
          </p>
        </div>
      </div>

      {/* 双选分区：桌面端左右对半，移动端上下堆叠。 */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 md:min-h-dvh">
        {/* 桌面端共享背景：只挂一份贯穿全屏的 AeroShards，同一片碎片流
            飘过中线时颜色从工作绿变成生活蓝——不再是两份画布拼接，动画
            本身连续不断，只是颜色随位置切换。 */}
        {isDesktop && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            {gpuFailed ? (
              <FallbackBackdrop />
            ) : (
              <AeroShards {...AERO_BASE} onError={markGpuFailed} shardColor={WORK_COLOR} crossColor={LIFE_COLOR} />
            )}
          </div>
        )}

        {/* 中间的分界线：上下两端淡出，只在中段可见，标出两个分区的
            边界，同时不会把背景的交叉淡出切成生硬的两半。 */}
        <div
          className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px z-[5] pointer-events-none -translate-x-1/2"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.16) 15%, rgba(255,255,255,0.16) 85%, transparent 100%)',
          }}
        />

        {/* ================= LEFT: WORK ENTRANCE ================= */}
        <button
          id="home-work-door-btn"
          type="button"
          disabled={isTransitioning}
          onClick={() => onChooseMode('work', workHeadingRef.current)}
          onMouseEnter={prefetchWork}
          onFocus={prefetchWork}
          className="group relative z-10 flex flex-col items-center justify-center text-center p-8 sm:p-14 min-h-[65dvh] md:min-h-dvh overflow-hidden border-b md:border-b-0 border-[#1C2128] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#34D378]"
        >
          {/* 移动端各分区没有接缝可言，各挂一份单色实例即可。 */}
          {!isDesktop && (
            <div className="absolute inset-0 opacity-80">
              {gpuFailed ? (
                <FallbackBackdrop side="work" />
              ) : (
                <AeroShards {...AERO_BASE} onError={markGpuFailed} shardColor={WORK_COLOR} crossColor={WORK_COLOR} />
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.04] transition-colors duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0D] via-[#0A0B0D]/40 to-transparent" />

          <div className={`relative z-10 ${CARD_VERTICAL_OFFSET}`}>
            <h2
              ref={workHeadingRef}
              className="text-3xl sm:text-4xl font-bold text-[#F3F5F8] group-hover:text-[#34D378] transition-colors"
            >
              上班的我
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#C7CDD6] font-light">
              项目经历 · 作品集 · 简历
            </p>
            <div className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-[#34D378]">
              <span>进入职业页</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </div>
        </button>

        {/* ================= RIGHT: LIFE ENTRANCE ================= */}
        <button
          id="home-life-door-btn"
          type="button"
          disabled={isTransitioning}
          onClick={() => onChooseMode('life', lifeHeadingRef.current)}
          onMouseEnter={prefetchLife}
          onFocus={prefetchLife}
          className="group relative z-10 flex flex-col items-center justify-center text-center p-8 sm:p-14 min-h-[65dvh] md:min-h-dvh overflow-hidden border-t md:border-t-0 border-[#1C2128] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4F8CFF]"
        >
          {!isDesktop && (
            <div className="absolute inset-0 opacity-80">
              {gpuFailed ? (
                <FallbackBackdrop side="life" />
              ) : (
                <AeroShards {...AERO_BASE} onError={markGpuFailed} shardColor={LIFE_COLOR} crossColor={LIFE_COLOR} />
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.04] transition-colors duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0D] via-[#0A0B0D]/40 to-transparent" />

          <div className={`relative z-10 ${CARD_VERTICAL_OFFSET}`}>
            <h2
              ref={lifeHeadingRef}
              className="text-3xl sm:text-4xl font-bold text-[#F3F5F8] group-hover:text-[#4F8CFF] transition-colors"
            >
              下班的我
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#C7CDD6] font-light">
              兴趣爱好 · 摄影 · 旅行与生活
            </p>
            <div className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-[#4F8CFF]">
              <span>进入生活页</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </div>
        </button>
      </div>
    </main>
  );
};
