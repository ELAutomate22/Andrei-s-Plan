"use client";

import { useEffect, useRef } from "react";

export interface VoxelTopographyGridProps {
  tileSize?: number;
  maxHeight?: number;
  primaryColor?: string;
  wireColor?: string;
  speed?: number;
  className?: string;
}

export function VoxelTopographyGrid({
  tileSize = 36,
  maxHeight = 54,
  wireColor = "rgba(57, 255, 136, 0.82)",
  speed = 0.008,
  className = "",
}: VoxelTopographyGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let time = 0;
    let isVisible = true;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leftFace = "rgba(8, 210, 82, .58)";
    const rightFace = "rgba(36, 255, 116, .72)";
    const topFace = "rgba(1, 4, 2, .97)";

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const move = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.current.targetX = event.clientX - rect.left;
      pointer.current.targetY = event.clientY - rect.top;
    };
    const visibility = () => { isVisible = document.visibilityState === "visible"; };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", visibility);

    const tileWidth = tileSize * .866025;
    const tileHeight = tileSize * .5;
    const radiusSquared = 190 * 190;

    const draw = () => {
      if (isVisible) {
        if (!reduceMotion) time += speed;
        pointer.current.x += (pointer.current.targetX - pointer.current.x) * .16;
        pointer.current.y += (pointer.current.targetY - pointer.current.y) * .16;
        context.clearRect(0, 0, width, height);
        const columns = Math.ceil(width / tileWidth) + 4;
        const rows = Math.ceil(height / tileHeight) + 8;
        const originX = width * .55;
        const originY = height * .34;

        for (let row = -Math.floor(rows / 2); row < Math.ceil(rows / 2); row += 1) {
          for (let column = -Math.floor(columns / 2); column < Math.ceil(columns / 2); column += 1) {
            const x = originX + (column - row) * tileWidth;
            const y = originY + (column + row) * tileHeight;
            const dx = x - pointer.current.x;
            const dy = y - pointer.current.y;
            const distanceSquared = dx * dx + dy * dy;
            const waveOne = Math.sin(time * 2 + column * .24 + row * .24);
            const waveTwo = Math.cos(time * 1.4 + column * .14 - row * .28);
            let elevation = (waveOne + waveTwo + 2) * .25 * maxHeight;
            if (!reduceMotion && distanceSquared < radiusSquared) {
              const influence = 1 - Math.sqrt(distanceSquared) / 190;
              elevation += influence * influence * 45;
            }
            const peakY = y - elevation;
            if (x + tileWidth < 0 || x - tileWidth > width || peakY > height || peakY + elevation + 15 < 0) continue;
            const bottom = elevation + 12;
            context.beginPath(); context.moveTo(x - tileWidth, peakY); context.lineTo(x, peakY + tileHeight); context.lineTo(x, peakY + tileHeight + bottom); context.lineTo(x - tileWidth, peakY + bottom); context.closePath(); context.fillStyle = leftFace; context.fill();
            context.beginPath(); context.moveTo(x, peakY + tileHeight); context.lineTo(x + tileWidth, peakY); context.lineTo(x + tileWidth, peakY + bottom); context.lineTo(x, peakY + tileHeight + bottom); context.closePath(); context.fillStyle = rightFace; context.fill();
            context.beginPath(); context.moveTo(x, peakY - tileHeight); context.lineTo(x + tileWidth, peakY); context.lineTo(x, peakY + tileHeight); context.lineTo(x - tileWidth, peakY); context.closePath();
            context.fillStyle = topFace; context.fill(); context.strokeStyle = wireColor; context.lineWidth = .72; context.stroke();
          }
        }
      }
      if (!reduceMotion) frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { observer.disconnect(); window.removeEventListener("pointermove", move); document.removeEventListener("visibilitychange", visibility); cancelAnimationFrame(frame); };
  }, [tileSize, maxHeight, wireColor, speed]);

  return <div ref={containerRef} className={`voxel-topography ${className}`} aria-hidden="true"><canvas ref={canvasRef}/></div>;
}

export default VoxelTopographyGrid;
