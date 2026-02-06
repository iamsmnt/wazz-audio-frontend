"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { audioApi } from "@/lib/api/audio";
import { emitToast } from "@/lib/hooks/use-toast";
import { generateId } from "@/lib/utils/id";
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
  _startStreaming: (jobId: string) => void;
}

const eventSources = new Map<string, EventSource>();

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: {},

  submitJob: (file, preset) => {
    const id = generateId();
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
    // Close any existing SSE connection
    if (eventSources.has(jobId)) {
      eventSources.get(jobId)!.close();
      eventSources.delete(jobId);
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
    // Close SSE connection
    if (eventSources.has(jobId)) {
      eventSources.get(jobId)!.close();
      eventSources.delete(jobId);
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
      }, job.preset);

      get()._updateJob(jobId, {
        serverJobId: response.job_id,
        originalFilename: response.original_filename,
        status: "processing",
      });

      get()._startStreaming(jobId);
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

  _startStreaming: (jobId) => {
    // Close any existing connection for this job
    if (eventSources.has(jobId)) {
      eventSources.get(jobId)!.close();
    }

    const job = get().jobs[jobId];
    if (!job?.serverJobId) return;

    const es = audioApi.subscribeToStatus(job.serverJobId);
    eventSources.set(jobId, es);

    es.addEventListener("status", (e) => {
      const data = JSON.parse(e.data);

      if (data.status === "completed") {
        es.close();
        eventSources.delete(jobId);

        get()._updateJob(jobId, { status: "completed" });

        emitToast({
          title: "Processing complete",
          description: `${job.fileName} (${formatSize(job.fileSize)}) is ready`,
          variant: "success",
        });

        // Fetch blob URL in the background for waveform preview
        audioApi.fetchAsBlobUrl(job.serverJobId!).then((blobUrl) => {
          get()._updateJob(jobId, { processedBlobUrl: blobUrl });
        }).catch(() => {
          // Waveform preview unavailable, download still works
        });
        return;
      }

      if (data.status === "failed") {
        es.close();
        eventSources.delete(jobId);

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

      // Still processing — update progress if present
    });

    es.onerror = () => {
      // EventSource auto-reconnects on error.
      // If the connection is permanently dead, readyState will be CLOSED.
      if (es.readyState === EventSource.CLOSED) {
        eventSources.delete(jobId);
        console.warn(`[jobs] SSE connection closed for ${jobId}`);
      }
    };
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
