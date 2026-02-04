"use client";

import { Download, Eye, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { JobStatusDot } from "./job-status-dot";
import type { Job } from "@/lib/stores/jobs-store";

interface JobCardProps {
  job: Job;
  onReview: (jobId: string) => void;
  onDownload: (jobId: string) => void;
  onRetry: (jobId: string) => void;
  onRemove: (jobId: string) => void;
}

const badgeConfig: Record<string, { label: string; variant: "outline" | "warning" | "success" | "error" }> = {
  queued: { label: "Queued", variant: "outline" },
  uploading: { label: "Uploading", variant: "warning" },
  processing: { label: "Processing", variant: "warning" },
  completed: { label: "Ready", variant: "success" },
  failed: { label: "Failed", variant: "error" },
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function JobCard({ job, onReview, onDownload, onRetry, onRemove }: JobCardProps) {
  const badge = badgeConfig[job.status] ?? badgeConfig.queued;

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-border-subtle hover:bg-white/[0.05] transition-colors group">
      <JobStatusDot status={job.status} />

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {job.fileName}
        </p>
        <p className="text-xs text-text-muted">{formatSize(job.fileSize)}</p>
      </div>

      {/* Status badge */}
      <Badge variant={badge.variant} className="shrink-0 text-[10px] px-2 py-0">
        {badge.label}
      </Badge>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {job.status === "completed" && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onReview(job.id); }}
              className="p-1 rounded-md text-text-muted hover:text-accent-cyan transition-colors"
              title="Review"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDownload(job.id); }}
              className="p-1 rounded-md text-text-muted hover:text-success transition-colors"
              title="Download"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </>
        )}

        {job.status === "failed" && (
          <button
            onClick={(e) => { e.stopPropagation(); onRetry(job.id); }}
            className="p-1 rounded-md text-text-muted hover:text-warning transition-colors"
            title="Retry"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onRemove(job.id); }}
          className="p-1 rounded-md text-text-muted hover:text-error transition-colors opacity-0 group-hover:opacity-100"
          title="Remove"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
