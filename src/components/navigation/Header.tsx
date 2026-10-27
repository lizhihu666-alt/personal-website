import React, { useEffect, useState, useRef } from 'react';
import { AppMode } from '../../types';
import { Briefcase, HeartHandshake } from 'lucide-react';
import StaggeredMenu, { StaggeredMenuHandle } from '../effects/StaggeredMenu/StaggeredMenu';

interface HeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onOpenResume?: () => void;
  onOpenContact?: () => void;
}

// 生活页还在开发：菜单里先放几个不可点击、带「即将开放」标签的栏目，上线后去掉 badge、填上 link 即可。
const LIFE_MENU_ITEMS = [
  { label: '摄影', ariaLabel: '摄影（即将开放）', link: '#', badge: '即将开放' },
  { label: '旅行', ariaLabel: '旅行（即将开放）', link: '#', badge: '即将开放' },
  { label: '运动', ariaLabel: '运动（即将开放）', link: '#', badge: '即将开放' },
];

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onOpenResume,
  onOpenContact,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<StaggeredMenuHandle>(null);

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

  const scrollToSection = (id: string) => {
    const hasTarget = () => !!document.getElementById(id);

    // 目标章节不在当前视图里（例如在首页打开菜单、点的是 项目 的条目），
    // 就先切到 项目 模式；视图是懒加载的，等它挂载出来再定位。
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

  // StaggeredMenu 的 items/socialItems 只认识 <a href> 链接，站内导航靠
  // onNavigate 拦截下来，转给我们自己的跨模式滚动逻辑（简历/生活模式
  // 这两个不是锚点，单独判断处理）。
  const handleMenuNavigate = (link: string) => {
    if (link === '#resume') {
      onOpenResume?.();
      return;
    }
    if (link === '#life') {
      onSelectMode('life');
      return;
    }
    scrollToSection(link.replace(/^#/, ''));
  };

  const handleMenuModeSwitch = (mode: AppMode) => {
    onSelectMode(mode);
    // 先让滑块动画播完再关抽屉，不然两个动画一起跑，滑块的位移
    // 被抽屉整体飞出去的动作盖掉，看起来就像瞬间切换、没有过渡。
    window.setTimeout(() => menuRef.current?.close(), 380);
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-[100] w-full transition-colors duration-200 ${
          isScrolled
            ? 'bg-[#0A0B0D]/95 shadow-xs'
            : 'bg-[#0A0B0D]/90'
        }`}
      >
        <div className="px-6 sm:px-10 lg:px-16">
          <div className="max-w-6xl mx-auto h-16 flex items-center justify-between gap-3">
            {/* Brand Logo: Leo Hu */}
            <button
              id="nav-brand-logo"
              onClick={() => onSelectMode('home')}
              className="group flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#34D378] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0A0B0D] rounded-sm py-1 min-h-11 sm:min-h-0 shrink-0"
              aria-label="回到首页"
            >
              <span
                className={`font-bold text-lg sm:text-[19px] tracking-tight text-[#F3F5F8] transition-colors whitespace-nowrap ${
                  currentMode === 'life' ? 'group-hover:text-[#4F8CFF]' : 'group-hover:text-[#34D378]'
                }`}
              >
                Leo Hu
              </span>
              <span className="text-sm text-[#A8B0BC] hidden sm:inline-block">/ 胡利致</span>
            </button>

            {/* 站点导航菜单：React Bits 的 StaggeredMenu（isFixed 铺满全屏做
                滑出面板 + 数字编号 + 彩色扫过动画），只保留它自己的
                切换按钮，logo 留空避免跟上面的 "Leo Hu" 品牌重复。原来
                顶栏那个"职业/生活"切换胶囊挪进了菜单底部（footer），
                换成浅色底样式配合白色面板。 */}
            <div className="relative min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 flex items-center justify-center shrink-0">
              <StaggeredMenu
                ref={menuRef}
                isFixed
                position="right"
                items={currentMode === 'life' ? LIFE_MENU_ITEMS : [
                  { label: '成果', ariaLabel: '查看成果', link: '#work-impact' },
                  { label: '项目', ariaLabel: '查看精选项目', link: '#work-projects' },
                  { label: '经历', ariaLabel: '查看经历', link: '#work-experience' },
                  { label: '方法', ariaLabel: '查看方法', link: '#work-method-trace' },
                  { label: '关于', ariaLabel: '关于我', link: '#work-about' },
                  { label: '联系', ariaLabel: '联系方式', link: '#work-contact' },
                ]}
                displayItemNumbering
                menuButtonColor="#F3F5F8"
                openMenuButtonColor="#0A0B0D"
                changeMenuColorOnOpen
                colors={currentMode === 'life' ? ['#2F6FED', '#2459C7'] : ['#0E7C3D', '#0A6631']}
                accentColor={currentMode === 'life' ? '#2F6FED' : '#0E7C3D'}
                onNavigate={handleMenuNavigate}
                footer={
                  <div className="relative bg-[#E9ECEF] p-1 rounded-full flex items-center gap-1 w-full max-w-[11rem]">
                    {/* 滑动的高亮块：宽度固定为半个轨道减去 gap/padding 的
                        份额（calc(50% - 6px)），左边贴着 padding 固定不动，
                        只用 translateX 在两个按钮之间平移，纯 CSS 过渡，
                        不需要额外的动画库。颜色跟随当前模式——职业绿、
                        生活蓝。在首页打开菜单时 currentMode 是 'home'，
                        两个按钮都不算"当前"，这时把高亮块透明度降到 0，
                        避免出现色块在但文字没变白、看起来"字消失了"的情况。 */}
                    <span
                      aria-hidden="true"
                      className={`absolute top-1 bottom-1 left-1 rounded-full shadow-xs transition-[transform,opacity,background-color] duration-300 ease-out ${
                        currentMode === 'life' ? 'bg-[#2F6FED]' : 'bg-[#0E7C3D]'
                      }`}
                      style={{
                        width: 'calc(50% - 6px)',
                        transform: currentMode === 'life' ? 'translateX(calc(100% + 4px))' : 'translateX(0)',
                        opacity: currentMode === 'home' ? 0 : 1,
                      }}
                    />
                    <button
                      id="switcher-btn-work"
                      onClick={() => handleMenuModeSwitch('work')}
                      className={`relative z-10 flex-1 px-2.5 py-2 min-h-11 rounded-full text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0B0D] whitespace-nowrap ${
                        currentMode === 'work' ? 'text-white font-semibold' : 'text-[#4B5563] hover:text-[#0A0B0D]'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      职业
                    </button>

                    <button
                      id="switcher-btn-life"
                      onClick={() => handleMenuModeSwitch('life')}
                      className={`relative z-10 flex-1 px-2.5 py-2 min-h-11 rounded-full text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0B0D] whitespace-nowrap ${
                        currentMode === 'life' ? 'text-white font-semibold' : 'text-[#4B5563] hover:text-[#0A0B0D]'
                      }`}
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      生活
                    </button>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
