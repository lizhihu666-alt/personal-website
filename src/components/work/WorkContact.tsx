import React, { useState, useRef, useLayoutEffect } from 'react';
import { WORK_DATA } from '../../data/portfolioData';
import { Copy, Check, ExternalLink, Download, ArrowUp } from 'lucide-react';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';

interface WorkContactProps {
  onOpenResume?: () => void;
}

// 个人主页链接：地址由 portfolioData 提供。
// 还没填真地址时显示为「待补充」，不再跳转到平台首页——空承诺比没有链接更伤可信度。
const ProfileLink: React.FC<{ label: string; href?: string }> = ({ label, href }) => {
  if (!href) {
    return (
      <div className="flex items-center justify-between gap-3 text-sm text-[#A8B0BC]">
        <span>{label}</span>
        <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-sm border border-dashed border-[#3A424E] text-[#8C95A3] whitespace-nowrap">
          待补充
        </span>
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 text-sm text-[#F3F5F8] hover:text-[#5B89FF] transition-colors font-medium"
    >
      <span>{label}</span>
      <ExternalLink className="w-3.5 h-3.5 text-[#A8B0BC]" />
    </a>
  );
};

export const WorkContact: React.FC<WorkContactProps> = ({ onOpenResume }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedWechat, setCopiedWechat] = useState(false);

  const containerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact-reveal',
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
            start: 'top 80%',
            once: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(WORK_DATA.contact.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyWechat = () => {
    navigator.clipboard.writeText(WORK_DATA.contact.wechat);
    setCopiedWechat(true);
    setTimeout(() => setCopiedWechat(false), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      id="work-contact"
      ref={containerRef}
      className="relative py-20 sm:py-28 px-6 sm:px-10 lg:px-16 bg-[#0A0B0D] border-b border-[#232A33]"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Marker */}
        <div className="flex items-center justify-between pb-5 border-b border-[#232A33] mb-12 sm:mb-16">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold tracking-widest text-[#5B89FF] bg-[#002FA7]/10 px-2.5 py-1 rounded-md uppercase">
              CONTACT & DIALOGUE
            </span>
            <span className="text-xs font-mono tracking-widest text-[#A8B0BC] uppercase">
              INITIATE CONVERSATION
            </span>
          </div>
          <span className="text-xs font-mono tracking-widest text-[#A8B0BC] uppercase">
            OPEN TO OPPORTUNITIES
          </span>
        </div>

        {/* Big Editorial Call to Action */}
        <div className="max-w-3xl mb-16 contact-reveal">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#F3F5F8] leading-tight">
            如果你正在寻找一个能把复杂业务
            <br />
            <span className="text-[#5B89FF] italic font-semibold">真正推进落地的人</span>，我们可以聊聊。
          </h2>
          <p className="mt-5 text-base text-[#A8B0BC] leading-relaxed">
            欢迎就跨境业务中台、SOP 流程架构、系统割接交付或 Vibe Coding 原型实践展开探讨。可通过邮箱预约线上沟通，或直接添加微信交流。
          </p>
        </div>

        {/* Direct Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 contact-reveal border-t border-[#3A424E] pt-12 pb-16">
          {/* Email Channel */}
          <div className="p-6 bg-[#111418] border border-[#232A33] rounded-xl shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-[#A8B0BC] tracking-wider uppercase mb-2">
                DIRECT EMAIL
              </div>
              <div className="font-mono text-sm sm:text-base text-[#F3F5F8] font-medium break-all">
                {WORK_DATA.contact.email}
              </div>
            </div>
            <button
              id="contact-copy-email-btn"
              onClick={handleCopyEmail}
              className="mt-6 text-xs font-mono tracking-widest uppercase flex items-center justify-between text-[#5B89FF] hover:text-[#5B89FF] transition-colors pt-3 border-t border-[#232A33] font-semibold"
            >
              <span>{copiedEmail ? '已复制到剪贴板' : '复制邮箱地址'}</span>
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#5B89FF]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* WeChat Channel */}
          <div className="p-6 bg-[#111418] border border-[#232A33] rounded-xl shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-[#A8B0BC] tracking-wider uppercase mb-2">
                WECHAT ID
              </div>
              <div className="font-mono text-sm sm:text-base text-[#F3F5F8] font-medium">
                {WORK_DATA.contact.wechat}
              </div>
            </div>
            <button
              id="contact-copy-wechat-btn"
              onClick={handleCopyWechat}
              className="mt-6 text-xs font-mono tracking-widest uppercase flex items-center justify-between text-[#5B89FF] hover:text-[#5B89FF] transition-colors pt-3 border-t border-[#232A33] font-semibold"
            >
              <span>{copiedWechat ? '已复制到剪贴板' : '复制微信号'}</span>
              {copiedWechat ? <Check className="w-3.5 h-3.5 text-[#5B89FF]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* LinkedIn / GitHub */}
          <div className="p-6 bg-[#111418] border border-[#232A33] rounded-xl shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-[#A8B0BC] tracking-wider uppercase mb-2">
                NETWORKS
              </div>
              <div className="space-y-2">
                <ProfileLink label="LinkedIn" href={WORK_DATA.contact.linkedin} />
                <ProfileLink label="GitHub" href={WORK_DATA.contact.github} />
              </div>
            </div>
            <div className="mt-6 text-[10px] font-mono text-[#A8B0BC] uppercase pt-3 border-t border-[#232A33]">
              {WORK_DATA.contact.linkedin || WORK_DATA.contact.github
                ? 'VERIFIED PROFILES'
                : 'PROFILE LINKS · 整理中'}
            </div>
          </div>

          {/* Resume Sheet Modal Trigger */}
          <div className="p-6 bg-[#111418] border border-[#232A33] rounded-xl shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-[#A8B0BC] tracking-wider uppercase mb-2">
                FORMAL RESUME
              </div>
              <div className="text-sm text-[#F3F5F8] font-semibold">
                标准 PDF / 简历查看
              </div>
              <p className="text-xs text-[#A8B0BC] mt-1">
                Formatted for recruitment & HR filing
              </p>
            </div>
            {onOpenResume && (
              <button
                id="contact-open-resume-btn"
                onClick={onOpenResume}
                className="mt-6 text-xs font-mono tracking-widest uppercase flex items-center justify-between text-[#5B89FF] hover:text-[#5B89FF] transition-colors pt-3 border-t border-[#232A33] font-semibold"
              >
                <span>OPEN RESUME SHEET</span>
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Footer & Back to Top */}
        <div className="border-t border-[#232A33] pt-8 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#A8B0BC]">
          <div className="flex items-center gap-4">
            <span>© 2026 LEO HU</span>
            <span>·</span>
            <span>SHENZHEN, CHINA</span>
            <span>·</span>
            <span className="text-[#5B89FF] font-semibold">PORTFOLIO</span>
          </div>

          <button
            id="contact-back-to-top-btn"
            onClick={scrollToTop}
            className="flex items-center gap-2 hover:text-[#F3F5F8] transition-colors uppercase tracking-widest focus:outline-none"
          >
            <span>BACK TO TOP</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#5B89FF]" />
          </button>
        </div>
      </div>
    </section>
  );
};
