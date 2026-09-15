import React, { useEffect, useState, useRef } from 'react';
import { AppMode } from '../../types';
import { Briefcase, HeartHandshake, ArrowLeft, Download, Mail, X, ArrowUpRight } from 'lucide-react';

interface HeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onOpenResume?: () => void;
  onOpenContact?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onOpenResume,
  onOpenContact,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 菜单抽屉打开时：锁住背景滚动、把焦点送进抽屉、Esc 关闭、Tab 只在抽屉里循环；
  // 关闭时：恢复滚动位置，并把焦点还给“MENU”按钮。（与简历弹窗一致的可访问性行为）
  useEffect(() => {
    if (!isMenuOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const lockedScrollY = window.scrollY;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevWidth = body.style.width;
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${lockedScrollY}px`;
    body.style.width = '100%';

    const panel = menuPanelRef.current;
    const getFocusables = (): HTMLElement[] => {
      const list: HTMLElement[] = [];
      if (!panel) return list;
      panel
        .querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        .forEach((el) => {
          if (el.offsetParent !== null) list.push(el);
        });
      return list;
    };

    window.requestAnimationFrame(() => getFocusables()[0]?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const list = getFocusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      body.style.overflow = prevOverflow;
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.width = prevWidth;
      window.scrollTo({ top: lockedScrollY, behavior: 'instant' });
      const previous = previouslyFocusedRef.current;
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [isMenuOpen]);

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);

    const hasTarget = () => !!document.getElementById(id);

    // 目标章节不在当前视图里（例如在首页打开菜单、点的是 Work 的条目），
    // 就先切到 Work 模式；视图是懒加载的，等它挂载出来再定位。
    if (!hasTarget()) {
      onSelectMode('work');

      let ticks = 0;
      let corrections = 0;
      let cancel = () => {};
      const timer = window.setInterval(() => {
        ticks += 1;
        const el = document.getElementById(id);
        if (el) {
          // 切模式时会先还原上次的滚动位置，这里连续校正几次把它盖掉，
          // 确保最终停在目标章节而不是旧位置上。
          el.scrollIntoView({ behavior: 'instant' });
          corrections += 1;
          if (corrections >= 6) end();
          return;
        }
        if (ticks > 50) end();
      }, 60);

      // 校正期间如果用户自己滚动，立刻停手，不跟用户抢。
      const end = () => {
        window.clearInterval(timer);
        window.removeEventListener('wheel', cancel);
        window.removeEventListener('touchstart', cancel);
      };
      cancel = end;
      window.addEventListener('wheel', cancel, { passive: true });
      window.addEventListener('touchstart', cancel, { passive: true });
      return;
    }

    // 抽屉关闭时会先把页面滚动位置还原，所以等这一帧结束再滚动，避免两个动作互相打断。
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      })
    );
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-40 w-full backdrop-blur-md transition-colors duration-200 ${
          isScrolled
            ? 'bg-[#0A0B0D]/95 border-b border-[#232A33] shadow-xs'
            : 'bg-[#0A0B0D]/80 border-b border-[#232A33]/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-10 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo: Leo Hu */}
          <button
            id="nav-brand-logo"
            onClick={() => onSelectMode('home')}
            className="group flex items-center gap-2 text-left focus:outline-none py-1 shrink-0"
            aria-label="Back to Home"
          >
            <span className="font-bold text-lg sm:text-xl tracking-tight text-[#F3F5F8] group-hover:text-[#5B89FF] transition-colors whitespace-nowrap">
              Leo Hu
            </span>
            <span className="text-xs text-[#A8B0BC] font-mono tracking-tight hidden sm:inline-block">
              / 胡子
            </span>
            {currentMode !== 'home' && (
              <span className="text-xs text-[#A8B0BC] hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                <ArrowLeft className="w-3 h-3" />
                <span>首页</span>
              </span>
            )}
          </button>

          {/* Center: Mode Switcher Pill */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="bg-[#232A33]/80 p-1 rounded-full flex items-center border border-[#2B323C] shadow-xs">
              <button
                id="switcher-btn-work"
                onClick={() => onSelectMode('work')}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 focus:outline-none whitespace-nowrap ${
                  currentMode === 'work'
                    ? 'bg-[#002FA7] text-white shadow-xs font-semibold'
                    : 'text-[#A8B0BC] hover:text-[#F3F5F8] hover:bg-[#2B323C]'
                }`}
              >
                <Briefcase className={`w-3.5 h-3.5 ${currentMode === 'work' ? 'text-white' : 'text-[#A8B0BC]'}`} />
                <span className="hidden sm:inline">职业 · Work</span>
                <span className="sm:hidden">Work</span>
              </button>

              <button
                id="switcher-btn-life"
                onClick={() => onSelectMode('life')}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 focus:outline-none whitespace-nowrap ${
                  currentMode === 'life'
                    ? 'bg-[#002FA7] text-white shadow-xs font-semibold'
                    : 'text-[#A8B0BC] hover:text-[#F3F5F8] hover:bg-[#2B323C]'
                }`}
              >
                <HeartHandshake className={`w-3.5 h-3.5 ${currentMode === 'life' ? 'text-white' : 'text-[#A8B0BC]'}`} />
                <span className="hidden sm:inline">生活 · Life</span>
                <span className="sm:hidden">Life</span>
              </button>
            </div>

            {/* Menu Button */}
            <div className="flex items-center gap-2 pl-0 sm:pl-2">
              <button
                id="header-menu-toggle-btn"
                ref={menuToggleRef}
                onClick={() => setIsMenuOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={isMenuOpen}
                aria-controls="site-menu-drawer"
                aria-label="打开导航菜单"
                className="group px-2.5 sm:px-3.5 py-1.5 bg-[#002FA7] hover:bg-[#002585] text-white text-xs font-mono tracking-widest uppercase rounded-lg flex items-center gap-2 transition-colors focus:outline-none shadow-xs"
              >
                <span className="hidden sm:inline">Menu</span>
                <span className="flex flex-col gap-0.5 w-2.5">
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-white rounded-full" />
                    <span className="w-1 h-1 bg-white rounded-full" />
                  </span>
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-white rounded-full" />
                    <span className="w-1 h-1 bg-white rounded-full" />
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Drawer Panel */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div
            id="site-menu-drawer"
            ref={menuPanelRef}
            role="dialog"
            aria-modal="true"
            aria-label="站点导航"
            className="relative w-full max-w-md bg-[#002FA7] text-white h-full flex flex-col justify-between p-8 sm:p-12 z-10 shadow-2xl animate-in slide-in-from-right duration-300"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/20 pb-6 text-xs font-mono tracking-widest uppercase">
              <div className="flex items-center gap-2 text-white/90">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>• MENU / 01-06</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="hover:opacity-80 flex items-center gap-1.5 text-white focus:outline-none"
              >
                <span>Close</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="space-y-6 sm:space-y-8 my-auto py-8">
              <button
                onClick={() => scrollToSection('work-signal')}
                className="group flex items-baseline justify-between w-full text-left focus:outline-none"
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-sm font-mono text-white/60">01</span>
                  <span className="text-3xl sm:text-4xl font-normal tracking-tight group-hover:translate-x-2 transition-transform">
                    Signal
                  </span>
                </div>
                <span className="text-xs font-mono text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  [ INTRO ]
                </span>
              </button>

              <button
                onClick={() => scrollToSection('work-projects')}
                className="group flex items-baseline justify-between w-full text-left focus:outline-none"
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-sm font-mono text-white/60">02</span>
                  <span className="text-3xl sm:text-4xl font-normal tracking-tight group-hover:translate-x-2 transition-transform">
                    Work
                  </span>
                </div>
                <span className="text-xs font-mono text-white/60">
                  [ DIRECTION ]
                </span>
              </button>

              <button
                onClick={() => scrollToSection('work-practice')}
                className="group flex items-baseline justify-between w-full text-left focus:outline-none"
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-sm font-mono text-white/60">03</span>
                  <span className="text-3xl sm:text-4xl font-normal tracking-tight group-hover:translate-x-2 transition-transform">
                    Practice
                  </span>
                </div>
                <span className="text-xs font-mono text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  [ SYSTEM ]
                </span>
              </button>

              <button
                onClick={() => scrollToSection('work-method')}
                className="group flex items-baseline justify-between w-full text-left focus:outline-none"
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-sm font-mono text-white/60">04</span>
                  <span className="text-3xl sm:text-4xl font-normal tracking-tight group-hover:translate-x-2 transition-transform">
                    Method
                  </span>
                </div>
                <span className="text-xs font-mono text-white/60">
                  [ CONVERGENCE ]
                </span>
              </button>

              <button
                onClick={() => scrollToSection('work-about')}
                className="group flex items-baseline justify-between w-full text-left focus:outline-none"
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-sm font-mono text-white/60">05</span>
                  <span className="text-3xl sm:text-4xl font-normal tracking-tight group-hover:translate-x-2 transition-transform">
                    About
                  </span>
                </div>
                <span className="text-xs font-mono text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  [ PROFILE ]
                </span>
              </button>

              <button
                onClick={() => scrollToSection('work-contact')}
                className="group flex items-baseline justify-between w-full text-left focus:outline-none"
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-sm font-mono text-white/60">06</span>
                  <span className="text-3xl sm:text-4xl font-normal tracking-tight group-hover:translate-x-2 transition-transform">
                    Contact
                  </span>
                </div>
                <span className="text-xs font-mono text-white/60">
                  [ ACTION ]
                </span>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-white/20 pt-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-white/70">
                <span>SHENZHEN, CHINA</span>
                <span>UTC+8 CST</span>
              </div>
              <div className="flex items-center gap-3">
                {onOpenResume && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenResume();
                    }}
                    className="flex-1 py-2.5 px-4 bg-white text-[#002FA7] text-xs font-mono font-semibold uppercase tracking-wider rounded-lg hover:bg-white/95 transition-colors text-center"
                  >
                    View Resume Sheet
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onSelectMode('life');
                  }}
                  className="py-2.5 px-4 bg-black/30 hover:bg-black/40 text-white text-xs font-mono uppercase tracking-wider rounded-xs transition-colors"
                >
                  Enter Life Mode →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
