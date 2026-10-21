import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { isReducedMotion } from '../../../utils/gsapSetup';
import './ImpossibleSwitch.css';
import { BearBody } from './BearBody';

/**
 * A playful "impossible" toggle: a bear hides below it and sneaks a paw in to
 * flip it back off every time you manage to switch it on. Ported from Jhey
 * Tompkins' "Impossible Checkbox v2" (https://codepen.io/jh3y/pen/LYNZwGm),
 * rescaled to widget size and recolored to the site's indigo, with the
 * fixed-to-viewport positioning converted to be relative to its own wrapper
 * so it can drop into a footer instead of owning the whole screen.
 */

const ARM_DURATION = 0.2;
const BEAR_DURATION = 0.25;
const CHECKBOX_DURATION = 0.25;
const PAW_DURATION = 0.1;

const DEFAULT_ON_COLOR = '#4f46e5';
const DEFAULT_OFF_COLOR = '#cbd5e1';

// After this many failed attempts, the bear stops being coy and states its
// refusal outright instead of just grunting.
const DEFAULT_ANGER_COUNT = 4;
// The bear should stay in view for exactly as long as the message bubble is
// shown, so it isn't left floating with no one there to have said it.
const MESSAGE_DURATION = 3;

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

export interface ImpossibleSwitchProps {
  /** Text shown in the speech bubble once the bear loses patience. */
  message?: string;
  /** 多句台词：小熊每多失败一次就换下一句（循环）；传了就优先于 message。 */
  messages?: string[];
  /** 开关被打开（true）/ 被小熊拨回去（false）时的回调，页面可以据此做联动。 */
  onToggle?: (on: boolean) => void;
  /** Optional caption rendered to the left of the switch. */
  label?: string;
  /** Hover tooltip on the switch. */
  title?: string;
  /** Switch colors. */
  onColor?: string;
  offColor?: string;
  /** Failed attempts before the bear gets angry and speaks. */
  angerCount?: number;
}

