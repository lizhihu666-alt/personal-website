import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
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

    document.addEventListener('keydown', handleKeyDown);
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
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
      className="fixed inset-0 z-[120] overflow-hidden bg-[#0E7C3D] text-white"
      data-state={isClosing ? 'closing' : 'open'}
    >
      <ProjectSystemField
        projectId={project.id}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-80"
      />

      <div ref={scrollRef} data-lenis-prevent className="relative h-full overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
        <header className="sticky top-0 z-30 bg-white px-6 sm:px-10 lg:px-16">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3">
            <span className="flex shrink-0 items-center gap-2 whitespace-nowrap py-1">
              <span className="text-lg font-bold tracking-tight text-[#0E7C3D] sm:text-[19px]">Leo Hu</span>
              <span className="hidden text-[16.5px] font-bold tracking-tight text-[#0E7C3D] sm:inline-block sm:text-[17.5px]">/ 胡利致</span>
            </span>
          </div>
        </header>

        <section className="project-immersive-stage flex min-h-[calc(100dvh-4rem)] items-center px-6 pb-28 pt-6 sm:px-10 lg:px-16">
          <div
            className="project-stage-content mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14"
            style={{ fontSize: 'clamp(14px, min(2.3vh, 1.4vw), 22px)' }}
          >
            <div className="lg:col-span-4">
              <h2
                id={headingId}
                className="project-stage-reveal font-semibold leading-[1.15] text-white max-sm:[text-wrap:balance]"
                style={{ fontSize: 'clamp(1.9rem, 2.6em + 0.6vw, 3.1rem)' }}
              >
                {project.title}
              </h2>
              <p className="project-stage-reveal mt-4 max-w-[34rem] text-[1.12em] leading-[1.7] text-white max-sm:[text-wrap:pretty]">
                {project.subtitle}
              </p>

              {project.metrics && project.metrics.length > 0 && (
                <div className="project-stage-reveal mt-7 flex flex-wrap gap-x-10 gap-y-4">
                  {project.metrics.map((metric) => (
                    <div key={metric.label}>
                      <div className="type-number text-[3.6em] font-semibold leading-none text-work-proof">
                        {metric.value}
                      </div>
                      <div className="mt-2 text-[0.95em] text-white">{metric.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {project.tags.length > 0 && (
                <ul className="project-stage-reveal mt-6 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <li key={tag} className="rounded-full border border-white/30 px-3.5 py-1 text-[0.82em] text-white">
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="lg:col-span-8" style={{ fontSize: '0.92em' }}>
              <div className="project-stage-reveal grid grid-cols-[3.4em_1fr] gap-3 sm:grid-cols-[4.5em_1fr] sm:gap-4 pb-[0.75em]">
                <div>
                  <h3 className="text-[0.95em] font-semibold text-white">情境</h3>
                </div>
                <div className="text-[1em] leading-[1.75] text-white">
                  <p>{project.context}</p>
                  <p className="mt-[0.4em] text-white">{project.problem}</p>
                </div>
              </div>
              <div className="project-stage-reveal grid grid-cols-[3.4em_1fr] gap-3 sm:grid-cols-[4.5em_1fr] sm:gap-4 border-t border-white/25 py-[0.75em]">
                <div>
                  <h3 className="text-[0.95em] font-semibold text-white">任务</h3>
                </div>
                <p className="text-[1em] leading-[1.75] text-white">{project.myRole}</p>
              </div>
              <div className="project-stage-reveal grid grid-cols-[3.4em_1fr] gap-3 sm:grid-cols-[4.5em_1fr] sm:gap-4 border-t border-white/25 py-[0.75em]">
                <div>
                  <h3 className="text-[0.95em] font-semibold text-white">行动</h3>
                </div>
                <ul className="space-y-[0.6em]">
                  {project.whatIDid.map((action) => (
                    <li key={action} className="relative pl-4 text-[1em] leading-[1.75] text-white">
                      <span className="absolute left-0 top-[0.8em] h-1.5 w-1.5 rounded-full bg-white" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="project-stage-reveal grid grid-cols-[3.4em_1fr] gap-3 sm:grid-cols-[4.5em_1fr] sm:gap-4 border-t border-white/25 py-[0.75em]">
                <div>
                  <h3 className="text-[0.95em] font-semibold text-white">结果</h3>
                </div>
                <p className="text-[1em] font-normal leading-[1.75] text-white">{project.result}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <button
        ref={closeButtonRef}
        type="button"
        onClick={requestClose}
        aria-label="关闭案例"
        className="group absolute bottom-12 left-1/2 z-30 flex -translate-x-1/2 items-center rounded-full bg-white p-[3px] text-sm text-[#0E7C3D] shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-colors hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span className="max-w-0 overflow-hidden whitespace-nowrap pl-0 opacity-0 transition-[max-width,opacity,padding] duration-300 ease-out group-hover:max-w-[6rem] group-hover:pl-3.5 group-hover:pr-2 group-hover:opacity-100 group-focus-visible:max-w-[6rem] group-focus-visible:pl-3.5 group-focus-visible:pr-2 group-focus-visible:opacity-100">
          关闭案例
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0E7C3D] text-white transition-transform duration-200 group-hover:rotate-90">
          <X className="h-4 w-4" aria-hidden="true" />
        </span>
      </button>
    </div>
  );
};
