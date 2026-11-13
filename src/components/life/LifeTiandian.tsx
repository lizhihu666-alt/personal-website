import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Heart, PawPrint } from 'lucide-react';
import { TIANDIAN } from '../../data/portfolioData';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';
import { LifeChapterLabel } from './LifeChapterLabel';
import './LifeTiandian.css';

// 生活页「小甜点」：先认识我的狗，再往下看我给别的毛孩子拍的肖像。
// 这一块是可以玩的：右边「在外 / 在家」是个开关，决定左边照片的脾气——
//   在外：高冷，不让人摸。鼠标靠近照片会躲开，点它会摇头，冒一句「不让摸」。
//   在家：小暖男。照片会凑过来，点一下冒几颗爱心，还会数你摸了几下。

type Mood = 'outside' | 'home';

// 在外被摸时的反应，轮着来
const REFUSALS = ['不让摸', '别碰', '哼'];

interface HeartParticle {
  id: number;
  x: number; // 点击位置，相对照片的百分比
  y: number;
  dx: number; // 飘走时的横向偏移 px
  rot: number;
  size: number;
  delay: number;
}

export const LifeTiandian: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLButtonElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [mood, setMood] = useState<Mood>('outside');
  const [attempts, setAttempts] = useState(0); // 在外想摸、被拒绝的次数
  const [pets, setPets] = useState(0); // 在家摸到的次数
  const [refusal, setRefusal] = useState<{ id: number; text: string } | null>(null);
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  // 访客还没切换过开关时，滑块每隔几秒朝另一边探一下头，提示它可以拨过去
  const [switched, setSwitched] = useState(false);
  const idRef = useRef(0);
  const leanRef = useRef<{ x: (v: number) => void; y: (v: number) => void; r: (v: number) => void } | null>(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      const trigger = { trigger: sectionRef.current, start: 'top 72%', once: true };

      gsap.fromTo(
        '.tiandian-photo',
        { clipPath: 'inset(0 0 100% 0 round 1rem)' },
        { clipPath: 'inset(0 0 0% 0 round 1rem)', duration: 0.9, ease: 'power4.out', clearProps: 'clipPath', scrollTrigger: trigger }
      );
      gsap.fromTo(
        '.tiandian-reveal',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.08, delay: 0.15, ease: 'power3.out', clearProps: 'opacity,transform', scrollTrigger: trigger }
      );
    }, sectionRef);

    // 照片跟着鼠标「躲开 / 凑过来」：用 quickTo 做一点惯性，不然会显得机械
    if (photoRef.current) {
      const opts = { duration: 0.55, ease: 'power3.out' };
      leanRef.current = {
        x: gsap.quickTo(photoRef.current, 'x', opts),
        y: gsap.quickTo(photoRef.current, 'y', opts),
        r: gsap.quickTo(photoRef.current, 'rotation', opts),
      };
    }

    return () => {
      ctx.revert();
      leanRef.current = null;
    };
  }, []);

  // 「不让摸」气泡自己消失
  useEffect(() => {
    if (!refusal) return;
    const id = window.setTimeout(() => setRefusal(null), 1300);
    return () => window.clearTimeout(id);
  }, [refusal]);

  const resetLean = () => {
    leanRef.current?.x(0);
    leanRef.current?.y(0);
    leanRef.current?.r(0);
  };

  const handleMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!leanRef.current || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    // -1 ~ 1：鼠标在照片里的相对位置
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    // 在外：往反方向躲，幅度大一点；在家：朝鼠标凑过来一点
    const k = mood === 'outside' ? -1 : 0.6;
    leanRef.current.x(nx * 16 * k);
    leanRef.current.y(ny * 12 * k);
    leanRef.current.r(nx * 2.4 * k);
  };

  const handlePet = (event: React.MouseEvent<HTMLButtonElement>) => {
    const reduced = isReducedMotion();
    if (mood === 'outside') {
      setAttempts((n) => n + 1);
      idRef.current += 1;
      setRefusal({ id: idRef.current, text: REFUSALS[attempts % REFUSALS.length] });
      // 摇头
      if (!reduced) {
        innerRef.current?.animate(
          [
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(9px)' },
            { transform: 'translateX(-7px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(0)' },
          ],
          { duration: 480, easing: 'ease-out' }
        );
      }
      return;
    }

    setPets((n) => n + 1);
    if (reduced) return;
    // 蹭一下
    innerRef.current?.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.035)' }, { transform: 'scale(1)' }],
      { duration: 420, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
    );
    const rect = event.currentTarget.getBoundingClientRect();
    // 键盘触发时没有坐标，从小甜点脸的位置冒出来
    const fromKeyboard = event.detail === 0;
    const x = fromKeyboard ? 64 : ((event.clientX - rect.left) / rect.width) * 100;
    const y = fromKeyboard ? 52 : ((event.clientY - rect.top) / rect.height) * 100;
    const burst: HeartParticle[] = Array.from({ length: 3 }, (_, i) => {
      idRef.current += 1;
      return {
        id: idRef.current,
        x,
        y,
        dx: (Math.random() - 0.5) * 90,
        rot: (Math.random() - 0.5) * 50,
        size: 16 + Math.random() * 12,
        delay: i * 70,
      };
    });
    setHearts((list) => [...list, ...burst]);
  };

  const switchMood = (next: Mood) => {
    if (next === mood) return;
    setMood(next);
    setSwitched(true);
    setRefusal(null);
    resetLean();
  };

  const { together } = TIANDIAN;
  const [outside, home] = TIANDIAN.moods;

  const hint =
    mood === 'outside'
      ? attempts === 0
        ? '摸摸它试试'
        : '在外不让摸，切到「在家」试试'
      : pets === 0
        ? '现在可以摸了'
        : `摸了 ${pets} 下`;

  return (
    <section
      id="life-tiandian"
      ref={sectionRef}
      aria-labelledby="life-tiandian-title"
      className="relative border-t border-[#1F1F1F] px-6 py-20 sm:px-10 sm:py-28 lg:px-16"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-12 md:gap-10 lg:gap-0">
        <div className="relative mx-auto w-full max-w-sm md:col-span-5 md:max-w-none">
          <button
            ref={photoRef}
            type="button"
            className="tiandian-photo"
            data-mood={mood}
            aria-label={mood === 'outside' ? `摸摸${TIANDIAN.name}（在外，它不让摸）` : `摸摸${TIANDIAN.name}`}
            onPointerMove={handleMove}
            onPointerLeave={resetLean}
            onClick={handlePet}
          >
            <div ref={innerRef} className="tiandian-photo-inner">
              <img
                src={together.src}
                alt={together.alt}
                width={together.width}
                height={together.height}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </div>

            {/* 左下角的提示：告诉访客可以摸，摸了之后变成反馈 */}
            <span className="tiandian-hint" aria-live="polite">
              <PawPrint className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span key={hint} className="tiandian-hint-text">
                {hint}
              </span>
            </span>

            {/* 在外被摸：冒一句拒绝 */}
            {refusal && (
              <span key={refusal.id} className="tiandian-bubble" aria-hidden="true">
                {refusal.text}
              </span>
            )}

            {/* 在家被摸：爱心从点的地方飘上去 */}
            {hearts.map((heart) => (
              <span
                key={heart.id}
                className="tiandian-heart"
                aria-hidden="true"
                style={
                  {
                    left: `${heart.x}%`,
                    top: `${heart.y}%`,
                    animationDelay: `${heart.delay}ms`,
                    '--dx': `${heart.dx}px`,
                    '--rot': `${heart.rot}deg`,
                  } as React.CSSProperties
                }
                onAnimationEnd={() => setHearts((list) => list.filter((item) => item.id !== heart.id))}
              >
                <Heart style={{ width: heart.size, height: heart.size }} fill="currentColor" strokeWidth={0} />
              </span>
            ))}
          </button>
        </div>

        <div className="md:col-span-7 lg:col-span-6 lg:col-start-7">
          <LifeChapterLabel index="01" name="宠物" className="tiandian-reveal" />
          <h2
            id="life-tiandian-title"
            className="tiandian-reveal mt-5 text-3xl font-bold leading-[1.2] tracking-tight text-[#F5F4F2] sm:text-[2.6rem]"
          >
            这是
            {/* 切到「在家」时，名字的三个字挨个蹦一下 */}
            <span key={mood} className="tiandian-name text-(--life-accent)" data-mood={mood}>
              {Array.from(TIANDIAN.name).map((char, index) => (
                <span key={index} style={{ animationDelay: `${index * 70}ms` }}>
                  {char}
                </span>
              ))}
            </span>
          </h2>

          {/* 小档案：上下两条细线夹着一行，项与项之间用竖线分开 */}
          <dl className="tiandian-reveal mt-9 grid grid-cols-2 gap-y-6 border-y border-[#262626] py-6 sm:grid-cols-4">
            {TIANDIAN.facts.map((fact, index) => (
              <div
                key={fact.label}
                className={`${index % 2 === 1 ? 'border-l border-[#262626] pl-5' : ''} ${
                  index > 0 ? 'sm:border-l sm:border-[#262626] sm:pl-5' : ''
                }`}
              >
                <dt className="text-xs text-[#8A8784]">{fact.label}</dt>
                <dd className="mt-2 text-xl font-semibold text-[#F5F4F2]">{fact.value}</dd>
              </div>
            ))}
          </dl>

          {/* 两副面孔：一个拨动开关，高亮的滑块滑到哪边，左边的照片就是哪副脾气。
              不写「点击切换」这类字，靠滑块本身说明：边上有个小把手、会朝另一边探头、悬停时会被「拉」过去一点 */}
          <div
            className="tiandian-reveal tiandian-moods mt-6"
            role="radiogroup"
            aria-label={`${TIANDIAN.name}的两副面孔`}
            data-mood={mood}
            data-nudge={!switched}
          >
            <span className="tiandian-moods-thumb" aria-hidden="true" />
            <button
              type="button"
              role="radio"
              aria-checked={mood === 'outside'}
              className="tiandian-mood tiandian-mood--outside"
              onClick={() => switchMood('outside')}
            >
              <span className="tiandian-mood-head">
                <span>{outside.where}</span>
              </span>
              <span className="tiandian-mood-what">{outside.what}</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={mood === 'home'}
              className="tiandian-mood tiandian-mood--home"
              onClick={() => switchMood('home')}
            >
              <span className="tiandian-mood-head">
                <span>{home.where}</span>
              </span>
              <span className="tiandian-mood-what">{home.what}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
