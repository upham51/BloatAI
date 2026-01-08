"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AbstractBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
}

export const AbstractBackground = ({
  className,
  children,
  ...props
}: AbstractBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col h-[100vh] items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 text-slate-950 transition-bg",
          className
        )}
        {...props}
      >
        {/* Abstract flowing lines background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-20">
          <svg
            className="absolute w-full h-full"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#94a3b8', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#cbd5e1', stopOpacity: 0.1 }} />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#64748b', stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: '#94a3b8', stopOpacity: 0.15 }} />
              </linearGradient>
              <linearGradient id="grad3" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#475569', stopOpacity: 0.25 }} />
                <stop offset="100%" style={{ stopColor: '#94a3b8', stopOpacity: 0.1 }} />
              </linearGradient>
            </defs>

            {/* Flowing feather-like curves - emanating from bottom left */}
            <g opacity="0.8" className="dark:opacity-60">
              {/* Primary curve group */}
              <path
                d="M -50 950 Q 150 850 250 700 T 400 400 T 450 150"
                fill="none"
                stroke="url(#grad1)"
                strokeWidth="0.5"
                strokeLinecap="round"
              />
              <path
                d="M -30 960 Q 170 860 270 710 T 420 410 T 470 160"
                fill="none"
                stroke="url(#grad1)"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
              <path
                d="M -10 970 Q 190 870 290 720 T 440 420 T 490 170"
                fill="none"
                stroke="url(#grad1)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />

              {/* Secondary curve group */}
              <path
                d="M 0 1000 Q 200 900 300 750 T 500 450 T 600 200"
                fill="none"
                stroke="url(#grad2)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 20 1010 Q 220 910 320 760 T 520 460 T 620 210"
                fill="none"
                stroke="url(#grad2)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Tertiary curve group - darker accent */}
              <path
                d="M 50 1020 Q 250 920 350 770 T 550 470 T 650 220"
                fill="none"
                stroke="url(#grad3)"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.6"
              />
              <path
                d="M 70 1030 Q 270 930 370 780 T 570 480 T 670 230"
                fill="none"
                stroke="url(#grad3)"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.5"
              />

              {/* Fine detail lines */}
              <path
                d="M 100 1040 Q 300 940 400 790 T 600 490 T 700 240"
                fill="none"
                stroke="url(#grad1)"
                strokeWidth="0.4"
                strokeLinecap="round"
              />
              <path
                d="M 120 1050 Q 320 950 420 800 T 620 500 T 720 250"
                fill="none"
                stroke="url(#grad2)"
                strokeWidth="0.6"
                strokeLinecap="round"
              />

              {/* Right side complement - flowing from top right */}
              <path
                d="M 1050 -50 Q 950 150 850 300 T 700 500 T 600 700"
                fill="none"
                stroke="url(#grad1)"
                strokeWidth="0.5"
                strokeLinecap="round"
              />
              <path
                d="M 1060 -30 Q 960 170 860 320 T 710 520 T 610 720"
                fill="none"
                stroke="url(#grad2)"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <path
                d="M 1070 0 Q 970 200 870 350 T 720 550 T 620 750"
                fill="none"
                stroke="url(#grad3)"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.5"
              />

              {/* Additional fine wisps */}
              <path
                d="M -20 900 Q 180 800 280 650 T 430 350 T 480 100"
                fill="none"
                stroke="url(#grad1)"
                strokeWidth="0.3"
                strokeLinecap="round"
              />
              <path
                d="M 1040 -20 Q 940 180 840 330 T 690 530 T 590 730"
                fill="none"
                stroke="url(#grad2)"
                strokeWidth="0.4"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>

        {/* Subtle radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/30 dark:to-black/20 pointer-events-none" />

        {children}
      </div>
    </main>
  );
};
