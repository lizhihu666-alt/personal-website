import React, { useLayoutEffect, useRef, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { WORK_DATA } from '../../data/portfolioData';
import { gsap, isReducedMotion, ScrollTrigger } from '../../utils/gsapSetup';
import { revealLines } from '../../utils/textReveal';

export const WorkExperience: React.FC = () => {
  const experiences = WORK_DATA.experiences;
  const education = WORK_DATA.education;
  const [expandedExpId, setExpandedExpId] = useState('');
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const progress = progressRef.current;
    if (!track || !progress) return;

    const items = gsap.utils.toArray<HTMLElement>('.career-track-item', track);

    if (isReducedMotion()) {
      progress.style.transform = 'scaleY(1)';
      items.forEach((item) => item.classList.add('is-reached'));
      return;
    }

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

        ScrollTrigger.create({
          trigger: item,
          start: 'top 72%',
          once: true,
          onEnter: () => item.classList.add('is-reached'),
        });
      });

      ScrollTrigger.create({
        trigger: track,
        start: 'top 72%',
        end: 'bottom 68%',
        scrub: 0.35,
        onUpdate: (self) => {
          progress.style.transform = `scaleY(${self.progress})`;
        },
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
          <div className="career-track-rail" aria-hidden="true" />
          <div ref={progressRef} className="career-track-progress" aria-hidden="true" />

          <div className="career-track-list">
            {experiences.map((exp, index) => {
              // 所有经历默认折叠，只露出岗位/公司/时间/地点，点展开按钮再看简介和关键交付。
              const isExpanded = exp.id === expandedExpId;

              return (
                <div
                  key={exp.id}
                  className="career-track-item grid grid-cols-[28px_minmax(0,1fr)] gap-4 sm:gap-8"
                >
                  <div className="relative flex justify-center pt-[2.78rem]" aria-hidden="true">
                    <span className="career-track-node" />
                  </div>

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
                      className="group min-h-[100px] w-full px-6 py-4 text-left sm:px-8 sm:py-5"
                    >
                      <div className="grid gap-2 lg:grid-cols-12 lg:items-center lg:gap-8">
                        <div className="lg:col-span-8">
                          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                            <h3 className="text-xl font-semibold tracking-tight text-[#F3F5F8] sm:text-2xl">
                              {exp.title}
                            </h3>
                            <span className="type-body font-medium text-[#34D378]">
                              {exp.company}
                            </span>
                          </div>
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
                        <div className="grid gap-5 border-t border-dashed border-[#232A33] p-6 sm:p-8 lg:grid-cols-12">
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

            <div className="career-track-item mt-8 grid grid-cols-[28px_minmax(0,1fr)] gap-4 sm:mt-10 sm:gap-8">
              <div className="relative flex justify-center pt-7 sm:pt-8" aria-hidden="true">
                <span className="career-track-node" />
              </div>

              <article className="career-track-card rounded-2xl border border-[#232A33] bg-[#111418] px-6 py-5 sm:px-8 sm:py-6">
                <div className="mb-3 flex items-center gap-3">
                  <GraduationCap className="h-6 w-6 text-[#34D378]" aria-hidden="true" />
                  <h3 className="text-xl font-semibold tracking-tight text-[#F3F5F8] sm:text-2xl">教育背景</h3>
                </div>

                <div className="divide-y divide-[#232A33]">
                  {education.map((edu) => (
                    <div
                      key={edu.institution}
                      className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                          <h4 className="text-lg font-semibold text-[#F3F5F8] sm:text-xl">
                            {edu.institutionZh ?? edu.institution}
                          </h4>
                          <span className="type-body font-medium text-[#34D378]">{edu.degree}</span>
                        </div>
                        {edu.institutionZh && (
                          <p className="type-meta mt-0.5 text-[#A8B0BC]">{edu.institution}</p>
                        )}
                      </div>
                      {/* 跟上面工作经历卡片一致：时间在上，地点在下（灰白色），右对齐 */}
                      <div className="shrink-0 sm:text-right">
                        <div className="text-xl font-light tracking-tight text-work-proof sm:text-2xl">
                          {edu.period}
                        </div>
                        <div className="type-meta mt-1 text-[#A8B0BC]">{edu.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
