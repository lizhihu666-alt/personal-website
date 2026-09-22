import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, X } from 'lucide-react';
import { ProjectCaseStudy } from '../../types';
import { gsap, isReducedMotion, ScrollTrigger } from '../../utils/gsapSetup';
import { ProjectSystemField } from './ProjectSystemField';

interface ProjectImmersiveProps {
  project: ProjectCaseStudy;
  origin: {
    x: number;
    y: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  onClose: () => void;
}

export const ProjectImmersive: React.FC<ProjectImmersiveProps> = ({
  project,
  origin,
  onClose,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const verticalProgressRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const [isClosing, setIsClosing] = useState(false);
  const headingId = useId();
  const primaryMetric = project.metrics?.[0];

  const requestClose = useCallback(() => {
    const root = rootRef.current;
    if (!root || closingRef.current) return;

    if (isReducedMotion()) {
      onClose();
      return;
    }

    closingRef.current = true;
    setIsClosing(true);
    gsap.killTweensOf(root);
    const returnClip = `inset(${origin.top}px ${origin.right}px ${origin.bottom}px ${origin.left}px round 12px)`;

    gsap.to(root, {
      clipPath: returnClip,
      duration: 0.28,
      ease: 'power3.in',
      onComplete: onClose,
    });
  }, [onClose, origin.bottom, origin.left, origin.right, origin.top]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const scroller = scrollRef.current;
    if (!root || !scroller) return;

    scroller.scrollTop = 0;

    if (!isReducedMotion()) {
      const openingClip = `inset(${origin.top}px ${origin.right}px ${origin.bottom}px ${origin.left}px round 12px)`;
      const settledClip = 'inset(0px 0px 0px 0px round 0px)';

      root.style.clipPath = openingClip;
      gsap.fromTo(root, { clipPath: openingClip }, {
        clipPath: settledClip,
        duration: 0.76,
        ease: 'power4.inOut',
        onComplete: () => {
          root.style.clipPath = 'none';
        },
      });
    }

    const context = gsap.context(() => {
      const stages = gsap.utils.toArray<HTMLElement>('.project-immersive-stage');

      if (isReducedMotion()) return;

      stages.forEach((stage, stageIndex) => {
        const reveals = stage.querySelectorAll<HTMLElement>('.project-stage-reveal');
        const rule = stage.querySelector<HTMLElement>('.project-stage-rule');
        const revealTimeline = gsap.timeline({
          scrollTrigger: {
            scroller,
            trigger: stage,
            start: 'top 76%',
            once: true,
          },
        });

        revealTimeline.fromTo(
          reveals,
          { y: 30, opacity: 0, clipPath: 'inset(0 0 26% 0)' },
          {
            y: 0,
            opacity: 1,
            clipPath: 'inset(0 0 0% 0)',
            duration: 0.72,
            stagger: 0.07,
            ease: 'power4.out',
            clearProps: stageIndex === 0 ? 'transform,opacity,clipPath' : undefined,
          }
        );

        if (rule) {
          revealTimeline.fromTo(
            rule,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.52, ease: 'power3.out' },
            0.14
          );
        }
      });
    }, root);

    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      context.revert();
    };
  }, [origin.bottom, origin.left, origin.right, origin.top, project.id]);

  useEffect(() => {
    const root = rootRef.current;
    const scroller = scrollRef.current;
    if (!root || !scroller) return;

    const previousOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    const updateProgress = () => {
      const maxScroll = scroller.scrollHeight - scroller.clientHeight;
      const progress = maxScroll > 0 ? scroller.scrollTop / maxScroll : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`;
      }
      if (verticalProgressRef.current) {
        verticalProgressRef.current.style.transform = `scaleY(${progress})`;
      }
    };

    const getFocusableElements = () => {
      const elements: HTMLElement[] = Array.from(
        root.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

      return elements.filter((element) => element.getClientRects().length > 0);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        root.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    scroller.addEventListener('scroll', updateProgress, { passive: true });
    document.addEventListener('keydown', handleKeyDown);
    updateProgress();
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      scroller.removeEventListener('scroll', updateProgress);
      window.cancelAnimationFrame(focusFrame);
      previousActiveElement?.focus();
    };
  }, [requestClose]);

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      tabIndex={-1}
      className="fixed inset-0 z-[80] overflow-hidden bg-[#0E7C3D] text-white"
      data-state={isClosing ? 'closing' : 'open'}
    >
      <ProjectSystemField
        projectId={project.id}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-80"
      />

      <div ref={scrollRef} className="relative h-full overflow-y-auto overscroll-contain">
        <header className="sticky top-0 z-30 bg-[#0E7C3D] px-6 sm:px-10 lg:px-16">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between sm:h-20">
            <span className="type-label text-white/75">Leo Hu / 项目案例</span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={requestClose}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/35 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10"
            >
              <span>关闭案例</span>
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 h-px w-full bg-white/20" />
          <div
            ref={progressRef}
            className="absolute bottom-0 left-0 h-px w-full origin-left bg-work-proof"
            style={{ transform: 'scaleX(0)' }}
            aria-hidden="true"
          />
        </header>

        <div className="project-scroll-rail pointer-events-none absolute bottom-4 top-24 hidden lg:block" aria-hidden="true">
          <div ref={verticalProgressRef} className="project-scroll-rail-progress" />
        </div>

        <section className="project-immersive-stage flex min-h-[100dvh] items-center px-6 py-24 sm:px-10 lg:px-16">
          <div className="project-stage-content mx-auto w-full max-w-6xl">
            <div className="project-stage-reveal type-meta text-white/75">
              {project.period} · {project.category}
            </div>
            <h2
              id={headingId}
              className="project-stage-reveal type-display mt-5 max-w-[12ch] text-white"
            >
              {project.title}
            </h2>
            <p className="project-stage-reveal type-lead mt-7 max-w-[50rem] text-white/90">
              {project.subtitle}
            </p>

            {primaryMetric && (
              <div className="project-stage-reveal mt-12 flex flex-wrap items-end gap-x-6 gap-y-3 border-t border-white/25 pt-7">
                <span className="type-number text-6xl font-semibold leading-none text-work-proof sm:text-8xl">
                  {primaryMetric.value}
                </span>
                <span className="type-body pb-1 text-white/85">{primaryMetric.label}</span>
              </div>
            )}

            <div className="project-stage-reveal mt-16 inline-flex items-center gap-3 text-sm text-white/75">
              <span>向下滚动，查看系统如何落地</span>
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="project-immersive-stage flex min-h-[100dvh] items-center border-t border-white/25 px-6 py-24 sm:px-10 lg:px-16">
          <div className="project-stage-content mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <div className="project-stage-reveal lg:col-span-4">
              <h3 className="type-section">问题</h3>
              <span className="project-stage-rule" aria-hidden="true" />
            </div>
            <p className="project-stage-reveal type-lead lg:col-span-8 max-w-[54rem] text-white/90">
              {project.problem}
            </p>
          </div>
        </section>

        <section className="project-immersive-stage flex min-h-[100dvh] items-center border-t border-white/25 px-6 py-24 sm:px-10 lg:px-16">
          <div className="project-stage-content mx-auto w-full max-w-6xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
              <div className="project-stage-reveal lg:col-span-4">
                <h3 className="type-section">系统</h3>
                <span className="project-stage-rule" aria-hidden="true" />
              </div>
              <div className="lg:col-span-8">
                <p className="project-stage-reveal type-lead max-w-[54rem] text-white/90">
                  {project.system ?? project.context}
                </p>
                {project.whatIDid.length > 0 && (
                  <ul className="project-stage-reveal mt-12 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
                    {project.whatIDid.map((action) => (
                      <li key={action} className="relative pl-5 text-base leading-7 text-white/80">
                        <span className="absolute left-0 top-[0.78em] h-1.5 w-1.5 rounded-full bg-white" />
                        {action}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="project-immersive-stage flex min-h-[100dvh] items-center border-t border-white/25 px-6 py-24 sm:px-10 lg:px-16">
          <div className="project-stage-content mx-auto w-full max-w-6xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
              <div className="project-stage-reveal lg:col-span-4">
                <h3 className="type-section text-work-proof">结果</h3>
                <span className="project-stage-rule project-stage-rule-proof" aria-hidden="true" />
              </div>
              <div className="lg:col-span-8">
                <p className="project-stage-reveal type-lead max-w-[54rem] font-medium text-white">
                  {project.result}
                </p>

                {project.metrics && project.metrics.length > 0 && (
                  <div className="project-stage-reveal mt-12 grid grid-cols-1 gap-8 border-t border-white/25 pt-8 sm:grid-cols-2">
                    {project.metrics.map((metric) => (
                      <div key={metric.label}>
                        <div className="type-number text-5xl font-semibold leading-none text-work-proof sm:text-6xl">
                          {metric.value}
                        </div>
                        <div className="type-subheading mt-4 text-white">{metric.label}</div>
                        {metric.note && metric.note !== metric.label && (
                          <p className="type-meta mt-2 text-white/70">{metric.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {project.whatILearned && (
                  <p className="project-stage-reveal type-body mt-12 max-w-[48rem] text-white/75">
                    {project.whatILearned}
                  </p>
                )}

                <button
                  type="button"
                  onClick={requestClose}
                  className="project-stage-reveal mt-14 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/35 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  返回项目列表
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
