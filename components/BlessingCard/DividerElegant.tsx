interface DividerElegantProps {
  className?: string;
  accent?: string;
}

export default function DividerElegant({ className = '', accent = '#8b7355' }: DividerElegantProps) {
  return (
    <svg
      width="200"
      height="12"
      viewBox="0 0 200 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`opacity-50 block ${className}`}
    >
      <defs>
        {/* 左側漸層 */}
        <linearGradient id="divider-gradient-left" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accent} stopOpacity="0" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.8" />
        </linearGradient>
        {/* 右側漸層 */}
        <linearGradient id="divider-gradient-right" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.8" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 左側線條 */}
      <line
        x1="0"
        y1="6"
        x2="95"
        y2="6"
        stroke="url(#divider-gradient-left)"
        strokeWidth="1"
      />

      {/* 中央圓點 */}
      <circle cx="100" cy="6" r="2.5" fill={accent} opacity="0.8" />
      <circle cx="100" cy="6" r="1.5" fill={accent} />

      {/* 右側線條 */}
      <line
        x1="105"
        y1="6"
        x2="200"
        y2="6"
        stroke="url(#divider-gradient-right)"
        strokeWidth="1"
      />
    </svg>
  );
}
