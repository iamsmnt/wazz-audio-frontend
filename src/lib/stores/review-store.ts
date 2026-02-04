"use client";

import { create } from "zustand";
import { useJobsStore } from "./jobs-store";

interface ReviewState {
  selectedJobId: string | null;
  originalBlobUrl: string | null;
  processedBlobUrl: string | null;
  fileName: string | null;
  serverJobId: string | null;
  originalFilename: string | null;

  selectJob: (jobId: string) => void;
  clearReview: () => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  selectedJobId: null,
  originalBlobUrl: null,
  processedBlobUrl: null,
  fileName: null,
  serverJobId: null,
  originalFilename: null,

  selectJob: (jobId) => {
    // Revoke previous original blob URL
    const prev = get().originalBlobUrl;
    if (prev) URL.revokeObjectURL(prev);

    const job = useJobsStore.getState().jobs[jobId];
    if (!job) return;

    const originalBlobUrl = URL.createObjectURL(job.file);

    set({
      selectedJobId: jobId,
      originalBlobUrl,
      processedBlobUrl: job.processedBlobUrl,
      fileName: job.fileName,
      serverJobId: job.serverJobId,
      originalFilename: job.originalFilename,
    });
  },

  clearReview: () => {
    const { originalBlobUrl } = get();
    if (originalBlobUrl) URL.revokeObjectURL(originalBlobUrl);

    set({
      selectedJobId: null,
      originalBlobUrl: null,
      processedBlobUrl: null,
      fileName: null,
      serverJobId: null,
      originalFilename: null,
    });
  },
}));
