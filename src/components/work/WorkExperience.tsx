import React, { useLayoutEffect, useRef, useState } from 'react';
import { Briefcase, GraduationCap } from 'lucide-react';
import { WORK_DATA } from '../../data/portfolioData';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';
import { revealLines } from '../../utils/textReveal';

export const WorkExperience: React.FC = () => {
  const experiences = WORK_DATA.experiences;
  const education = WORK_DATA.education;
  const [expandedExpId, setExpandedExpId] = useState('');
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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

  const toggleExp = (id: string) => {
    setExpandedExpId((prev) => (prev === id ? '' : id));
  };

  return (
    <section
      id="work-experience"
      ref={sectionRef}
      className="relative px-6 py-20 sm:px-10 sm:py-28 lg:px-16 bg-[#0A0B0D]"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-14 max-w-3xl sm:mb-20">
          <h2 ref={headingRef} className="type-section-sm text-[#F3F5F8]">
            从审计、业务、产品、数据到跨境电商，
            <span className="text-[#34D378]">每一站都在把复杂的事理顺</span>
          </h2>
        </div>

        <div ref={trackRef} className="relative">
          <div className="mb-5 flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-[#34D378]" aria-hidden="true" />
            <h3 className="text-xl font-semibold tracking-tight text-[#F3F5F8] sm:text-2xl">工作经历</h3>
          </div>

          <div className="career-track-list">
            {experiences.map((exp, index) => {
              // 所有经历默认折叠，只露出岗位/公司/时间/地点，点展开按钮再看简介和关键交付。
              const isExpanded = exp.id === expandedExpId;

              return (
                <div key={exp.id} className="career-track-item">
                  <article
                    className={`career-track-card career-track-row overflow-hidden ${
                      index === experiences.length - 1 ? 'is-last' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleExp(exp.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`work-experience-panel-${exp.id}`}
                      className="group min-h-[90px] w-full px-0 py-4 text-left sm:py-5"
                    >
                      <div className="grid gap-2 lg:grid-cols-12 lg:items-center lg:gap-8">
                        <div className="relative lg:col-span-8">
                          <div className="career-track-head flex flex-wrap items-baseline gap-x-4 gap-y-1">
                            <h3 className="text-lg font-semibold tracking-tight text-[#F3F5F8] sm:text-xl">
                              {exp.company}
                            </h3>
                            <span className="type-body font-medium text-[#34D378]">
                              {exp.title}
                            </span>
                          </div>
                          {exp.companyEn && (
                            <p className="career-track-sub type-meta mt-1 text-[#A8B0BC]">{exp.companyEn}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-5 lg:col-span-4 lg:justify-end">
                          <div className="career-track-meta relative lg:text-right">
                            <div className="career-track-period text-lg font-light tracking-tight text-work-proof sm:text-xl">
                              {exp.period}
                            </div>
                            <div className="career-track-loc type-meta mt-1 text-[#A8B0BC]">{exp.location}</div>
                          </div>
                          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-[#34D378]">
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
                        <div className="grid gap-5 border-t border-dashed border-[#232A33] py-6 sm:py-8 lg:grid-cols-12">
                          <div className="type-label text-[#F3F5F8] lg:col-span-3">关键交付</div>
                          <div className="lg:col-span-9">
                            <p className="text-sm leading-relaxed mb-4 text-[#C3CAD5]">{exp.description}</p>
                            <ul className="text-sm leading-relaxed space-y-2.5 text-[#C3CAD5]">
                              {exp.keyProjects.map((project) => (
                                <li key={project} className="relative pl-4">
                                  <span className="absolute left-0 top-[0.72em] h-1.5 w-1.5 rounded-full bg-[#34D378]" />
                                  <span>{project}</span>
                                </li>
                              ))}
                            </ul>
                            <p className="type-meta mt-5 text-[#A8B0BC]">
                              {exp.skills.join(' · ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}

            <div className="mb-5 mt-10 flex items-center gap-3 sm:mt-12">
              <GraduationCap className="h-6 w-6 text-[#34D378]" aria-hidden="true" />
              <h3 className="text-xl font-semibold tracking-tight text-[#F3F5F8] sm:text-2xl">教育背景</h3>
            </div>

            {education.map((edu, index) => (
              <div key={edu.institution} className="career-track-item">
                <article
                  className={`career-track-card career-track-row overflow-hidden ${
                    index === education.length - 1 ? 'is-last' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExp(edu.institution)}
                    aria-expanded={edu.institution === expandedExpId}
                    aria-controls={`work-education-panel-${index}`}
                    className="flex min-h-[90px] w-full flex-col justify-center gap-2 py-4 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-5"
                  >
                    <div className="relative min-w-0">
                      <div className="career-track-head flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <h4 className="text-lg font-semibold tracking-tight text-[#F3F5F8] sm:text-xl">
                          {edu.institutionZh ?? edu.institution}
                        </h4>
                        <span className="type-body font-medium text-[#34D378]">{edu.degree}</span>
                      </div>
                      {edu.institutionZh && (
                        <p className="career-track-sub type-meta mt-1 text-[#A8B0BC]">{edu.institution}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-5 sm:justify-end">
                      <div className="career-track-meta relative sm:text-right">
                        <div className="career-track-period text-lg font-light tracking-tight text-work-proof sm:text-xl">
                          {edu.period}
                        </div>
                        <div className="career-track-loc type-meta mt-1 text-[#A8B0BC]">{edu.location}</div>
                      </div>
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-[#34D378]">
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
                      <div className="grid gap-5 border-t border-dashed border-[#232A33] py-6 sm:py-8 lg:grid-cols-12">
                        <div className="type-label text-[#F3F5F8] lg:col-span-3">绩点与荣誉</div>
                        <div className="space-y-2.5 text-sm leading-relaxed text-[#C3CAD5] lg:col-span-9">
                          {edu.gpa && <p>GPA：{edu.gpa}</p>}
                          {edu.honors && edu.honors.length > 0 && (
                            <ul className="space-y-2.5">
                              {edu.honors.map((honor) => (
                                <li key={honor} className="relative pl-4">
                                  <span className="absolute left-0 top-[0.72em] h-1.5 w-1.5 rounded-full bg-[#34D378]" />
                                  <span>{honor}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {!edu.gpa && !edu.honors?.length && <p className="text-[#A8B0BC]">绩点与荣誉待补充</p>}
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
    </section>
  );
};
