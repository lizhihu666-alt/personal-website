import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { TRAVEL, TRAVEL_HOME, type TravelCountry } from '../../data/portfolioData';
import { gsap, isReducedMotion } from '../../utils/gsapSetup';
import { LifeChapterLabel } from './LifeChapterLabel';
import './LifeTravel.css';

// 生活页「旅行」：点阵世界地图 + 从家出发的航线；点一个国家，地图放大到这个国家，每个点都能看照片。
// 底图都是用 dotted-map 一次性生成的静态 SVG（墨卡托投影），这里用同一套投影把经纬度换算成百分比位置。
//   世界：public/travel/dotted-world.svg，经度 -179~179、纬度 -56~71，画布 210×100
//   国家：public/travel/travel-*.svg，范围见下面的 DETAIL（美国只画本土）

const mercator = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

interface Region {
  lat: [number, number];
  lng: [number, number];
}

// 经纬度 → 在某个区域地图里的百分比位置（0~100）
const projectIn = (region: Region, lat: number, lng: number) => {
  const top = mercator(region.lat[1]);
  return {
    x: ((lng - region.lng[0]) / (region.lng[1] - region.lng[0])) * 100,
    y: ((top - mercator(lat)) / (top - mercator(region.lat[0]))) * 100,
  };
};

const WORLD: Region = { lat: [-56, 71], lng: [-179, 179] };
// 世界图的 SVG 画布是 210×100，航线在这个坐标系里画
const MAP_W = 210;
const MAP_H = 100;

const DETAIL: Record<string, Region & { src: string }> = {
  '840': { src: '/travel/travel-usa.svg', lat: [23.5, 50.5], lng: [-132.22689510349096, -59.773104896509025] },
  '392': { src: '/travel/travel-japan.svg', lat: [32.4, 38.4], lng: [128.2640396759342, 143.7359603240658] },
  '764': { src: '/travel/travel-thailand.svg', lat: [7.2, 19.8], lng: [87.56337853585035, 114.83662146414966] },
};

const pct = (p: { x: number; y: number }) => ({ left: `${p.x}%`, top: `${p.y}%` });

// 从家到目的地的弧线：控制点抬到两点上方，距离越远弧度越大。
const arcPath = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const midX = (a.x + b.x) / 2;
  const lift = Math.min(28, Math.hypot(b.x - a.x, b.y - a.y) * 0.32);
  const midY = Math.min(a.y, b.y) - lift;
  return `M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`;
};
const toCanvas = (p: { x: number; y: number }) => ({ x: (p.x / 100) * MAP_W, y: (p.y / 100) * MAP_H });

const LABEL_PLACEMENT: Record<string, string> = {
  top: 'travel-label--top',
  left: 'travel-label--left',
  right: 'travel-label--right',
  bottom: 'travel-label--bottom',
};

const canZoom = (country: TravelCountry) => Boolean(DETAIL[country.id]) && country.cities.length > 0;

