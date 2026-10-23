import React, { useLayoutEffect, useRef, useState } from 'react';
import { Briefcase, GraduationCap } from 'lucide-react';
import { WORK_DATA } from '../../data/portfolioData';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';
import { revealLines } from '../../utils/textReveal';
import { PixelCoverCanvas, usePixelCover } from './PixelCover';

export const WorkExperience: React.FC = () => {
  const experiences = WORK_DATA.experiences;
  const education = WORK_DATA.education;
  const [expandedExpId, setExpandedExpId] = useState('');
  const [tab, setTab] = useState<'work' | 'education'>('work');
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLCanvasElement>(null);
  // 滚到底后被方块盖成下一个板块（方法，深色）的颜色。
  usePixelCover(pinRef, coverRef, '#0A0B0D', 1, 4);
  const TABS = [
    { id: 'work' as const, label: '工作经历', Icon: Briefcase },
    { id: 'education' as const, label: '教育背景', Icon: GraduationCap },
  ];

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const items = gsap.utils.toArray<HTMLElement>('.career-track-item', track);

    if (isReducedMotion()) return;

    let revertHeading = () => {};

    const context = gsap.context(() => {
      revertHeading = revealLines(headingRef.current, {
        trigger: sectionRef.current,
        start: 'top 82%',
      });

      items.forEach((item) => {
        const card = item.querySelector<HTMLElement>('.career-track-card');

        if (card) {
          gsap.fromTo(
            card,
            { y: 28, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: item,
                start: 'top 82%',
                once: true,
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => {
      revertHeading();
      context.revert();
    };
  }, []);

  // 切换页签：收起已展开的行，并让新列表轻轻淡入。
  const switchTab = (next: 'work' | 'education') => {
    if (next === tab) return;
    setExpandedExpId('');
    setTab(next);
  };

  const tabMountedRef = useRef(false);
  useLayoutEffect(() => {
    // 首次挂载由下面的滚动入场负责，这里只处理之后的切换。
    if (!tabMountedRef.current) {
      tabMountedRef.current = true;
      return;
    }
    if (isReducedMotion()) return;
    const rows = trackRef.current?.querySelectorAll('.career-track-item');
    if (!rows?.length) return;
    gsap.fromTo(
      rows,
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.07, clearProps: 'transform,opacity' }
    );
  }, [tab]);

  const toggleExp = (id: string) => {
    setExpandedExpId((prev) => (prev === id ? '' : id));
  };

  return (
    <section
      id="work-experience"
      ref={sectionRef}
      className="relative -mt-[100dvh] px-6 sm:px-10 lg:px-16 bg-[#F3F5F8]"
    >
      <div ref={pinRef} className="relative flex min-h-dvh flex-col justify-center py-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 max-w-5xl sm:mb-8">
          <h2 ref={headingRef} className="type-section-sm text-[#0A0B0D]">
            从审计、业务、产品、数据到跨境电商，
            <span className="text-[#0E7C3D]">每一站都在把复杂的事理顺</span>
          </h2>
        </div>

        <div ref={trackRef} className="relative">
          {/* 工作 / 教育切换：两个文字页签，文字和图标颜色不变，只靠绿色下划线标出选中项，不另做按钮底色。 */}
          <div role="tablist" aria-label="经历类别" className="mb-5 flex items-center gap-8">
            {TABS.map(({ id, label, Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`work-experience-tab-${id}`}
                  aria-selected={active}
                  aria-controls="work-experience-list"
                  onClick={() => switchTab(id)}
                  className="group relative flex items-center gap-3 pb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C3D]"
                >
                  <Icon
                    className="h-6 w-6 text-[#0E7C3D]"
                    aria-hidden="true"
                  />
                  <span
                    className="text-xl font-semibold tracking-tight text-[#0A0B0D] sm:text-2xl"
                  >
                    {label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-px left-0 h-px w-full origin-left bg-[#0E7C3D] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      active ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div id="work-experience-list" role="tabpanel" aria-labelledby={`work-experience-tab-${tab}`} className="career-track-list min-h-[450px]">
            {tab === 'work' &&
              experiences.map((exp, index) => {
              // 所有经历默认折叠，只露出岗位/公司/时间/地点，点展开按钮再看简介和关键交付。
              const isExpanded = exp.id === expandedExpId;

              return (
                <div key={exp.id} className="career-track-item">
                  <article
                    className={`career-track-card career-track-row row-on-light overflow-hidden ${
                      index === experiences.length - 1 ? 'is-last' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleExp(exp.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`work-experience-panel-${exp.id}`}
                      className="group min-h-[90px] w-full px-0 py-3 text-left sm:py-3.5"
                    >
                      <div className="grid gap-2 lg:grid-cols-12 lg:items-center lg:gap-8">
                        <div className="relative lg:col-span-8">
                          <div className="career-track-head flex flex-wrap items-baseline gap-x-4 gap-y-1">
                            <h3 className="text-lg font-semibold tracking-tight text-[#0A0B0D] sm:text-xl">
                              {exp.company}
                            </h3>
                            <span className="type-body font-semibold text-[#0E7C3D]">
                              {exp.title}
                            </span>
                          </div>
                          {exp.companyEn && (
                            <p className="career-track-sub type-meta mt-1 text-[#4B5563]">{exp.companyEn}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-5 lg:col-span-4 lg:justify-end">
                          <div className="career-track-meta relative lg:text-right">
                            <div className="career-track-period text-lg font-medium tabular-nums tracking-tight text-[#0E7C3D] sm:text-xl">
                              {exp.period}
                            </div>
                            <div className="career-track-loc type-meta mt-1 text-[#4B5563]">{exp.location}</div>
                          </div>
                          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-[#0E7C3D]">
                            <svg
                              className={`career-track-arrow h-6 w-6 ${isExpanded ? 'rotate-180' : ''}`}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M12 2.5 V21" pathLength="1" />
                              <path d="M12 21 L6.5 15.5" pathLength="1" />
                              <path d="M12 21 L17.5 15.5" pathLength="1" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </button>

                    <div
                      id={`work-experience-panel-${exp.id}`}
                      aria-hidden={!isExpanded}
                      className={`motion-disclosure grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="min-h-0">
                        <div className="grid gap-5 border-t border-dashed border-[#D8DCE2] py-6 sm:py-8 lg:grid-cols-12">
                          <div className="type-label text-[#0A0B0D] lg:col-span-3">关键交付</div>
                          <div className="lg:col-span-9">
                            <p className="text-sm leading-relaxed mb-4 text-[#4B5563]">{exp.description}</p>
                            <ul className="text-sm leading-relaxed space-y-2.5 text-[#4B5563]">
                              {exp.keyProjects.map((project) => (
                                <li key={project} className="relative pl-4">
                                  <span className="absolute left-0 top-[0.72em] h-1.5 w-1.5 rounded-full bg-[#0E7C3D]" />
                                  <span>{project}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}

            {tab === 'education' &&
              education.map((edu, index) => (
              <div key={edu.institution} className="career-track-item">
                <article
                  className={`career-track-card career-track-row row-on-light overflow-hidden ${
                    index === education.length - 1 ? 'is-last' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExp(edu.institution)}
                    aria-expanded={edu.institution === expandedExpId}
                    aria-controls={`work-education-panel-${index}`}
                    className="flex min-h-[90px] w-full flex-col justify-center gap-2 py-3 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-3.5"
                  >
                    <div className="relative min-w-0">
                      <div className="career-track-head flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <h4 className="text-lg font-semibold tracking-tight text-[#0A0B0D] sm:text-xl">
                          {edu.institutionZh ?? edu.institution}
                        </h4>
                        <span className="type-body font-semibold text-[#0E7C3D]">{edu.degree}</span>
                      </div>
                      {edu.institutionZh && (
                        <p className="career-track-sub type-meta mt-1 text-[#4B5563]">
                          {edu.institution}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-5 sm:justify-end">
                      <div className="career-track-meta relative sm:text-right">
                        <div className="career-track-period text-lg font-medium tabular-nums tracking-tight text-[#0E7C3D] sm:text-xl">
                          {edu.period}
                        </div>
                        <div className="career-track-loc type-meta mt-1 text-[#4B5563]">{edu.location}</div>
                      </div>
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-[#0E7C3D]">
                        <svg
                          className={`career-track-arrow h-6 w-6 ${edu.institution === expandedExpId ? 'rotate-180' : ''}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 2.5 V21" pathLength="1" />
                          <path d="M12 21 L6.5 15.5" pathLength="1" />
                          <path d="M12 21 L17.5 15.5" pathLength="1" />
                        </svg>
                      </span>
                    </div>
                  </button>

                  <div
                    id={`work-education-panel-${index}`}
                    aria-hidden={edu.institution !== expandedExpId}
                    className={`motion-disclosure grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      edu.institution === expandedExpId ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="min-h-0">
                      <div className="grid gap-5 border-t border-dashed border-[#D8DCE2] py-6 sm:py-8 lg:grid-cols-12">
                        <div className="type-label text-[#0A0B0D] lg:col-span-3">绩点与荣誉</div>
                        <div className="space-y-2.5 text-sm leading-relaxed text-[#4B5563] lg:col-span-9">
                          {edu.gpa && <p>GPA：{edu.gpa}</p>}
                          {edu.honors && edu.honors.length > 0 && (
                            <ul className="space-y-2.5">
                              {edu.honors.map((honor) => (
                                <li key={honor} className="relative pl-4">
                                  <span className="absolute left-0 top-[0.72em] h-1.5 w-1.5 rounded-full bg-[#0E7C3D]" />
                                  <span>{honor}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {!edu.gpa && !edu.honors?.length && <p className="text-[#4B5563]">绩点与荣誉待补充</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>
        <PixelCoverCanvas ref={coverRef} background="#F3F5F8" />
      </div>
    </section>
  );
};
