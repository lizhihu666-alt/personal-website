import React, { useEffect, useRef } from 'react';
import { WorkHero } from './WorkHero';
import { WorkImpact } from './WorkImpact';
import { WorkMethodTrace } from './WorkMethodTrace';
import { WorkSelectedProjects } from './WorkSelectedProjects';
import { WorkExperience } from './WorkExperience';
import { WorkAbout } from './WorkAbout';
import { WorkContact } from './WorkContact';
import { ScrollTrigger } from '../../utils/gsapSetup';

interface WorkViewProps {
  onOpenResume?: () => void;
  onSwitchToLife?: () => void;
}

export const WorkView: React.FC<WorkViewProps> = ({ onOpenResume, onSwitchToLife }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Refresh ScrollTrigger after initial mount and font/image settling
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full bg-[#0A0B0D] text-[#F3F5F8] selection:bg-[#0E7C3D] selection:text-white"
    >
      {/* 00 / HERO */}
      <WorkHero onOpenResume={onOpenResume} />

      {/* 01 / IMPACT：数字全部显现后，同一屏会紧接着被像素方块盖成
          方法区的深色，转场效果做在 WorkImpact 内部（跟数字揭示用
          同一个钉住的画面），不再单独起一段过渡区块。 */}
      <WorkImpact />

      {/* 02 / METHOD TRACE */}
      <WorkMethodTrace />

      {/* 03 / PROJECTS */}
      <WorkSelectedProjects />

      {/* 04 / EXPERIENCE */}
      <WorkExperience />

      {/* 05 / ABOUT & TOOLKIT */}
      <WorkAbout onSwitchToLife={onSwitchToLife} />

      {/* 06 / CONTACT */}
      <WorkContact onOpenResume={onOpenResume} />
    </div>
  );
};
