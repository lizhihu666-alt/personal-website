import { useEffect, useRef, useState } from 'react';
import ProfileCard from './ProfileCard';
import { isReducedMotion } from '../../../utils/gsapSetup';
import './ContactCard.css';

// ===== LEO 水印参数（改这三个数就行）=====
// WATERMARK_ANGLE：倾斜角度，单位度。正数 = 向右上斜（30 即 30° 斜向上），
//   0 = 水平，负数 = 向右下斜。角度大或字样太大时，字会被图块边缘切掉，
//   此时把下面的 WATERMARK_TEXT_RATIO 调小一点。
const WATERMARK_ANGLE = 30;
// WATERMARK_SIZE：每个 LEO 图块占名片宽度的比例。越大 → LEO 越大、数量越少。
//   可选：'30%' 偏密 / '40%' 适中 / '50%' 偏疏 / '65%' 很疏
// WATERMARK_TEXT_RATIO：LEO 字样占图块宽度的比例，越小 → LEO 之间留白越大。
//   可选：0.7 紧凑 / 0.5 适中 / 0.4 宽松 / 0.3 很宽松
const WATERMARK_SIZE = '50%';
const WATERMARK_TEXT_RATIO = 0.7;

// 全息水印用亮度蒙版：白色是"透出彩虹反光"的部分，黑色是挡住的部分。
// 直接用 SVG 现画一个 LEO 平铺图，不依赖额外图片文件。
const TILE_W = 220;
const TILE_H = 140;
const FONT_SIZE = Math.round((TILE_W * WATERMARK_TEXT_RATIO) / 2.2);
const LEO_WATERMARK = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_W}" height="${TILE_H}" viewBox="0 0 ${TILE_W} ${TILE_H}">` +
    `<rect width="${TILE_W}" height="${TILE_H}" fill="black"/>` +
    `<text x="${TILE_W / 2}" y="${TILE_H / 2 + FONT_SIZE * 0.35}" text-anchor="middle" ` +
    `transform="rotate(${-WATERMARK_ANGLE} ${TILE_W / 2} ${TILE_H / 2})" ` +
    `font-family="Geist, Inter, Arial, sans-serif" font-size="${FONT_SIZE}" font-weight="800" ` +
    `letter-spacing="${Math.round(FONT_SIZE / 10)}" fill="white">LEO</text></svg>`
)
  // ProfileCard 把它放进不带引号的 url() 里，encodeURIComponent 不会转义括号，
  // 而 rotate(...) 里有括号，必须手动转义，否则整条 url() 会被截断、水印消失。
  .replace(/\(/g, '%28')
  .replace(/\)/g, '%29')}`;

const GREEN_GRADIENT = 'linear-gradient(145deg,#0b2a1dcc 0%,#07130ecc 100%)';
const GREEN_GLOW = 'rgba(52, 211, 120, 0.55)';

export interface ContactCardProps {
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  contactText?: string;
  avatarUrl: string;
  qrUrl: string;
  qrAlt?: string;
  qrTitle?: string;
  qrCaption?: string;
  /** 二维码图片加载失败（或还没放进去）时显示的文字，例如微信号 */
  qrFallbackText?: string;
  flipHint?: string;
  backLabel?: string;
}

// 翻面名片：正面是 ProfileCard，背面是二维码。点击名片或联系按钮翻面，再点翻回。
export function ContactCard({
  name = 'Leo.Hu',
  title = '',
  handle = '',
  status = '',
  contactText = '联系',
  avatarUrl,
  qrUrl,
  qrAlt = '二维码',
  qrTitle = name,
  qrCaption = '扫码添加',
  qrFallbackText = '',
  flipHint = '点击任意处翻回',
  backLabel = '翻回名片'
}: ContactCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);
  const [reduced] = useState(() => isReducedMotion());
  // 触屏设备没有悬停，倾斜/反光跟手指走没有意义，还会让混合层在手指按住时不断重绘，直接关掉。
  const [touchOnly] = useState(() => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches);

  return (
    <div className="contact-flip-wrap">
      <div className={`contact-flip-inner ${flipped ? 'is-flipped' : ''}`}>
        <div className="contact-flip-face contact-flip-front" onClick={() => setFlipped(true)}>
          <div
            className="contact-profile-card"
            style={{ ['--watermark-size' as string]: WATERMARK_SIZE }}
          >
            <ProfileCard
              name={name}
              title={title}
              handle={handle}
              status={status}
              contactText={contactText}
              avatarUrl={avatarUrl}
              iconUrl={LEO_WATERMARK}
              showMiniAvatar={false}
              showUserInfo
              enableTilt={!reduced && !touchOnly}
              enableMobileTilt={false}
              behindGlowEnabled
              behindGlowColor={GREEN_GLOW}
              innerGradient={GREEN_GRADIENT}
              onContactClick={() => setFlipped(true)}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setFlipped(false)}
          aria-label={backLabel}
          className="contact-flip-face contact-flip-back contact-qr-back"
        >
          <p className="contact-qr-title">{qrTitle}</p>
          <p className="contact-qr-caption">{qrCaption}</p>
          <div className="contact-qr-box">
            {qrFailed ? (
              <span className="contact-qr-fallback">{qrFallbackText || qrCaption}</span>
            ) : (
              <img src={qrUrl} alt={qrAlt} onError={() => setQrFailed(true)} />
            )}
          </div>
          <span className="contact-qr-hint">{flipHint}</span>
        </button>
      </div>
    </div>
  );
}

export interface ContactModalProps extends ContactCardProps {
  isOpen: boolean;
  onClose: () => void;
  closeLabel?: string;
}

// 弹窗外壳：遮罩、Esc / 点遮罩关闭，打开期间锁住页面滚动（页面是 Lenis 接管的，
// 只靠 overflow:hidden 挡不住，跟简历弹窗同样用 body fixed 方式锁）。
export function ContactModal({ isOpen, onClose, closeLabel = '关闭', ...card }: ContactModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const body = document.body;
    const scrollY = window.scrollY;
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width
    };
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      window.scrollTo(0, scrollY);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="contact-modal-root">
      <div className="contact-modal-backdrop" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={card.name ?? '联系方式'}
        tabIndex={-1}
        className="contact-modal-panel"
      >
        <button type="button" onClick={onClose} aria-label={closeLabel} className="contact-modal-close">
          ×
        </button>
        <ContactCard {...card} />
      </div>
    </div>
  );
}
