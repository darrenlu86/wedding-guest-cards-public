const POSITION_CONFIG = {
  'top-left': { classes: 'top-6 left-6', rotation: 0 },
  'top-right': { classes: 'top-6 right-6', rotation: 90 },
  'bottom-right': { classes: 'bottom-6 right-6', rotation: 180 },
  'bottom-left': { classes: 'bottom-6 left-6', rotation: 270 },
} as const;

interface CornerOrnamentProps {
  position: keyof typeof POSITION_CONFIG;
  accent?: string;
}

export default function CornerOrnament({ position, accent = '#8b7355' }: CornerOrnamentProps) {
  const { classes, rotation } = POSITION_CONFIG[position];

  return (
    <div className={`absolute ${classes} opacity-20 pointer-events-none`}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* L 型線條 */}
        <path
          d="M 8,2 L 2,2 L 2,8"
          stroke={accent}
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 12,2 L 2,2 L 2,12"
          stroke={accent}
          strokeWidth="0.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* 裝飾圓點 */}
        <circle cx="2" cy="2" r="1.5" fill={accent} />
        <circle cx="8" cy="2" r="0.75" fill={accent} opacity="0.7" />
        <circle cx="2" cy="8" r="0.75" fill={accent} opacity="0.7" />
      </svg>
    </div>
  );
}
