"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { audioApi } from "@/lib/api/audio";
import { emitToast } from "@/lib/hooks/use-toast";
import type { ProcessingPreset, ProcessingStatus } from "@/types/audio";

export interface Job {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  preset: ProcessingPreset;
  status: ProcessingStatus;
  uploadProgress: number;
  serverJobId: string | null;
  originalFilename: string | null;
  processedBlobUrl: string | null;
  error: string | null;
  createdAt: number;
}

interface JobsState {
  jobs: Record<string, Job>;

  submitJob: (file: File, preset: ProcessingPreset) => void;
  retryJob: (jobId: string) => void;
  removeJob: (jobId: string) => void;
  clearCompleted: () => void;

  _updateJob: (jobId: string, patch: Partial<Job>) => void;
  _startUpload: (jobId: string) => Promise<void>;
  _startPolling: (jobId: string) => void;
}

const pollTimers = new Map<string, ReturnType<typeof setInterval>>();

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: {},

  submitJob: (file, preset) => {
    const id = crypto.randomUUID();
    const job: Job = {
      id,
      file,
      fileName: file.name,
      fileSize: file.size,
      preset,
      status: "queued",
      uploadProgress: 0,
      serverJobId: null,
      originalFilename: null,
      processedBlobUrl: null,
      error: null,
      createdAt: Date.now(),
    };
    set((state) => ({
      jobs: { ...state.jobs, [id]: job },
    }));
    get()._startUpload(id);
  },

  retryJob: (jobId) => {
    const job = get().jobs[jobId];
    if (!job) return;
    // Clear any existing poll timer
    if (pollTimers.has(jobId)) {
      clearInterval(pollTimers.get(jobId)!);
      pollTimers.delete(jobId);
    }
    get()._updateJob(jobId, {
      status: "queued",
      uploadProgress: 0,
      serverJobId: null,
      processedBlobUrl: null,
      error: null,
    });
    get()._startUpload(jobId);
  },

  removeJob: (jobId) => {
    const job = get().jobs[jobId];
    if (!job) return;
    // Clean up poll timer
    if (pollTimers.has(jobId)) {
      clearInterval(pollTimers.get(jobId)!);
      pollTimers.delete(jobId);
    }
    // Revoke blob URL
    if (job.processedBlobUrl) {
      URL.revokeObjectURL(job.processedBlobUrl);
    }
    set((state) => {
      const { [jobId]: _, ...rest } = state.jobs;
      return { jobs: rest };
    });
  },

  clearCompleted: () => {
    const { jobs } = get();
    const remaining: Record<string, Job> = {};
    for (const [id, job] of Object.entries(jobs)) {
      if (job.status === "completed") {
        if (job.processedBlobUrl) URL.revokeObjectURL(job.processedBlobUrl);
      } else {
        remaining[id] = job;
      }
    }
    set({ jobs: remaining });
  },

  _updateJob: (jobId, patch) => {
    set((state) => {
      const job = state.jobs[jobId];
      if (!job) return state;
      return {
        jobs: { ...state.jobs, [jobId]: { ...job, ...patch } },
      };
    });
  },

  _startUpload: async (jobId) => {
    const job = get().jobs[jobId];
    if (!job) return;

    get()._updateJob(jobId, { status: "uploading", uploadProgress: 0, error: null });

    try {
      const response = await audioApi.upload(job.file, (progress) => {
        get()._updateJob(jobId, { uploadProgress: progress });
      });

      get()._updateJob(jobId, {
        serverJobId: response.job_id,
        originalFilename: response.original_filename,
        status: "processing",
      });

      get()._startPolling(jobId);
    } catch (err) {
      get()._updateJob(jobId, {
        status: "failed",
        error: err instanceof Error ? err.message : "Upload failed",
      });
      emitToast({
        title: "Upload failed",
        description: job.fileName,
        variant: "error",
      });
    }
  },

  _startPolling: (jobId) => {
    if (pollTimers.has(jobId)) {
      clearInterval(pollTimers.get(jobId)!);
    }

    const poll = async () => {
      const job = get().jobs[jobId];
      if (!job?.serverJobId) return;

      try {
        const data = await audioApi.getStatus(job.serverJobId);

        if (data.status === "completed") {
          clearInterval(pollTimers.get(jobId)!);
          pollTimers.delete(jobId);

          // Update status immediately — don't block on blob download
          get()._updateJob(jobId, { status: "completed" });

          emitToast({
            title: "Processing complete",
            description: `${job.fileName} (${formatSize(job.fileSize)}) is ready`,
            variant: "success",
          });

          // Fetch blob URL in the background for waveform preview
          try {
            const blobUrl = await audioApi.fetchAsBlobUrl(job.serverJobId);
            get()._updateJob(jobId, { processedBlobUrl: blobUrl });
          } catch {
            // Waveform preview unavailable, download still works
          }
          return;
        }

        if (data.status === "failed") {
          clearInterval(pollTimers.get(jobId)!);
          pollTimers.delete(jobId);

          get()._updateJob(jobId, {
            status: "failed",
            error: data.error_message || "Processing failed",
          });

          emitToast({
            title: "Processing failed",
            description: job.fileName,
            variant: "error",
          });
          return;
        }

        // Still processing — keep polling
      } catch (err) {
        console.warn(`[jobs] poll failed for ${jobId}:`, err);
      }
    };

    poll();
    pollTimers.set(jobId, setInterval(poll, 2000));
  },
}));

// Derived selectors — primitives are safe, arrays need useMemo
export const useJobsList = () => {
  const jobs = useJobsStore((s) => s.jobs);
  return useMemo(
    () => Object.values(jobs).sort((a, b) => b.createdAt - a.createdAt),
    [jobs]
  );
};

export const useActiveJobCount = () =>
  useJobsStore((s) =>
    Object.values(s.jobs).filter(
      (j) => j.status === "queued" || j.status === "uploading" || j.status === "processing"
    ).length
  );

export const useHasJobs = () =>
  useJobsStore((s) => Object.keys(s.jobs).length > 0);

export const useCompletedJobCount = () =>
  useJobsStore((s) =>
    Object.values(s.jobs).filter((j) => j.status === "completed").length
  );
