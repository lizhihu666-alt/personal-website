import React, { useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { WORK_DATA } from '../../data/portfolioData';
import { ProjectCaseStudy } from '../../types';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';
import { resetPointerMotion, updatePointerMotion } from '../../utils/pointerMotion';
import { ProjectImmersive } from './ProjectImmersive';

interface ActiveProject {
  project: ProjectCaseStudy;
  origin: {
    x: number;
    y: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export const WorkSelectedProjects: React.FC = () => {
  const projects = WORK_DATA.projects;
  const [activeProject, setActiveProject] = useState<ActiveProject | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.project-row',
        { y: 24, opacity: 0, clipPath: 'inset(0 0 16% 0)' },
        {
          y: 0,
          opacity: 1,
          clipPath: 'inset(0 0 0% 0)',
          stagger: 0.08,
          duration: 0.65,
          ease: 'power3.out',
          clearProps: 'opacity,transform,clipPath',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const openProject = (project: ProjectCaseStudy, trigger: HTMLButtonElement) => {
    const rect = trigger.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;
    const left = Math.max(0, Math.min(rect.left, viewportWidth));
    const top = Math.max(0, Math.min(rect.top, viewportHeight));
    const right = Math.max(0, viewportWidth - Math.max(rect.right, 0));
    const bottom = Math.max(0, viewportHeight - Math.max(rect.bottom, 0));

    setActiveProject({
      project,
      origin: {
        x: Math.min(viewportWidth, left + rect.width / 2),
        y: Math.min(viewportHeight, top + rect.height / 2),
        top,
        right,
        bottom,
        left,
      },
    });
  };

  return (
    <section
      id="work-projects"
      ref={containerRef}
      className="relative py-20 sm:py-28 px-6 sm:px-10 lg:px-16 bg-[#F3F5F8] text-[#0A0B0D]"
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className="mb-14 sm:mb-20 max-w-4xl">
          <h2 className="type-section text-[#0A0B0D]">
            精选项目，<br className="sm:hidden" />
            皆以系统落地。
          </h2>
          <p className="type-lead mt-6 max-w-[62ch] text-[#4B5563]">
            进入全屏案例，从问题、系统到结果，完整看清每一次落地。
          </p>
        </div>

        <div className="border-t border-[#D8DCE2]">
          {projects.map((project, index) => (
            <article
              key={project.id}
              onPointerMove={updatePointerMotion}
              onPointerLeave={resetPointerMotion}
              className="project-row border-b border-[#D8DCE2] transition-colors duration-300 hover:bg-black/[0.03]"
            >
              <div className="grid grid-cols-1 gap-8 py-10 sm:py-14 md:grid-cols-12 md:items-end">
                <div className="md:col-span-7">
                  <div className="type-meta mb-4 text-[#8A94A3] tabular-nums">
                    {String(index + 1).padStart(2, '0')} / {project.category}
                  </div>
                  <h3 className="project-row-title type-section-sm text-[#0A0B0D]">{project.title}</h3>
                  <p className="type-body mt-4 max-w-[42rem] text-[#4B5563]">
                    {project.subtitle}
                  </p>
                </div>

                <div className="flex flex-col gap-5 md:col-span-5 md:items-end md:text-right">
                  <span className="type-meta font-medium text-[#0E7C3D] tabular-nums">
                    {project.period}
                  </span>
                  <button
                    type="button"
                    onClick={(event) => openProject(project, event.currentTarget)}
                    aria-haspopup="dialog"
                    aria-label={`进入${project.title}全屏案例`}
                    className="project-row-action group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0E7C3D] hover:bg-[#0A6631] px-5 py-2.5 text-sm font-medium text-white transition-colors"
                  >
                    进入全屏案例
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {activeProject && (
        <ProjectImmersive
          project={activeProject.project}
          origin={activeProject.origin}
          onClose={() => setActiveProject(null)}
        />
      )}
    </section>
  );
};
