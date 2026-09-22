      (async () => {
        const canvas = document.querySelector("#path-canvas");
        const stage = document.querySelector(".stage");
        const method = document.querySelector(".method");
        const nodeLayer = document.querySelector(".node-layer");
        const finalMarker = document.querySelector(".final-marker");
        const copies = [...document.querySelectorAll(".copy")];
        const progressBar = document.querySelector(".progress-bar");
        const progressDot = document.querySelector(".progress-dot");
        const scrollHint = document.querySelector(".scroll-hint");
        const loadError = document.querySelector(".load-error");
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        let THREE;

        try {
          THREE = await import(
            "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js"
          );
        } catch (error) {
          loadError.style.display = "block";
          canvas.style.display = "none";
          return;
        }

        const clamp = (value, min = 0, max = 1) =>
          Math.min(max, Math.max(min, value));
        const mix = (from, to, amount) => from + (to - from) * amount;
        const mapRange = (value, start, end) =>
          clamp((value - start) / (end - start));
        const smoothstep = (value) => {
          const x = clamp(value);
          return x * x * (3 - 2 * x);
        };

        // ------------------------------------------------------------------
        // 运动模型：模态弦（modal string），不再是逐节点绳索模拟。
        //
        // 为什么换掉 58 节点 Verlet 绳索：
        //   1. 58 个节点意味着 57 个振动模态。距离约束用 10 次 Gauss-Seidel
        //      迭代根本传不到绳子中段，残差以高频涟漪留在线上 —— 就是「抖动」。
        //   2. 不可伸长的绳子只有 5.5% 余量，物理上只能形成 ∪ 型悬链线。
        //      想要 ∩ 就必须让绳子松掉，而松掉的约束求解器会把节点推向任意
        //      方向 —— 那是混乱的褶皱，不是优美的凸弧。
        //
        // 这一版只保留弦的前两阶模态。任何一根弦的横向位移都能分解成
        // 「两端连线」+ Σ qₙ(t)·sin(nπu)，每个模态坐标 qₙ 满足
        //      qₙ'' + 2ζωₙ·qₙ' + ωₙ²·qₙ = Fₙ
        // 而 Fₙ 的驱动项正是「有效重力」g − ÿ端点（非惯性系项）。
        //
        // 所以重力永远朝下、从不翻转：
        //   圆点向下加速得比 g 快 → 有效重力翻负 → 中段被甩到弦线上方 → ∩
        //   圆点向上加速        → 有效重力叠加   → 更深的 ∪
        // 形状是 sin 弧，天生光滑；高频模态被整体丢弃 → 数学上不可能抖。
        // ------------------------------------------------------------------
        const DEFAULT_MOTION = {
          dotSpeed: 2.35,
          modeRatio: 1.15,
          damping: 0.58,
          sagRest: 0.05,
          sagSwing: 0.24,
          mode2: 0.045,
          lagTime: 0.24,
        };

        const MOTION = { ...DEFAULT_MOTION };

        const CONTROLS = [
          {
            key: "dotSpeed",
            label: "圆点速度",
            unit: "×",
            min: 0.4,
            max: 4,
            step: 0.05,
            digits: 2,
            hint: "只改周期，不改弧度深浅（弧度已对加速度归一化）。2.35 时一个 ∩→∪ 循环约 3–4.5 秒。",
          },
          {
            key: "modeRatio",
            label: "ω₁ / ω 圆点",
            unit: "",
            min: 0.6,
            max: 3.2,
            step: 0.05,
            digits: 2,
            hint: "弧形翻面的时机。1.0 落在共振点、恰好在圆点折返那一瞬翻面；越大翻得越早，越接近「高处就是 ∩」。",
          },
          {
            key: "damping",
            label: "阻尼比 ζ",
            unit: "",
            min: 0.2,
            max: 1.2,
            step: 0.02,
            digits: 2,
            hint: "低于 0.4 会开始回弹发颤；高于 1.0 弧形变迟钝。",
          },
          {
            key: "sagRest",
            label: "静止垂度",
            unit: "×h",
            min: 0,
            max: 0.12,
            step: 0.002,
            digits: 3,
            hint: "重力带来的常态 ∪，也就是整条线的静息形状。",
          },
          {
            key: "sagSwing",
            label: "加速度摆幅",
            unit: "×h",
            min: 0,
            max: 0.32,
            step: 0.005,
            digits: 3,
            hint: "∩ 与 ∪ 的深度 —— 「弧度好不好看」的主旋钮。",
          },
          {
            key: "mode2",
            label: "二阶模态",
            unit: "×h",
            min: 0,
            max: 0.09,
            step: 0.002,
            digits: 3,
            hint: "让弧顶偏向一侧，去掉完全对称的塑料感。",
          },
          {
            key: "lagTime",
            label: "行波延迟",
            unit: "s",
            min: 0,
            max: 0.6,
            step: 0.01,
            digits: 2,
            hint: "线身沿圆点历史轨迹的拖尾长度，鞭子感的来源。",
          },
        ];

        // 上一版「两组反向」是把 Y 轴运动硬掰成两个互为镜像的簇，结果太
        // 对称、两簇之间留出一条死板的空白带。改成参考图里真实的样子：
        // Y 轴回到四条线各自独立的相位漫游（不分组，互相自然穿插）；
        // X 轴（行进方向）才是「1 个领跑者 + 3 个追随者」结构 —— 领跑者
        // 起点天生更靠右，全程稳定领先；三个追随者共享同一条基准行进
        // 曲线，只靠各自独立频率的水平抖动（overtake）在追赶中反复交错、
        // 彼此反超，抖动幅度随 travel 趋近 1 而收敛到 0，保证终点仍然
        // 干净地并到同一点，不会在汇合点附近抖。
        const OVERTAKE_AMPLITUDE = 0.065;

        const lineDefinitions = [
          {
            label: "BUSINESS ANALYSIS",
            role: "follower",
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
            label: "PROCESS DESIGN",
            role: "follower",
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
            label: "SYSTEM INTEGRATION",
            role: "follower",
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
            label: "STAKEHOLDER ALIGNMENT",
            role: "leader",
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
        let scrollTriggerInstance;

        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(0, 1, 0, 1, 0.1, 10);
        camera.position.z = 2;

        const renderedPointCount = 190;
        const historyCap = 140;
        const tailColor = new THREE.Color(0x143d22);
        const headColor = new THREE.Color(0x59ff8b);

        // 尾部（u→0，锚点一侧）用透明度渐隐取代硬边起点，让整条线看起来
        // 像一段被截出来的运动轨迹，而不是凭空冒出来的线段。
        const tailFadeEnd = 0.16;

        const systems = lineDefinitions.map((definition, index) => {
          const positions = new Float32Array(renderedPointCount * 3);
          const colors = new Float32Array(renderedPointCount * 3);
          const alphas = new Float32Array(renderedPointCount);
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3)
          );

          for (let pointIndex = 0; pointIndex < renderedPointCount; pointIndex += 1) {
            const u = pointIndex / (renderedPointCount - 1);
            const color = tailColor.clone().lerp(headColor, smoothstep(u));
            colors[pointIndex * 3] = color.r;
            colors[pointIndex * 3 + 1] = color.g;
            colors[pointIndex * 3 + 2] = color.b;
            alphas[pointIndex] = smoothstep(mapRange(u, 0, tailFadeEnd));
          }

          geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
          geometry.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));

          // LineBasicMaterial 只吃 vertexColors 的 RGB 通道，逐顶点透明度
          // 渐隐得走自定义着色器才能拿到 alpha。
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

          const marker = document.createElement("div");
          marker.className = "line-marker";
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
            headX: 0,
            headY: 0,
            // 一阶模态 sin(πu)：整条线的 ∪ / ∩
            firstMode: 0,
            firstModeVelocity: 0,
            // 二阶模态 sin(2πu)：S 型非对称，让弧顶偏向一侧
            secondMode: 0,
            secondModeVelocity: 0,
            history: [],
            initialized: false,
          };
        });

        // 圆点的漫游轨迹写成显式的正弦项之和，于是位置、速度、加速度都有
        // 闭式解 —— 不必对位置做二阶有限差分（那会把噪声放大到不可用）。
        const roamSecondary = 0.04;
        const roamDetail = 0.01;

        const roamStateAt = (definition, time) => {
          const baseOmega = definition.speed * 1.72 * MOTION.dotSpeed;
          const terms = [
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

        // 受迫阻尼振子，半隐式欧拉 + 固定 1/240s 子步。
        // ωh ≈ 0.02，远离稳定边界，所以帧率再怎么抖它都不会发散。
        const advanceMode = (value, velocity, target, omega, zeta, deltaTime) => {
          const stepCount = Math.max(1, Math.min(24, Math.ceil(deltaTime * 240)));
          const stepTime = deltaTime / stepCount;
          let position = value;
          let speed = velocity;

          for (let step = 0; step < stepCount; step += 1) {
            speed +=
              (omega * omega * (target - position) - 2 * zeta * omega * speed) *
              stepTime;
            position += speed * stepTime;
          }

          return [position, speed];
        };

        const recordHead = (system, time) => {
          system.history.push({ t: time, x: system.headX, y: system.headY });
          if (system.history.length > historyCap) {
            system.history.shift();
          }
        };

        // 线条 = 【延迟弦】+【模态弓形】
        //   延迟弦：参数 u 处连向圆点 (1-u)·lag 秒前的位置，形成沿圆点真实
        //           轨迹的行波拖尾（有限波速，物理上同样成立）。
        //   模态弓形：q₁·sin(πu) + q₂·sin(2πu)，永远光滑。
        // 全部是采样与求值，没有任何需要收敛的迭代 → 不可能抖动。
        const buildLine = (system, anchorX, anchorY, time, lag) => {
          const history = system.history;
          const lastIndex = history.length - 1;
          const firstMode = system.firstMode;
          const secondMode = system.secondMode;
          let cursor = 0;

          for (let index = 0; index < renderedPointCount; index += 1) {
            const u = index / (renderedPointCount - 1);
            const wantedTime = time - (1 - u) * lag;

            let headX = system.headX;
            let headY = system.headY;

            if (lastIndex >= 1) {
              // wantedTime 随 u 单调递增，所以游标只需单向前进一次
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

            const bow =
              firstMode * Math.sin(Math.PI * u) +
              secondMode * Math.sin(2 * Math.PI * u);

            system.positions[index * 3] = mix(anchorX, headX, u);
            system.positions[index * 3 + 1] = mix(anchorY, headY, u) + bow;
            system.positions[index * 3 + 2] = 0;
          }

          system.geometry.attributes.position.needsUpdate = true;
        };

        const resize = () => {
          width = Math.max(1, stage.clientWidth);
          height = Math.max(1, stage.clientHeight);

          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
          renderer.setSize(width, height, false);

          camera.left = 0;
          camera.right = width;
          camera.top = 0;
          camera.bottom = height;
          camera.updateProjectionMatrix();

          systems.forEach((system) => {
            system.initialized = false;
          });
        };

        const updateCopies = (progress) => {
          const centers = [0, 0.33, 0.59, 0.89];
          const radii = [0.25, 0.24, 0.24, 0.26];

          copies.forEach((copy, index) => {
            const weight = smoothstep(
              1 - Math.abs(progress - centers[index]) / radii[index]
            );
            copy.style.opacity = `${weight}`;
            copy.style.transform = `translateY(${(1 - weight) * 22}px)`;
          });

          progressBar.style.transform = `scaleY(${progress})`;
          progressDot.style.top = `${progress * 100}%`;
          scrollHint.style.opacity = `${1 - smoothstep(mapRange(progress, 0.02, 0.15))}`;
        };

        const updateSystem = (system, time, deltaTime, progress) => {
          const { definition } = system;
          const travel = smoothstep(mapRange(progress, 0.01, 0.79));
          const convergence = smoothstep(mapRange(progress, 0.59, 0.96));
          const mergeX = width * (width < 760 ? 0.72 : 0.765);
          const mergeY = height * (width < 760 ? 0.39 : 0.455);

          const roam = roamStateAt(definition, time);
          const baseHeadX = mix(width * definition.startX, mergeX, travel);
          // 追随者才抖动；抖动幅度乘 (1 - travel) 而不是 (1 - convergence)，
          // 因为 travel 更早到 1（三条追随者的基准位置更早汇成同一个
          // baseHeadX），两者必须同步收敛到 0，否则 travel 已到头但
          // convergence 还没追上时，追随者会在领跑者已经停稳的地方继续
          // 抖动，看起来像反超了领跑者。
          const overtake =
            definition.role === "follower"
              ? Math.sin(time * definition.overtakeSpeed + definition.overtakePhase) *
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
          const anchorY =
            height * definition.anchor +
            Math.sin(time * 0.36 + definition.phase) * height * 0.008;

          // 垂度尺度：以视口高度作视觉预算，再按弦长修正（弦越长垂得越多）。
          // 汇聚时只收敛掉一半，留下一道微微的弧线 —— 不让终点处变成
          // 死板的直线。
          const chord = Math.hypot(system.headX - tailX, system.headY - anchorY);
          const sagScale =
            height *
            clamp(chord / (width * 0.95), 0.6, 1.35) *
            (1 - 0.5 * convergence);

          // 把有效重力 g − ÿ端点 归一化到 [-1, 1]，于是「弧度多深」与
          // 「圆点多快」彻底解耦：改速度不改弧度，改 sagSwing 才改弧度。
          const accelerationRatio =
            roam.accelerationPeak > 1e-6
              ? (roam.acceleration * (1 - convergence)) / roam.accelerationPeak
              : 0;
          const velocityRatio =
            roam.velocityPeak > 1e-6
              ? (roam.velocity * (1 - convergence)) / roam.velocityPeak
              : 0;

          const firstTarget =
            sagScale * (MOTION.sagRest - MOTION.sagSwing * accelerationRatio);
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

          buildLine(
            system,
            tailX,
            anchorY,
            time,
            MOTION.lagTime * (1 - 0.7 * convergence)
          );

          system.material.uniforms.uOpacity.value =
            (0.88 - system.index * 0.045) * (1 - convergence * 0.16);

          const individualOpacity = 1 - smoothstep(mapRange(convergence, 0.62, 0.96));
          system.marker.style.opacity = `${individualOpacity}`;
          system.marker.style.transform = `translate3d(${system.headX}px, ${system.headY}px, 0)`;

          return { mergeX, mergeY, convergence };
        };

        const renderFrame = (now) => {
          const deltaTime = Math.min((now - lastTime) / 1000, 0.05);
          const time = now / 1000;
          lastTime = now;

          if (!prefersReducedMotion) {
            visibleProgress +=
              (targetProgress - visibleProgress) * (1 - Math.exp(-7.2 * deltaTime));
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

          const arrival = smoothstep(
            mapRange(convergenceState.convergence, 0.52, 0.95)
          );
          finalMarker.style.opacity = `${arrival}`;
          finalMarker.style.transform = `translate3d(${convergenceState.mergeX}px, ${convergenceState.mergeY}px, 0) scale(${0.72 + arrival * 0.28})`;

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
        const tuner = document.querySelector("#tuner");
        const tunerToggle = document.querySelector("#tuner-toggle");
        const tunerRows = document.querySelector("#tuner-rows");
        const tunerDump = document.querySelector("#tuner-dump");
        const tunerReset = document.querySelector("#tuner-reset");
        const sliders = new Map();

        const refreshDump = () => {
          tunerDump.textContent = CONTROLS.map(
            (control) =>
              `${control.key}: ${MOTION[control.key].toFixed(control.digits)},`
          ).join("\n");
        };

        const refreshSliders = () => {
          CONTROLS.forEach((control) => {
            const entry = sliders.get(control.key);
            entry.output.value = `${MOTION[control.key].toFixed(control.digits)}${control.unit}`;
            entry.input.value = `${MOTION[control.key]}`;
          });
          refreshDump();
        };

        CONTROLS.forEach((control) => {
          const row = document.createElement("div");
          row.className = "tuner-row";

          const top = document.createElement("div");
          top.className = "tuner-row-top";

          const label = document.createElement("label");
          label.textContent = control.label;
          label.htmlFor = `tune-${control.key}`;

          const output = document.createElement("output");
          output.htmlFor = `tune-${control.key}`;

          const input = document.createElement("input");
          input.type = "range";
          input.id = `tune-${control.key}`;
          input.min = `${control.min}`;
          input.max = `${control.max}`;
          input.step = `${control.step}`;
          input.value = `${MOTION[control.key]}`;

          const hint = document.createElement("p");
          hint.className = "tuner-hint";
          hint.textContent = control.hint;

          input.addEventListener("input", () => {
            MOTION[control.key] = Number(input.value);
            output.value = `${MOTION[control.key].toFixed(control.digits)}${control.unit}`;
            refreshDump();
          });

          top.append(label, output);
          row.append(top, input, hint);
          tunerRows.append(row);
          sliders.set(control.key, { input, output });
        });

        const setTunerOpen = (open) => {
          tuner.hidden = !open;
          tunerToggle.setAttribute("aria-expanded", `${open}`);
        };

        tunerToggle.addEventListener("click", () => {
          setTunerOpen(tuner.hidden);
        });

        tunerReset.addEventListener("click", () => {
          Object.assign(MOTION, DEFAULT_MOTION);
          refreshSliders();
        });

        window.addEventListener("keydown", (event) => {
          if (event.metaKey || event.ctrlKey || event.altKey) return;
          const tag = event.target?.tagName;
          if (tag === "INPUT" || tag === "TEXTAREA") return;
          if (event.key === "t" || event.key === "T") {
            setTunerOpen(tuner.hidden);
          }
        });

        refreshSliders();
        resize();

        if (!prefersReducedMotion && window.gsap && window.ScrollTrigger) {
          window.gsap.registerPlugin(window.ScrollTrigger);
          scrollTriggerInstance = window.ScrollTrigger.create({
            trigger: method,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
              targetProgress = self.progress;
            },
            invalidateOnRefresh: true,
          });
        } else if (!prefersReducedMotion) {
          window.addEventListener("scroll", updateNativeProgress, { passive: true });
          updateNativeProgress();
        }

        window.addEventListener("resize", resize, { passive: true });

        renderFrame(performance.now());

        window.addEventListener(
          "pagehide",
          () => {
            cancelAnimationFrame(frameId);
            scrollTriggerInstance?.kill();
            systems.forEach((system) => {
              system.geometry.dispose();
              system.material.dispose();
            });
            renderer.dispose();
          },
          { once: true }
        );
      })();
