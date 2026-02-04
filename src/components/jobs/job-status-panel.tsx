"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "./job-card";
import {
  useJobsStore,
  useJobsList,
  useActiveJobCount,
  useHasJobs,
  useCompletedJobCount,
} from "@/lib/stores/jobs-store";
import { useReviewStore } from "@/lib/stores/review-store";
import { audioApi } from "@/lib/api/audio";

export function JobStatusPanel() {
  const jobs = useJobsList();
  const hasJobs = useHasJobs();
  const activeCount = useActiveJobCount();
  const completedCount = useCompletedJobCount();
  const removeJob = useJobsStore((s) => s.removeJob);
  const retryJob = useJobsStore((s) => s.retryJob);
  const clearCompleted = useJobsStore((s) => s.clearCompleted);
  const selectJob = useReviewStore((s) => s.selectJob);

  const handleDownload = async (jobId: string) => {
    const job = useJobsStore.getState().jobs[jobId];
    if (!job?.serverJobId) return;
    await audioApi.downloadFile(job.serverJobId, job.originalFilename ?? job.fileName);
  };

  return (
    <AnimatePresence>
      {hasJobs && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-display font-semibold text-text-primary">
                Active Jobs
              </h3>
              {activeCount > 0 && (
                <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                  {activeCount} processing
                </Badge>
              )}
              {activeCount === 0 && completedCount > 0 && (
                <Badge variant="success" className="text-[10px] px-1.5 py-0">
                  {completedCount} ready
                </Badge>
              )}
            </div>

            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-secondary transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Clear completed
              </button>
            )}
          </div>

          {/* Job list */}
          <div className="space-y-1.5">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onReview={selectJob}
                onDownload={handleDownload}
                onRetry={retryJob}
                onRemove={removeJob}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
