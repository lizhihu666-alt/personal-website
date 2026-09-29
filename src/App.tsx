import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { AppMode } from './types';
import { Header } from './components/navigation/Header';
import { HomeHero } from './components/home/HomeHero';
import { SceneTransition } from './components/character/SceneTransition';
import { WorkResumeModal } from './components/work/WorkResumeModal';
import { ReadingProgressNav } from './components/navigation/ReadingProgressNav';
import ClickSpark from './components/effects/ClickSpark';

// 按需加载：Work 页包含 three.js 3D 场景，Life 页体积也不小。
// 首页不再把这些代码一起下载，首屏更快；进入对应模式时再加载。
const WorkView = lazy(() =>
  import('./components/work/WorkView').then((module) => ({ default: module.WorkView }))
);
const LifeView = lazy(() =>
  import('./components/life/LifeView').then((module) => ({ default: module.LifeView }))
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
  // Navigation & Mode state
  const [currentMode, setCurrentMode] = useState<AppMode>('home');
  const [transitioningTo, setTransitioningTo] = useState<'work' | 'life' | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // Independent scroll position memories
  const scrollPositions = useRef<{ work: number; life: number }>({ work: 0, life: 0 });

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
      const applyTarget = () => window.scrollTo({ top: targetY, behavior: 'instant' });

      applyTarget();
      requestAnimationFrame(applyTarget);
      if (targetY > 0) {
        // 视图是懒加载的，等模块真正挂载完成后再校正一次滚动位置
        window.setTimeout(applyTarget, 160);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
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
        window.scrollTo({ top: 0, behavior: 'instant' });
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

        {/* Main View Area */}
        <div className="flex-1 w-full">
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
                <LifeView />
              </div>
            )}
          </Suspense>
        </div>

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
