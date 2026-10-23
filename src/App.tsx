import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import Lenis from 'lenis';
import { AppMode } from './types';
import { Header } from './components/navigation/Header';
import { HomeHero } from './components/home/HomeHero';
import { SceneTransition } from './components/character/SceneTransition';
import { WorkResumeModal } from './components/work/WorkResumeModal';
import { ReadingProgressNav } from './components/navigation/ReadingProgressNav';
import ClickSpark from './components/effects/ClickSpark';
import { LoadingScreen } from './components/effects/LoadingScreen';
import { gsap, ScrollTrigger, isReducedMotion } from './utils/gsapSetup';

// 首页背景的 WebGPU 代码体积大，加载页播放期间先在后台取回来。
void import('./components/effects/AeroShards');

// 按需加载：Work 页包含 three.js 3D 场景，Life 页体积也不小。
// 首页不再把这些代码一起下载，首屏更快；进入对应模式时再加载。
const WorkView = lazy(() =>
  import('./components/work/WorkView').then((module) => ({ default: module.WorkView }))
);
// 生活页暂时是「施工中」占位页；原来的完整版本还留在 components/life/LifeView.tsx。
const LifeView = lazy(() =>
  import('./components/life/LifeComingSoon').then((module) => ({ default: module.LifeComingSoon }))
);

// 首页"上班的我/下班的我"卡片跳转的 View Transition 共享元素名——
// 卡片标题跟目的地 Hero 大标题共用同一个名字，浏览器负责把两者的
// 位置/大小/像素做插值变形。
const DOOR_MORPH_NAME = 'door-hero-morph';

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
    updateCallbackDone: Promise<void>;
    finished: Promise<void>;
  };
};

