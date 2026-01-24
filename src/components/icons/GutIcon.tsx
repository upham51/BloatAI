interface GutIconProps {
  className?: string;
}

export function GutIcon({ className = "w-5 h-5" }: GutIconProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left organic flame-like shape */}
      <path
        d="M 120 90
           C 80 100, 70 120, 70 180
           C 70 240, 75 300, 85 360
           C 95 420, 110 450, 135 465
           C 160 480, 190 475, 215 450
           C 240 425, 250 385, 250 340
           C 250 295, 245 250, 235 210
           C 225 170, 210 140, 185 110
           C 160 80, 135 85, 120 90 Z"
        fill="#10b981"
      />
      {/* Right organic flame-like shape */}
      <path
        d="M 392 90
           C 432 100, 442 120, 442 180
           C 442 240, 437 300, 427 360
           C 417 420, 402 450, 377 465
           C 352 480, 322 475, 297 450
           C 272 425, 262 385, 262 340
           C 262 295, 267 250, 277 210
           C 287 170, 302 140, 327 110
           C 352 80, 377 85, 392 90 Z"
        fill="#10b981"
      />
      {/* Center upward arrow with triangular head */}
      <path
        d="M 256 200 L 220 240 L 240 240 L 240 360 L 272 360 L 272 240 L 292 240 Z"
        fill="#10b981"
      />
    </svg>
  );
}
