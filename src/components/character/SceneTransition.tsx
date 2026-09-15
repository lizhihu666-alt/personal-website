import React, { useEffect, useState, useRef } from 'react';
import { LeoCharacter, CharacterAction } from './LeoCharacter';
import { FastForward } from 'lucide-react';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';

interface SceneTransitionProps {
  targetMode: 'work' | 'life';
  onComplete: () => void;
  onCancel?: () => void;
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  targetMode,
  onComplete,
}) => {
  const [characterAction, setCharacterAction] = useState<CharacterAction>(
    targetMode === 'work' ? 'look-left' : 'look-right'
  );
  const [statusText, setStatusText] = useState<string>(
    targetMode === 'work' ? '准备就绪 · 拿上电脑包' : '换下正装 · 拿上球拍'
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);
  const shuttlecockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isReducedMotion()) {
      onComplete();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          onComplete();
        },
      });

      if (targetMode === 'work') {
        // WORK TIMELINE (~1.85s total)
        // 1. Look left & pick up bag (0 - 0.3s)
        tl.call(() => {
          setCharacterAction('look-left');
          setStatusText('准备就绪 · 拿上电脑包');
        }, undefined, 0);

        // 2. Start walking left with subtle body movement (0.3s - 1.25s)
        tl.call(() => {
          setCharacterAction('walk-left');
          setStatusText('前往工位 · 开启专注模式');
        }, undefined, 0.3);

        tl.to(characterRef.current, {
          x: -180,
          duration: 0.95,
          ease: 'power2.inOut',
        }, 0.3);

        tl.to(cameraRef.current, {
          x: 140,
          duration: 0.95,
          ease: 'power2.inOut',
        }, 0.45);

        tl.to(decorRef.current, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power3.out',
        }, 0.5);

        // 3. Arrive & sit at desk (1.25s - 1.85s)
        tl.call(() => {
          setCharacterAction('sit-desk');
          setStatusText('入座 · 启动项目系统');
        }, undefined, 1.25);

        tl.to(characterRef.current, {
          x: -200,
          duration: 0.55,
          ease: 'power3.out',
        }, 1.25);

      } else {
        // LIFE TIMELINE (~1.85s total)
        // 1. Look right & pick up racket (0 - 0.3s)
        tl.call(() => {
          setCharacterAction('look-right');
          setStatusText('换下正装 · 拿上球拍');
        }, undefined, 0);

        // 2. Walk right towards court (0.3s - 1.25s)
        tl.call(() => {
          setCharacterAction('walk-right');
          setStatusText('走出大楼 · 奔赴球场');
        }, undefined, 0.3);

        tl.to(characterRef.current, {
          x: 180,
          duration: 0.95,
          ease: 'power2.inOut',
        }, 0.3);

        tl.to(cameraRef.current, {
          x: -140,
          duration: 0.95,
          ease: 'power2.inOut',
        }, 0.45);

        tl.to(decorRef.current, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power3.out',
        }, 0.5);

        // 3. Swing racket (1.25s) & Shuttlecock arc flight
        tl.call(() => {
          setCharacterAction('swing-racket');
          setStatusText('击球放空 · 接住生活');
        }, undefined, 1.25);

        if (shuttlecockRef.current) {
          gsap.set(shuttlecockRef.current, { opacity: 0, x: 220, y: -20, scale: 0.6 });
          tl.to(shuttlecockRef.current, {
            opacity: 1,
            scale: 1,
            x: 360,
            y: -90,
            rotation: 25,
            duration: 0.3,
            ease: 'power1.out',
          }, 1.35);

          tl.to(shuttlecockRef.current, {
            x: 480,
            y: 20,
            rotation: 65,
            duration: 0.35,
            ease: 'power2.in',
          }, 1.65);
        }
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [targetMode, onComplete]);

  return (
    <div
      ref={containerRef}
      id="transition-overlay"
      className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center select-none"
      style={{
        backgroundColor: targetMode === 'work' ? '#111418' : '#EDF1F7',
        transition: 'background-color 0.8s ease',
      }}
    >
      {/* Background Architectural Atmosphere */}
      {targetMode === 'work' ? (
        /* Work Office Ambient Grid & Skyline */
        <div ref={cameraRef} className="absolute inset-0 pointer-events-none">
          {/* Subtle architectural vertical lines */}
          <div className="absolute inset-0 opacity-15 flex justify-around">
            <div className="w-[1px] h-full bg-[#232A33]" />
            <div className="w-[1px] h-full bg-[#232A33]" />
            <div className="w-[1px] h-full bg-[#232A33]" />
            <div className="w-[1px] h-full bg-[#232A33]" />
          </div>

          {/* Left-side Office Room Setup */}
          <div
            ref={decorRef}
            className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-[420px] w-96 h-80 opacity-0"
          >
            {/* Office Bookshelf & Plant silhouette */}
            <svg viewBox="0 0 300 240" className="w-full h-full">
              {/* Minimalist shelf */}
              <line x1="30" y1="90" x2="110" y2="90" stroke="#DDE3EA" strokeWidth="2" />
              <rect x="40" y="65" width="6" height="25" fill="#5A6578" />
              <rect x="48" y="70" width="8" height="20" fill="#4A5361" />
              <rect x="58" y="62" width="10" height="28" fill="#48525F" />
              {/* Ceramic vase */}
              <path d="M 85 90 C 82 82 92 78 88 74 L 88 70 L 92 70 L 92 74 C 88 78 98 82 95 90 Z" fill="#5A6578" />
              
              {/* Fiddle-leaf Fig plant in corner */}
              <rect x="15" y="160" width="22" height="30" rx="3" fill="#4A5361" />
              <path d="M 26 160 Q 20 120 5 110" stroke="#48525F" strokeWidth="2" fill="none" />
              <ellipse cx="6" cy="110" rx="8" ry="14" transform="rotate(-30, 6, 110)" fill="#4A5361" opacity="0.6" />
              <path d="M 26 160 Q 35 125 45 115" stroke="#48525F" strokeWidth="2" fill="none" />
              <ellipse cx="45" cy="115" rx="8" ry="14" transform="rotate(30, 45, 115)" fill="#4A5361" opacity="0.6" />
            </svg>
          </div>
        </div>
      ) : (
        /* Life Badminton Court Ambient Lines & Sunlight */
        <div ref={cameraRef} className="absolute inset-0 pointer-events-none">
          {/* Cool Blue Sunlight Beam */}
          <div
            className="absolute top-0 right-1/4 w-96 h-full opacity-20 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(77, 127, 255, 0.25) 0%, transparent 80%)',
            }}
          />

          {/* Right-side Badminton Court Lines & Net silhouette */}
          <div
            ref={decorRef}
            className="absolute left-1/2 top-1/2 -translate-y-1/2 translate-x-[180px] w-96 h-80 opacity-0"
          >
            <svg viewBox="0 0 320 240" className="w-full h-full">
              {/* Court ground line */}
              <line x1="10" y1="210" x2="310" y2="210" stroke="#5B89FF" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
              <line x1="180" y1="210" x2="180" y2="150" stroke="#5B89FF" strokeWidth="2" opacity="0.6" />
              {/* Net mesh */}
              <rect x="180" y="150" width="130" height="28" fill="#16233A" stroke="#5B89FF" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
              {/* Net post */}
              <line x1="180" y1="145" x2="180" y2="212" stroke="#1E2C45" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      )}

      {/* FLYING SHUTTLECOCK DURING LIFE SWING */}
      {targetMode === 'life' && (
        <div
          ref={shuttlecockRef}
          className="absolute left-1/2 top-1/2 pointer-events-none z-40 opacity-0"
        >
          <svg viewBox="0 0 40 40" className="w-8 h-8 drop-shadow-xs">
            {/* Shuttlecock cork base */}
            <ellipse cx="28" cy="20" rx="4.5" ry="4" fill="#5B89FF" stroke="#5B89FF" strokeWidth="1" />
            {/* Feathers cone */}
            <polygon points="26,17 10,12 12,28 26,23" fill="#FFFFFF" stroke="#DDE3EA" strokeWidth="1" />
            {/* Thread bands */}
            <line x1="18" y1="14" x2="19" y2="26" stroke="#3E4A5C" strokeWidth="1" />
          </svg>
        </div>
      )}

      {/* MAIN CHARACTER STAGE */}
      <div
        ref={characterRef}
        className="relative z-30"
      >
        <div className="w-48 h-64 sm:w-56 sm:h-72 flex items-center justify-center">
          <LeoCharacter
            action={characterAction}
            className="w-full h-full"
            showProps={true}
          />
        </div>

        {/* Dynamic Transition Text Status Under Character */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          <p className="text-xs font-mono tracking-widest uppercase text-[#A8B0BC] bg-[#111418]/90 px-3 py-1 rounded-full border border-[#232A33]/60 shadow-xs">
            {statusText}
          </p>
        </div>
      </div>

      {/* Skip Button in Top Right */}
      <button
        id="btn-skip-transition"
        onClick={onComplete}
        className="absolute top-6 right-6 z-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#111418] hover:bg-[#151A21] text-xs text-[#A8B0BC] hover:text-[#F3F5F8] border border-[#232A33] transition-all shadow-xs"
        aria-label="Skip Animation"
      >
        <span>跳过动画</span>
        <FastForward className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
