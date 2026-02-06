"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Video,
  Users,
  Music,
  Download,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioUploader } from "@/components/audio/audio-uploader";
import { WaveformDisplay } from "@/components/audio/waveform-display";
import { PresetCard } from "@/components/features/preset-card";
import { JobStatusPanel } from "@/components/jobs/job-status-panel";
import { useJobsStore } from "@/lib/stores/jobs-store";
import { useReviewStore } from "@/lib/stores/review-store";
import { audioApi } from "@/lib/api/audio";
import type { ProcessingPreset, PresetInfo } from "@/types/audio";

const presets: PresetInfo[] = [
  {
    id: "speech_enhancement",
    name: "Speech Enhancement",
    description: "Remove background noise and enhance voice clarity",
    icon: Mic,
  },
  {
    id: "noise_reduction",
    name: "Noise Reduction",
    description: "Clean audio by removing unwanted noise",
    icon: Music,
  },
  {
    id: "speaker_separation",
    name: "Speaker Separation",
    description: "Separate multiple speakers into individual tracks",
    icon: Users,
  },
  {
    id: "music_separation",
    name: "Music Separation",
    description: "Isolate vocals, drums, bass, and instruments",
    icon: Video,
  },
];

export default function DashboardPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreset, setSelectedPreset] =
    useState<ProcessingPreset>("speech_enhancement");

  const submitJob = useJobsStore((s) => s.submitJob);

  const searchParams = useSearchParams();

  const selectedJobId = useReviewStore((s) => s.selectedJobId);
  const originalBlobUrl = useReviewStore((s) => s.originalBlobUrl);
  const processedBlobUrl = useReviewStore((s) => s.processedBlobUrl);
  const reviewFileName = useReviewStore((s) => s.fileName);
  const reviewServerJobId = useReviewStore((s) => s.serverJobId);
  const reviewOriginalFilename = useReviewStore((s) => s.originalFilename);
  const reviewLoading = useReviewStore((s) => s.loading);
  const loadProject = useReviewStore((s) => s.loadProject);
  const clearReview = useReviewStore((s) => s.clearReview);

  // Load project from URL params (e.g. /dashboard?project=abc&name=my-audio.wav)
  useEffect(() => {
    const projectId = searchParams.get("project");
    const name = searchParams.get("name");
    if (projectId) {
      loadProject(projectId, name || "audio");
    }
  }, [searchParams, loadProject]);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const handleProcess = useCallback(() => {
    if (selectedFile) {
      submitJob(selectedFile, selectedPreset);
      setSelectedFile(null);
    }
  }, [selectedFile, selectedPreset, submitJob]);

  const handleDownloadReviewed = useCallback(async () => {
    if (!reviewServerJobId) return;
    await audioApi.downloadFile(
      reviewServerJobId,
      reviewOriginalFilename ?? "audio"
    );
  }, [reviewServerJobId, reviewOriginalFilename]);

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold tracking-tight">
            Process Audio
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Upload your audio and choose a processing preset
          </p>
        </div>

        {/* Main grid: Center + Right panel */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          {/* Center — Upload & Review */}
          <div className="space-y-5">
            {/* Upload zone — always visible */}
            <AudioUploader
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onClear={handleClear}
            />

            {/* Process button — shown when file selected */}
            <AnimatePresence>
              {selectedFile && (
                <motion.div
                  key="process-btn"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={handleProcess}
                    size="lg"
                    className="w-full h-12"
                  >
                    <Upload className="h-4 w-4" />
                    Start Processing
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Waveform review — shown when a completed job is selected from jobs panel */}
            <AnimatePresence>
              {selectedJobId && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-display font-semibold text-text-primary">
                        Reviewing
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5 truncate max-w-[300px]">
                        {reviewFileName}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearReview}
                      className="text-text-muted hover:text-text-primary"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {reviewLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
                      <span className="ml-2 text-sm text-text-muted">Loading audio...</span>
                    </div>
                  ) : (
                    <>
                      {originalBlobUrl && (
                        <WaveformDisplay
                          audioUrl={originalBlobUrl}
                          type="original"
                          label="Original"
                        />
                      )}
                      {processedBlobUrl && (
                        <WaveformDisplay
                          audioUrl={processedBlobUrl}
                          type="processed"
                          label="Processed"
                        />
                      )}

                      <Button
                        onClick={handleDownloadReviewed}
                        size="lg"
                        className="w-full"
                      >
                        <Download className="h-4 w-4" />
                        Download Processed
                      </Button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Jobs panel — inline, below uploader and review */}
            <JobStatusPanel />
          </div>

          {/* Right panel — Presets */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-3"
          >
            <div className="mb-1">
              <h2 className="text-sm font-display font-semibold text-text-primary">
                Processing Preset
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Select how to transform your audio
              </p>
            </div>

            {presets.map((preset) => (
              <PresetCard
                key={preset.id}
                id={preset.id}
                name={preset.name}
                description={preset.description}
                icon={preset.icon}
                isSelected={selectedPreset === preset.id}
                isDisabled={false}
                onClick={() =>
                  setSelectedPreset(preset.id as ProcessingPreset)
                }
              />
            ))}
          </motion.aside>
        </div>
      </motion.div>
    </div>
  );
}
