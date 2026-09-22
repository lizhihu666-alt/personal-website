import React, { useEffect, useRef } from 'react';
import { isReducedMotion } from '../../utils/gsapSetup';

interface ProjectSystemFieldProps {
  projectId: string;
  className?: string;
}

interface SystemNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const createRandom = (seed: number) => {
  let value = seed || 1;

  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result = (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result;
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

export const ProjectSystemField: React.FC<ProjectSystemFieldProps> = ({
  projectId,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    let seed = 0;
    for (let index = 0; index < projectId.length; index += 1) {
      seed += projectId.charCodeAt(index);
    }
    const random = createRandom(seed);
    const nodes: SystemNode[] = Array.from({ length: 30 }, (_, index) => ({
      x: random(),
      y: random(),
      vx: (random() - 0.5) * 0.000055,
      vy: (random() - 0.5) * 0.000055,
      radius: index % 7 === 0 ? 2.6 : 1.25,
    }));

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let previousTime = 0;
    let isVisible = !document.hidden;
    const pointer = { x: -1000, y: -1000, active: false };
    const reduceMotion = isReducedMotion();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      if (!width || !height) return;

      context.clearRect(0, 0, width, height);
      const delta = previousTime ? Math.min(time - previousTime, 34) : 16;
      previousTime = time;
      const positions = nodes.map((node) => ({ x: node.x * width, y: node.y * height }));

      nodes.forEach((node, index) => {
        if (!reduceMotion) {
          node.x += node.vx * delta;
          node.y += node.vy * delta;
          if (node.x < 0.03 || node.x > 0.97) node.vx *= -1;
          if (node.y < 0.05 || node.y > 0.95) node.vy *= -1;
          node.x = Math.min(0.97, Math.max(0.03, node.x));
          node.y = Math.min(0.95, Math.max(0.05, node.y));
        }

        positions[index] = { x: node.x * width, y: node.y * height };
      });

      const connectionDistance = Math.min(250, Math.max(150, width * 0.16));

      for (let index = 0; index < positions.length; index += 1) {
        const start = positions[index];
        for (let targetIndex = index + 1; targetIndex < positions.length; targetIndex += 1) {
          const end = positions[targetIndex];
          const distance = Math.hypot(end.x - start.x, end.y - start.y);
          if (distance > connectionDistance) continue;

          const alpha = (1 - distance / connectionDistance) * 0.16;
          context.beginPath();
          context.moveTo(start.x, start.y);
          context.lineTo(end.x, end.y);
          context.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          context.lineWidth = 0.8;
          context.stroke();
        }
      }

      if (pointer.active) {
        positions.forEach((position) => {
          const distance = Math.hypot(position.x - pointer.x, position.y - pointer.y);
          if (distance > 220) return;
          context.beginPath();
          context.moveTo(pointer.x, pointer.y);
          context.lineTo(position.x, position.y);
          context.strokeStyle = `rgba(255, 255, 255, ${(1 - distance / 220) * 0.28})`;
          context.lineWidth = 0.9;
          context.stroke();
        });
      }

      nodes.forEach((node, index) => {
        const position = positions[index];
        const distanceToPointer = pointer.active
          ? Math.hypot(position.x - pointer.x, position.y - pointer.y)
          : Number.POSITIVE_INFINITY;
        const pointerInfluence = Math.max(0, 1 - distanceToPointer / 180);
        const pulse = reduceMotion ? 0.35 : (Math.sin(time * 0.0016 + index) + 1) / 2;

        if (index % 7 === 0 && !reduceMotion) {
          const ringProgress = (time * 0.00042 + index * 0.07) % 1;
          context.beginPath();
          context.arc(position.x, position.y, 4 + ringProgress * 13, 0, Math.PI * 2);
          context.strokeStyle = `rgba(255, 255, 255, ${(1 - ringProgress) * 0.13})`;
          context.lineWidth = 0.8;
          context.stroke();
        }

        context.beginPath();
        context.arc(position.x, position.y, node.radius + pointerInfluence * 1.8, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 255, 255, ${0.34 + pulse * 0.22 + pointerInfluence * 0.35})`;
        context.fill();
      });

      if (!reduceMotion) {
        for (let packetIndex = 0; packetIndex < 7; packetIndex += 1) {
          const start = positions[(packetIndex * 5 + 2) % positions.length];
          const end = positions[(packetIndex * 7 + 6) % positions.length];
          const progress = (time * 0.00011 + packetIndex * 0.14) % 1;
          const x = start.x + (end.x - start.x) * progress;
          const y = start.y + (end.y - start.y) * progress;
          context.beginPath();
          context.arc(x, y, 1.6, 0, Math.PI * 2);
          context.fillStyle = 'rgba(255, 255, 255, 0.72)';
          context.fill();
        }
      }
    };

    const animate = (time: number) => {
      if (isVisible) draw(time);
      animationFrame = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = pointer.x >= 0 && pointer.x <= width && pointer.y >= 0 && pointer.y <= height;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw(0);
    });

    resizeObserver.observe(canvas);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibility);
    resize();

    if (reduceMotion) {
      draw(0);
    } else {
      animationFrame = window.requestAnimationFrame(animate);
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [projectId]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};
