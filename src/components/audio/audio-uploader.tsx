"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileAudio, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatFileSize } from "@/lib/utils/format";

const ACCEPTED_FORMATS = [".mp3", ".wav", ".m4a", ".flac", ".ogg", ".webm"];
const MAX_SIZE_MB = 500;
const ACCEPT_STRING = "audio/*";

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear?: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
  className?: string;
}

export function AudioUploader({
  onFileSelect,
  selectedFile,
  onClear,
  isUploading,
  uploadProgress = 0,
  className,
}: AudioUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!file.type.startsWith("audio/")) {
      return "Please select a valid audio file";
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File size exceeds ${MAX_SIZE_MB}MB limit`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const err = validateFile(file);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className={cn("w-full", className)}>
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
        animate={{
          scale: isDragging ? 1.01 : 1,
          borderColor: isDragging
            ? "rgba(139, 92, 246, 0.6)"
            : "rgba(255, 255, 255, 0.08)",
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors cursor-pointer",
          isDragging
            ? "bg-accent-violet-muted border-accent-violet"
            : selectedFile
            ? "border-border-subtle bg-white/[0.02]"
            : "border-border-subtle hover:border-white/15 hover:bg-white/[0.02]",
          isUploading && "pointer-events-none"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_STRING}
          onChange={handleInputChange}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className="rounded-2xl bg-accent-violet-muted p-3">
                <FileAudio className="h-8 w-8 text-accent-violet" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary truncate max-w-[240px]">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>

              {/* Upload progress */}
              {isUploading && (
                <div className="w-full max-w-[200px]">
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-accent-violet to-accent-cyan rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-1.5 text-center">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}

              {!isUploading && onClear && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-error transition-colors mt-1"
                >
                  <X className="h-3 w-3" />
                  Remove
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className="rounded-2xl bg-white/5 p-3">
                <Upload className="h-8 w-8 text-text-muted" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Drop your audio file here
                </p>
                <p className="text-xs text-text-muted mt-1">
                  or click to browse
                </p>
              </div>
              <p className="text-[11px] text-text-muted/60">
                {ACCEPTED_FORMATS.join(", ")} &middot; Max {MAX_SIZE_MB}MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-error mt-2 px-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
