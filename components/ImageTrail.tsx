import React, { useRef, useEffect, useState } from "react";

interface ImageTrailProps {
  items: string[];
  renderImageBuffer?: number;
  rotationRange?: number;
  threshold?: number;
}

interface TrailItem {
  id: number;
  x: number;
  y: number;
  r: number;
  url: string;
}

const ImageTrail: React.FC<ImageTrailProps> = ({
  items,
  renderImageBuffer = 20,
  rotationRange = 25,
  threshold = 80,
}) => {
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const trailRef = useRef<TrailItem[]>([]);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const counter = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      if (!lastPos.current) {
        lastPos.current = { x: clientX, y: clientY };
        return;
      }

      const dx = clientX - lastPos.current.x;
      const dy = clientY - lastPos.current.y;
      const distance = Math.hypot(dx, dy);

      if (distance > threshold) {
        const newId = counter.current++;
        const newItem: TrailItem = {
          id: newId,
          x: clientX,
          y: clientY,
          r: Math.random() * rotationRange * 2 - rotationRange,
          url: items[counter.current % items.length],
        };

        // Keep only the last N items to prevent DOM bloat
        trailRef.current = [...trailRef.current, newItem].slice(-renderImageBuffer);
        setTrail([...trailRef.current]);
        
        lastPos.current = { x: clientX, y: clientY };

        // Schedule removal
        setTimeout(() => {
          trailRef.current = trailRef.current.filter((i) => i.id !== newId);
          setTrail([...trailRef.current]);
        }, 800); // Matches animation duration
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [items, threshold, rotationRange, renderImageBuffer]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      {trail.map((item) => (
        <div
          key={item.id}
          className="absolute will-change-transform"
          style={{
            left: item.x,
            top: item.y,
            // Use CSS variables for the animation to access
            // @ts-ignore
            "--r": `${item.r}deg`,
          }}
        >
          <img
            src={item.url}
            alt="trail"
            className="w-32 h-32 sm:w-48 sm:h-48 object-cover rounded-xl shadow-2xl border-2 border-white/30"
            style={{
              animation: "trail-pop 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes trail-pop {
          0% {
            transform: translate(-50%, -50%) rotate(var(--r)) scale(0.3);
            opacity: 0;
          }
          30% {
            transform: translate(-50%, -50%) rotate(var(--r)) scale(1);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--r)) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ImageTrail;