import type { LucideIcon } from "lucide-react";

export type ProcessingPreset =
  | "speech_enhancement"
  | "speaker_separation"
  | "music_separation"
  | "noise_reduction";

export type ProcessingStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "failed";

export interface PresetInfo {
  id: ProcessingPreset;
  name: string;
  description: string;
  icon: LucideIcon;
}
