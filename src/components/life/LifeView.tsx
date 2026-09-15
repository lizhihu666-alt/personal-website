import React, { useState, useRef, useEffect } from 'react';
import { LIFE_DATA } from '../../data/portfolioData';
import { LeoCharacter } from '../character/LeoCharacter';
import {
  Camera,
  Sparkles,
  Zap,
} from 'lucide-react';
import { gsap, ScrollTrigger, isReducedMotion } from '../../utils/gsapSetup';

export const LifeView: React.FC = () => {
  const [activePhotoTab, setActivePhotoTab] = useState<string>('p1');
  const activePhoto =
    LIFE_DATA.photography.photos.find((p) => p.id === activePhotoTab) ||
    LIFE_DATA.photography.photos[0];
  const activePhotoSrc = activePhoto.src;

  // 摄影作品标签支持左右方向键切换（无障碍 / 键盘可用性）
  const handlePhotoTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

    event.preventDefault();
    const total = LIFE_DATA.photography.photos.length;
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const nextId = LIFE_DATA.photography.photos[(index + step + total) % total].id;

    setActivePhotoTab(nextId);
    document.getElementById(`photo-tab-${nextId}`)?.focus();
  };

  // GSAP Animation Refs
  const rootRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroCharacterRef = useRef<HTMLDivElement>(null);

  const photoFrameRef = useRef<HTMLDivElement>(null);
  const photoMetaRef = useRef<HTMLDivElement>(null);

  const badmintonSectionRef = useRef<HTMLElement>(null);
  const badmintonShuttleRef = useRef<SVGGElement>(null);
  const badmintonImpactRef = useRef<SVGCircleElement>(null);
  const badmintonPathRef = useRef<SVGPathElement>(null);
  const badmintonStatsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      // 1. HERO PARALLAX
      if (heroSectionRef.current) {
        gsap.to(heroTitleRef.current, {
          y: -25,
          ease: 'none',
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });

        gsap.to(heroCharacterRef.current, {
          y: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // 2. VALUES (ALTERNATELY SLIDING IN: EVEN FROM RIGHT, ODD FROM LEFT)
      const valueCards = gsap.utils.toArray<HTMLElement>('.life-value-card');
      valueCards.forEach((card, idx) => {
        const fromX = idx % 2 === 0 ? -30 : 30;
        gsap.fromTo(
          card,
          { x: fromX, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.65,
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'opacity,transform',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              once: true,
            },
          }
        );
      });

      // 3. PET PHOTOGRAPHY REVEAL
      if (photoFrameRef.current) {
        gsap.fromTo(
          photoFrameRef.current,
          {
            opacity: 0,
            clipPath: 'inset(15% 0% 0% 0%)',
          },
          {
            opacity: 1,
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#life-photography',
              start: 'top 75%',
              once: true,
            },
          }
        );
      }

      if (photoMetaRef.current) {
        const metaItems = photoMetaRef.current.querySelectorAll('.photo-meta-reveal');
        gsap.fromTo(
          metaItems,
          { y: 15, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.15,
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'opacity,transform',
            scrollTrigger: {
              trigger: '#life-photography',
              start: 'top 70%',
              once: true,
            },
          }
        );
      }

      // 4. BADMINTON SCENE (DESKTOP PIN WITH SCRUB TRAJECTORY, MOBILE AUTO DEMO)
      const mm = gsap.matchMedia();

      // Desktop: >= 1024px with brief pin and scroll-driven flight
      mm.add('(min-width: 1024px)', () => {
        if (badmintonSectionRef.current && badmintonShuttleRef.current) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: badmintonSectionRef.current,
              pin: true,
              scrub: 0.8,
              start: 'top top+=70',
              end: '+=550',
            },
          });

          // 战绩卡片：钉住动画里只做位移（y），不再长时间压到 0.6 透明度。
          // 原来它长时间停在 0.6，小字对比度只有 2.4:1，几乎看不清。
          const statsReveal = gsap.fromTo(
            badmintonStatsRef.current,
            { y: 15 },
            { y: 0, duration: 0.25, ease: 'power2.out' }
          );
          tl.add(statsReveal, 0);

          // 透明度改用一次性的“进入视口淡入”，播完即停在 1，不会长时间半透明。
          gsap.fromTo(
            badmintonStatsRef.current,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.5,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: badmintonSectionRef.current,
                start: 'top 85%',
                once: true,
              },
            }
          );

          // Shuttlecock flight along arc
          tl.fromTo(
            badmintonShuttleRef.current,
            { transform: 'translate(60px, 175px) rotate(-35deg)', opacity: 0 },
            {
              transform: 'translate(200px, 50px) rotate(10deg)',
              opacity: 1,
              duration: 0.5,
              ease: 'power1.out',
            }
          )
            .to(badmintonShuttleRef.current, {
              transform: 'translate(345px, 155px) rotate(55deg)',
              duration: 0.5,
              ease: 'power2.in',
            })
            // Impact bloom
            .fromTo(
              badmintonImpactRef.current,
              { scale: 0, opacity: 0 },
              { scale: 2.2, opacity: 0.9, duration: 0.2, ease: 'power1.out' },
              '-=0.1'
            );
        }
      });

      // Mobile / Tablet: < 1024px without pin
      mm.add('(max-width: 1023px)', () => {
        if (badmintonShuttleRef.current) {
          const mobileTl = gsap.timeline({
            scrollTrigger: {
              trigger: badmintonSectionRef.current,
              start: 'top 75%',
              once: true,
            },
          });

          mobileTl
            .fromTo(
              badmintonShuttleRef.current,
              { transform: 'translate(60px, 175px) rotate(-35deg)', opacity: 0 },
              {
                transform: 'translate(200px, 50px) rotate(10deg)',
                opacity: 1,
                duration: 0.5,
                ease: 'power1.out',
              }
            )
            .to(badmintonShuttleRef.current, {
              transform: 'translate(345px, 155px) rotate(55deg)',
              duration: 0.45,
              ease: 'power2.in',
            })
            .fromTo(
              badmintonImpactRef.current,
              { scale: 0, opacity: 0 },
              { scale: 2.2, opacity: 0.9, duration: 0.2, ease: 'power1.out' },
              '-=0.1'
            );
        }
      });

      // 5. TRAVEL TICKETS STAGGER REVEAL
      const travelCards = gsap.utils.toArray<HTMLElement>('.travel-ticket-card');
      if (travelCards.length > 0) {
        gsap.fromTo(
          travelCards,
          { y: 25, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.12,
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'opacity,transform',
            scrollTrigger: {
              trigger: '#life-travel',
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      // 6. TINKERING SCRAPBOOK REVEAL
      const tinkerCards = gsap.utils.toArray<HTMLElement>('.tinkering-card');
      if (tinkerCards.length > 0) {
        gsap.fromTo(
          tinkerCards,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.1,
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'opacity,transform',
            scrollTrigger: {
              trigger: '#life-tinkering',
              start: 'top 80%',
              once: true,
            },
          }
        );
      }
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="w-full bg-[#0A0B0D] text-[#F3F5F8] pb-24 selection:bg-[#002FA7] selection:text-white"
    >
      {/* ================= HERO SECTION ================= */}
      <section
        ref={heroSectionRef}
        id="life-hero"
        className="relative pt-12 sm:pt-16 pb-16 sm:pb-24 border-b border-[#232A33] overflow-hidden"
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#002FA7]/10 text-[#5B89FF] text-xs font-mono mb-4 tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#5B89FF]" />
                <span>LEO OFF DUTY · 个人生活向</span>
              </div>

              <h1
                ref={heroTitleRef}
                className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F3F5F8] leading-[1.2] mb-6"
              >
                {LIFE_DATA.hero.title}
              </h1>

              <p className="text-base sm:text-lg text-[#A8B0BC] leading-relaxed font-light mb-8 max-w-xl">
                {LIFE_DATA.hero.bio}
              </p>

              {/* Quick links to life chapters */}
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <a
                  href="#life-values"
                  className="px-3.5 py-1.5 rounded-full bg-[#0A0B0D] border border-[#232A33] text-[#C3CAD5] hover:text-[#5B89FF] hover:border-[#5B89FF]/50 transition-colors"
                >
                  #01 价值观
                </a>
                <a
                  href="#life-photography"
                  className="px-3.5 py-1.5 rounded-full bg-[#0A0B0D] border border-[#232A33] text-[#C3CAD5] hover:text-[#5B89FF] hover:border-[#5B89FF]/50 transition-colors"
                >
                  #02 宠物摄影
                </a>
                <a
                  href="#life-badminton"
                  className="px-3.5 py-1.5 rounded-full bg-[#0A0B0D] border border-[#232A33] text-[#C3CAD5] hover:text-[#5B89FF] hover:border-[#5B89FF]/50 transition-colors"
                >
                  #03 羽毛球
                </a>
                <a
                  href="#life-travel"
                  className="px-3.5 py-1.5 rounded-full bg-[#0A0B0D] border border-[#232A33] text-[#C3CAD5] hover:text-[#5B89FF] hover:border-[#5B89FF]/50 transition-colors"
                >
                  #04 旅行痕迹
                </a>
                <a
                  href="#life-tinkering"
                  className="px-3.5 py-1.5 rounded-full bg-[#0A0B0D] border border-[#232A33] text-[#C3CAD5] hover:text-[#5B89FF] hover:border-[#5B89FF]/50 transition-colors"
                >
                  #05 最近在折腾
                </a>
              </div>
            </div>

            {/* Little Leo in Athletic / Relaxed Pose */}
            <div
              ref={heroCharacterRef}
              className="flex flex-col items-center justify-center p-5 bg-[#111418] rounded-2xl border border-[#232A33] shadow-xs self-center lg:self-auto"
            >
              <div className="w-52 h-44 sm:w-56 sm:h-48 relative flex items-center justify-center">
                <LeoCharacter
                  action="swing-racket"
                  className="w-full h-full"
                  showProps={true}
                />
              </div>
              <div className="text-[11px] font-mono text-[#98A1AF] tracking-tight mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5B89FF]" />
                <span>Leo @ Court · 换下正装，认真出汗与生活</span>
              </div>
            </div>
          </div>

          {/* Life Quote Ticker */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#111418] border border-[#232A33] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#A8B0BC]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5B89FF] shrink-0" />
              <span className="font-editorial text-sm italic text-[#F3F5F8]">
                “没有 KPI 的热爱，才是精神真正的锚点。”
              </span>
            </div>
            <div className="font-mono text-[11px] text-[#98A1AF] self-end sm:self-auto">
              50mm Lens · Yonex Astrox · Road Trips
            </div>
          </div>
        </div>
      </section>

      {/* ================= 1. VALUES (我的价值观) ================= */}
      {/* overflow-x-clip：价值观卡片用 ±30px 横向滑入做动效，裁掉滑入过程中的横向溢出，避免整页出现左右滚动条 */}
      <section id="life-values" className="py-16 sm:py-20 border-b border-[#232A33] overflow-x-clip">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-xs font-mono tracking-widest text-[#A8B0BC] uppercase block mb-2">
              01 / CORE BELIEFS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F5F8]">
              我的生活态度与价值观
            </h2>
            <p className="text-sm text-[#A8B0BC] mt-2 font-light">
              用第一人称真诚记录，不讲空泛道理：
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LIFE_DATA.values.map((v, idx) => (
              <div
                key={v.id}
                className="life-value-card p-6 sm:p-8 rounded-xl bg-[#111418] border border-[#232A33] shadow-xs flex flex-col justify-between hover:border-[#5B89FF]/50 transition-colors"
              >
                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="font-mono text-xs text-[#5B89FF] font-medium">
                      0{idx + 1} / 04
                    </span>
                    <span className="text-[11px] font-mono text-[#98A1AF]">
                      PERSONAL ESSAY
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#F3F5F8] tracking-tight mb-2">
                    {v.title}
                  </h3>
                  <p className="text-xs font-medium text-[#5B89FF] mb-3">
                    {v.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#232A33]">
                  <p className="text-xs sm:text-sm text-[#A8B0BC] leading-relaxed font-light">
                    {v.reflection}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 2. PET PHOTOGRAPHY (LEO PHOTOGRAPHY) ================= */}
      <section
        id="life-photography"
        className="py-16 sm:py-24 border-b border-[#232A33] bg-[#0D1014]"
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-mono tracking-widest text-[#A8B0BC] uppercase block mb-2">
                02 / VISUAL ARCHIVE
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F5F8]">
                {LIFE_DATA.photography.brand}
              </h2>
              <p className="text-sm text-[#5B89FF] font-mono mt-1">
                {LIFE_DATA.photography.tagline}
              </p>
            </div>
            <div className="text-xs font-mono text-[#A8B0BC] max-w-xs sm:text-right">
              {LIFE_DATA.photography.gear}
            </div>
          </div>

          <p className="text-sm text-[#A8B0BC] max-w-2xl leading-relaxed mb-8 font-light">
            {LIFE_DATA.photography.description}
          </p>

          {/* Photo Selector Tabs */}
          <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="宠物摄影作品选择">
            {LIFE_DATA.photography.photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                role="tab"
                id={`photo-tab-${photo.id}`}
                aria-selected={activePhotoTab === photo.id}
                aria-controls="photo-showcase-panel"
                tabIndex={activePhotoTab === photo.id ? 0 : -1}
                onClick={() => setActivePhotoTab(photo.id)}
                onKeyDown={(event) => handlePhotoTabKeyDown(event, index)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  activePhotoTab === photo.id
                    ? 'bg-[#161A21] text-white shadow-xs'
                    : 'bg-[#111418] text-[#A8B0BC] border border-[#232A33] hover:bg-[#151A21]'
                }`}
              >
                {photo.title}
              </button>
            ))}
          </div>

          {/* Active Editorial Photo Showcase */}
          <div
            id="photo-showcase-panel"
            role="tabpanel"
            aria-labelledby={`photo-tab-${activePhotoTab}`}
            className="bg-[#111418] rounded-2xl border border-[#232A33] shadow-xs overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Photo Frame / Editorial Visual Placeholder with Artistic Grain & Framing */}
              <div
                ref={photoFrameRef}
                className="lg:col-span-7 bg-[#161A21] p-8 sm:p-12 flex flex-col items-center justify-center relative min-h-[320px] sm:min-h-[400px]"
              >
                {/* Subtle Framing Guides */}
                <div className="absolute inset-6 border border-white/10 pointer-events-none" />
                <div className="hidden sm:block absolute top-8 left-8 text-[10px] font-mono text-white/55 uppercase">
                  RAW 14-BIT · {activePhoto.focalLength} · {activePhoto.aperture}
                </div>
                <div className="hidden sm:block absolute bottom-8 right-8 text-[10px] font-mono text-white/55 uppercase">
                  LEO PET ARCHIVE
                </div>

                {/* 照片位：在 portfolioData 里给照片填上 src，这里就自动变成真照片；没填就显示占位块 */}
                {activePhotoSrc ? (
                  <div
                    className={`relative w-full max-w-md overflow-hidden rounded-sm border border-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.55)] ${activePhoto.aspectRatio}`}
                  >
                    <img
                      src={activePhotoSrc}
                      alt={activePhoto.subject}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div
                    className={`photo-placeholder-plate relative w-full max-w-md overflow-hidden rounded-sm border border-white/10 flex flex-col items-center justify-center gap-2 px-6 text-center ${activePhoto.aspectRatio}`}
                  >
                    <Camera className="w-5 h-5 text-[#5B89FF]" />
                    <div className="text-[11px] font-mono tracking-[0.2em] text-[#A8B0BC] uppercase">
                      Photo Pending
                    </div>
                    <div className="max-w-[15rem] text-xs leading-relaxed text-[#C3CAD5]">
                      真实照片待放入 · 画面比例已预留
                    </div>
                  </div>
                )}

                <div className="text-center mt-4">
                  <span className="text-xs italic font-medium text-white/80 tracking-wide">
                    “{activePhoto.subject}”
                  </span>
                </div>
              </div>

              {/* Photo Editorial Meta & Story */}
              <div
                ref={photoMetaRef}
                className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-[#111418]"
              >
                <div>
                  <div className="photo-meta-reveal flex items-center gap-2 text-xs font-mono text-[#5B89FF] mb-2 font-medium">
                    <Camera className="w-3.5 h-3.5" />
                    <span>EXIF & LIGHTING SPEC</span>
                  </div>

                  <h3 className="photo-meta-reveal text-xl font-bold text-[#F3F5F8] tracking-tight mb-2">
                    {activePhoto.title}
                  </h3>

                  {/* Camera parameters grid */}
                  <div className="photo-meta-reveal grid grid-cols-3 gap-2 p-3 rounded-lg bg-[#0D1014] border border-[#232A33] text-xs font-mono mb-4 text-[#A8B0BC]">
                    <div>
                      <div className="text-[10px] text-[#98A1AF]">FOCAL</div>
                      <div className="font-semibold text-[#F3F5F8]">
                        {activePhoto.focalLength}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#98A1AF]">APERTURE</div>
                      <div className="font-semibold text-[#F3F5F8]">
                        {activePhoto.aperture}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#98A1AF]">ISO</div>
                      <div className="font-semibold text-[#F3F5F8]">
                        {activePhoto.iso}
                      </div>
                    </div>
                  </div>

                  {/* Lighting note */}
                  <div className="photo-meta-reveal mb-4 text-xs text-[#A8B0BC]">
                    <span className="font-semibold text-[#F3F5F8]">光线设定：</span>
                    <p className="mt-0.5 text-[#A8B0BC]">{activePhoto.lightingNote}</p>
                  </div>

                  {/* Story behind the shot */}
                  <div className="photo-meta-reveal">
                    <span className="text-xs font-semibold text-[#F3F5F8]">
                      快门背后的故事：
                    </span>
                    <p className="text-xs sm:text-sm text-[#A8B0BC] leading-relaxed mt-1 font-light">
                      {activePhoto.story}
                    </p>
                  </div>
                </div>

                <div className="photo-meta-reveal mt-6 pt-4 border-t border-[#232A33] flex items-center justify-between text-[11px] font-mono text-[#98A1AF]">
                  <span>GENUINE PORTRAITS ONLY</span>
                  <span>NO STOCK FILLERS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. BADMINTON (羽毛球专项模块) ================= */}
      <section
        ref={badmintonSectionRef}
        id="life-badminton"
        className="py-16 sm:py-24 border-b border-[#232A33] overflow-hidden"
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-8">
            <span className="text-xs font-mono tracking-widest text-[#A8B0BC] uppercase block mb-2">
              03 / COURT RHYTHM
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F5F8]">
              {LIFE_DATA.badminton.title}
            </h2>
            <p className="text-sm font-editorial italic text-[#5B89FF] mt-1 text-base">
              “{LIFE_DATA.badminton.quote}”
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Court Trajectory Diagram / Refined Line-Art */}
            <div className="md:col-span-6 bg-[#111418] p-6 rounded-xl border border-[#232A33] shadow-xs relative">
              <div className="flex items-center justify-between text-xs font-mono text-[#A8B0BC] mb-3">
                <span>FLIGHT TRAJECTORY & COURT GEOMETRY</span>
                <span className="text-[#5B89FF]">ASTROX 88D PRO</span>
              </div>

              {/* Court Vector Diagram with Animated Shuttlecock */}
              <div className="w-full aspect-[16/10] bg-[#0D1014] rounded-lg border border-[#232A33] relative p-4 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 400 240" className="w-full h-full">
                  {/* Outer Court Boundary */}
                  <rect
                    x="20"
                    y="20"
                    width="360"
                    height="200"
                    fill="none"
                    stroke="#232A33"
                    strokeWidth="1.5"
                  />
                  {/* Center Line & Net */}
                  <line
                    x1="200"
                    y1="20"
                    x2="200"
                    y2="220"
                    stroke="#5B89FF"
                    strokeWidth="2"
                  />
                  {/* Singles & Doubles Lines */}
                  <line
                    x1="20"
                    y1="45"
                    x2="380"
                    y2="45"
                    stroke="#232A33"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="20"
                    y1="195"
                    x2="380"
                    y2="195"
                    stroke="#232A33"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="80"
                    y1="20"
                    x2="80"
                    y2="220"
                    stroke="#232A33"
                    strokeWidth="1"
                  />
                  <line
                    x1="320"
                    y1="20"
                    x2="320"
                    y2="220"
                    stroke="#232A33"
                    strokeWidth="1"
                  />

                  {/* Aerodynamic Smash Arc Flight Path */}
                  <path
                    ref={badmintonPathRef}
                    d="M 60 175 Q 200 40 345 155"
                    fill="none"
                    stroke="#5B89FF"
                    strokeWidth="2"
                    strokeDasharray="5 4"
                    opacity="0.65"
                  />

                  {/* Animated Flying Shuttlecock Node */}
                  <g
                    ref={badmintonShuttleRef}
                    className="origin-center"
                    style={{
                      transform: 'translate(60px, 175px) rotate(-35deg)',
                    }}
                  >
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="3.5"
                      ry="3"
                      fill="#5B89FF"
                      stroke="#002585"
                      strokeWidth="1"
                    />
                    <polygon
                      points="-4,-3 -12,-8 -10,8 -4,3"
                      fill="#FFFFFF"
                      stroke="#DDE3EA"
                      strokeWidth="0.8"
                    />
                  </g>

                  {/* Baseline impact ring */}
                  <circle
                    ref={badmintonImpactRef}
                    cx="345"
                    cy="155"
                    r="6"
                    fill="#5B89FF"
                    fillOpacity="0.25"
                    stroke="#5B89FF"
                    strokeWidth="1.5"
                    style={{ transformOrigin: '345px 155px', transform: 'scale(0)' }}
                  />

                  {/* Baseline impact label */}
                  <text
                    x="305"
                    y="185"
                    fontSize="9"
                    fill="#4A5361"
                    fontFamily="monospace"
                  >
                    SMASH IMPACT · 300+ km/h
                  </text>
                </svg>
              </div>

              <div className="mt-4 text-xs text-[#A8B0BC] font-light leading-relaxed">
                {LIFE_DATA.badminton.reflection}
              </div>
            </div>

            {/* Gear & Stats */}
            <div ref={badmintonStatsRef} className="md:col-span-6 space-y-6">
              {/* Routine pill */}
              <div className="p-4 rounded-xl bg-[#111418] border border-[#232A33] shadow-xs">
                <div className="text-xs font-mono text-[#98A1AF] uppercase mb-1">
                  REGULAR TIME · 约定节律
                </div>
                <div className="text-sm font-bold text-[#F3F5F8]">
                  {LIFE_DATA.badminton.schedule}
                </div>
                <div className="text-xs text-[#A8B0BC] mt-1">
                  装备：{LIFE_DATA.badminton.gear}
                </div>
              </div>

              {/* Stats list */}
              <div className="grid grid-cols-2 gap-3">
                {LIFE_DATA.badminton.stats.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#111418] border border-[#232A33] shadow-xs"
                  >
                    <div className="text-xs font-mono text-[#98A1AF]">
                      {item.label}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-[#F3F5F8] mt-1">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtle quote */}
              <div className="p-4 rounded-xl bg-[#0D1014] border border-[#232A33] text-xs text-[#A8B0BC] font-editorial italic">
                “球打得好不好是技术问题，但每周末跑上球场出一身透汗，是敬畏生活的态度。”
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. TRAVEL (旅行痕迹) ================= */}
      <section
        id="life-travel"
        className="py-16 sm:py-24 border-b border-[#232A33] bg-[#0D1014]"
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-xs font-mono tracking-widest text-[#A8B0BC] uppercase block mb-2">
              04 / FOOTPRINTS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F5F8]">
              去陌生城市里走很远
            </h2>
            <p className="text-sm text-[#A8B0BC] mt-2 font-light">
              旅行票据式排版，不赶景点，只记录有温度的片段：
            </p>
          </div>

          {/* Travel Boarding Ticket styled layout */}
          <div className="space-y-4">
            {LIFE_DATA.travels.map((dest) => (
              <div
                key={dest.id}
                className="travel-ticket-card bg-[#111418] rounded-xl border border-[#232A33] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#5B89FF]/50 transition-colors"
              >
                {/* Left: City & Airport Code */}
                <div className="flex items-start gap-4">
                  <div className="px-3 py-2 rounded-lg bg-[#0D1014] border border-[#232A33] text-center font-mono shrink-0">
                    <div className="text-xs text-[#98A1AF]">CODE</div>
                    <div className="text-base font-bold text-[#F3F5F8] tracking-wider">
                      {dest.airportCode}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-[#F3F5F8] tracking-tight">
                        {dest.city}
                      </h3>
                      <span className="text-xs font-mono text-[#98A1AF]">
                        {dest.country} · {dest.year}
                      </span>
                    </div>
                    <p className="text-xs text-[#5B89FF] font-medium mt-0.5">
                      {dest.tagline}
                    </p>
                  </div>
                </div>

                {/* Center / Right: Memory snippet & Highlight */}
                <div className="md:max-w-md text-xs text-[#A8B0BC] space-y-1 font-light border-t md:border-t-0 pt-3 md:pt-0 border-[#232A33]">
                  <p className="leading-relaxed">{dest.memory}</p>
                  <div className="text-[11px] font-mono text-[#A8B0BC] pt-1">
                    <span className="text-[#5B89FF] font-semibold">记忆亮点：</span>{' '}
                    {dest.highlight}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 5. LATELY TINKERING (最近在折腾) ================= */}
      <section id="life-tinkering" className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-xs font-mono tracking-widest text-[#A8B0BC] uppercase block mb-2">
              05 / PERSONAL SCRAPBOOK
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F5F8]">
              最近在折腾的事
            </h2>
            <p className="text-sm text-[#A8B0BC] mt-2 font-light">
              个人手账风格，记录那些没人催促、却让我满心欢喜的实验：
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LIFE_DATA.tinkering.map((item, idx) => (
              <div
                key={item.id}
                className="tinkering-card p-6 rounded-xl bg-[#111418] border border-[#232A33] shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-3">
                    <span className="text-[#5B89FF] font-medium flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      {item.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#0D1014] text-[#98A1AF] border border-[#232A33]">
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F3F5F8] tracking-tight mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#A8B0BC] leading-relaxed font-light mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#232A33] text-xs font-editorial italic text-[#F3F5F8]">
                  “{item.insight}”
                </div>
              </div>
            ))}
          </div>

          {/* Life Mode Footer Footnote */}
          <div className="mt-16 text-center text-xs text-[#98A1AF] font-editorial italic">
            “永远保持对世界的好奇，认真去爱，认真去创造。”
          </div>
        </div>
      </section>
    </div>
  );
};
