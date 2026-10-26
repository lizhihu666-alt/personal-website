import React, { useEffect, useRef, useState } from 'react';
import { WORK_DATA } from '../../data/portfolioData';
import { X, Printer, Check, AlertCircle, Copy, Download, ExternalLink, Mail } from 'lucide-react';
import { copyText } from '../../utils/clipboard';

interface WorkResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkResumeModal: React.FC<WorkResumeModalProps> = ({ isOpen, onClose }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const copyResetTimerRef = useRef<number | null>(null);

  // 打开时：锁定背景滚动 + 把焦点送进弹窗；关闭时：完整恢复
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const scrollY = window.scrollY;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevWidth = body.style.width;

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    const focusTimer = window.setTimeout(() => {
      const target = dialogRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (target ?? dialogRef.current)?.focus();
    }, 30);

    return () => {
      window.clearTimeout(focusTimer);
      body.style.overflow = prevOverflow;
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

  // 键盘：Esc 关闭，Tab 焦点始终困在弹窗内
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusables: HTMLElement[] = [];
      dialog
        .querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        .forEach((el) => {
          if (el.offsetParent !== null || el === document.activeElement) {
            focusables.push(el);
          }
        });

      if (focusables.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!active || !dialog.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleCopyEmail = async () => {
    const didCopy = await copyText(WORK_DATA.contact.email);

    if (copyResetTimerRef.current !== null) {
      window.clearTimeout(copyResetTimerRef.current);
    }

    setCopyStatus(didCopy ? 'success' : 'error');
    copyResetTimerRef.current = window.setTimeout(() => {
      setCopyStatus('idle');
      copyResetTimerRef.current = null;
    }, 2200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="resume-print-root fixed inset-0 z-[120] overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 resume-overlay-in"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="resume-print-sheet bg-[#111418] w-full max-w-4xl rounded-xs shadow-2xl border border-[#232A33] flex flex-col max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-title"
      >
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-end gap-2 px-4 py-3 sm:justify-between sm:px-6 sm:py-4 border-b border-[#232A33] bg-[#0A0B0D]">
          <div className="hidden items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#A8B0BC] sm:flex">
            <span className="w-2 h-2 rounded-full bg-[#0E7C3D]" />
            <span>个人简历预览</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="resume-btn-copy-email"
              onClick={handleCopyEmail}
              className={`flex min-h-11 items-center gap-1.5 whitespace-nowrap px-3 py-1.5 sm:min-h-0 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${
                copyStatus === 'error'
                  ? 'text-[#FFB4AB] hover:bg-black/5'
                  : 'text-[#34D378] hover:bg-black/5'
              }`}
            >
              {copyStatus === 'success' ? (
                <Check className="w-3.5 h-3.5 text-[#34D378]" />
              ) : copyStatus === 'error' ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span aria-live="polite">
                {copyStatus === 'success' ? '已复制 · 期待来信' : copyStatus === 'error' ? '复制失败' : '复制邮箱'}
              </span>
            </button>

            <button
              id="resume-btn-print"
              onClick={handlePrint}
              className="hidden items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-[#A8B0BC] hover:text-[#F3F5F8] hover:bg-black/5 rounded-md transition-colors sm:flex"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>打印</span>
            </button>

            <a
              id="resume-btn-download"
              href="/resume.pdf"
              download="胡利致-简历.pdf"
              className="flex min-h-11 items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 sm:min-h-0 text-xs font-mono uppercase tracking-wider bg-[#0E7C3D] text-white hover:bg-[#0A6631] rounded-md transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 PDF</span>
            </a>

            <button
              id="resume-btn-close"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center sm:h-auto sm:w-auto sm:p-1.5 text-[#A8B0BC] hover:text-[#F3F5F8] hover:bg-black/5 rounded-md transition-colors sm:ml-1"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Resume Sheet */}
        <div data-lenis-prevent className="resume-print-body overflow-y-auto overscroll-contain p-8 sm:p-12 text-[#F3F5F8] bg-[#111418] selection:bg-[#0E7C3D] selection:text-white">
          {/* Header */}
          <div className="border-b border-black/10 pb-6 mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
            <div>
              <h1 id="resume-title" className="text-3xl font-bold tracking-tight text-[#F3F5F8]">
                胡利致 / LEO HU
              </h1>
              <p className="text-sm font-semibold text-[#34D378] mt-1 font-mono tracking-wide">
                项目运营主管 / 跨境电商中台
              </p>
              <p className="text-xs text-[#A8B0BC] mt-2 max-w-xl leading-relaxed">
                {WORK_DATA.hero.bio}
              </p>
            </div>

            <div className="text-xs text-[#A8B0BC] space-y-1 font-mono text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#232A33]">
              <div className="whitespace-nowrap">深圳 · 基于全职 / 顾问合作</div>
              <div className="whitespace-nowrap">{WORK_DATA.contact.email}</div>
              <div className="whitespace-nowrap">微信：{WORK_DATA.contact.wechat}</div>
            </div>
          </div>

          {/* Core Competencies */}
          <div className="mb-8">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#A8B0BC] border-b border-[#232A33] pb-1.5 mb-4 font-semibold">
              核心能力
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
              {WORK_DATA.capabilities.map((cap) => (
                <div key={cap.key} className="border-l-2 border-[#34D378] pl-3">
                  <div className="font-semibold text-[#F3F5F8]">{cap.name}</div>
                  <div className="text-[#A8B0BC] mt-0.5 leading-normal">{cap.details}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Work Experience */}
          <div className="mb-8">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#A8B0BC] border-b border-[#232A33] pb-1.5 mb-4 font-semibold">
              工作经历
            </h2>
            <div className="space-y-6">
              {WORK_DATA.experiences.map((exp) => (
                <div key={exp.id} className="text-xs">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-baseline">
                    <span className="font-bold text-sm text-[#F3F5F8]">{exp.company}</span>
                    <span className="text-[#A8B0BC] font-mono">{[exp.period, exp.location].filter(Boolean).join(' · ')}</span>
                  </div>
                  <div className="text-[#34D378] font-mono font-medium mt-0.5">{exp.title}</div>
                  <p className="text-[#A8B0BC] mt-1.5 leading-relaxed">{exp.description}</p>
                  <div className="mt-2 text-[#C3CAD5]">
                    <span className="font-semibold">核心交付成果：</span>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-[#A8B0BC]">
                      {exp.keyProjects.map((proj, idx) => (
                        <li key={idx}>{proj}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Case Studies */}
          <div className="mb-8">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#A8B0BC] border-b border-[#232A33] pb-1.5 mb-4 font-semibold">
              重点项目精选
            </h2>
            <div className="space-y-5 text-xs">
              {WORK_DATA.projects.map((proj) => (
                <div key={proj.id} className="bg-[#0A0B0D] p-4 rounded-xl border border-[#232A33]">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-baseline mb-1">
                    <h3 className="font-bold text-sm text-[#F3F5F8]">{proj.title} · {proj.subtitle}</h3>
                    <span className="text-[#A8B0BC] font-mono">{proj.period}</span>
                  </div>
                  <div className="text-[#34D378] font-mono font-medium mb-1.5">{proj.myRole}</div>
                  <p className="text-[#A8B0BC] mb-2 leading-relaxed">{proj.problem}</p>
                  <div className="text-[#F3F5F8] font-semibold mb-1">关键行动与执行：</div>
                  <ul className="list-disc list-inside space-y-0.5 text-[#A8B0BC] mb-2">
                    {proj.whatIDid.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <div className="text-[#34D378] text-sm pt-2 border-t border-[#232A33] font-medium">
                    交付成效：{proj.result}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#98A1AF] border-b border-[#232A33] pb-1.5 mb-4">
              教育背景
            </h2>
            <div className="space-y-3 text-xs">
              {WORK_DATA.education.map((edu, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-baseline">
                  <div>
                    <span className="font-bold text-[#F3F5F8]">{edu.institutionZh ? edu.institutionZh + " " : ""}{edu.institution}</span>
                    {edu.degree && <div className="text-[#9AA3B0]">{edu.degree}</div>}
                  </div>
                  <div className="text-[#98A1AF] font-mono text-left sm:text-right mt-1 sm:mt-0">
                    {edu.period} · {edu.location}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
