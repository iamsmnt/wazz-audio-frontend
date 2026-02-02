"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ProcessingStatus } from "@/types/audio";

interface ProcessingIndicatorProps {
  status: ProcessingStatus;
  progress?: number;
  error?: string | null;
  className?: string;
}

export function ProcessingIndicator({
  status,
  progress = 0,
  error,
  className,
}: ProcessingIndicatorProps) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div
      className={cn("flex flex-col items-center gap-4 py-6", className)}
    >
      {/* Circular progress */}
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="6"
          />
          {/* Progress arc */}
          {(status === "processing" || status === "uploading") && (
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="url(#progress-gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          )}
          {status === "completed" && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#10B981"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={0}
            />
          )}
          {status === "failed" && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#EF4444"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={0}
            />
          )}
          <defs>
            <linearGradient id="progress-gradient">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {(status === "processing" || status === "uploading") && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Loader2 className="h-8 w-8 text-accent-violet" />
            </motion.div>
          )}
          {status === "completed" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
              }}
            >
              <CheckCircle2 className="h-8 w-8 text-success" />
            </motion.div>
          )}
          {status === "failed" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
              }}
            >
              <XCircle className="h-8 w-8 text-error" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        <p
          className={cn(
            "text-sm font-semibold",
            status === "processing" && "text-accent-violet",
            status === "uploading" && "text-accent-cyan",
            status === "completed" && "text-success",
            status === "failed" && "text-error"
          )}
        >
          {status === "uploading" && `Uploading... ${progress}%`}
          {status === "processing" && `Processing... ${progress}%`}
          {status === "completed" && "Processing complete!"}
          {status === "failed" && "Processing failed"}
        </p>
        {status === "failed" && error && (
          <p className="text-xs text-text-muted mt-1 max-w-[240px]">{error}</p>
        )}
      </div>
    </div>
  );
}
