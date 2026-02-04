"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
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
  const panelOpen = useJobsStore((s) => s.panelOpen);
  const togglePanel = useJobsStore((s) => s.togglePanel);
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 right-4 z-50 w-[360px]"
        >
          {/* Header bar — always visible */}
          <button
            onClick={togglePanel}
            className="w-full glass-strong flex items-center justify-between px-4 py-2.5 rounded-t-xl border border-border-subtle border-b-0 hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">
                Jobs
              </span>
              {activeCount > 0 && (
                <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                  {activeCount} active
                </Badge>
              )}
              {activeCount === 0 && completedCount > 0 && (
                <Badge variant="success" className="text-[10px] px-1.5 py-0">
                  {completedCount} ready
                </Badge>
              )}
            </div>
            {panelOpen ? (
              <ChevronDown className="h-4 w-4 text-text-muted" />
            ) : (
              <ChevronUp className="h-4 w-4 text-text-muted" />
            )}
          </button>

          {/* Expandable body */}
          <AnimatePresence>
            {panelOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="glass-strong rounded-b-xl border border-border-subtle border-t border-t-white/[0.05]">
                  {/* Clear completed */}
                  {completedCount > 0 && (
                    <div className="flex justify-end px-3 pt-2">
                      <button
                        onClick={clearCompleted}
                        className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-secondary transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        Clear completed
                      </button>
                    </div>
                  )}

                  {/* Job list */}
                  <div className="max-h-[320px] overflow-y-auto p-2 space-y-1.5">
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
