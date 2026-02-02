"use client";

import { create } from "zustand";
import { audioApi } from "@/lib/api/audio";
import type { ProcessingPreset, ProcessingStatus } from "@/types/audio";

interface AudioState {
  originalFile: File | null;
  originalUrl: string | null;
  processedUrl: string | null;

  status: ProcessingStatus;
  uploadProgress: number;
  processingProgress: number;
  jobId: string | null;
  originalFilename: string | null;
  error: string | null;

  selectedPreset: ProcessingPreset;

  setOriginalFile: (file: File) => void;
  setSelectedPreset: (preset: ProcessingPreset) => void;
  uploadAndProcess: (file: File) => Promise<void>;
  pollStatus: () => void;
  downloadProcessed: () => Promise<void>;
  reset: () => void;
}

let pollTimer: ReturnType<typeof setInterval> | null = null;

export const useAudioStore = create<AudioState>((set, get) => ({
  originalFile: null,
  originalUrl: null,
  processedUrl: null,
  status: "idle",
  uploadProgress: 0,
  processingProgress: 0,
  jobId: null,
  originalFilename: null,
  error: null,
  selectedPreset: "speech_enhancement",

  setOriginalFile: (file) => {
    const prevUrl = get().originalUrl;
    if (prevUrl) URL.revokeObjectURL(prevUrl);

    set({
      originalFile: file,
      originalUrl: URL.createObjectURL(file),
      processedUrl: null,
      status: "idle",
      error: null,
      jobId: null,
      uploadProgress: 0,
      processingProgress: 0,
    });
  },

  setSelectedPreset: (preset) => set({ selectedPreset: preset }),

  uploadAndProcess: async (file) => {
    set({ status: "uploading", uploadProgress: 0, error: null });

    try {
      const response = await audioApi.upload(file, (progress) => {
        set({ uploadProgress: progress });
      });

      set({
        jobId: response.job_id,
        originalFilename: response.original_filename,
        status: "processing",
        processingProgress: response.progress ?? 0,
      });

      // Start polling
      get().pollStatus();
    } catch (err) {
      set({
        status: "failed",
        error: err instanceof Error ? err.message : "Upload failed",
      });
    }
  },

  pollStatus: () => {
    if (pollTimer) clearInterval(pollTimer);

    const poll = async () => {
      const { jobId } = get();
      if (!jobId) return;

      try {
        const data = await audioApi.getStatus(jobId);

        if (data.status === "completed") {
          if (pollTimer) clearInterval(pollTimer);
          pollTimer = null;

          // Fetch processed audio with auth headers and create a
          // blob URL that WaveSurfer can load without credentials
          try {
            const blobUrl = await audioApi.fetchAsBlobUrl(jobId);
            set({
              status: "completed",
              processingProgress: 100,
              processedUrl: blobUrl,
            });
          } catch {
            // Waveform preview unavailable, download still works
            set({
              status: "completed",
              processingProgress: 100,
              processedUrl: null,
            });
          }
          return;
        }

        if (data.status === "failed") {
          if (pollTimer) clearInterval(pollTimer);
          pollTimer = null;
          set({
            status: "failed",
            error: data.error_message || "Processing failed",
          });
          return;
        }

        set({ processingProgress: data.progress ?? 0 });
      } catch {
        // keep polling on transient errors
      }
    };

    poll();
    pollTimer = setInterval(poll, 2000);
  },

  downloadProcessed: async () => {
    const { jobId, originalFilename } = get();
    if (!jobId) return;
    await audioApi.downloadFile(jobId, originalFilename ?? "audio");
  },

  reset: () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    const { originalUrl, processedUrl } = get();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);

    set({
      originalFile: null,
      originalUrl: null,
      processedUrl: null,
      status: "idle",
      uploadProgress: 0,
      processingProgress: 0,
      jobId: null,
      originalFilename: null,
      error: null,
    });
  },
}));
