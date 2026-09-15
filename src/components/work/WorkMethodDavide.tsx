import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ScrollTrigger } from '../../utils/gsapSetup';

interface MotionParams {
  dotSpeed: number;
  modeRatio: number;
  damping: number;
  sagRest: number;
  sagSwing: number;
  mode2: number;
  lagTime: number;
  [key: string]: number;
}

interface ControlConfig {
  key: keyof MotionParams;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  digits: number;
  hint: string;
}

interface LineDefinition {
  label: string;
  role: 'follower' | 'leader';
  anchor: number;
  roamCenter: number;
  roamAmplitude: number;
  speed: number;
  phase: number;
  startX: number;
  spring: number;
  overtakeSpeed?: number;
  overtakePhase?: number;
}

interface SystemInstance {
  definition: LineDefinition;
  index: number;
  geometry: THREE.BufferGeometry;
  positions: Float32Array;
  material: THREE.ShaderMaterial;
  marker: HTMLDivElement;
  labelEl: HTMLElement | null;
  labelWidth: number;
  headX: number;
  headY: number;
  firstMode: number;
  firstModeVelocity: number;
  secondMode: number;
  secondModeVelocity: number;
  history: Array<{ t: number; x: number; y: number }>;
  initialized: boolean;
}

export const WorkMethodDavide: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodeLayerRef = useRef<HTMLDivElement>(null);
  const finalMarkerRef = useRef<HTMLDivElement>(null);
  const narrativeRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressDotRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const loadErrorRef = useRef<HTMLDivElement>(null);
  const tunerRef = useRef<HTMLDivElement>(null);
  const tunerToggleRef = useRef<HTMLButtonElement>(null);
  const tunerRowsRef = useRef<HTMLDivElement>(null);
  const tunerDumpRef = useRef<HTMLPreElement>(null);
  const tunerResetRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = containerRef.current;
    const method = sectionRef.current;
    const nodeLayer = nodeLayerRef.current;
    const finalMarker = finalMarkerRef.current;
    const narrative = narrativeRef.current;
    const progressBar = progressBarRef.current;
    const progressDot = progressDotRef.current;
    const scrollHint = scrollHintRef.current;
    const loadError = loadErrorRef.current;
    const tuner = tunerRef.current;
    const tunerToggle = tunerToggleRef.current;
    const tunerRows = tunerRowsRef.current;
    const tunerDump = tunerDumpRef.current;
    const tunerReset = tunerResetRef.current;

    if (!canvas || !stage || !method || !nodeLayer || !finalMarker || !narrative || !progressBar || !progressDot || !scrollHint || !loadError || !tuner || !tunerToggle || !tunerRows || !tunerDump || !tunerReset) {
      return;
    }

    const copies = Array.from(stage.querySelectorAll('.copy')) as HTMLElement[];
    const finalLabel = finalMarker.querySelector('.final-marker-label') as HTMLElement | null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 文案挡板：动态标签飘到正在显示的那段文案上时，标签文字自动淡出（只留圆点），
    // 避免两行字叠在一起导致两边都读不清。挡板范围在 resize 时量一次，逐帧只做加减法。
    type SafeBox = { left: number; right: number; top: number; bottom: number };
    const SAFE_PADDING = 12;
    const COPY_BOUNDS = [0, 0.165, 0.46, 0.74, 1];
    // 文案框先向外扩一圈（FADE_PAD），标签在这个“缓冲带”里就开始淡出；
    // 等它真正贴到文字边缘时已经几乎看不见了，所以永远不会出现两行字叠在一起。
    const FADE_PAD = 12;
    const SAFE_FADE_DEPTH = 10;
    let copyBoxes: SafeBox[] = [];
    let finalLabelWidth = 160;

    const activeCopyIndex = (progress: number) => {
      for (let i = copies.length - 1; i >= 0; i -= 1) {
        if (progress >= COPY_BOUNDS[i]) return i;
      }
      return 0;
    };

    // 标签压进文案越深，透明度越低：刚擦到边（0px）时还是 1，压进去 22px 就完全隐去。
    const textMask = (box: SafeBox, progress: number) => {
      const textBox = copyBoxes[activeCopyIndex(progress)];
      if (!textBox) return 1;
      const overlapX = Math.min(box.right, textBox.right + FADE_PAD) - Math.max(box.left, textBox.left - FADE_PAD);
      const overlapY = Math.min(box.bottom, textBox.bottom + FADE_PAD) - Math.max(box.top, textBox.top - FADE_PAD);
      if (overlapX <= 0 || overlapY <= 0) return 1;
      const depth = Math.min(overlapX, overlapY);
      return 1 - smoothstep(mapRange(depth, 0, SAFE_FADE_DEPTH));
    };

    // Reset container in case of remount
    nodeLayer.innerHTML = '';
    tunerRows.innerHTML = '';

    const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;
    const mapRange = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
    const smoothstep = (value: number) => {
      const x = clamp(value);
      return x * x * (3 - 2 * x);
    };

    // ------------------------------------------------------------------
    // 运动模型：模态弦（modal string），不再是逐节点绳索模拟。
    // ------------------------------------------------------------------
    const DEFAULT_MOTION: MotionParams = {
      dotSpeed: 2.35,
      modeRatio: 1.15,
      damping: 0.58,
      sagRest: 0.05,
      sagSwing: 0.24,
      mode2: 0.045,
      lagTime: 0.24,
    };

    const MOTION: MotionParams = { ...DEFAULT_MOTION };

    const CONTROLS: ControlConfig[] = [
      {
        key: 'dotSpeed',
        label: '圆点速度',
        unit: '×',
        min: 0.4,
        max: 4,
        step: 0.05,
        digits: 2,
        hint: '只改周期，不改弧度深浅（弧度已对加速度归一化）。2.35 时一个 ∩→∪ 循环约 3-4.5 秒。',
      },
      {
        key: 'modeRatio',
        label: 'ω₁ / ω 圆点',
        unit: '',
        min: 0.6,
        max: 3.2,
        step: 0.05,
        digits: 2,
        hint: '弧形翻面的时机。1.0 落在共振点、恰好在圆点折返那一瞬翻面；越大翻得越早，越接近「高处就是 ∩」。',
      },
      {
        key: 'damping',
        label: '阻尼比 ζ',
        unit: '',
        min: 0.2,
        max: 1.2,
        step: 0.02,
        digits: 2,
        hint: '低于 0.4 会开始回弹发颤；高于 1.0 弧形变迟钝。',
      },
      {
        key: 'sagRest',
        label: '静止垂度',
        unit: '×h',
        min: 0,
        max: 0.12,
        step: 0.002,
        digits: 3,
        hint: '重力带来的常态 ∪，也就是整条线的静息形状。',
      },
      {
        key: 'sagSwing',
        label: '加速度摆幅',
        unit: '×h',
        min: 0,
        max: 0.32,
        step: 0.005,
        digits: 3,
        hint: '∩ 与 ∪ 的深度: 「弧度好不好看」的主旋钮。',
      },
      {
        key: 'mode2',
        label: '二阶模态',
        unit: '×h',
        min: 0,
        max: 0.09,
        step: 0.002,
        digits: 3,
        hint: '让弧顶偏向一侧，去掉完全对称的塑料感。',
      },
      {
        key: 'lagTime',
        label: '行波延迟',
        unit: 's',
        min: 0,
        max: 0.6,
        step: 0.01,
        digits: 2,
        hint: '线身沿圆点历史轨迹的拖尾长度，鞭子感的来源。',
      },
    ];

    const OVERTAKE_AMPLITUDE = 0.065;

    const lineDefinitions: LineDefinition[] = [
      {
        label: 'BUSINESS ANALYSIS',
        role: 'follower',
        anchor: 0.22,
        roamCenter: 0.46,
        roamAmplitude: 0.285,
        speed: 0.38,
        phase: 0.15,
        startX: 0.28,
        spring: 7.5,
        overtakeSpeed: 0.92,
        overtakePhase: 0.4,
      },
      {
        label: 'PROCESS DESIGN',
        role: 'follower',
        anchor: 0.39,
        roamCenter: 0.46,
        roamAmplitude: 0.27,
        speed: 0.46,
        phase: 1.78,
        startX: 0.4,
        spring: 8.4,
        overtakeSpeed: 1.31,
        overtakePhase: 2.6,
      },
      {
        label: 'SYSTEM INTEGRATION',
        role: 'follower',
        anchor: 0.59,
        roamCenter: 0.46,
        roamAmplitude: 0.3,
        speed: 0.34,
        phase: 3.36,
        startX: 0.33,
        spring: 7.8,
        overtakeSpeed: 1.68,
        overtakePhase: 4.5,
      },
      {
        label: 'STAKEHOLDER ALIGNMENT',
        role: 'leader',
        anchor: 0.76,
        roamCenter: 0.46,
        roamAmplitude: 0.28,
        speed: 0.52,
        phase: 5.02,
        startX: 0.52,
        spring: 8.8,
      },
    ];

    let width = 1;
    let height = 1;
    let targetProgress = prefersReducedMotion ? 0.9 : 0;
    let visibleProgress = targetProgress;
    let frameId = 0;
    let lastTime = performance.now();
    let scrollTriggerInstance: ScrollTrigger | null = null;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setClearColor(0x000000, 0);
    } catch (e) {
      loadError.style.display = 'block';
      canvas.style.display = 'none';
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 0, 1, 0.1, 10);
    camera.position.z = 2;

    const renderedPointCount = 190;
    const historyCap = 140;
    const tailColor = new THREE.Color(0x14294a);
    const headColor = new THREE.Color(0x5b89ff);
    const tailFadeEnd = 0.16;

    const systems: SystemInstance[] = lineDefinitions.map((definition, index) => {
      const positions = new Float32Array(renderedPointCount * 3);
      const colors = new Float32Array(renderedPointCount * 3);
      const alphas = new Float32Array(renderedPointCount);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      for (let pointIndex = 0; pointIndex < renderedPointCount; pointIndex += 1) {
        const u = pointIndex / (renderedPointCount - 1);
        const color = tailColor.clone().lerp(headColor, smoothstep(u));
        colors[pointIndex * 3] = color.r;
        colors[pointIndex * 3 + 1] = color.g;
        colors[pointIndex * 3 + 2] = color.b;
        alphas[pointIndex] = smoothstep(mapRange(u, 0, tailFadeEnd));
      }

      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uOpacity: { value: 0.88 - index * 0.045 },
        },
        vertexShader: `
          attribute vec3 color;
          attribute float alpha;
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vColor = color;
            vAlpha = alpha;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          precision mediump float;
          uniform float uOpacity;
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            gl_FragColor = vec4(vColor, vAlpha * uOpacity);
          }
        `,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });

      const object = new THREE.Line(geometry, material);
      object.frustumCulled = false;
      object.renderOrder = index;
      scene.add(object);

      const marker = document.createElement('div');
      marker.className = 'line-marker';
      marker.innerHTML = `
        <span class="marker-dot"></span>
        <span class="marker-label">${definition.label}</span>
      `;
      nodeLayer.appendChild(marker);

      return {
        definition,
        index,
        geometry,
        positions,
        material,
        marker,
        labelEl: marker.querySelector('.marker-label'),
        labelWidth: 0,
        headX: 0,
        headY: 0,
        firstMode: 0,
        firstModeVelocity: 0,
        secondMode: 0,
        secondModeVelocity: 0,
        history: [],
        initialized: false,
      };
    });

    const roamSecondary = 0.04;
    const roamDetail = 0.01;

    const roamStateAt = (definition: LineDefinition, time: number) => {
      const baseOmega = definition.speed * 1.72 * MOTION.dotSpeed;
      const terms: [number, number, number][] = [
        [definition.roamAmplitude, baseOmega, definition.phase],
        [roamSecondary, baseOmega * 0.355, definition.phase * 1.37],
        [roamDetail, baseOmega * 1.686, definition.phase * 0.73],
      ];

      let offset = 0;
      let velocity = 0;
      let acceleration = 0;
      let velocityPeak = 0;
      let accelerationPeak = 0;

      for (const [amplitude, omega, phase] of terms) {
        const angle = omega * time + phase;
        offset += amplitude * Math.sin(angle);
        velocity += amplitude * omega * Math.cos(angle);
        acceleration -= amplitude * omega * omega * Math.sin(angle);
        velocityPeak += amplitude * omega;
        accelerationPeak += amplitude * omega * omega;
      }

      return {
        y: (definition.roamCenter + offset) * height,
        velocity: velocity * height,
        acceleration: acceleration * height,
        velocityPeak: velocityPeak * height,
        accelerationPeak: accelerationPeak * height,
        omega: baseOmega,
      };
    };

    const advanceMode = (
      value: number,
      velocity: number,
      target: number,
      omega: number,
      zeta: number,
      deltaTime: number
    ): [number, number] => {
      const stepCount = Math.max(1, Math.min(24, Math.ceil(deltaTime * 240)));
      const stepTime = deltaTime / stepCount;
      let position = value;
      let speed = velocity;

      for (let step = 0; step < stepCount; step += 1) {
        speed += (omega * omega * (target - position) - 2 * zeta * omega * speed) * stepTime;
        position += speed * stepTime;
      }

      return [position, speed];
    };

    const recordHead = (system: SystemInstance, time: number) => {
      system.history.push({ t: time, x: system.headX, y: system.headY });
      if (system.history.length > historyCap) {
        system.history.shift();
      }
    };

    const buildLine = (system: SystemInstance, anchorX: number, anchorY: number, time: number, lag: number) => {
      const history = system.history;
      const lastIndex = history.length - 1;
      const firstMode = system.firstMode;
      const secondMode = system.secondMode;
      let cursor = 0;

      for (let index = 0; index < renderedPointCount; index += 1) {
        if (index === renderedPointCount - 1) {
          system.positions[index * 3] = system.headX;
          system.positions[index * 3 + 1] = system.headY;
          system.positions[index * 3 + 2] = 0;
          continue;
        }

        const u = index / (renderedPointCount - 1);
        const wantedTime = time - (1 - u) * lag;

        let headX = system.headX;
        let headY = system.headY;

        if (lastIndex >= 1) {
          while (cursor < lastIndex - 1 && history[cursor + 1].t < wantedTime) {
            cursor += 1;
          }

          const before = history[cursor];
          const after = history[cursor + 1];
          const span = after.t - before.t;
          const blend = span > 1e-6 ? clamp((wantedTime - before.t) / span) : 1;
          headX = mix(before.x, after.x, blend);
          headY = mix(before.y, after.y, blend);
        }

        const bow = firstMode * Math.sin(Math.PI * u) + secondMode * Math.sin(2 * Math.PI * u);

        system.positions[index * 3] = mix(anchorX, headX, u);
        system.positions[index * 3 + 1] = mix(anchorY, headY, u) + bow;
        system.positions[index * 3 + 2] = 0;
      }

      system.geometry.attributes.position.needsUpdate = true;
    };

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(width, height, true);

      camera.left = 0;
      camera.right = width;
      camera.top = 0;
      camera.bottom = height;
      camera.updateProjectionMatrix();

      systems.forEach((system) => {
        system.initialized = false;
      });

      const layerRect = nodeLayer.getBoundingClientRect();
      const toBox = (el: Element): SafeBox => {
        const r = el.getBoundingClientRect();
        return {
          left: r.left - layerRect.left,
          right: r.right - layerRect.left,
          top: r.top - layerRect.top,
          bottom: r.bottom - layerRect.top,
        };
      };

      copyBoxes = copies.map((copy) => {
        const kids = Array.from(copy.children).map(toBox);
        const parts = kids.length ? kids : [toBox(copy)];
        return {
          left: Math.min(...parts.map((b) => b.left)) - SAFE_PADDING,
          right: Math.max(...parts.map((b) => b.right)) + SAFE_PADDING,
          top: Math.min(...parts.map((b) => b.top)) - SAFE_PADDING,
          bottom: Math.max(...parts.map((b) => b.bottom)) + SAFE_PADDING,
        };
      });

      systems.forEach((system) => {
        system.labelWidth = system.labelEl ? system.labelEl.getBoundingClientRect().width : 120;
      });

      if (finalLabel) finalLabelWidth = finalLabel.getBoundingClientRect().width;
    };

    const updateCopies = (progress: number) => {
      // 每段文案的独占区间边界（相邻两段文案中心点的中点）。
      // 切换方式：前一段先淡出到 0，下一段再从 0 淡入（先出后进，两者不在同一时刻共现）。
      // 这样屏幕上任何时刻都只有一段文案：既不会“两段字同时发亮”，也不会两段不同的句子
      // 各占一半透明度叠成一片看不清的重影。
      const bounds = COPY_BOUNDS;
      const edge = 0.01;
      const lastIndex = copies.length - 1;

      copies.forEach((copy, index) => {
        const left = bounds[index];
        const right = bounds[index + 1];
        const enter = index === 0 ? 1 : clamp((progress - left) / edge);
        // 最后一段文案在章节结尾保持可见，不做淡出。
        const leave = index === lastIndex ? 1 : 1 - clamp((progress - (right - edge)) / edge);
        const weight = clamp(Math.min(enter, leave));

        copy.style.opacity = `${weight}`;
        copy.style.transform = `translateY(${(1 - weight) * 22}px)`;
      });

      progressBar.style.transform = `scaleY(${progress})`;
      progressDot.style.top = `${progress * 100}%`;
      scrollHint.style.opacity = `${1 - smoothstep(mapRange(progress, 0.02, 0.15))}`;
    };

    const updateSystem = (system: SystemInstance, time: number, deltaTime: number, progress: number) => {
      const { definition } = system;
      const travel = smoothstep(mapRange(progress, 0.01, 0.79));
      const convergence = smoothstep(mapRange(progress, 0.59, 0.96));
      const mergeX = width * (width < 760 ? 0.72 : 0.765);
      const mergeY = height * (width < 760 ? 0.39 : 0.455);

      const roam = roamStateAt(definition, time);
      const baseHeadX = mix(width * definition.startX, mergeX, travel);
      const overtake =
        definition.role === 'follower'
          ? Math.sin(time * (definition.overtakeSpeed || 1) + (definition.overtakePhase || 0)) *
            OVERTAKE_AMPLITUDE *
            width *
            (1 - travel)
          : 0;
      const targetHeadX = baseHeadX + overtake;
      const targetHeadY = mix(roam.y, mergeY, convergence);
      const springAmount = 1 - Math.exp(-definition.spring * deltaTime);

      if (!system.initialized) {
        system.headX = targetHeadX;
        system.headY = targetHeadY;
        system.history.length = 0;
        system.initialized = true;
      } else {
        system.headX += (targetHeadX - system.headX) * springAmount;
        system.headY += (targetHeadY - system.headY) * springAmount;
      }

      recordHead(system, time);

      const tailX = width * (width < 760 ? -0.48 : -0.13);
      const anchorY = height * definition.anchor + Math.sin(time * 0.36 + definition.phase) * height * 0.008;

      const chord = Math.hypot(system.headX - tailX, system.headY - anchorY);
      const sagScale = height * clamp(chord / (width * 0.95), 0.6, 1.35) * (1 - 0.5 * convergence);

      const accelerationRatio =
        roam.accelerationPeak > 1e-6 ? (roam.acceleration * (1 - convergence)) / roam.accelerationPeak : 0;
      const velocityRatio =
        roam.velocityPeak > 1e-6 ? (roam.velocity * (1 - convergence)) / roam.velocityPeak : 0;

      const firstTarget = sagScale * (MOTION.sagRest - MOTION.sagSwing * accelerationRatio);
      const secondTarget = sagScale * MOTION.mode2 * -velocityRatio;
      const firstOmega = roam.omega * MOTION.modeRatio;

      [system.firstMode, system.firstModeVelocity] = advanceMode(
        system.firstMode,
        system.firstModeVelocity,
        firstTarget,
        firstOmega,
        MOTION.damping,
        deltaTime
      );
      [system.secondMode, system.secondModeVelocity] = advanceMode(
        system.secondMode,
        system.secondModeVelocity,
        secondTarget,
        firstOmega * 2,
        MOTION.damping,
        deltaTime
      );

      buildLine(system, tailX, anchorY, time, MOTION.lagTime * (1 - 0.7 * convergence));

      system.material.uniforms.uOpacity.value = (0.88 - system.index * 0.045) * (1 - convergence * 0.16);

      const individualOpacity = 1 - smoothstep(mapRange(convergence, 0.62, 0.96));
      system.marker.style.opacity = `${individualOpacity}`;
      system.marker.style.transform = `translate3d(${system.headX}px, ${system.headY}px, 0) translate(-4px, -50%)`;

      // 圆点后面就是标签文字：圆点占 8px，间距 8px，再留 4px 余量。
      const labelBox: SafeBox = {
        left: system.headX + 12,
        right: system.headX + 12 + system.labelWidth,
        top: system.headY - 9,
        bottom: system.headY + 9,
      };
      if (system.labelEl) {
        system.labelEl.style.opacity = `${textMask(labelBox, progress)}`;
      }

      return { mergeX, mergeY, convergence };
    };

    const renderFrame = (now: number) => {
      const deltaTime = Math.min((now - lastTime) / 1000, 0.05);
      const time = now / 1000;
      lastTime = now;

      if (!prefersReducedMotion) {
        visibleProgress += (targetProgress - visibleProgress) * (1 - Math.exp(-7.2 * deltaTime));
      }

      let convergenceState = {
        mergeX: width * 0.765,
        mergeY: height * 0.455,
        convergence: 0,
      };

      systems.forEach((system) => {
        convergenceState = updateSystem(
          system,
          prefersReducedMotion ? 1.8 : time,
          prefersReducedMotion ? 1 : deltaTime,
          visibleProgress
        );
      });

      const arrival = smoothstep(mapRange(convergenceState.convergence, 0.52, 0.95));
      finalMarker.style.opacity = `${arrival}`;
      finalMarker.style.transformOrigin = '14px 50%';
      finalMarker.style.transform = `translate3d(${convergenceState.mergeX}px, ${convergenceState.mergeY}px, 0) translate(-14px, -50%) scale(${
        0.72 + arrival * 0.28
      })`;

      if (finalLabel) {
        const labelScale = 0.72 + arrival * 0.28;
        const labelBox: SafeBox = {
          left: convergenceState.mergeX + 24,
          right: convergenceState.mergeX + 24 + finalLabelWidth * labelScale,
          top: convergenceState.mergeY - 20 * labelScale - 8,
          bottom: convergenceState.mergeY + 20 * labelScale + 8,
        };
        finalLabel.style.opacity = `${textMask(labelBox, visibleProgress)}`;
      }

      updateCopies(visibleProgress);
      renderer.render(scene, camera);

      if (!prefersReducedMotion) {
        frameId = requestAnimationFrame(renderFrame);
      }
    };

    const updateNativeProgress = () => {
      const rect = method.getBoundingClientRect();
      const distance = Math.max(1, method.offsetHeight - window.innerHeight);
      targetProgress = clamp(-rect.top / distance);
    };

    // ---- 调节台：弧度是审美判断，交给滑杆比来回改代码快得多 ----
    const sliders = new Map<keyof MotionParams, { input: HTMLInputElement; output: HTMLOutputElement }>();

    const refreshDump = () => {
      tunerDump.textContent = CONTROLS.map(
        (control) => `${control.key}: ${MOTION[control.key].toFixed(control.digits)},`
      ).join('\n');
    };

    const refreshSliders = () => {
      CONTROLS.forEach((control) => {
        const entry = sliders.get(control.key);
        if (entry) {
          entry.output.value = `${MOTION[control.key].toFixed(control.digits)}${control.unit}`;
          entry.input.value = `${MOTION[control.key]}`;
        }
      });
      refreshDump();
    };

    CONTROLS.forEach((control) => {
      const row = document.createElement('div');
      row.className = 'tuner-row';

      const top = document.createElement('div');
      top.className = 'tuner-row-top';

      const label = document.createElement('label');
      label.textContent = control.label;
      label.htmlFor = `tune-${control.key}`;

      const output = document.createElement('output');
      output.htmlFor = `tune-${control.key}`;

      const input = document.createElement('input');
      input.type = 'range';
      input.id = `tune-${control.key}`;
      input.min = `${control.min}`;
      input.max = `${control.max}`;
      input.step = `${control.step}`;
      input.value = `${MOTION[control.key]}`;

      const hint = document.createElement('p');
      hint.className = 'tuner-hint';
      hint.textContent = control.hint;

      input.addEventListener('input', () => {
        MOTION[control.key] = Number(input.value);
        output.value = `${MOTION[control.key].toFixed(control.digits)}${control.unit}`;
        refreshDump();
      });

      top.append(label, output);
      row.append(top, input, hint);
      tunerRows.append(row);
      sliders.set(control.key, { input, output });
    });

    const setTunerOpen = (open: boolean) => {
      tuner.hidden = !open;
      tunerToggle.setAttribute('aria-expanded', `${open}`);
    };

    const handleTunerToggleClick = () => {
      setTunerOpen(tuner.hidden);
    };

    const handleTunerResetClick = () => {
      Object.assign(MOTION, DEFAULT_MOTION);
      refreshSliders();
    };

    tunerToggle.addEventListener('click', handleTunerToggleClick);
    tunerReset.addEventListener('click', handleTunerResetClick);

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (event.key === 't' || event.key === 'T') {
        setTunerOpen(tuner.hidden);
      }
    };

    window.addEventListener('keydown', handleKeydown);

    refreshSliders();
    resize();

    // Scroll progress synchronization
    if (!prefersReducedMotion) {
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: method,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          targetProgress = self.progress;
        },
        invalidateOnRefresh: true,
      });
    }

    const handleScrollPassive = () => {
      if (!scrollTriggerInstance) {
        updateNativeProgress();
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(stage);

    window.addEventListener('scroll', handleScrollPassive, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    renderFrame(performance.now());

    return () => {
      cancelAnimationFrame(frameId);
      scrollTriggerInstance?.kill();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', handleScrollPassive);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeydown);
      tunerToggle.removeEventListener('click', handleTunerToggleClick);
      tunerReset.removeEventListener('click', handleTunerResetClick);

      systems.forEach((system) => {
        system.geometry.dispose();
        system.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <section
      id="work-method"
      ref={sectionRef}
      className="method relative w-full h-[360vh] bg-[#08090B] text-white"
    >
      {/* Sticky Stage Container: Pins during 360vh scroll with ZERO layout shift */}
      <div
        ref={containerRef}
        className="stage sticky top-0 w-full h-screen min-h-[640px] max-h-[1080px] relative overflow-hidden bg-[#08090B] text-white select-none"
      >
        {/* Subtle Background Coordinate Crosshair Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-10" aria-hidden="true">
          <div className="absolute top-0 bottom-0 left-[18%] w-[1px] bg-[#5B89FF]" />
          <div className="absolute top-0 bottom-0 left-[76.5%] w-[1px] bg-[#5B89FF]" />
          <div className="absolute left-0 right-0 top-[45.5%] h-[1px] bg-[#5B89FF]" />
        </div>

        {/* WebGL Canvas for 4 Modal Strings - Fills 100% of the Stage exactly */}
        <canvas
          ref={canvasRef}
          id="path-canvas"
          className="absolute inset-0 w-full h-full block z-0 pointer-events-none"
        />

        {/* Fallback Load Error Banner */}
        <div
          ref={loadErrorRef}
          className="load-error hidden absolute inset-0 flex items-center justify-center text-[#5B89FF] font-mono text-xs z-30"
        >
          Failed to initialize Three.js WebGL rendering context
        </div>

        {/* Moving Node & Label Layer - Exactly identical dimensions to Canvas */}
        <div
          ref={nodeLayerRef}
          className="node-layer absolute inset-0 z-10 pointer-events-none overflow-hidden"
        />

        {/* Final Convergence Target Marker */}
        <div
          ref={finalMarkerRef}
          className="final-marker absolute top-0 left-0 z-20 pointer-events-none opacity-0 flex items-center gap-3.5"
        >
          <div className="relative flex items-center justify-center w-7 h-7">
            <span className="absolute w-12 h-12 rounded-full border border-[#5B89FF]/40 animate-ping" />
            <span className="absolute w-8 h-8 rounded-full border border-[#5B89FF]/70" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#5B89FF] shadow-[0_0_14px_#5B89FF]" />
          </div>
          <div className="final-marker-label flex flex-col select-none">
            <div className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[#5B89FF] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              DELIVERY // 最终交付
            </div>
            <div className="font-mono text-[10px] sm:text-[11px] text-[#9AA3B0] tracking-wider uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              SYSTEM RUNNING · CLOSED LOOP
            </div>
          </div>
        </div>

        {/* Top Header Row within the Dark Console Stage (Overlay) */}
        {/* 顶部留白必须让开站点顶栏（64px），否则 TUNER 按钮会被压在顶栏下面点不到 */}
        <header className="absolute top-0 left-0 right-0 z-20 px-6 sm:px-10 lg:px-16 pt-[84px] sm:pt-24 pointer-events-none">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold tracking-widest text-[#5B89FF] bg-[#5B89FF]/10 border border-[#5B89FF]/30 px-2.5 py-1 rounded-2xs uppercase">
                03 / METHOD
              </span>
              <span className="text-xs font-mono tracking-widest text-[#9AA3B0] uppercase hidden sm:inline">
                EXECUTION ARCHITECTURE · MODAL STRING SIMULATION
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-xs font-mono tracking-wider text-[#9AA3B0] uppercase hidden md:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5B89FF]" />
                <span>4 DIVERGENT TRACKS → 1 CLOSED LOOP</span>
              </div>

              {/* Tuner Toggle Button */}
              <button
                ref={tunerToggleRef}
                id="tuner-toggle"
                type="button"
                aria-expanded="false"
                className="pointer-events-auto px-2.5 py-1 text-[11px] font-mono border border-white/20 hover:border-[#5B89FF] hover:text-[#5B89FF] text-[#9AA3B0] bg-black/40 backdrop-blur-sm rounded-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#5B89FF]" />
                <span>TUNER [T]</span>
              </button>
            </div>
          </div>
        </header>

        {/* Vertical Scroll Progress Track on Left Edge */}
        <div className="absolute left-6 lg:left-12 top-1/2 -translate-y-1/2 h-36 w-[2px] bg-white/10 hidden sm:block pointer-events-none z-20">
          <div
            ref={progressBarRef}
            className="progress-bar absolute top-0 left-0 w-full h-full bg-[#5B89FF] origin-top scale-y-0 transition-transform duration-75"
          />
          <div
            ref={progressDotRef}
            className="progress-dot absolute -left-[3px] w-2 h-2 rounded-full bg-[#5B89FF] shadow-[0_0_8px_#5B89FF] -translate-y-1/2 transition-[top] duration-75"
          />
        </div>

        {/* Right Narrative Overlay (Synchronized with Scroll Progress) */}
        <div
          ref={narrativeRef}
          className="absolute right-6 sm:right-12 lg:right-20 top-1/2 -translate-y-1/2 w-[calc(100%_-_3rem)] sm:w-[calc(100%_-_6rem)] lg:w-[28rem] max-w-sm sm:max-w-md pointer-events-none z-20 h-[260px]"
        >
          {/* Copy 0: Phase 1 */}
          <div className="copy absolute inset-0 flex flex-col justify-center select-none opacity-0">
            <span className="font-mono text-xs tracking-widest text-[#5B89FF] uppercase mb-2 sm:mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B89FF]" />
              PHASE 01 // 业务理解
            </span>
            <p className="text-xl sm:text-2xl lg:text-3xl font-light text-[#F4F4F5] leading-snug sm:leading-relaxed font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              “我不会从一张需求单开始，而是先理解真正的业务问题。”
            </p>
            <div className="mt-3 sm:mt-4 text-xs font-mono text-[#9AA3B0] leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              深入一线调研 · 识别假需求 · 厘清跨境商业链条真实痛点
            </div>
          </div>

          {/* Copy 1: Phase 2 */}
          <div className="copy absolute inset-0 flex flex-col justify-center select-none opacity-0">
            <span className="font-mono text-xs tracking-widest text-[#5B89FF] uppercase mb-2 sm:mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B89FF]" />
              PHASE 02 // 流程设计
            </span>
            <p className="text-xl sm:text-2xl lg:text-3xl font-light text-[#F4F4F5] leading-snug sm:leading-relaxed font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              “我把模糊的问题拆成清晰的流程、责任和推进路径。”
            </p>
            <div className="mt-3 sm:mt-4 text-xs font-mono text-[#9AA3B0] leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              拆解里程碑 · 划定权责边界 · 沉淀高标准可执行 SOP
            </div>
          </div>

          {/* Copy 2: Phase 3 */}
          <div className="copy absolute inset-0 flex flex-col justify-center select-none opacity-0">
            <span className="font-mono text-xs tracking-widest text-[#5B89FF] uppercase mb-2 sm:mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B89FF]" />
              PHASE 03 // 系统拉通
            </span>
            <p className="text-xl sm:text-2xl lg:text-3xl font-light text-[#F4F4F5] leading-snug sm:leading-relaxed font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              “我连接产品、系统、供应链和外部合作伙伴，让不同环节在同一条链路上运行。”
            </p>
            <div className="mt-3 sm:mt-4 text-xs font-mono text-[#9AA3B0] leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              统一 API 协议 · 打通库存与履约数据孤岛 · 消除系统断点
            </div>
          </div>

          {/* Copy 3: Phase 4 & Convergence */}
          <div className="copy absolute inset-0 flex flex-col justify-center select-none opacity-0">
            <span className="font-mono text-xs tracking-widest text-[#5B89FF] uppercase mb-2 sm:mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5B89FF] animate-ping" />
              CONVERGENCE // 闭环达成
            </span>
            <p className="text-xl sm:text-2xl lg:text-3xl font-normal text-white leading-snug sm:leading-relaxed font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              “从业务问题到系统方案，再到真正上线，我习惯把一条链路走完整。”
            </p>
            <div className="mt-3 sm:mt-4 text-xs font-mono text-[#9AA3B0] leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              闭环交付 · 不仅代码上线 · 更确保业务跑通并产生成果
            </div>
          </div>
        </div>

        {/* Scroll Down Hint */}
        <div
          ref={scrollHintRef}
          className="scroll-hint absolute bottom-20 left-1/2 -translate-x-1/2 text-[11px] font-mono tracking-widest text-[#9AA3B0] uppercase flex items-center gap-2 pointer-events-none z-20 transition-opacity duration-300"
        >
          <span>SCROLL TO CONVERGE</span>
          <span className="scroll-cue-drift text-[#5B89FF]">↓</span>
        </div>

        {/* Bottom Bar: Davide Inspired Chapter Index & System Convergence Status (Overlay) */}
        <footer className="absolute bottom-0 left-0 right-0 z-20 px-6 sm:px-10 lg:px-16 pb-8 pointer-events-none">
          <div className="max-w-7xl mx-auto w-full pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono tracking-wider uppercase text-[#9AA3B0]">
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 pointer-events-auto">
              <span className="opacity-75">SIGNAL</span>
              <span className="opacity-60">/</span>
              <span className="opacity-75">IMPACT</span>
              <span className="opacity-60">/</span>
              <span className="text-[#5B89FF] font-semibold flex items-center gap-1.5 bg-[#5B89FF]/10 border border-[#5B89FF]/30 px-2 py-0.5 rounded-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5B89FF]" />
                METHOD (ACTIVE)
              </span>
              <span className="opacity-60">/</span>
              <span className="opacity-75">SELECTED WORK</span>
              <span className="opacity-60">/</span>
              <span className="opacity-75">EXPERIENCE</span>
              <span className="opacity-60">/</span>
              <span className="opacity-75">ABOUT</span>
              <span className="opacity-60">/</span>
              <span className="opacity-75">CONTACT</span>
            </div>

            <div className="text-right text-[#9AA3B0]">
              <span>SYSTEM CONVERGENCE →</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Parameter Tuner Modal Panel */}
      <div
        ref={tunerRef}
        id="tuner"
        hidden
        className="fixed bottom-6 right-6 z-50 w-84 max-h-[85vh] overflow-y-auto bg-[#08090B]/95 border border-white/15 backdrop-blur-md rounded-xs p-4 shadow-2xl text-white select-none"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5B89FF]" />
            <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              MODAL STRING TUNER
            </span>
          </div>
          <button
            ref={tunerResetRef}
            id="tuner-reset"
            type="button"
            className="text-[10px] font-mono text-[#9AA3B0] hover:text-[#5B89FF] border border-white/10 hover:border-[#5B89FF]/40 px-2 py-0.5 rounded-2xs cursor-pointer transition-colors"
          >
            RESET
          </button>
        </div>

        {/* Generated Slider Controls Container */}
        <div ref={tunerRowsRef} id="tuner-rows" className="space-y-3"></div>

        {/* Live Export Parameter String */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="text-[10px] font-mono text-[#9AA3B0] mb-1 uppercase">DUMP PARAMS:</div>
          <pre
            ref={tunerDumpRef}
            id="tuner-dump"
            className="text-[10px] font-mono text-[#5B89FF] bg-black/60 p-2.5 rounded-2xs border border-white/10 overflow-x-auto select-all"
          ></pre>
        </div>
      </div>
    </section>
  );
};
