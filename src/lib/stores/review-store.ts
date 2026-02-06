"use client";

import { create } from "zustand";
import { useJobsStore } from "./jobs-store";
import { audioApi } from "@/lib/api/audio";

interface ReviewState {
  selectedJobId: string | null;
  originalBlobUrl: string | null;
  processedBlobUrl: string | null;
  fileName: string | null;
  serverJobId: string | null;
  originalFilename: string | null;
  loading: boolean;

  selectJob: (jobId: string) => void;
  loadProject: (serverJobId: string, fileName: string) => Promise<void>;
  clearReview: () => void;
}

function revokeUrls(state: ReviewState) {
  if (state.originalBlobUrl) URL.revokeObjectURL(state.originalBlobUrl);
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  selectedJobId: null,
  originalBlobUrl: null,
  processedBlobUrl: null,
  fileName: null,
  serverJobId: null,
  originalFilename: null,
  loading: false,

  selectJob: (jobId) => {
    revokeUrls(get());

    const job = useJobsStore.getState().jobs[jobId];
    if (!job) return;

    const originalBlobUrl = URL.createObjectURL(job.file);
    const hasProcessedUrl = !!job.processedBlobUrl;

    set({
      selectedJobId: jobId,
      originalBlobUrl,
      processedBlobUrl: job.processedBlobUrl,
      fileName: job.fileName,
      serverJobId: job.serverJobId,
      originalFilename: job.originalFilename,
      loading: !hasProcessedUrl && !!job.serverJobId,
    });

    // If blob URL not ready yet (fetch still in progress), fetch it ourselves
    if (!hasProcessedUrl && job.serverJobId) {
      audioApi.fetchAsBlobUrl(job.serverJobId).then((blobUrl) => {
        if (get().selectedJobId === jobId) {
          set({ processedBlobUrl: blobUrl, loading: false });
        }
      }).catch(() => {
        if (get().selectedJobId === jobId) {
          set({ loading: false });
        }
      });
    }
  },

  loadProject: async (serverJobId, fileName) => {
    revokeUrls(get());

    set({
      selectedJobId: `project-${serverJobId}`,
      originalBlobUrl: null,
      processedBlobUrl: null,
      fileName,
      serverJobId,
      originalFilename: fileName,
      loading: true,
    });

    try {
      const [originalBlobUrl, processedBlobUrl] = await Promise.all([
        audioApi.fetchOriginalAsBlobUrl(serverJobId),
        audioApi.fetchAsBlobUrl(serverJobId),
      ]);

      set({ originalBlobUrl, processedBlobUrl, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  clearReview: () => {
    revokeUrls(get());

    set({
      selectedJobId: null,
      originalBlobUrl: null,
      processedBlobUrl: null,
      fileName: null,
      serverJobId: null,
      originalFilename: null,
      loading: false,
    });
  },
}));