export function ImpossibleSwitch({
  message = "Sorry, that one can't be skipped.",
  messages,
  onToggle,
  label,
  title = 'Psst... try opening it?',
  onColor = DEFAULT_ON_COLOR,
  offColor = DEFAULT_OFF_COLOR,
  angerCount = DEFAULT_ANGER_COUNT
}: ImpossibleSwitchProps) {
  const [checked, setChecked] = useState(false);
  const [count, setCount] = useState(1);

  const limitsRef = useRef({ armLimit: 0, headLimit: 0 });
  if (limitsRef.current.armLimit === 0 && limitsRef.current.headLimit === 0) {
    const armLimit = randomBetween(0, 3);
    const headLimit = randomBetween(armLimit + 1, armLimit + 3);
    limitsRef.current = { armLimit, headLimit };
  }
  const { armLimit, headLimit } = limitsRef.current;

  const bearRef = useRef<SVGSVGElement | null>(null);
  const swearRef = useRef<HTMLDivElement | null>(null);
  const armWrapRef = useRef<HTMLDivElement | null>(null);
  const pawRef = useRef<HTMLDivElement | null>(null);
  const armRef = useRef<SVGSVGElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  const onHover = () => {
    if (Math.random() > 0.5 && count > armLimit) {
      gsap.to(bearRef.current, { duration: BEAR_DURATION / 2, y: '40%' });
    }
  };
  const offHover = () => {
    if (!checked) {
      gsap.to(bearRef.current, { duration: BEAR_DURATION / 2, y: '100%' });
    }
  };
  const onChange = () => {
    if (checked) return;
    setChecked(true);
    onToggle?.(true);
  };

  const bubbleText =
    messages && messages.length > 0 ? messages[Math.max(0, count - angerCount) % messages.length] : message;

  useEffect(() => {
    const grabBearTimeline = () => {
      let bearTranslation = '100%';
      if (count > armLimit && count < headLimit) {
        bearTranslation = '40%';
      } else if (count >= headLimit) {
        bearTranslation = '0%';
      }

      const onComplete = () => {
        onToggle?.(false);
        setChecked(false);
        setCount(count + 1);
      };
      const isAngry = count >= angerCount;
      let onBearComplete = () => {};
      if (isAngry) {
        onBearComplete = () => {
          gsap.set(swearRef.current, { display: 'block' });
          gsap.delayedCall(MESSAGE_DURATION, () => gsap.set(swearRef.current, { display: 'none' }));
        };
      }

      const base = ARM_DURATION + ARM_DURATION + PAW_DURATION;
      const preDelay = Math.random();
      const delay = count > armLimit ? base + BEAR_DURATION + preDelay : base;
      // The switch flips back off and the arm/paw retract at their normal pace,
      // but while angry the bear itself lingers in view until the message
      // bubble above it (shown for MESSAGE_DURATION) is done, instead of
      // ducking away while the bubble is still floating with no bear under it.
      const bearHideAt = isAngry ? BEAR_DURATION + MESSAGE_DURATION : delay + PAW_DURATION;
      const tl = gsap.timeline({ delay: Math.random(), onComplete });

      tl.add(
        count > armLimit
          ? gsap.to(bearRef.current, {
              duration: BEAR_DURATION,
              onComplete: onBearComplete,
              y: bearTranslation
            })
          : () => {}
      )
        .to(armWrapRef.current, { x: 16, duration: ARM_DURATION }, count > armLimit ? preDelay : 0)
        .to(armRef.current, { scaleX: 0.7, duration: ARM_DURATION })
        .to(pawRef.current, { duration: PAW_DURATION, scaleX: 0.8 })
        .to(bgRef.current, { duration: CHECKBOX_DURATION, backgroundColor: offColor }, delay)
        .to(indicatorRef.current, { duration: CHECKBOX_DURATION, x: '0%' }, delay)
        .to(pawRef.current, { duration: PAW_DURATION, scaleX: 0 }, delay)
        .to(armRef.current, { duration: PAW_DURATION, scaleX: 1 }, delay + PAW_DURATION)
        .to(armWrapRef.current, { duration: ARM_DURATION, x: 0 }, delay + PAW_DURATION)
        .to(bearRef.current, { duration: BEAR_DURATION, y: '100%' }, bearHideAt);

      return tl;
    };

    const showTimeline = () => {
      gsap
        .timeline()
        .to(bgRef.current, { duration: CHECKBOX_DURATION, backgroundColor: onColor }, 0)
        .to(indicatorRef.current, { duration: CHECKBOX_DURATION, x: '100%' }, 0)
        .add(grabBearTimeline(), CHECKBOX_DURATION);
    };

    if (checked && isReducedMotion()) {
      // 减弱动画：不演小熊的戏，只静态地「打开 → 弹出台词 → 自己关回去」。
      gsap.set(bgRef.current, { backgroundColor: onColor });
      gsap.set(indicatorRef.current, { x: '100%' });
      gsap.set(swearRef.current, { display: 'block' });
      const timer = gsap.delayedCall(2, () => {
        gsap.set(bgRef.current, { backgroundColor: offColor });
        gsap.set(indicatorRef.current, { x: '0%' });
        gsap.set(swearRef.current, { display: 'none' });
        onToggle?.(false);
        setChecked(false);
        setCount(count + 1);
      });
      return () => {
        timer.kill();
      };
    }

    if (checked) showTimeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, count]);

  return (
    <div className="isw-root">
      {label && <p className="isw-label">{label}</p>}
      <div className="isw-widget" title={title}>
      {/* Rendered outside the overflow-hidden stage below so the bubble isn't clipped, and
          offset beside (not on top of) the bear's head, comic-speech-bubble style with a
          tail pointing back at it. */}
      <div ref={swearRef} className="isw-swear">
        <div className="isw-bubble">
          {bubbleText}
          <div className="isw-bubble-tail" />
        </div>
      </div>
      <div className="isw-stage">
        <div className="isw-bear-wrap">
          <svg
            ref={bearRef}
            className="isw-bear"
            style={{ transform: 'translate(0, 100%)' }}
            viewBox="0 0 284.94574 359.73706"
            preserveAspectRatio="xMinYMin"
          >
            <BearBody angry={count >= angerCount} />
          </svg>
        </div>

        {/* Track anchor: everything below is positioned relative to the
            switch's own box (bottom of the stage), not the taller stage that
            gives the bear room to rise above it. */}
        <div className="isw-track">
          <div
            ref={armWrapRef}
            className="isw-arm-wrap"
            style={{ height: 10, width: 28, top: '50%', left: '50%', transform: 'translate(0, -50%)' }}
          >
            <svg
              ref={armRef}
              className="isw-arm"
              style={{ top: '50%', left: '50%', transform: 'translate(-35%, -50%) scaleX(1)', transformOrigin: 'left' }}
              viewBox="0 0 250.00001 99.999997"
              preserveAspectRatio="xMinYMin"
            >
              <g transform="translate(868.57141,-900.93359)">
                <path
                  d="m -619.43416,945.05124 c 4.18776,73.01076 -78.25474,53.24342 -150.21568,52.94118 -82.38711,-0.34602 -98.92158,-19.44459 -98.92157,-47.05883 0,-27.61424 4.78794,-42.54902 73.82353,-42.54902 69.03559,0 171.43607,-30.93764 175.31372,36.66667 z"
                  style={{ fill: '#784421' }}
                />
                <ellipse cx="-683.02264" cy="950.98572" rx="29.910826" ry="29.414362" style={{ fill: '#e9c6af' }} />
              </g>
            </svg>
          </div>
          <div
            ref={pawRef}
            className="isw-paw"
            style={{
              background: '#784421',
              height: 10,
              width: 10,
              top: '50%',
              left: '50%',
              transformOrigin: 'right',
              transform: 'translate(26px, -5px) scaleX(0)'
            }}
          />

          <div className="isw-switch">
            <input
              type="checkbox"
              role="switch"
              aria-label={label ?? title}
              className="isw-input"
              checked={checked}
              onChange={onChange}
              onMouseOver={onHover}
              onMouseOut={offHover}
            />
            <div ref={bgRef} className="isw-bg" style={{ background: offColor }} />
            <div ref={indicatorRef} className="isw-indicator">
              <div className="isw-knob" />
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
