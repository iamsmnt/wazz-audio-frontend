"use client";

import { motion } from "framer-motion";
import { FolderOpen, Clock, FileAudio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Placeholder — wire to real API when /audio/projects endpoint is available
const projects: {
  id: string;
  name: string;
  status: "completed" | "processing" | "failed";
  date: string;
  type: string;
}[] = [];

const statusVariant = {
  completed: "success" as const,
  processing: "warning" as const,
  failed: "error" as const,
};

export default function ProjectsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight">Projects</h1>
            <p className="text-sm text-text-muted mt-1">
              Your processed audio files
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No projects yet"
            description="Process your first audio file to see it appear here."
            action={
              <Button asChild>
                <Link href="/dashboard">Process audio</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-5 gradient-border hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="rounded-lg bg-accent-violet-muted p-2">
                    <FileAudio className="h-4 w-4 text-accent-violet" />
                  </div>
                  <Badge variant={statusVariant[project.status]}>
                    {project.status}
                  </Badge>
                </div>
                <h3 className="text-sm font-display font-semibold text-text-primary truncate">
                  {project.name}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                  <Clock className="h-3 w-3" />
                  {project.date}
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {project.type}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
