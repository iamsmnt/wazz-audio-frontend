"use client";

import { cn } from "@/lib/utils/cn";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const sizeMap = { sm: "h-6 w-6", md: "h-8 w-8", lg: "h-10 w-10" };
  const textSize = { sm: "text-sm", md: "text-lg", lg: "text-xl" };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("relative", sizeMap[size])}>
        {/* Waveform icon */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-full h-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="logo-grad"
              x1="0"
              y1="0"
              x2="32"
              y2="32"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8B5CF6" />
              <stop offset="1" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
          {/* Waveform bars */}
          <rect x="7" y="12" width="2.5" height="8" rx="1.25" fill="white" />
          <rect x="11" y="9" width="2.5" height="14" rx="1.25" fill="white" />
          <rect x="15" y="6" width="2.5" height="20" rx="1.25" fill="white" />
          <rect x="19" y="10" width="2.5" height="12" rx="1.25" fill="white" />
          <rect x="23" y="13" width="2.5" height="6" rx="1.25" fill="white" />
        </svg>
      </div>
      {showText && (
        <span
          className={cn(
            "font-display font-bold tracking-tight text-text-primary",
            textSize[size]
          )}
        >
          Wazz<span className="gradient-text">Audio</span>
        </span>
      )}
    </div>
  );
}
