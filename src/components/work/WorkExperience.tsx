import React, { useState, useRef, useLayoutEffect } from 'react';
import { WORK_DATA } from '../../data/portfolioData';
import { ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';

export const WorkExperience: React.FC = () => {
  const experiences = WORK_DATA.experiences;
  const education = WORK_DATA.education;
  const [expandedExpId, setExpandedExpId] = useState<string>('exp-1');

  const containerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.exp-item-row',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.75,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'opacity,transform',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const toggleExp = (id: string) => {
    setExpandedExpId((prev) => (prev === id ? '' : id));
  };

  return (
    <section
      id="work-experience"
      ref={containerRef}
      className="relative py-20 sm:py-28 px-6 sm:px-10 lg:px-16 border-b border-[#232A33] bg-[#0A0B0D]"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Marker */}
        <div className="flex items-center justify-between pb-5 border-b border-[#232A33] mb-12 sm:mb-16">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold tracking-widest text-[#5B89FF] bg-[#002FA7]/10 px-2.5 py-1 rounded-md uppercase">
              EXPERIENCE & TRAJECTORY
            </span>
            <span className="text-xs font-mono tracking-widest text-[#A8B0BC] uppercase">
              CAREER & EDUCATION
            </span>
          </div>
          <span className="text-xs font-mono tracking-widest text-[#A8B0BC] uppercase">
            CHRONOLOGICAL RECORD
          </span>
        </div>

        {/* Section Header */}
        <div className="mb-12 sm:mb-16 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#F3F5F8] leading-tight">
            深耕出海与数字运营，
            <br />
            持续在实战中淬炼<span className="text-[#5B89FF] italic font-semibold">解决复杂业务问题的能力</span>。
          </h2>
        </div>

        {/* Professional Experience List */}
        <div className="border-t border-[#3A424E] mb-16 sm:mb-20">
          {experiences.map((exp) => {
            const isExpanded = exp.id === expandedExpId;

            return (
              <div
                key={exp.id}
                className="exp-item-row border-b border-[#232A33] py-7 sm:py-9 hover:bg-black/[0.015] transition-colors px-2 sm:px-4"
              >
                <div
                  onClick={() => toggleExp(exp.id)}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-baseline cursor-pointer select-none group"
                >
                  {/* Big Year on Left */}
                  <div className="lg:col-span-3">
                    <span className="font-mono text-2xl sm:text-3xl font-light text-[#F3F5F8] tracking-tight group-hover:text-[#5B89FF] transition-colors">
                      {exp.period}
                    </span>
                    <div className="text-xs font-mono text-[#A8B0BC] tracking-wider uppercase mt-1">
                      {exp.location}
                    </div>
                  </div>

                  {/* Company & Role */}
                  <div className="lg:col-span-6">
                    <h3 className="text-xl sm:text-2xl font-semibold text-[#F3F5F8] tracking-tight">
                      {exp.title}
                    </h3>
                    <div className="text-xs font-mono text-[#5B89FF] tracking-wider uppercase font-semibold mt-1">
                      {exp.company}
                    </div>
                    <p className="text-sm text-[#A8B0BC] mt-2 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>

                  {/* Expand / Collapse Control */}
                  <div className="lg:col-span-3 flex items-center lg:justify-end text-xs font-mono text-[#5B89FF]">
                    <span className="flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-md border border-[#5B89FF]/25 group-hover:border-[#5B89FF]">
                      {isExpanded ? (
                        <>
                          <span>收起成果细节</span>
                          <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          <span>查看成果细节</span>
                          <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Expandable Key Achievements */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-dashed border-[#232A33] grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-3 text-xs font-mono tracking-widest text-[#A8B0BC] uppercase">
                      KEY DELIVERABLES
                    </div>
                    <div className="lg:col-span-9 space-y-2.5">
                      {exp.keyProjects.map((proj, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2 text-sm text-[#C3CAD5]">
                          <span className="text-[#5B89FF] mt-0.5 font-mono text-xs">↳</span>
                          <span>{proj}</span>
                        </div>
                      ))}
                      <div className="pt-3 flex flex-wrap gap-1.5">
                        {exp.skills.map((sk, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] font-mono text-[#A8B0BC] bg-black/[0.04] border border-black/5 px-2 py-0.5 rounded"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Education Subsection */}
        <div>
          <div className="flex items-center gap-2 pb-4 border-b border-[#232A33] mb-8 text-xs font-mono tracking-widest text-[#A8B0BC] uppercase">
            <GraduationCap className="w-4 h-4 text-[#5B89FF]" />
            <span>ACADEMIC FOUNDATIONS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {education.map((edu, idx) => (
              <div
                key={idx}
                className="exp-item-row p-6 bg-[#111418] border border-[#232A33] rounded-xl flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="text-xs font-mono text-[#5B89FF] uppercase tracking-wider font-semibold mb-2">
                    {edu.period} · {edu.location}
                  </div>
                  <h4 className="text-lg font-semibold text-[#F3F5F8]">
                    {edu.institution}
                  </h4>
                  <div className="text-sm text-[#C3CAD5] mt-1 font-medium">
                    {edu.degree}
                  </div>
                </div>
                {edu.honors && (
                  <div className="mt-4 pt-3 border-t border-[#232A33] text-xs text-[#A8B0BC] leading-relaxed">
                    {edu.honors}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
