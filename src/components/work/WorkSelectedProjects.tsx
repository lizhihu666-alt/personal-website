import React, { useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { WORK_DATA } from '../../data/portfolioData';
import { ProjectCaseStudy } from '../../types';
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
      className="relative bg-[#F3F5F8] text-[#0A0B0D]"
    >
      <div className="project-rail relative py-16 sm:py-24">
        <div className="max-w-6xl mx-auto w-full px-6 sm:px-10 lg:px-16">
          <h2 className="type-section text-[#0A0B0D] max-w-4xl">
            少而精，<br />
            <span className="text-[#0E7C3D]">件件有结果</span>
          </h2>
          <p className="type-lead mt-6 max-w-[62ch] text-[#4B5563]">
            点开任意一个，查看从问题、系统到结果的完整案例
          </p>

          {/* 4 个项目一次全部铺开：手机单列，平板及以上 2×2，不再横向滑动。 */}
          <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 sm:grid-cols-2 sm:gap-8">
            {projects.map((project) => {
              const metric = project.metrics?.[0];

              return (
                <article
                  key={project.id}
                  className="project-card group flex flex-col rounded-2xl border border-[#D8DCE2] bg-white/70 p-7 transition-colors duration-300 hover:bg-white sm:p-8"
                >
                  <h3 className="project-card-title type-section-sm text-[#0A0B0D]">
                    {project.title}
                  </h3>
                  <p className="type-body mt-4 text-[#4B5563]">{project.subtitle}</p>

                  {metric && (
                    <div className="mt-6">
                      <div className="type-number text-4xl font-semibold text-[#0E7C3D]">
                        {metric.value}
                      </div>
                      <div className="type-meta mt-1 text-[#6B7280]">{metric.label}</div>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#D8DCE2] px-3 py-1 text-xs text-[#4B5563]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={(event) => openProject(project, event.currentTarget)}
                    aria-haspopup="dialog"
                    aria-label={`进入${project.title}全屏案例`}
                    className="project-card-action group mt-5 inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#0E7C3D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0A6631]"
                  >
                    进入全屏案例
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </button>
                </article>
              );
            })}
          </div>
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