export const LifeTravel: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [countryId, setCountryId] = useState<string | null>(null);
  const [cityId, setCityId] = useState<string | null>(null);

  const homePct = useMemo(() => projectIn(WORLD, TRAVEL_HOME.lat, TRAVEL_HOME.lng), []);
  const routes = useMemo(() => {
    const home = toCanvas(homePct);
    return TRAVEL.filter((country) => country.route).map((country) => {
      const end = toCanvas(projectIn(WORLD, country.anchor[1], country.anchor[0]));
      return { country, d: arcPath(home, end) };
    });
  }, [homePct]);

  const country = countryId ? TRAVEL.find((item) => item.id === countryId) ?? null : null;
  const detail = country ? DETAIL[country.id] : null;
  const city = country?.cities.find((item) => item.id === cityId) ?? null;
  const totalCities = TRAVEL.reduce((sum, item) => sum + item.cities.length, 0);
  const zoomed = Boolean(detail);

  const openCountry = (next: TravelCountry | null, nextCity: string | null = null) => {
    setCountryId(next && canZoom(next) ? next.id : null);
    setCityId(nextCity);
  };

  // 放大视图里按 Esc 回到世界地图
  useEffect(() => {
    if (!zoomed) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') openCountry(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomed]);

  // 世界地图放大时，以这个国家为中心推近
  const zoomOrigin = country ? projectIn(WORLD, country.anchor[1], country.anchor[0]) : { x: 50, y: 50 };

  // 进入视口时，航线按顺序画出来，目的地的点和标签随后亮起。
  useLayoutEffect(() => {
    if (isReducedMotion()) return;
    const ctx = gsap.context(() => {
      const trigger = { trigger: sectionRef.current, start: 'top 68%', once: true };
      gsap.fromTo(
        '.travel-reveal',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.08, ease: 'power3.out', clearProps: 'opacity,transform', scrollTrigger: trigger }
      );
      gsap.utils.toArray<SVGPathElement>('.travel-route').forEach((path, index) => {
        const length = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDasharray: length, strokeDashoffset: length },
          { strokeDashoffset: 0, duration: 1.4, delay: 0.35 + index * 0.35, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset', scrollTrigger: trigger }
        );
      });
      gsap.fromTo(
        '.travel-marker',
        { opacity: 0, scale: 0.4 },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.02, delay: 0.6, ease: 'back.out(2)', clearProps: 'opacity,transform', scrollTrigger: trigger }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const reduced = typeof window !== 'undefined' && isReducedMotion();

  return (
    <section
      id="life-travel"
      ref={sectionRef}
      aria-labelledby="life-travel-title"
      className="relative border-t border-[#1F1F1F] px-6 py-20 sm:px-10 sm:py-28 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        {/* 标题在左、一句统计在右，和上面两个栏目同一条左边线 */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
          <div>
            <LifeChapterLabel index="03" name="旅行" className="travel-reveal" />
            <h2
              id="life-travel-title"
              className="travel-reveal mt-5 text-3xl font-bold leading-[1.2] tracking-tight text-[#F5F4F2] sm:text-[2.6rem]"
            >
              走过的<span className="text-(--life-accent)">地方</span>
            </h2>
          </div>
          <p className="travel-reveal text-base leading-[1.85] text-[#B4B0AB] md:pb-1 md:text-right">
            从{TRAVEL_HOME.name}出发，{TRAVEL.length - 1} 个国家，{totalCities} 座城市和国家公园
          </p>
        </div>

        {/* 地图：世界层和国家层叠在同一个框里，切换时一个推近淡出、一个淡入 */}
        <div className="travel-reveal travel-stage relative mx-auto mt-10 aspect-[21/10] w-full sm:mt-12" data-zoomed={zoomed}>
          {/* ── 世界 ── */}
          <div
            className="travel-layer travel-layer--world"
            style={{ transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }}
            aria-hidden={zoomed}
            inert={zoomed}
          >
            <img
              src="/travel/dotted-world.svg"
              alt=""
              aria-hidden="true"
              draggable={false}
              className="travel-dots pointer-events-none absolute inset-0 h-full w-full select-none"
            />

            <svg
              viewBox={`0 0 ${MAP_W} ${MAP_H}`}
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="travel-route-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'var(--life-accent)', stopOpacity: 0 }} />
                  <stop offset="12%" style={{ stopColor: 'var(--life-accent)', stopOpacity: 1 }} />
                  <stop offset="88%" style={{ stopColor: 'var(--life-accent)', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: 'var(--life-accent)', stopOpacity: 0 }} />
                </linearGradient>
              </defs>

              {routes.map(({ country: item, d }, index) => (
                <g key={item.id}>
                  <path
                    className="travel-route"
                    d={d}
                    fill="none"
                    stroke="url(#travel-route-gradient)"
                    strokeWidth={1.25}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* 沿着航线跑的一粒光点 */}
                  {!reduced && !zoomed && (
                    <circle r={0.75} style={{ fill: 'var(--life-accent-hi)' }}>
                      <animateMotion dur="3.6s" begin={`${1.8 + index * 0.6}s`} repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1" />
                      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="3.6s" begin={`${1.8 + index * 0.6}s`} repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              ))}
            </svg>

            {/* 家 */}
            <div className="travel-marker travel-point travel-point--home" style={pct(homePct)}>
              <span className="travel-dot travel-dot--home" />
              <span className="travel-pulse" />
              <span className="travel-label travel-label--right travel-label--home">{TRAVEL_HOME.name}</span>
            </div>

            {/* 城市：世界图上只是光点，不挂名字（太密），点了直接进这个国家 */}
            {TRAVEL.flatMap((item) =>
              item.cities.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  tabIndex={-1}
                  className="travel-marker travel-point"
                  style={pct(projectIn(WORLD, place.lat, place.lon))}
                  aria-label={`${item.name} · ${place.name}`}
                  onClick={() => openCountry(item, place.id)}
                >
                  <span className="travel-dot" />
                </button>
              ))
            )}

            {/* 国家标签：点了放大到这个国家 */}
            {TRAVEL.filter((item) => item.route).map((item) => (
              <button
                key={item.id}
                type="button"
                className={`travel-marker travel-label travel-label--country ${LABEL_PLACEMENT[item.labelAt ?? 'top']}`}
                style={pct(projectIn(WORLD, item.anchor[1], item.anchor[0]))}
                onClick={() => openCountry(item)}
                aria-label={`放大查看${item.name}，${item.cities.length} 个地方`}
              >
                {item.name}
                <span className="travel-label-count">{item.cities.length}</span>
              </button>
            ))}
          </div>

          {/* ── 国家 ── */}
          {country && detail && (
            <div key={country.id} className="travel-layer travel-layer--detail">
              <img
                src={detail.src}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="travel-dots travel-dots--detail pointer-events-none absolute inset-0 h-full w-full select-none"
              />

              {country.cities.map((place, index) => {
                const selected = place.id === cityId;
                return (
                  <button
                    key={place.id}
                    type="button"
                    className="travel-point travel-point--detail"
                    data-selected={selected}
                    data-dim={cityId !== null && !selected}
                    style={{ ...pct(projectIn(detail, place.lat, place.lon)), animationDelay: `${0.25 + index * 0.035}s` }}
                    aria-label={place.name}
                    aria-pressed={selected}
                    onClick={() => setCityId(selected ? null : place.id)}
                  >
                    <span className="travel-dot" />
                    {selected && <span className="travel-pulse" />}
                    <span className="travel-label travel-label--top travel-label--city">{place.name}</span>
                  </button>
                );
              })}

              <div className="travel-detail-head">
                <button type="button" className="travel-back" onClick={() => openCountry(null)}>
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  世界
                </button>
                <span className="travel-detail-title">
                  {country.name}
                  <span className="travel-label-count">{country.cities.length}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 地图下面：国家切换 + 城市 + 照片 */}
        <div className="travel-reveal mx-auto mt-10 max-w-3xl">
          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="按国家查看">
            {TRAVEL.filter(canZoom).map((item) => {
              const active = countryId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => openCountry(active ? null : item)}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors duration-200 focus-visible:outline-none ${
                    active
                      ? 'border-(--life-accent) bg-(--life-accent) font-semibold text-(--life-on-accent)'
                      : 'border-[#333333] text-[#F5F4F2] hover:border-(--life-accent) hover:text-(--life-accent) focus-visible:border-(--life-accent) focus-visible:text-(--life-accent)'
                  }`}
                >
                  <span>{item.name}</span>
                  <span className={`tabular-nums ${active ? 'text-(--life-on-accent)/70' : 'text-[#8A8784]'}`}>{item.cities.length}</span>
                </button>
              );
            })}
          </div>

          {country && country.cities.length > 0 && (
            <ul key={country.id} className="travel-cities mt-6 flex flex-wrap justify-center gap-x-1 gap-y-1">
              {country.cities.map((place) => {
                const selected = place.id === cityId;
                return (
                  <li key={place.id}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setCityId(selected ? null : place.id)}
                      className={`inline-flex min-h-11 items-center rounded-full px-3.5 py-2 text-sm transition-colors duration-200 focus-visible:outline-none ${
                        selected
                          ? 'text-(--life-accent) underline decoration-(--life-accent)/60 underline-offset-[6px]'
                          : 'text-[#B4B0AB] hover:text-[#F5F4F2] focus-visible:text-[#F5F4F2]'
                      }`}
                    >
                      {place.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* 选中一个地方：照片卡 */}
          {country && city && (
            <div key={city.id} className="travel-card mt-8 rounded-2xl border border-[#262626] bg-[#111111] p-5 sm:p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-lg font-semibold text-[#F5F4F2]">
                  {city.name}
                  <span className="ml-2 text-sm font-normal text-[#8A8784]">{country.name}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setCityId(null)}
                  className="text-sm text-[#8A8784] transition-colors hover:text-[#F5F4F2]"
                >
                  收起
                </button>
              </div>
              {city.photos && city.photos.length > 0 ? (
                <div
                  className={`mt-5 grid gap-3 ${
                    city.photos.length === 1
                      ? `mx-auto grid-cols-1 ${city.photos[0].width > city.photos[0].height ? 'max-w-xl' : 'max-w-sm'}`
                      : city.photos.length === 2
                        ? 'grid-cols-2'
                        : 'grid-cols-2 sm:grid-cols-3'
                  }`}
                >
                  {city.photos.map((photo) => (
                    <img
                      key={photo.src}
                      src={photo.src}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      loading="lazy"
                      decoding="async"
                      className={`w-full rounded-xl object-cover ${city.photos!.length === 1 ? 'h-auto' : 'aspect-[3/4]'}`}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-[#8A8784]">照片还在整理，过几天再来看看。</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
