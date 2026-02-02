"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatDuration } from "@/lib/utils/format";

interface WaveformDisplayProps {
  audioUrl: string;
  type?: "original" | "processed";
  label?: string;
  height?: number;
  waveColor?: string;
  progressColor?: string;
  className?: string;
}

export function WaveformDisplay({
  audioUrl,
  type = "original",
  label,
  height = 100,
  waveColor,
  progressColor,
  className,
}: WaveformDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<import("wavesurfer.js").default | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const defaultWaveColor =
    type === "original"
      ? "rgba(139, 92, 246, 0.5)"
      : "rgba(6, 182, 212, 0.5)";
  const defaultProgressColor =
    type === "original" ? "#8B5CF6" : "#06B6D4";

  const initWaveSurfer = useCallback(async () => {
    if (!containerRef.current) return;

    // Cleanup previous instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const WaveSurfer = (await import("wavesurfer.js")).default;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: waveColor || defaultWaveColor,
      progressColor: progressColor || defaultProgressColor,
      cursorColor: "#ffffff",
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height,
      normalize: true,
    });

    ws.on("ready", () => {
      setIsReady(true);
      setDuration(ws.getDuration());
    });

    ws.on("audioprocess", () => {
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on("seeking", () => {
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => setIsPlaying(false));

    ws.load(audioUrl);
    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [audioUrl, height, waveColor, progressColor, defaultWaveColor, defaultProgressColor]);

  useEffect(() => {
    initWaveSurfer();
    return () => {
      wavesurferRef.current?.destroy();
    };
  }, [initWaveSurfer]);

  const togglePlay = () => {
    wavesurferRef.current?.playPause();
  };

  const restart = () => {
    wavesurferRef.current?.seekTo(0);
    wavesurferRef.current?.play();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn("rounded-2xl glass p-4", className)}
    >
      {/* Label + time */}
      {(label || isReady) && (
        <div className="flex items-center justify-between mb-3">
          {label && (
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                type === "original" ? "text-accent-violet" : "text-accent-cyan"
              )}
            >
              {label}
            </span>
          )}
          {isReady && (
            <span className="text-xs text-text-muted font-mono">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
          )}
        </div>
      )}

      {/* Waveform */}
      <div
        ref={containerRef}
        className={cn(
          "w-full rounded-lg overflow-hidden cursor-pointer",
          !isReady && "shimmer"
        )}
        style={{ minHeight: height }}
      />

      {/* Controls */}
      {isReady && (
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={togglePlay}
            className={cn(
              "rounded-full",
              type === "original"
                ? "hover:bg-accent-violet/15 text-accent-violet"
                : "hover:bg-accent-cyan/15 text-accent-cyan"
            )}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={restart}
            className="rounded-full text-text-muted hover:text-text-secondary"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}
