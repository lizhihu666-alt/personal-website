import React, { useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { WORK_DATA } from '../../data/portfolioData';
import { ProjectCaseStudy } from '../../types';
import { gsap, isReducedMotion, ScrollTrigger } from '../../utils/gsapSetup';
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
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressLabelRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track) return;

    // 标题这一块留在 track 外面，不参与横向位移，滚动驱动的只是
    // track 的位移——效果就是标题钉在原地，下面的项目卡片横向滑过去。
    // track 现在跟标题共用同一个 max-w-6xl 容器，起始位置不再贴着
    // 视口左边缘，而是有 track.offsetLeft 这一段居中留白——滚动需要
    // 吃掉的距离要把这段留白也算进去，否则最后一张卡片的右边缘会
    // 停在视口内侧、露出一截，而不是贴齐视口右边缘。
    const getDistance = () =>
      Math.max(0, track.offsetLeft + track.scrollWidth - window.innerWidth);

    let ctx: gsap.Context | null = null;

    // 这一段紧跟在方法论页那个 8.5 屏的钉住区块后面。两个组件的
    // useLayoutEffect 在同一次 React 提交里同步依次跑，但方法论页那个
    // pin 真正把 spacer 撑到最终高度是在它自己的下一帧 rAF 里才做的——
    // 这里如果在同一次提交里就同步创建 ScrollTrigger，量到的
    // #work-projects 位置还是方法论页 spacer 撑开之前的临时布局，算出来
    // 的 start/end 会整体错位，横向滑动一上来就已经是终点状态。用 rAF
    // 把创建动作也推迟一帧，调度顺序上必然排在方法论页那个 rAF 后面，
    // 到这里执行时前面的布局已经定型。
    const frame = window.requestAnimationFrame(() => {
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: pin,
          // 顶栏 sticky + z-40 会盖住钉住的内容，跟 WorkImpact 同样的
          // 顶栏偏移处理。
          start: 'top 64px',
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            track.style.transform = `translate3d(${-(self.progress * getDistance())}px, 0, 0)`;
            // 横向滑卡没有原生滚动条能给方向/数量提示，靠这个小标签告诉
            // 用户"现在第几张、一共几张"——直接改 textContent 而不是走
            // React state，避免每个滚动帧都触发一次组件重渲染。
            if (progressLabelRef.current) {
              const activeIndex = Math.min(
                projects.length - 1,
                Math.round(self.progress * (projects.length - 1))
              );
              progressLabelRef.current.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(
                projects.length
              ).padStart(2, '0')}`;
            }
          },
        });
      }, containerRef);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      ctx?.revert();
    };
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
      className="relative bg-[#F3F5F8] text-[#0A0B0D]"
    >
      <div ref={pinRef} className="project-rail relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-24">
        <div className="max-w-6xl mx-auto w-full px-6 sm:px-10 lg:px-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="type-section text-[#0A0B0D] max-w-4xl">
              精选项目，<br className="sm:hidden" />
              皆以系统落地。
            </h2>
            {/* 横向滑卡没有原生滚动条，加个"当前/总数"提示，告诉用户还有
                更多卡片、以及大概滑到哪了——纯装饰性的滚动进度提示，不是
                真实的可交互控件，对读屏隐藏。 */}
            <span
              ref={progressLabelRef}
              aria-hidden="true"
              className="hidden shrink-0 pb-1 font-mono text-sm tabular-nums text-[#6B7280] sm:block"
            >
              {`01 / ${String(projects.length).padStart(2, '0')}`}
            </span>
          </div>
          <p className="type-lead mt-6 max-w-[62ch] text-[#4B5563]">
            进入全屏案例，从问题、系统到结果，完整看清每一次落地。
          </p>

          {/* track 跟标题共用同一个 max-w-6xl 容器，左边缘就能对齐——
              容器本身没有 overflow-hidden，宽度超出 max-w-6xl 的部分
              照样能视觉溢出到右边，不会被截断（真正裁剪可视范围的是
              最外层 .project-rail 的 overflow-hidden）。 */}
          <div
            ref={trackRef}
            className="mt-6 flex gap-6 sm:mt-8 sm:gap-8"
            style={{ width: 'max-content' }}
          >
            {projects.map((project, index) => {
              const metric = project.metrics?.[0];

              return (
                <article
                  key={project.id}
                  className="project-card group flex w-[300px] shrink-0 flex-col rounded-2xl border border-[#D8DCE2] bg-white/70 p-7 transition-colors duration-300 hover:bg-white sm:w-[360px] sm:p-8"
                >
                  {/* #8A94A3 对 bg-white/70 只有 3.0:1 对比度，低于 WCAG AA
                      文本要求的 4.5:1——换成同样偏灰但更深一档的 #6B7280
                      （约 4.8:1），仍然读作弱化的元信息，但不再是真的看不清。 */}
                  <div className="flex items-center justify-between type-meta text-[#6B7280] tabular-nums">
                    <span>
                      {String(index + 1).padStart(2, '0')} / {project.category}
                    </span>
                    <span className="font-medium text-[#0E7C3D]">{project.period}</span>
                  </div>

                  <h3 className="project-card-title type-section-sm mt-5 text-[#0A0B0D]">
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

            {/* 收尾留白，滑到底时最后一张卡片右边不会紧贴视口边缘。 */}
            <div className="w-6 shrink-0 sm:w-10 lg:w-16" aria-hidden="true" />
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
