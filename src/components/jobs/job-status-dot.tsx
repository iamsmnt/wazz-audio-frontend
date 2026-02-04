import { cn } from "@/lib/utils/cn";
import type { ProcessingStatus } from "@/types/audio";

const dotStyles: Record<string, string> = {
  queued: "bg-text-muted",
  uploading: "bg-accent-cyan animate-pulse",
  processing: "bg-accent-violet animate-pulse",
  completed: "bg-success",
  failed: "bg-error",
};

interface JobStatusDotProps {
  status: ProcessingStatus;
  className?: string;
}

export function JobStatusDot({ status, className }: JobStatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full shrink-0",
        dotStyles[status] ?? "bg-text-muted",
        className
      )}
    />
  );
}
