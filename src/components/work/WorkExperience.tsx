import React, { useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, GraduationCap } from 'lucide-react';
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
            从业务分析到系统交付，这条轨道记录我如何把复杂问题
            <span className="text-[#34D378]">变成可运行的系统</span>。
          </h2>
        </div>

        <div ref={trackRef} className="relative">
          <div className="career-track-rail" aria-hidden="true" />
          <div ref={progressRef} className="career-track-progress" aria-hidden="true" />

          <div className="space-y-8 sm:space-y-10">
            {experiences.map((exp) => {
              const isExpanded = exp.id === expandedExpId;

              return (
                <div
                  key={exp.id}
                  className="career-track-item grid grid-cols-[28px_minmax(0,1fr)] gap-4 sm:gap-8"
                >
                  <div className="relative flex justify-center pt-7 sm:pt-8" aria-hidden="true">
                    <span className="career-track-node" />
                  </div>

                  <article className="career-track-card overflow-hidden rounded-2xl border border-[#232A33] bg-[#111418]">
                    <button
                      type="button"
                      onClick={() => toggleExp(exp.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`work-experience-panel-${exp.id}`}
                      className="group w-full p-6 text-left sm:p-8"
                    >
                      <div className="grid gap-5 lg:grid-cols-12 lg:gap-8">
                        <div className="lg:col-span-8">
                          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                            <h3 className="text-xl font-semibold tracking-tight text-[#F3F5F8] sm:text-2xl">
                              {exp.title}
                            </h3>
                            <span className="type-body font-medium text-[#34D378]">
                              {exp.company}
                            </span>
                          </div>
                          <p className="type-body mt-4 max-w-[42rem] text-[#A8B0BC]">
                            {exp.description}
                          </p>
                        </div>

                        <div className="flex items-start justify-between gap-5 lg:col-span-4 lg:justify-end">
                          <div className="lg:text-right">
                            <div className="text-xl font-light tracking-tight text-work-proof sm:text-2xl">
                              {exp.period}
                            </div>
                            <div className="type-meta mt-1 text-[#A8B0BC]">{exp.location}</div>
                          </div>
                          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#34D378]/25 text-[#34D378] transition-colors group-hover:border-[#34D378]">
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : 'rotate-0'
                              }`}
                              aria-hidden="true"
                            />
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
                            <ul className="type-body space-y-3 text-[#C3CAD5]">
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

            <div className="career-track-item grid grid-cols-[28px_minmax(0,1fr)] gap-4 sm:gap-8">
              <div className="relative flex justify-center pt-7 sm:pt-8" aria-hidden="true">
                <span className="career-track-node" />
              </div>

              <article className="career-track-card rounded-2xl border border-[#232A33] bg-[#111418] p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3 border-b border-[#232A33] pb-5 text-base font-medium text-[#F3F5F8]">
                  <GraduationCap className="h-5 w-5 text-[#34D378]" aria-hidden="true" />
                  <span>教育背景</span>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {education.map((edu) => (
                    <div key={edu.institution}>
                      <div className="type-meta">
                        <span className="text-work-proof">{edu.period}</span>
                        <span className="text-[#34D378]"> · {edu.location}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-[#F3F5F8]">
                        {edu.institution}
                      </h3>
                      <p className="type-body mt-1 font-medium text-[#C3CAD5]">{edu.degree}</p>
                      {edu.honors && (
                        <p className="type-meta mt-4 border-t border-[#232A33] pt-4 text-[#A8B0BC]">
                          {edu.honors}
                        </p>
                      )}
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
