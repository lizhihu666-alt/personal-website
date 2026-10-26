import React, { useRef, useState } from 'react';
import { WORK_DATA } from '../../data/portfolioData';
import { ProjectCaseStudy } from '../../types';
import { ProjectImmersive } from './ProjectImmersive';
import { PixelCoverCanvas, usePixelCover } from './PixelCover';

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
  const pinRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLCanvasElement>(null);
  // 滚到底后被方块盖成下一个板块（经历，浅色）的颜色。
  usePixelCover(pinRef, coverRef, '#F3F5F8', undefined, 5);

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
      className="relative md:-mt-[100dvh] bg-[#0A0B0D] px-6 text-[#F3F5F8] sm:px-10 lg:px-16"
    >
      <div ref={pinRef} className="relative flex flex-col justify-center md:min-h-dvh">
      <div className="project-rail relative py-10 sm:py-14">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="type-section text-[#F3F5F8] max-w-4xl">
            少而精，<br />
            <span className="text-[#34D378]">件件有结果</span>
          </h2>
          <p className="type-lead mt-6 max-w-[62ch] text-[#A8B0BC]">
            点-线-面结合，查看从问题、行动到结果的完整案例
          </p>

          {/* 行式列表，和经历板块同一套交互：整行可点，悬停时绿线延伸、一句话说明和指标说明淡入。 */}
          <div className="career-track-list mt-8 sm:mt-8">
            {projects.map((project, index) => {
              const metric = project.metrics?.[0];

              return (
                <div key={project.id} className="career-track-item">
                  <article
                    className={`career-track-card career-track-row ${
                      index === projects.length - 1 ? 'is-last' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(event) => openProject(project, event.currentTarget)}
                      aria-haspopup="dialog"
                      aria-label={`进入${project.title}全屏案例`}
                      className="group min-h-[88px] w-full px-0 py-3 text-left sm:py-3.5"
                    >
                      <div className="grid gap-2 lg:grid-cols-12 lg:items-center lg:gap-8">
                        <div className="relative lg:col-span-8">
                          <div className="career-track-head">
                            <h3 className="project-card-title text-2xl font-semibold tracking-tight text-[#F3F5F8] transition-colors duration-200 group-hover:text-[#34D378] group-focus-visible:text-[#34D378] sm:text-3xl">
                              {project.title}
                            </h3>
                          </div>
                          <p className="career-track-sub type-meta mt-1 text-[#A8B0BC]">{project.subtitle}</p>
                        </div>

                        <div className="flex items-center justify-between gap-5 lg:col-span-4 lg:justify-end">
                          {metric && (
                            <div className="career-track-meta relative lg:text-right">
                              <div className="career-track-period type-number text-3xl font-semibold tabular-nums text-[#34D378] sm:text-4xl">
                                {metric.value}
                              </div>
                              <div className="career-track-loc type-meta mt-1 text-[#A8B0BC]">{metric.label}</div>
                            </div>
                          )}
                          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-[#34D378]">
                            <svg
                              className="career-track-arrow h-6 w-6"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M6 18 L18 6" pathLength="1" />
                              <path d="M8.5 6 H18 V15.5" pathLength="1" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </button>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </div>

        <PixelCoverCanvas ref={coverRef} background="#0A0B0D" cue={{ label: '下滑查看经历', tone: 'dark' }} />
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
