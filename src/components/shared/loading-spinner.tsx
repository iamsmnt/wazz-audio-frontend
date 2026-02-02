"use client";

import { cn } from "@/lib/utils/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeMap = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };

  return (
    <svg
      className={cn("animate-spin", sizeMap[size], className)}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-80"
        d="M12 2a10 10 0 0 1 10 10"
        stroke="url(#spinner-grad)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="spinner-grad" x1="12" y1="2" x2="22" y2="12">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
    </svg>
  );
}
