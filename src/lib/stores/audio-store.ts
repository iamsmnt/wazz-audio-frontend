"use client";

import { create } from "zustand";
import { audioApi } from "@/lib/api/audio";
import { emitToast } from "@/lib/hooks/use-toast";
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
  streamStatus: () => void;
  downloadProcessed: () => Promise<void>;
  reset: () => void;
}

let eventSource: EventSource | null = null;

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

      // Start streaming status updates
      get().streamStatus();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      set({ status: "failed", error: message });
      emitToast({
        title: "Upload failed",
        description: message,
        variant: "error",
      });
    }
  },

  streamStatus: () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }

    const { jobId } = get();
    if (!jobId) return;

    const es = audioApi.subscribeToStatus(jobId);
    eventSource = es;

    es.addEventListener("status", (e) => {
      const data = JSON.parse(e.data);

      if (data.status === "completed") {
        es.close();
        eventSource = null;

        emitToast({
          title: "Processing complete",
          description: get().originalFilename ?? "Your audio is ready",
          variant: "success",
        });

        // Fetch processed audio with auth headers and create a
        // blob URL that WaveSurfer can load without credentials
        audioApi.fetchAsBlobUrl(jobId).then((blobUrl) => {
          set({
            status: "completed",
            processingProgress: 100,
            processedUrl: blobUrl,
          });
        }).catch(() => {
          set({
            status: "completed",
            processingProgress: 100,
            processedUrl: null,
          });
        });
        return;
      }

      if (data.status === "failed") {
        es.close();
        eventSource = null;

        emitToast({
          title: "Processing failed",
          description: data.error_message || "Something went wrong",
          variant: "error",
        });

        set({
          status: "failed",
          error: data.error_message || "Processing failed",
        });
        return;
      }

      set({ processingProgress: data.progress ?? 0 });
    });

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        eventSource = null;
      }
      // EventSource auto-reconnects on transient errors
    };
  },

  downloadProcessed: async () => {
    const { jobId, originalFilename } = get();
    if (!jobId) return;
    await audioApi.downloadFile(jobId, originalFilename ?? "audio");
  },

  reset: () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
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
