import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { isReducedMotion, ScrollTrigger } from '../../utils/gsapSetup';
import { METHOD_TEXT_REVEAL_END } from './methodTraceTiming';

interface TraceDefinition {
  label: string;
  seed: number;
  amplitude: number;
  positionShift: number;
  highlighted?: boolean;
}

interface TracePoint {
  x: number;
  y: number;
  z: number;
}

const TRACE_DEFINITIONS: TraceDefinition[] = [
  {
    label: '项目管理',
    seed: 650,
    amplitude: 1,
    positionShift: 2,
    highlighted: true,
  },
  {
    label: 'IT 拉通',
    seed: 350,
    amplitude: 2,
    positionShift: -3,
  },
  {
    label: '供应链协同',
    seed: 750,
    amplitude: 1.5,
    positionShift: -2,
  },
  {
    label: 'AI 提效',
    seed: 650,
    amplitude: 1.25,
    positionShift: -4,
  },
];

// 曲线的形状由 BASE_COUNT 个采样点决定（每隔 3 个参数取一个，和原来完全一致，
// 所以外观不变）。但这些点直接用直线连起来，每段 0.75 个单位长，弯处能看出折角。
// 做法：保留这 100 个采样点，再用 Catmull-Rom 样条在它们之间插值出 POINT_COUNT 个点，
// 线条就是真正的平滑曲线，而不是改变形状。
const BASE_COUNT = 100;
const POINT_COUNT = 400;
const POINT_COMPONENTS = POINT_COUNT * 3;
const CURVE_SPAN = 300;
const curveIndexOf = (baseIndex: number) => baseIndex * 3;

// 标准 Catmull-Rom（张力 0.5）：在 p1→p2 之间按 u∈[0,1] 取值，p0、p3 是两侧邻点。
const catmullRom = (p0: number, p1: number, p2: number, p3: number, u: number) => {
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * u +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * u3)
  );
};
const CAMERA_Z = 5;
const CAMERA_FOV = 75;
const FALLBACK_VIEW_WIDTH = 13.8;
const TRACE_COLOR = '#279E5A';
const HIGHLIGHT_DOT_COLOR = '#279E5A';
const HIGHLIGHT_DOT_END = new THREE.Color('#279E5A');
// 收尾阶段跟 WorkImpact 的变黑转场用同一套像素随机铺开手法，只不过这里
// 是从深色页面过渡到下一板块（项目，浅色），铺的是浅色方块，方向反过来。
const PIXEL_EXIT_COLOR = '#F3F5F8';
const PIXEL_CELL_SIZE = 80;
// 文字全部出现后先留一段停顿(HOLD_END 之前什么都不发生)再触发转场——
// 不然鼠标一下滑，惯性马上就把变白动画带出来了，跟 WorkImpact 变黑
// 之前加缓冲是同一个道理，但停顿不能太长：之前留了 265vh 的纯空滚动
// （950vh 总跨度里，文字在 507vh 处就已经揭示完，转场却要等到 772vh
// 才开始），读者滑到怀疑人生才能翻到下一个板块。现在把总跨度收到
// window.innerHeight * 4.9（约 490vh），停顿只留 50vh，线条汇合/文字
// 揭示的相对节奏不变，只是整体更紧凑。
const HOLD_END = 0.8776;
const PIXEL_TRANSITION_START = HOLD_END;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (start: number, end: number, amount: number) => (1 - amount) * start + amount * end;
const cubic = (value: number) => value * value * value;

const easeInOutQuad = (value: number) => {
  const progress = clamp(value);
  return progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
};

const easeOutQuad = (value: number) => {
  const progress = clamp(value);
  return 1 - (1 - progress) * (1 - progress);
};

