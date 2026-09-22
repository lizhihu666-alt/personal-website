import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
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

export default function App() {
  // Navigation & Mode state
  const [currentMode, setCurrentMode] = useState<AppMode>('home');
  const [transitioningTo, setTransitioningTo] = useState<'work' | 'life' | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // Independent scroll position memories
  const scrollPositions = useRef<{ work: number; life: number }>({ work: 0, life: 0 });

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

  // Triggered when user selects Work or Life from the Home entrance (plays animation)
  const handleChooseModeFromHome = (target: 'work' | 'life') => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCurrentMode(target);
      updateUrlHistory(target);
      restoreScroll(target);
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
    <ClickSpark sparkColor="#34D378" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
      <div className="min-h-dvh bg-[#0A0B0D] flex flex-col font-sans selection:bg-[#232A33] selection:text-white">
        {/* Top Header Navigation (Unified across entire portfolio) */}
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
