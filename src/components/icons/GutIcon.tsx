interface GutIconProps {
  className?: string;
}

export function GutIcon({ className = "w-5 h-5" }: GutIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Curved B shape representing gut */}
      <path
        d="M7 4C7 4 6 4 6 5V19C6 20 7 20 7 20C7 20 11 20 13 18C15 16 15 14 15 12C15 10 15 8 13 6C11 4 7 4 7 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Middle curve of B */}
      <path
        d="M7 12H12C13 12 13.5 11.5 13.5 10.5C13.5 9.5 13 9 12 9H7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Arrow pointing up inside */}
      <path
        d="M10 16L10 10M10 10L8 12M10 10L12 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
