import React, { useEffect, useRef } from 'react';
import { WorkHero } from './WorkHero';
import { WorkSignal } from './WorkSignal';
import { WorkImpact } from './WorkImpact';
import { WorkMethodDavide } from './WorkMethodDavide';
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
      className="w-full bg-[#0A0B0D] text-[#F3F5F8] selection:bg-[#002FA7] selection:text-white"
    >
      {/* 00 / HERO */}
      <WorkHero onOpenResume={onOpenResume} />

      {/* 01 / SIGNAL */}
      <WorkSignal />

      {/* 02 / IMPACT */}
      <WorkImpact />

      {/* 03 / METHOD: The Signature Davide-inspired Scroll Canvas */}
      <WorkMethodDavide />

      {/* 04 / SELECTED WORK: Specia1ne Editorial Index */}
      <WorkSelectedProjects />

      {/* 05 / EXPERIENCE & ACADEMIC FOUNDATIONS */}
      <WorkExperience />

      {/* 06 / ABOUT & TOOLKIT (With Clock Out to Life) */}
      <WorkAbout onSwitchToLife={onSwitchToLife} />

      {/* 07 / CONTACT */}
      <WorkContact onOpenResume={onOpenResume} />
    </div>
  );
};
