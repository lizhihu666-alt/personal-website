import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { WORK_DATA } from '../../data/portfolioData';
import { Copy, Check, AlertCircle, ExternalLink, Download } from 'lucide-react';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';
import { copyText } from '../../utils/clipboard';

interface WorkContactProps {
  onOpenResume?: () => void;
}

export const WorkContact: React.FC<WorkContactProps> = ({ onOpenResume }) => {
  const [copyState, setCopyState] = useState<{
    email: 'idle' | 'success' | 'error';
    wechat: 'idle' | 'success' | 'error';
  }>({ email: 'idle', wechat: 'idle' });
  const copyResetTimers = useRef<Record<'email' | 'wechat', number | null>>({
    email: null,
    wechat: null,
  });

  const containerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact-reveal',
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.65,
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

  useEffect(() => {
    return () => {
      Object.values(copyResetTimers.current).forEach((timer) => {
        if (typeof timer === 'number') window.clearTimeout(timer);
      });
    };
  }, []);

  const showCopyFeedback = (channel: 'email' | 'wechat', status: 'success' | 'error') => {
    const existingTimer = copyResetTimers.current[channel];
    if (existingTimer !== null) window.clearTimeout(existingTimer);

    setCopyState((prev) => ({ ...prev, [channel]: status }));
    copyResetTimers.current[channel] = window.setTimeout(() => {
      setCopyState((prev) => ({ ...prev, [channel]: 'idle' }));
      copyResetTimers.current[channel] = null;
    }, 2200);
  };

  const handleCopyEmail = async () => {
    showCopyFeedback('email', (await copyText(WORK_DATA.contact.email)) ? 'success' : 'error');
  };

  const handleCopyWechat = async () => {
    showCopyFeedback('wechat', (await copyText(WORK_DATA.contact.wechat)) ? 'success' : 'error');
  };

  const copyButtonClass = (status: 'idle' | 'success' | 'error') =>
    `type-meta mt-6 inline-flex min-h-11 items-center justify-between gap-3 border-t border-[#232A33] pt-4 font-semibold transition-colors ${
      status === 'error' ? 'text-[#FFB4AB]' : 'text-[#34D378] hover:text-[#86EFB3]'
    }`;

  return (
    <section
      id="work-contact"
      ref={containerRef}
      className="relative flex min-h-dvh flex-col justify-center pt-20 pb-10 sm:pt-28 sm:pb-12 px-6 sm:px-10 lg:px-16 bg-[#0A0B0D]"
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className="max-w-3xl mb-16 contact-reveal">
          <h2 className="type-section-sm text-[#F3F5F8]">
            如果你正在寻找能把复杂业务<br className="hidden sm:block" />
            <span className="text-[#34D378]">推进落地的人</span>，我们可以聊聊
          </h2>
          <p className="type-lead mt-6 max-w-[42rem] text-[#A8B0BC]">
            商家入驻、跨境中台、系统迁移或 AI 落地等，欢迎添加微信交流
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 contact-reveal">
          <div className="p-6 bg-[#111418] border border-[#232A33] rounded-2xl shadow-[0_2px_14px_rgba(0,0,0,0.06)] flex flex-col justify-between">
            <div>
              <div className="type-label text-[#A8B0BC]">邮箱</div>
              <div className="type-body mt-3 font-medium text-[#F3F5F8] break-words">
                {WORK_DATA.contact.email}
              </div>
            </div>
            <button
              id="contact-copy-email-btn"
              onClick={handleCopyEmail}
              className={copyButtonClass(copyState.email)}
            >
              <span aria-live="polite">
                {copyState.email === 'success'
                  ? '已复制 · 期待来信'
                  : copyState.email === 'error'
                    ? '复制失败，请手动复制'
                    : '复制邮箱地址'}
              </span>
              {copyState.email === 'success' ? (
                <Check className="copy-confirm-icon w-4 h-4" />
              ) : copyState.email === 'error' ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="p-6 bg-[#111418] border border-[#232A33] rounded-2xl shadow-[0_2px_14px_rgba(0,0,0,0.06)] flex flex-col justify-between">
            <div>
              <div className="type-label text-[#A8B0BC]">微信</div>
              <div className="type-body mt-3 font-medium text-[#F3F5F8] break-words">
                {WORK_DATA.contact.wechat}
              </div>
            </div>
            <button
              id="contact-copy-wechat-btn"
              onClick={handleCopyWechat}
              className={copyButtonClass(copyState.wechat)}
            >
              <span aria-live="polite">
                {copyState.wechat === 'success'
                  ? '已复制 · 欢迎添加'
                  : copyState.wechat === 'error'
                    ? '复制失败，请手动复制'
                    : '复制微信号'}
              </span>
              {copyState.wechat === 'success' ? (
                <Check className="copy-confirm-icon w-4 h-4" />
              ) : copyState.wechat === 'error' ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="p-6 bg-[#111418] border border-[#232A33] rounded-2xl shadow-[0_2px_14px_rgba(0,0,0,0.06)] flex flex-col justify-between">
            <div>
              <div className="type-label text-[#A8B0BC]">LinkedIn</div>
              <div className="type-body mt-3 font-medium text-[#F3F5F8] break-words">
                胡利致 · Leo Hu
              </div>
            </div>
            <a
              id="contact-open-linkedin-link"
              href={WORK_DATA.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="type-meta mt-6 inline-flex min-h-11 items-center justify-between gap-3 border-t border-[#232A33] pt-4 font-semibold text-[#34D378] transition-colors hover:text-[#86EFB3]"
            >
              <span>打开主页</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="p-6 bg-[#111418] border border-[#232A33] rounded-2xl shadow-[0_2px_14px_rgba(0,0,0,0.06)] flex flex-col justify-between">
            <div>
              <div className="type-label text-[#A8B0BC]">简历</div>
              <div className="type-body mt-3 font-semibold text-[#F3F5F8]">PDF 简历</div>
            </div>
            {onOpenResume && (
              <button
                id="contact-open-resume-btn"
                onClick={onOpenResume}
                className="mt-6 inline-flex min-h-11 items-center justify-between gap-3 border-t border-[#232A33] pt-4 text-sm font-semibold text-[#34D378] transition-colors hover:text-[#86EFB3]"
              >
                <span>打开简历</span>
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
