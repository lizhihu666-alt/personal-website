import React, { useEffect, useRef, useState } from 'react';
import { WorkHero } from './WorkHero';
import { WorkImpact } from './WorkImpact';
import { WorkMethodTrace } from './WorkMethodTrace';
import { WorkSelectedProjects } from './WorkSelectedProjects';
import { WorkExperience } from './WorkExperience';
import { WorkAbout } from './WorkAbout';
import { WorkContact } from './WorkContact';
import { WorkMotto } from './WorkMotto';
import { ScrollTrigger } from '../../utils/gsapSetup';
import { ContactModal } from '../effects/ContactCard/ContactCard';
import { CONTACT_CARD_PROPS } from '../../data/contactCard';

interface WorkViewProps {
  onOpenResume?: () => void;
  onSwitchToLife?: () => void;
  skipHeroIntro?: boolean;
}

export const WorkView: React.FC<WorkViewProps> = ({ onOpenResume, onSwitchToLife, skipHeroIntro }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isContactCardOpen, setIsContactCardOpen] = useState(false);

  useEffect(() => {
    // Refresh ScrollTrigger after initial mount and font/image settling。
    // 从首页卡片做 View Transition 变形跳转过来时，浏览器那段变形动画
    // 还在播（约 0.6s）——ScrollTrigger.refresh() 会挪动 pin-spacer、
    // 改 DOM 布局，如果在动画播放中途去改，会被判定为"变形过程中出现
    // 意外的 DOM 变更"，直接把整个 View Transition 中止掉（控制台报
    // InvalidStateError）。延后到比变形动画（含收尾缓冲）更长之后再
    // 刷新，两者就不会再撞车。
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full bg-[#0A0B0D] text-[#F3F5F8] selection:bg-[#0E7C3D] selection:text-white"
    >
      {/* 00 / HERO */}
      <WorkHero
        onOpenResume={onOpenResume}
        onOpenContactCard={() => setIsContactCardOpen(true)}
        skipIntro={skipHeroIntro}
      />

      {/* 01 / IMPACT：数字逐行显现，显现完直接接下面同为浅色的项目板块。 */}
      <WorkImpact />

      {/* 02 / PROJECTS */}
      <WorkSelectedProjects />

      {/* 03 / EXPERIENCE */}
      <WorkExperience />

      {/* 04 / METHOD TRACE：放在经历之后，体量大的动画不挡在 HR 最想看的项目和经历前面 */}
      <WorkMethodTrace />

      {/* 05 / ABOUT & TOOLKIT */}
      <WorkAbout onSwitchToLife={onSwitchToLife} />

      {/* 06 / CONTACT */}
      <WorkContact onOpenResume={onOpenResume} />

      {/* 07 / MOTTO：放在最末，作为整页的收尾 */}
      <WorkMotto />
      <ContactModal
        isOpen={isContactCardOpen}
        onClose={() => setIsContactCardOpen(false)}
        {...CONTACT_CARD_PROPS}
      />
    </div>
  );
};
