'use client';

import { useEffect, useState } from 'react';

interface Petal {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  type: number; // 花瓣形狀種類
}

const PETAL_COUNT = 24;

function generatePetals(): Petal[] {
  const petals: Petal[] = [];
  for (let i = 0; i < PETAL_COUNT; i++) {
    petals.push({
      id: i,
      left: Math.random() * 100,
      size: 8 + Math.random() * 14,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 5,
      rotation: Math.random() * 360,
      type: Math.floor(Math.random() * 3),
    });
  }
  return petals;
}

function PetalIcon({ size, type }: { size: number; type: number }) {
  if (type === 0) {
    // 圓形花瓣
    return (
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <ellipse cx="10" cy="10" rx="6" ry="10" fill="currentColor" opacity="0.7" />
      </svg>
    );
  }
  if (type === 1) {
    // 愛心形
    return (
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <path d="M10 18s-8-5-8-11a5 5 0 0 1 8-1 5 5 0 0 1 8 1c0 6-8 11-8 11z" fill="currentColor" opacity="0.6" />
      </svg>
    );
  }
  // 楓叶形
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 2c0 0-2 3-5 4 1 1 2 0 3 1-1 2-3 4-4 7 1-1 2-2 3-2 0 2 1 4 3 5 0-1 1-2 2-2 1 0 2 1 2 2 2-1 3-3 3-5 1 0 2 1 3 2-1-3-3-5-4-7 1-1 2 0 3-1-3-1-5-4-5-4z" fill="currentColor" opacity="0.65" />
    </svg>
  );
}

export default function PetalRain() {
  const [petals, setPetals] = useState<Petal[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPetals(generatePetals());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <style>{`
        @keyframes petalFall {
          0% {
            transform: translateY(-20px) rotate(var(--start-rot));
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(calc(100vh + 30px)) rotate(var(--end-rot));
            opacity: 0;
          }
        }

        @keyframes petalSway {
          0%, 100% { margin-left: 0; }
          25% { margin-left: 15px; }
          75% { margin-left: -15px; }
        }

        .petal {
          position: absolute;
          top: -20px;
          animation: petalFall var(--duration) linear var(--delay) infinite,
                     petalSway 3s ease-in-out var(--delay) infinite;
          color: var(--petal-color);
        }
      `}</style>

      {petals.map((petal) => {
        const colors = ['#e8b4b8', '#f2c5c5', '#d4a0a0', '#c9a0c9', '#f0d0d0'];
        const color = colors[petal.id % colors.length];

        return (
          <div
            key={petal.id}
            className="petal"
            style={{
              left: `${petal.left}%`,
              '--duration': `${petal.duration}s`,
              '--delay': `${petal.delay}s`,
              '--start-rot': `${petal.rotation}deg`,
              '--end-rot': `${petal.rotation + 180}deg`,
              '--petal-color': color,
            } as React.CSSProperties}
          >
            <PetalIcon size={petal.size} type={petal.type} />
          </div>
        );
      })}
    </div>
  );
}