export default function App() {
  // 全站唯一一次加载页：人脸<->LEO 变形循环播完之前，下面整棵应用树都
  // 不挂载——不是叠在首页上面的角标动效，是真正的开场门槛。
  // reduced-motion 时直接跳过，不显示这一屏。
  const [isLoading, setIsLoading] = useState(() => !isReducedMotion());

  // Navigation & Mode state
  const [currentMode, setCurrentMode] = useState<AppMode>('home');
  const [transitioningTo, setTransitioningTo] = useState<'work' | 'life' | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // Independent scroll position memories
  const scrollPositions = useRef<{ work: number; life: number }>({ work: 0, life: 0 });

  // 指向下面那个 Lenis 平滑滚动实例——首页/职业页/生活页之间切换时
  // 强制跳转滚动位置（restoreScroll、View Transition 落点归零）必须
  // 经过它的 scrollTo，不能直接用原生 window.scrollTo：Lenis 自己
  // 维护一份"虚拟"滚动位置并在每帧 raf 里用它去驱动真实 scrollY，如果
  // 绕开它直接改 scrollY，它下一帧会把这次改动当成外部干扰，按自己
  // 记的旧目标位置纠偏跳回去——表现出来就是页面切换那一下滚动位置
  // 跳变/错位，紧接着地跟 GSAP ScrollTrigger 的 pin 进度对不上，方法论
  // 线条区那种钉住的滚动动画就会在残留的错误进度上短暂渲染出上一屏
  // 内容叠加的画面。
  const lenisRef = useRef<Lenis | null>(null);
  const syncScrollTo = (top: number) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(top, { immediate: true });
    } else {
      window.scrollTo({ top, behavior: 'instant' });
    }
  };

  // 记录本次会话里 work/life 懒加载模块是不是已经真正渲染成功过一次。
  // React.lazy 首次渲染必然会先 Suspense 挂起一拍（哪怕模块早就用
  // import() 预取过，Promise resolve 也至少要等一个微任务），flushSync
  // 没法把这一拍抹掉；但只要成功渲染过一次，同一个 lazy 组件之后再
  // 挂载就不会再挂起了。View Transition 卡片变形要求目的地标题在
  // flushSync 这一次提交里就同步出现在 DOM 里，所以只在"这个模式这次
  // 会话已经加载过"时才走变形，否则退回原来那套小人走路转场——保证
  // 变形动画永远不会撞上一个空的 Suspense fallback。
  const loadedModesRef = useRef<Set<'work' | 'life'>>(new Set());
  const skipWorkHeroIntroRef = useRef(false);
  // 浏览器同一时间只能有一个 View Transition 在跑，重复调用会直接把
  // 前一个中止掉——按钮点击后到变形动画收尾之间这段时间上锁，防止
  // 手快连点两下首页卡片时撞车。
  const viewTransitionInFlightRef = useRef(false);

  useEffect(() => {
    if (currentMode === 'work' || currentMode === 'life') {
      loadedModesRef.current.add(currentMode);
    }
  }, [currentMode]);

  // 全站滚动平滑层：Work 页那几处钉住动画（Hero 覆盖、成果数字揭示、
  // 方法论线条、项目横滑）都是 GSAP ScrollTrigger 的 scrub:true，直接
  // 1:1 跟着原生 scrollY 走——原生滚轮/触控板本身不是连续平滑的（一截
  // 一截地跳），这些毛刺会原封不动地传导到动画上，观感发涩。Lenis 在
  // 原生滚动事件和 scrollY 之间加一层惯性缓动，ScrollTrigger 只监听
  // Lenis 磨平之后的滚动值，所有 scrub 动画就都跟着丝滑，不用逐个组件
  // 改。reduced-motion 时完全不启用，保留浏览器原生的即时滚动响应。
  useEffect(() => {
    if (isReducedMotion()) return;

    const lenis = new Lenis();
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenisRef.current = null;
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  // 页面之间的吸附：滚动停下后，如果离某个板块的起点不远，就轻轻吸过去，避免一下滑过头。
  // 只在职业页、非纯触屏设备上启用（手机原生触摸滚动不要打断）；方法板块的钉住动画内部
  // 保持自由滚动，只吸它的起点和终点；比一屏高的板块（比如展开了经历）中间不吸。
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis || currentMode !== 'work') return;
    // 只排除纯触屏设备；带触屏的笔记本主指针常被判成 coarse，不能用 (pointer: fine) 判断。
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    const SECTION_IDS = [
      'work-hero',
      'work-impact',
      'work-projects',
      'work-experience',
      'work-method-trace',
      'work-about',
      'work-contact',
      'work-motto',
    ];
    let timer = 0;
    let snapping = false;

    const getPoints = () => {
      const vh = window.innerHeight;
      const points: number[] = [];
      let freeStart = 0;
      let freeEnd = 0;
      SECTION_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.offsetTop;
        const bottomAligned = top + el.offsetHeight - vh;
        points.push(top);
        if (el.offsetHeight > vh * 1.2) points.push(bottomAligned);
        if (id === 'work-method-trace') {
          freeStart = top + vh * 0.15;
          freeEnd = bottomAligned - vh * 0.15;
        }
      });
      points.push(document.documentElement.scrollHeight - vh);
      return { points, freeStart, freeEnd };
    };

    // 上一次停稳的位置：用来判断这次是往下还是往上滚。
    let settledY = lenis.scroll;
    let prevY = lenis.scroll;
    let pending = false;

    const snap = () => {
      if (snapping || lenis.isStopped) return;
      const y = lenis.scroll;
      const vh = window.innerHeight;
      const { points, freeStart, freeEnd } = getPoints();
      if (y > freeStart && y < freeEnd) {
        settledY = y;
        return;
      }
      const sorted = [...points].sort((x, z) => x - z);
      const moved = y - settledY;
      let target = sorted[0];
      sorted.forEach((point) => {
        if (Math.abs(point - y) < Math.abs(target - y)) target = point;
      });

      // 这次明显往某个方向滚了（超过 12px）：不回头，直接去那个方向的下一个板块起点，
      // 一次滚动手势就翻一页；只有滚得很少时才回到原来的位置。
      if (Math.abs(moved) > 12) {
        const ahead =
          moved > 0
            ? sorted.find((point) => point > y + 2)
            : [...sorted].reverse().find((point) => point < y - 2);
        if (ahead !== undefined && Math.abs(ahead - y) <= vh * 1.25) target = ahead;
      }

      if (Math.abs(target - y) < 2 || Math.abs(target - y) > vh * 1.25) {
        settledY = y;
        return;
      }
      snapping = true;
      lenis.scrollTo(target, {
        duration: 0.7,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        onComplete: () => {
          snapping = false;
          settledY = lenis.scroll;
          prevY = lenis.scroll;
        },
      });
    };

    const onScroll = () => {
      if (snapping) {
        prevY = lenis.scroll;
        return;
      }
      // 一次新的滚动手势开始时，把它开始前的位置记成「上一次停稳的位置」，
      // 之后用它判断这次是往下还是往上。
      if (!pending) {
        settledY = prevY;
        pending = true;
      }
      prevY = lenis.scroll;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        pending = false;
        snap();
      }, 220);
    };
    lenis.on('scroll', onScroll);

    return () => {
      window.clearTimeout(timer);
      lenis.off('scroll', onScroll);
    };
  }, [currentMode]);

  // 1. Initial URL detection (direct link to /work or #work skips opening animation)
  useEffect(() => {
    const parseUrlMode = (): AppMode => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (path.includes('/work') || hash.includes('#work')) {
        return 'work';
      }
      if (path.includes('/life') || hash.includes('#life')) {
        return 'life';
      }
      return 'home';
    };

    const initialMode = parseUrlMode();
    if (initialMode !== 'home') {
      setCurrentMode(initialMode);
    }

    // Handle browser back / forward navigation
    const handlePopState = () => {
      const detected = parseUrlMode();
      setCurrentMode(detected);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Update URL and browser history smoothly
  const updateUrlHistory = (mode: AppMode) => {
    const newHash = mode === 'home' ? '' : `#${mode}`;
    const newUrl = mode === 'home' ? '/' : `/${mode}`;
    
    // In iframe or sandboxed environments, history.pushState with hash is safe and preserves back button
    try {
      if (mode === 'home') {
        window.history.pushState({ mode: 'home' }, '', window.location.pathname);
      } else {
        window.history.pushState({ mode }, '', newHash || newUrl);
      }
    } catch {
      // Fallback for sandboxed hash
      window.location.hash = newHash;
    }
  };

  // Scroll restoration handler
  const saveCurrentScroll = (mode: AppMode) => {
    if (mode === 'work' || mode === 'life') {
      scrollPositions.current[mode] = window.scrollY;
    }
  };

  const restoreScroll = (mode: AppMode) => {
    if (mode === 'work' || mode === 'life') {
      const targetY = scrollPositions.current[mode] || 0;
      const applyTarget = () => syncScrollTo(targetY);

      applyTarget();
      requestAnimationFrame(applyTarget);
      if (targetY > 0) {
        // 视图是懒加载的，等模块真正挂载完成后再校正一次滚动位置
        window.setTimeout(applyTarget, 160);
      }
    } else {
      syncScrollTo(0);
    }
  };

  // 从首页卡片直接做 View Transition 变形跳转——卡片标题原地"长大"
  // 变成目的地的 Hero 大标题。要求目的地模块这次会话已经真正渲染过
  // 一次（见 loadedModesRef 的注释），否则没有配对元素可变形。
  const runDoorMorphTransition = (target: 'work' | 'life', sourceEl: HTMLElement) => {
    const targetTitleId = target === 'work' ? 'work-hero-title' : 'life-hero-title';
    viewTransitionInFlightRef.current = true;
    sourceEl.style.viewTransitionName = DOOR_MORPH_NAME;
    if (target === 'work') skipWorkHeroIntroRef.current = true;

    const cleanup = () => {
      sourceEl.style.viewTransitionName = '';
      document.getElementById(targetTitleId)?.style.removeProperty('view-transition-name');
      skipWorkHeroIntroRef.current = false;
      viewTransitionInFlightRef.current = false;
    };

    const vtDocument = document as ViewTransitionDocument;
    const transition = vtDocument.startViewTransition!(() => {
      flushSync(() => {
        setCurrentMode(target);
        updateUrlHistory(target);
        // 变形的落点是 Hero 大标题，它只在页面顶部——不用 restoreScroll()
        // 记住的那个深处滚动位置（那是给"直接切换"用的），这次是从
        // 首页新"走进来"，就该落在目的地页面的最顶上。
        syncScrollTo(0);
      });

      const targetEl = document.getElementById(targetTitleId);
      if (targetEl) {
        targetEl.style.viewTransitionName = DOOR_MORPH_NAME;
      } else {
        // 这次目的地标题没能同步出现在 DOM 里（理论上不应该发生，因为
        // 调用方已经检查过 loadedModesRef），没有配对元素时浏览器会
        // 自动退化成普通的整页交叉淡入淡出，不算错误，只是清掉源头的
        // 变形名字，避免它孤零零地播一次没有目标的动画。
        sourceEl.style.viewTransitionName = '';
      }
    });

    // View Transition 在一些边缘情况下会被浏览器整个中止（标签页切到
    // 后台、连点太快撞上下一次调用等），三个生命周期 Promise 都会
    // reject——这是浏览器自己的降级行为，不是逻辑错误，全部接住避免
    // 控制台冒出未处理的 Promise rejection。清理逻辑不关心成功还是
    // 中止，两种情况都要执行一次。
    transition.updateCallbackDone.catch(() => {});
    transition.ready.catch(() => {});
    transition.finished.catch(() => {}).finally(cleanup);
  };

  // Triggered when user selects Work or Life from the Home entrance (plays animation)
  const handleChooseModeFromHome = (target: 'work' | 'life', sourceEl?: HTMLElement | null) => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCurrentMode(target);
      updateUrlHistory(target);
      restoreScroll(target);
      return;
    }

    const supportsViewTransition = typeof (document as ViewTransitionDocument).startViewTransition === 'function';
    if (
      supportsViewTransition &&
      sourceEl &&
      loadedModesRef.current.has(target) &&
      !viewTransitionInFlightRef.current
    ) {
      runDoorMorphTransition(target, sourceEl);
      return;
    }

    setTransitioningTo(target);
  };

  // Triggered when animation completes
  const handleTransitionComplete = () => {
    if (transitioningTo) {
      const next = transitioningTo;
      setTransitioningTo(null);
      setCurrentMode(next);
      updateUrlHistory(next);
      restoreScroll(next);
    }
  };

  // Triggered when user switches modes via Top Nav Header
  const handleDirectModeSwitch = (mode: AppMode) => {
    if (mode === currentMode) return;

    saveCurrentScroll(currentMode);
    setCurrentMode(mode);
    updateUrlHistory(mode);
    restoreScroll(mode);
  };

  if (isLoading) {
    return <LoadingScreen onDone={() => setIsLoading(false)} />;
  }

  return (
    <ClickSpark
      sparkColor={currentMode === 'life' ? '#4F8CFF' : '#34D378'}
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <div className="min-h-dvh bg-[#0A0B0D] flex flex-col font-sans selection:bg-[#232A33] selection:text-white">
        {/* Top Header Navigation：首页本身就是"职业/生活"这两个入口的选择界面，
            站点导航栏（项目/关于/联系、职业/生活切换）在这里没有目标可跳，
            跟首页那两个入口按钮重复，所以只在进入 work/life 之后才挂载。 */}
        {currentMode !== 'home' && (
          <Header
            currentMode={currentMode}
            onSelectMode={handleDirectModeSwitch}
            onOpenResume={() => setIsResumeModalOpen(true)}
            onOpenContact={() => {
              if (currentMode === 'work') {
                document.getElementById('work-contact')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                handleDirectModeSwitch('work');
                setTimeout(() => {
                  document.getElementById('work-contact')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
          />
        )}

        {/* 跳到主内容：只在键盘聚焦时显示，让键盘用户不必先 Tab 过导航和进度圆点。 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-[#34D378] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#0A0B0D]"
        >
          跳到主要内容
        </a>

        {/* Main View Area */}
        <main id="main-content" tabIndex={-1} className="flex-1 w-full outline-none">
          <Suspense fallback={<div className="min-h-[80vh] w-full" aria-hidden="true" />}>
            {currentMode === 'home' && (
              <HomeHero
                onChooseMode={handleChooseModeFromHome}
                isTransitioning={transitioningTo !== null}
              />
            )}

            {currentMode === 'work' && (
              <div className="animate-fadeIn">
                <WorkView
                  onOpenResume={() => setIsResumeModalOpen(true)}
                  onSwitchToLife={() => handleDirectModeSwitch('life')}
                  skipHeroIntro={skipWorkHeroIntroRef.current}
                />
              </div>
            )}

            {currentMode === 'life' && (
              <div className="animate-fadeIn">
                <LifeView onSwitchToWork={() => handleDirectModeSwitch('work')} />
              </div>
            )}
          </Suspense>
        </main>

        {/* Floating Reading Progress & Quick Section Jump Indicator */}
        <ReadingProgressNav currentMode={currentMode} />

        {/* Animated Choreographed Scene Transition Overlay */}
        {transitioningTo && (
          <SceneTransition
            targetMode={transitioningTo}
            onComplete={handleTransitionComplete}
            onCancel={() => setTransitioningTo(null)}
          />
        )}

        {/* Printable & Downloadable Resume Sheet Modal */}
        <WorkResumeModal
          isOpen={isResumeModalOpen}
          onClose={() => setIsResumeModalOpen(false)}
        />
      </div>
    </ClickSpark>
  );
}
