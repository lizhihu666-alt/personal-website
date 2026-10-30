import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ProjectImage, ProjectLink } from '../../types';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';

interface ProjectImageLightboxProps {
  images: ProjectImage[];
  // 这组图对应的外链（比如已上线的网站），显示在说明下面。
  link?: ProjectLink;
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

// 案例页里点开缩略图后的大图预览：Esc 关闭、左右方向键切换（首尾循环）、Tab 只在预览内循环、
// 关闭后焦点回到点开的那张缩略图。键盘事件在捕获阶段处理并拦下，不会同时触发案例页自己的 Esc / 方向键。
export const ProjectImageLightbox: React.FC<ProjectImageLightboxProps> = ({
  images,
  link,
  index,
  onIndexChange,
  onClose,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const stateRef = useRef({ index, count: images.length, onIndexChange, onClose });
  stateRef.current = { index, count: images.length, onIndexChange, onClose };

  const image = images[index];
  const hasMany = images.length > 1;

  useEffect(() => {
    const overlay = overlayRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    if (overlay && !isReducedMotion()) {
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const { index: current, count, onIndexChange: change, onClose: close } = stateRef.current;

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
        return;
      }

      if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && count > 1) {
        event.preventDefault();
        event.stopImmediatePropagation();
        change((current + (event.key === 'ArrowRight' ? 1 : -1) + count) % count);
        return;
      }

      if (event.key !== 'Tab' || !overlay) return;

      event.stopImmediatePropagation();
      const focusable: HTMLElement[] = Array.from(overlay.querySelectorAll('button:not([disabled]), a[href]'));
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      previouslyFocused?.focus?.();
    };
  }, []);

  if (!image) return null;

  const step = (direction: 1 | -1) => onIndexChange((index + direction + images.length) % images.length);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={image.caption ?? image.alt}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#04301A]/90 p-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="关闭大图"
        className="absolute right-6 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0E7C3D] transition-transform duration-200 hover:rotate-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-10"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      <figure className="flex max-h-full max-w-full flex-col items-center gap-4">
        <img
          src={image.src}
          alt={image.alt}
          className="max-h-[calc(100dvh-10rem)] max-w-[calc(100vw-3rem)] rounded-lg sm:max-w-[min(calc(100vw-10rem),1100px)] object-contain shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        />
        <figcaption className="max-w-[min(92vw,44rem)] text-center text-sm leading-relaxed text-white">
          {image.caption}
          {hasMany && (
            <span className="ml-3 tabular-nums text-white/70" aria-hidden="true">
              {index + 1} / {images.length}
            </span>
          )}
        </figcaption>
        {link && (
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.label}（在新窗口打开）`}
            className="group/link inline-flex items-center gap-1 text-sm font-medium text-white underline decoration-white/50 underline-offset-4 transition-[text-decoration-color] duration-200 hover:decoration-white focus-visible:decoration-white focus-visible:outline-none"
          >
            {link.label}
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        )}
      </figure>

      {hasMany && (
        <>
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="上一张"
            className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#0E7C3D] text-white shadow-[0_2px_10px_rgba(0,0,0,0.35)] ring-1 ring-white/70 transition-colors duration-200 hover:bg-white hover:text-[#0E7C3D] focus-visible:bg-white focus-visible:text-[#0E7C3D] focus-visible:outline-none sm:left-5"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="下一张"
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#0E7C3D] text-white shadow-[0_2px_10px_rgba(0,0,0,0.35)] ring-1 ring-white/70 transition-colors duration-200 hover:bg-white hover:text-[#0E7C3D] focus-visible:bg-white focus-visible:text-[#0E7C3D] focus-visible:outline-none sm:right-5"
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
};