const smoothstep = (start: number, end: number, value: number) => {
  const progress = clamp((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
};

// 线条汇合(fuse)、文字揭示、变白转场几段各自的物理滚动距离（进入
// 200vh、汇合 100vh、文字揭示 80vh、停顿 50vh、转场 60vh，共 490vh），
// 换算成 ScrollTrigger 总滚动范围下的百分比就是这几个数——同一批常量
// 要跟着 HOLD_END 一起改，不能只改其中一个。
const ENTER_END = 0.4082;
const FUSE_END = 0.6122;
// 右侧阅读进度条也用它判断「文字已完全显现」的滚动位置，所以定义在单独的文件里。
const TEXT_REVEAL_END = METHOD_TEXT_REVEAL_END;

const getScrollState = (progress: number) => {
  const enterProgress = easeOutQuad(clamp(progress / ENTER_END));
  const fuseProgress =
    progress <= ENTER_END ? 0 : easeInOutQuad((progress - ENTER_END) / (FUSE_END - ENTER_END));
  const enterPosition = lerp(12, -0.5, enterProgress);
  const currentEnterPosition =
    progress <= ENTER_END ? enterPosition : lerp(-0.5, -1.5, fuseProgress);

  return { fuseProgress, currentEnterPosition };
};

const getTracePoint = (
  definition: TraceDefinition,
  componentIndex: number,
  progress: number,
  elapsed: number,
  viewWidth: number,
  isCompact: boolean
): TracePoint => {
  const { fuseProgress, currentEnterPosition } = getScrollState(progress);
  const phase = (elapsed + definition.seed) * 0.8;
  const drift = Math.sin(phase + definition.seed / 100);
  const wave = Math.sin((componentIndex - phase) * (1 - 0.002 * currentEnterPosition) * 2);
  const remaining = 1 - fuseProgress;
  const shape = cubic(
    Math.sin((componentIndex / CURVE_SPAN) * 4 * Math.PI) *
      Math.sin(2 * definition.amplitude) *
      1.5
  );
  const fusedAmplitude = lerp(definition.amplitude, 0, cubic(fuseProgress));
  const depth = -CURVE_SPAN * 0.25 + 0.25 * componentIndex - currentEnterPosition;
  const rollingDepth = depth + drift + definition.positionShift;
  const widthDepth = depth - (1 - 0.06 * viewWidth);
  const curve = shape * fuseProgress;
  const horizontalDepth = lerp(rollingDepth, widthDepth, fuseProgress);
  const verticalWave = curve + wave * fusedAmplitude;
  const mixedDepth = lerp(0.1 * wave, remaining * wave + 0.5, fuseProgress);

  return {
    x: isCompact ? verticalWave : horizontalDepth,
    y: isCompact ? -horizontalDepth : verticalWave,
    z: mixedDepth,
  };
};

const getFallbackTrace = (definition: TraceDefinition) => {
  const coordinates = Array.from({ length: BASE_COUNT }, (_, index) => {
    const point = getTracePoint(definition, curveIndexOf(index), 1, 0, FALLBACK_VIEW_WIDTH, false);

    return {
      x: ((point.x + 8) / 16) * 1000,
      y: (0.5 - point.y / 5.5) * 560,
    };
  });

  return {
    path: coordinates
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' '),
    dot: coordinates[coordinates.length - 2],
    label: coordinates[coordinates.length - 2],
  };
};

const FALLBACK_TRACES = TRACE_DEFINITIONS.map(getFallbackTrace);

export const WorkMethodTrace: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const outcomeRef = useRef<HTMLDivElement>(null);
  const outcomeLinkRef = useRef<HTMLAnchorElement>(null);
  const pixelGridRef = useRef<HTMLCanvasElement>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const headingId = useId();

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const canvasHost = canvasHostRef.current;
    if (!section || !sticky || !canvasHost || isReducedMotion()) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    let width = canvasHost.clientWidth;
    let height = canvasHost.clientHeight;
    let progress = 0;
    let frameId = 0;
    let isVisible = false;
    let disposed = false;
    let hasReadyFrame = false;

    // 黑变白像素层跟视口一样宽高，section 没有左右内边距，方块层直接
    // 铺满 .method-trace-sticky 就是整屏，不需要像 WorkImpact 那样再
    // 用"满宽出血"的技巧去躲父元素的内边距。
    // 之前这层是几百个各自用 opacity 做淡入的绝对定位 div——每帧
    // 同时改几百个节点的样式，在集显卡机器上会跟同一帧里的 WebGL
    // 渲染抢资源，合成器来不及消化就出现撕裂，画面上表现成一条条
    // 细长的白色竖线（而不是设计好的棋盘格）。改成一块 canvas，每帧
    // 只用一次 2D 绘制把所有格子画上去，没有几百个独立图层要合成。
    const pixelGridEl = pixelGridRef.current;
    const pixelCtx = pixelGridEl?.getContext('2d') ?? null;
    let pixelCells: Array<{ col: number; row: number; threshold: number }> = [];
    // 格子的宽/高分开算（各自用画布的宽、高去除总列数/行数），保证
    // 无论列数、行数怎么四舍五入，最后一列/最后一行都精确顶到画布
    // 边缘——如果两个方向共用同一个"标准格子边长"，累积出来的总宽高
    // 跟画布实际尺寸会有几十像素的出入，差的这一截就會露出画布本身
    // 的透明背景（也就是section的纯黑底色），表现成一条黑边。
    let pixelCellW = 0;
    let pixelCellH = 0;
    let pixelCanvasWidth = 0;
    let pixelCanvasHeight = 0;

    const buildPixelGrid = () => {
      if (!pixelGridEl) return;
      const pixelRect = pixelGridEl.getBoundingClientRect();
      const cols = Math.max(1, Math.round(pixelRect.width / PIXEL_CELL_SIZE));
      const actualCellWidth = pixelRect.width / cols;
      const pixelRows = Math.max(1, Math.round(pixelRect.height / actualCellWidth));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      pixelCellW = pixelRect.width / cols;
      pixelCellH = pixelRect.height / pixelRows;
      pixelCanvasWidth = pixelRect.width;
      pixelCanvasHeight = pixelRect.height;
      pixelGridEl.width = pixelRect.width * dpr;
      pixelGridEl.height = pixelRect.height * dpr;
      pixelGridEl.style.width = `${pixelRect.width}px`;
      pixelGridEl.style.height = `${pixelRect.height}px`;
      pixelCtx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      pixelCells = [];
      for (let row = 0; row < pixelRows; row++) {
        for (let col = 0; col < cols; col++) {
          pixelCells.push({ col, row, threshold: Math.random() });
        }
      }
    };

    buildPixelGrid();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.width = '100%';
    canvasHost.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, width / height, 0.1, 1000);
    camera.position.set(0, 0, CAMERA_Z);

    const clock = new THREE.Clock();
    const group = new THREE.Group();
    scene.add(group);

    const traceObjects = TRACE_DEFINITIONS.map((definition) => {
      const positions = new Float32Array(POINT_COMPONENTS);
      const segmentPositions = new Float32Array((POINT_COUNT - 1) * 6);
      const instanceBuffer = new THREE.InstancedInterleavedBuffer(segmentPositions, 6, 1);
      const geometry = new LineGeometry();
      geometry.setAttribute(
        'instanceStart',
        new THREE.InterleavedBufferAttribute(instanceBuffer, 3, 0)
      );
      geometry.setAttribute(
        'instanceEnd',
        new THREE.InterleavedBufferAttribute(instanceBuffer, 3, 3)
      );
      geometry.instanceCount = POINT_COUNT - 1;
      geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1000);

      const lineMaterial = new LineMaterial({
        color: TRACE_COLOR,
        linewidth: 0.01,
        worldUnits: true,
        transparent: true,
        opacity: 1,
      });
      lineMaterial.resolution.set(width, height);

      const line = new Line2(geometry, lineMaterial);
      line.frustumCulled = false;

      const dotGeometry = new THREE.CircleGeometry(0.025, 32);
      const dotMaterial = new THREE.MeshBasicMaterial({
        color: definition.highlighted ? HIGHLIGHT_DOT_COLOR : TRACE_COLOR,
        transparent: true,
      });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      dot.scale.setScalar(definition.highlighted ? 2.6 : 1);

      group.add(line, dot);
      return {
        definition,
        positions,
        segmentPositions,
        instanceBuffer,
        geometry,
        lineMaterial,
        dot,
        dotGeometry,
        dotMaterial,
      };
    });

    const basePoints = new Float32Array(BASE_COUNT * 3);
    const worldPosition = new THREE.Vector3();
    const textPosition = new THREE.Vector3();
    const projectedPosition = new THREE.Vector3();

    const updateCamera = () => {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const updateSize = () => {
      const nextWidth = canvasHost.clientWidth;
      const nextHeight = canvasHost.clientHeight;
      if (!nextWidth || !nextHeight) return;

      width = nextWidth;
      height = nextHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      traceObjects.forEach(({ lineMaterial }) => lineMaterial.resolution.set(width, height));
      updateCamera();
      renderFrame();
    };

    const renderFrame = () => {
      if (disposed || !width || !height) return;

      const elapsed = clock.getElapsedTime();
      const { fuseProgress } = getScrollState(progress);
      const isCompact = width < 768;
      const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2)) * CAMERA_Z;
      const visibleWidth = visibleHeight * (width / height);

      group.position.x = isCompact ? 0 : -0.5 * smoothstep(0.9, 1, progress);
      camera.updateMatrixWorld();

      traceObjects.forEach(({ definition, positions, segmentPositions, instanceBuffer, lineMaterial, dot, dotMaterial }, traceIndex) => {
        let finalX = 0;
        let finalY = 0;
        let finalZ = 0;

        for (let baseIndex = 0; baseIndex < BASE_COUNT; baseIndex += 1) {
          const point = getTracePoint(
            definition,
            curveIndexOf(baseIndex),
            progress,
            elapsed,
            visibleWidth,
            isCompact
          );
          basePoints[baseIndex * 3] = point.x;
          basePoints[baseIndex * 3 + 1] = point.y;
          basePoints[baseIndex * 3 + 2] = point.z;
        }

        // 原始采样点之间用样条补点，让线条平滑。
        for (let pointIndex = 0; pointIndex < POINT_COUNT; pointIndex += 1) {
          const t = (pointIndex * (BASE_COUNT - 1)) / (POINT_COUNT - 1);
          const segment = Math.min(BASE_COUNT - 2, Math.floor(t));
          const u = t - segment;
          const i0 = Math.max(0, segment - 1) * 3;
          const i1 = segment * 3;
          const i2 = (segment + 1) * 3;
          const i3 = Math.min(BASE_COUNT - 1, segment + 2) * 3;
          const index = pointIndex * 3;

          for (let axis = 0; axis < 3; axis += 1) {
            positions[index + axis] = catmullRom(
              basePoints[i0 + axis],
              basePoints[i1 + axis],
              basePoints[i2 + axis],
              basePoints[i3 + axis],
              u
            );
          }

          if (pointIndex === POINT_COUNT - 1) {
            finalX = positions[index];
            finalY = positions[index + 1];
            finalZ = positions[index + 2];
          }
        }

        for (let pointIndex = 0; pointIndex < POINT_COUNT - 1; pointIndex += 1) {
          const sourceIndex = pointIndex * 3;
          const segmentIndex = pointIndex * 6;

          segmentPositions[segmentIndex] = positions[sourceIndex];
          segmentPositions[segmentIndex + 1] = positions[sourceIndex + 1];
          segmentPositions[segmentIndex + 2] = positions[sourceIndex + 2];
          segmentPositions[segmentIndex + 3] = positions[sourceIndex + 3];
          segmentPositions[segmentIndex + 4] = positions[sourceIndex + 4];
          segmentPositions[segmentIndex + 5] = positions[sourceIndex + 5];
        }
        instanceBuffer.needsUpdate = true;
        dot.position.set(finalX, finalY, finalZ);

        if (definition.highlighted) {
          const highlightProgress = smoothstep(0.92, 1, progress);
          dotMaterial.color.copy(new THREE.Color(HIGHLIGHT_DOT_COLOR).lerp(HIGHLIGHT_DOT_END, highlightProgress));
          dotMaterial.opacity = 1;
        } else {
          dotMaterial.opacity = 1 - fuseProgress;
        }

        lineMaterial.opacity = 1;

        const label = labelRefs.current[traceIndex];
        if (label) {
          const labelOffset = definition.highlighted ? 0.2 : 0.2 * (1 - fuseProgress);
          dot.getWorldPosition(worldPosition);
          textPosition.copy(worldPosition).add(new THREE.Vector3(0, labelOffset, 0));
          projectedPosition.copy(textPosition).project(camera);

          const screenX = (projectedPosition.x * 0.5 + 0.5) * width;
          const screenY = (-projectedPosition.y * 0.5 + 0.5) * height;
          const entryOpacity = smoothstep(0.02, 0.16, progress);
          const labelOpacity = definition.highlighted
            ? entryOpacity * (1 - smoothstep(0.96, 1, progress))
            : entryOpacity * (1 - fuseProgress);

          label.style.opacity = String(clamp(labelOpacity));
          label.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -136%)`;
        }
      });

      // 汇合(fuse)在 FUSE_END 就已经走完，文字揭示从这之后才起步——保证
      // 鼠标继续下滑时，看到的一定是"线已经收成一条，然后文字出现"，
      // 不会是文字跟线条汇合同时抢跑。文字在 TEXT_REVEAL_END 就已经
      // 完全显现，之后到 HOLD_END 之间的一大段纯滚动就是转场前的缓冲。
      const outcomeReveal = smoothstep(FUSE_END, TEXT_REVEAL_END, progress);
      if (outcomeRef.current) {
        const isInteractive = outcomeReveal > 0.9;
        outcomeRef.current.style.opacity = String(outcomeReveal);
        outcomeRef.current.style.pointerEvents = isInteractive ? 'auto' : 'none';
        outcomeRef.current.style.setProperty(
          '--method-outcome-shift',
          `${(1 - outcomeReveal) * 18}px`
        );
        // 文案还没显现的时候链接本身仍然是可 Tab 到的真实 <a>——键盘
        // 用户会先聚焦到一个看不见的链接上，然后被 scrollIntoView 之类
        // 的默认聚焦滚动行为拽到这段很长的钉住区域中间。跟着可见性一起
        // 切 tabIndex，不可见时直接从 Tab 顺序里摘掉。
        const link = outcomeLinkRef.current;
        if (link) {
          if (isInteractive) link.removeAttribute('tabindex');
          else link.setAttribute('tabindex', '-1');
        }
      }

      // 最后一段(HOLD_END ~ 100%)专门留给黑变白的像素转场，跟 WorkImpact
      // 变黑那段一样是随机顺序铺开，只是这里铺的是浅色、方向是收尾。
      if (pixelCtx && pixelCells.length) {
        const transitionProgress = clamp(
          (progress - PIXEL_TRANSITION_START) / (1 - PIXEL_TRANSITION_START)
        );
        pixelCtx.clearRect(0, 0, pixelCanvasWidth, pixelCanvasHeight);
        pixelCtx.fillStyle = PIXEL_EXIT_COLOR;
        pixelCells.forEach(({ col, row, threshold }) => {
          const cellStart = threshold * 0.85;
          const cellOpacity = smoothstep(cellStart, cellStart + 0.15, transitionProgress);
          if (cellOpacity <= 0) return;
          pixelCtx.globalAlpha = cellOpacity;
          pixelCtx.fillRect(
            col * pixelCellW,
            row * pixelCellH,
            pixelCellW + 1,
            pixelCellH + 1
          );
        });
        pixelCtx.globalAlpha = 1;
      }

      renderer.render(scene, camera);
      if (!hasReadyFrame) {
        hasReadyFrame = true;
        setIsCanvasReady(true);
      }

      // 黑变白转场彻底走完之后，专门把 WebGL 画布(不是整块 sticky)
      // 隐藏掉——这一段靠 GSAP 给它加 transform 位移来模拟"钉住"（配合
      // Lenis 用的是 transform 而不是 position:fixed），个别浏览器/
      // 显卡在这类 transform 驱动的合成层上会出现 WebGL 纹理没有及时
      // 丢弃的问题：明明 DOM 里量出来这块已经完全移出视口了，画布上
      // 一帧画的线条却仍残留在屏幕上，跟已经正常滚上来的下一个板块
      // 叠在一起显示。只隐藏 canvasHost 而不是整个 sticky，是因为
      // sticky 里同一层级还有黑变白转场用的那块不透明白色像素画布——
      // 那时候它已经整块铺满盖住了 WebGL 画布，隐藏 canvasHost 视觉上
      // 毫无变化；但如果连 sticky 一起隐藏，会连带把那块白色像素画布
      // 也藏起来，反而露出 section 自己的黑底色，变成一次刺眼的黑闪。
      canvasHost.style.visibility = progress >= 0.999 ? 'hidden' : '';
    };

    const loop = () => {
      if (disposed || !isVisible) {
        frameId = 0;
        return;
      }
      renderFrame();
      frameId = window.requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (frameId || disposed) return;
      frameId = window.requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(canvasHost);

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) startLoop();
        else stopLoop();
      },
      { threshold: 0.02 }
    );
    visibilityObserver.observe(section);

    // 原来靠纯 CSS position:sticky 撑一个超高的容器来模拟"钉住"，
    // 但 sticky 元素高度刚好等于一屏时，取消钉住的那一刻会先整个跳回
    // 容器顶部再随文档正常滚动——中间会露出整屏容器自己的深色背景，
    // 变成"变白之后先出现一屏黑，再出现项目页"的诡异空档。改用 GSAP
    // 自己的 pin（跟 WorkImpact 同一套机制），pin-spacer 由它自己精确
    // 计算，滚动结束的瞬间直接无缝衔接下一个板块，没有多余的空档。
    const trigger = ScrollTrigger.create({
      trigger: sticky,
      start: 'top top',
      // 总跨度约 1.2 屏（最早 4.9 屏、后来 2 屏）：各阶段在总跨度里的占比不变，整体按比例压缩。
      end: () => `+=${window.innerHeight * 1.2}`,
      pin: true,
      scrub: true,
      anticipatePin: 1,
      // 页面里排在经历之后、关于之前：按从上到下的顺序算位置（见 PixelCover 的说明）。
      refreshPriority: 3,
      onUpdate: (self) => {
        progress = self.progress;
        // 一定要在这里强制画一帧，不能靠 isVisible 门槛——快速滚轮
        // 猛地滑过这一段时，IntersectionObserver 的回调本身有延迟
        // （不是逐帧同步的），可能滚动早就把 progress 推到了 1（该
        // 转场完、该收尾），但 isVisible 还没来得及更新成 false 之前
        // 的最后一帧循环已经停了——canvas 就定格在半转场的旧画面上，
        // 直到下一次可见性变化才刷新，肉眼看到的就是"卡片已经滚出来了，
        // 上一屏的线条+黑底还叠在上面"那种一闪而过的诡异画面。
        renderFrame();
      },
    });

    // resize 时窗口宽高变化，方块层也要跟着重建，否则百分比宽高的格子
    // 会被拉伸成长方形（跟 WorkImpact 同一个道理）。不直接监听 window
    // resize：那样会跟 GSAP 自己的 resize 处理抢跑——resize 时
    // ScrollTrigger 也要重新算 pin 的位置/尺寸，抢在它算完之前量
    // pixelGridEl 的宽高，量到的是还没定型的中间状态。改成监听
    // ScrollTrigger 自己的 'refresh' 事件，等它把所有 pin 都重新算完、
    // 真正定型了才触发一次重建。
    ScrollTrigger.addEventListener('refresh', buildPixelGrid);

    renderFrame();
    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      disposed = true;
      ScrollTrigger.removeEventListener('refresh', buildPixelGrid);
      trigger.kill();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      stopLoop();
      window.cancelAnimationFrame(refreshFrame);
      traceObjects.forEach(
        ({ geometry, lineMaterial, dotGeometry, dotMaterial }) => {
          geometry.dispose();
          lineMaterial.dispose();
          dotGeometry.dispose();
          dotMaterial.dispose();
        }
      );
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <section
      id="work-method-trace"
      ref={sectionRef}
      aria-labelledby={headingId}
      className="method-trace-section relative -mt-[100dvh] bg-[#0A0B0D]"
    >
      <h2 id={headingId} className="sr-only">
        方法：项目管理、IT 拉通、供应链协同与 AI 提效四条路径汇成一套中台
      </h2>

      <div
        ref={stickyRef}
        className="method-trace-sticky relative overflow-hidden"
      >
        <div
          className="absolute inset-0"
          role="img"
          aria-label="项目管理、IT 拉通、供应链协同与 AI 提效四条绿色路径在深色背景中交错推进，最终由项目管理路径收束。"
        >
          <div
            className={`method-trace-fallback absolute inset-0 transition-opacity duration-700 ${
              isCanvasReady ? 'opacity-0' : 'opacity-100'
            }`}
            aria-hidden="true"
          >
            <svg
              className="h-full w-full"
              viewBox="0 0 1000 560"
              preserveAspectRatio="none"
            >
              {FALLBACK_TRACES.map(({ path }, index) => (
                <path
                  key={TRACE_DEFINITIONS[index].label}
                  d={path}
                  fill="none"
                  stroke={TRACE_COLOR}
                  strokeWidth={index === 0 ? 1.6 : 1.25}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {FALLBACK_TRACES.map(({ dot }, index) => (
                <circle
                  key={`${TRACE_DEFINITIONS[index].label}-dot`}
                  cx={dot.x}
                  cy={dot.y}
                  r={index === 0 ? 10.5 : 3.6}
                  fill={index === 0 ? HIGHLIGHT_DOT_COLOR : TRACE_COLOR}
                />
              ))}
            </svg>
          </div>

          <div
            ref={canvasHostRef}
            className={`absolute inset-0 transition-opacity duration-700 ${
              isCanvasReady ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />

          <div className="method-trace-veil" aria-hidden="true" />

          {TRACE_DEFINITIONS.map((definition, index) => {
            const fallback = FALLBACK_TRACES[index];
            const labelVariables = {
              '--method-label-left': `${(fallback.label.x / 1000) * 100}%`,
              '--method-label-top': `${(fallback.label.y / 560) * 100}%`,
            } as React.CSSProperties;

            return (
              <span
                key={definition.label}
                ref={(node) => {
                  labelRefs.current[index] = node;
                }}
                className="method-trace-label"
                style={labelVariables}
                aria-hidden="true"
              >
                {definition.label}
              </span>
            );
          })}
        </div>

        <div ref={outcomeRef} className="method-trace-outcome">
          <div className="method-trace-outcome-inner">
            <p className="method-trace-outcome-kicker">最终交付</p>
            <h3 className="method-trace-outcome-title">
              四条路径，
              <br />
              <span>汇成一套可运行的中台</span>
            </h3>
            <p className="method-trace-outcome-copy">
              从招商入驻、SaaS 迁站到自研商家中心，再用 AI 工具补上最后一段提效
            </p>
            <a
              ref={outcomeLinkRef}
              href="#work-about"
              className="method-trace-outcome-link"
            >
              <span>了解更多关于我</span>
              <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>
        </div>

        <canvas ref={pixelGridRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 h-full w-full" />
      </div>
    </section>
  );
};
