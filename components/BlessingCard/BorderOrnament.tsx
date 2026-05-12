interface BorderOrnamentProps {
  accent?: string;
}

export default function BorderOrnament({ accent = '#8b7355' }: BorderOrnamentProps) {
  return (
    <svg
      width="100%"
      height="24"
      viewBox="0 0 300 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-60"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* 中央菱形圖案 */}
      <g transform="translate(150, 12)">
        {/* 外圍菱形 */}
        <path
          d="M 0,-8 L 8,0 L 0,8 L -8,0 Z"
          stroke={accent}
          strokeWidth="0.5"
          fill="none"
        />
        {/* 內圍菱形 */}
        <path
          d="M 0,-5 L 5,0 L 0,5 L -5,0 Z"
          stroke={accent}
          strokeWidth="0.5"
          fill="none"
        />
        {/* 中心點 */}
        <circle cx="0" cy="0" r="1.5" fill={accent} />
      </g>

      {/* 左側延伸線條 */}
      <line
        x1="20"
        y1="12"
        x2="135"
        y2="12"
        stroke={accent}
        strokeWidth="0.5"
        opacity="0.6"
      />
      {/* 左側裝飾點 */}
      <circle cx="80" cy="12" r="1" fill={accent} opacity="0.5" />
      <circle cx="60" cy="12" r="0.75" fill={accent} opacity="0.4" />
      <circle cx="40" cy="12" r="0.5" fill={accent} opacity="0.3" />

      {/* 右側延伸線條 */}
      <line
        x1="165"
        y1="12"
        x2="280"
        y2="12"
        stroke={accent}
        strokeWidth="0.5"
        opacity="0.6"
      />
      {/* 右側裝飾點 */}
      <circle cx="220" cy="12" r="1" fill={accent} opacity="0.5" />
      <circle cx="240" cy="12" r="0.75" fill={accent} opacity="0.4" />
      <circle cx="260" cy="12" r="0.5" fill={accent} opacity="0.3" />
    </svg>
  );
}
