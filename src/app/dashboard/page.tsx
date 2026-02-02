"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Video,
  Users,
  Music,
  Download,
  RotateCcw,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioUploader } from "@/components/audio/audio-uploader";
import { WaveformDisplay } from "@/components/audio/waveform-display";
import { ProcessingIndicator } from "@/components/audio/processing-indicator";
import { PresetCard } from "@/components/features/preset-card";
import { useAudioStore } from "@/lib/stores/audio-store";
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
  const {
    originalFile,
    originalUrl,
    processedUrl,
    status,
    uploadProgress,
    processingProgress,
    error,
    selectedPreset,
    setOriginalFile,
    setSelectedPreset,
    uploadAndProcess,
    downloadProcessed,
    reset,
  } = useAudioStore();

  const handleFileSelect = useCallback(
    (file: File) => {
      setOriginalFile(file);
    },
    [setOriginalFile]
  );

  const handleProcess = useCallback(() => {
    if (originalFile) {
      uploadAndProcess(originalFile);
    }
  }, [originalFile, uploadAndProcess]);

  const isProcessing = status === "uploading" || status === "processing";
  const isComplete = status === "completed";

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
          {/* Center — Upload & Waveforms */}
          <div className="space-y-5">
            {/* Upload zone */}
            <AnimatePresence mode="wait">
              {status === "idle" && !originalFile && (
                <motion.div
                  key="uploader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AudioUploader
                    onFileSelect={handleFileSelect}
                    selectedFile={null}
                  />
                </motion.div>
              )}

              {status === "idle" && originalFile && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <AudioUploader
                    onFileSelect={handleFileSelect}
                    selectedFile={originalFile}
                    onClear={reset}
                  />

                  {/* Original waveform */}
                  {originalUrl && (
                    <WaveformDisplay
                      audioUrl={originalUrl}
                      type="original"
                      label="Original"
                    />
                  )}

                  {/* Process button */}
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

              {isProcessing && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {originalUrl && (
                    <WaveformDisplay
                      audioUrl={originalUrl}
                      type="original"
                      label="Original"
                    />
                  )}
                  <div className="glass rounded-2xl glow-pulse">
                    <ProcessingIndicator
                      status={status}
                      progress={
                        status === "uploading"
                          ? uploadProgress
                          : processingProgress
                      }
                      error={error}
                    />
                  </div>
                </motion.div>
              )}

              {isComplete && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Before / After waveforms */}
                  {originalUrl && (
                    <WaveformDisplay
                      audioUrl={originalUrl}
                      type="original"
                      label="Original"
                    />
                  )}
                  {processedUrl && (
                    <WaveformDisplay
                      audioUrl={processedUrl}
                      type="processed"
                      label="Processed"
                    />
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={downloadProcessed}
                      size="lg"
                      className="flex-1"
                    >
                      <Download className="h-4 w-4" />
                      Download Processed
                    </Button>
                    <Button variant="outline" size="lg" onClick={reset}>
                      <RotateCcw className="h-4 w-4" />
                      New File
                    </Button>
                  </div>
                </motion.div>
              )}

              {status === "failed" && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="glass rounded-2xl">
                    <ProcessingIndicator
                      status="failed"
                      error={error}
                    />
                  </div>
                  <Button variant="outline" onClick={reset} className="w-full">
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
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
                isDisabled={isProcessing}
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
