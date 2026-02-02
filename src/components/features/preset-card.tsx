"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PresetCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

export function PresetCard({
  name,
  description,
  icon: Icon,
  isSelected = false,
  isDisabled = false,
  onClick,
}: PresetCardProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      className={cn(
        "relative flex flex-col items-start gap-2.5 p-4 rounded-xl text-left transition-all duration-200 cursor-pointer w-full",
        "border",
        isSelected
          ? "bg-accent-violet/10 border-accent-violet/30 glow-violet"
          : "bg-white/[0.02] border-border-subtle hover:bg-white/[0.04] hover:border-white/15",
        isDisabled && "opacity-40 pointer-events-none"
      )}
    >
      {/* Gradient border on selection */}
      {isSelected && (
        <div className="absolute inset-[-1px] rounded-xl bg-gradient-to-br from-accent-violet/20 to-accent-cyan/20 -z-10" />
      )}

      <div
        className={cn(
          "rounded-lg p-2",
          isSelected ? "bg-accent-violet/20" : "bg-white/5"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5",
            isSelected ? "text-accent-violet" : "text-text-muted"
          )}
        />
      </div>

      <div>
        <p
          className={cn(
            "text-sm font-semibold",
            isSelected ? "text-text-primary" : "text-text-secondary"
          )}
        >
          {name}
        </p>
        <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.button>
  );
}
