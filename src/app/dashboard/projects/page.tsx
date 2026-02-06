"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Clock,
  FileAudio,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { audioApi } from "@/lib/api/audio";
import type { Project } from "@/types/api";

const statusVariant: Record<
  string,
  "success" | "warning" | "error" | "outline"
> = {
  completed: "success",
  processing: "warning",
  failed: "error",
  pending: "outline",
};

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [renaming, setRenaming] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();

  const openProject = (project: Project) => {
    if (project.status !== "completed") return;
    const name = project.project_name || project.original_filename;
    router.push(`/dashboard?project=${project.job_id}&name=${encodeURIComponent(name)}`);
  };

  useEffect(() => {
    audioApi
      .getProjects()
      .then(setProjects)
      .catch(() => setError("Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (editingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingId]);

  const startRename = (project: Project) => {
    setEditingId(project.job_id);
    setEditValue(project.project_name || project.original_filename);
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditValue("");
  };

  const submitRename = async (jobId: string) => {
    const trimmed = editValue.trim();
    if (!trimmed) return cancelRename();

    setRenaming(true);
    try {
      const updated = await audioApi.renameProject(jobId, trimmed);
      setProjects((prev) =>
        prev.map((p) => (p.job_id === jobId ? { ...p, project_name: updated.project_name } : p))
      );
    } catch {
      // Silently fail — name stays unchanged in UI
    } finally {
      setRenaming(false);
      setEditingId(null);
      setEditValue("");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await audioApi.deleteProject(deleteTarget.job_id);
      setProjects((prev) => prev.filter((p) => p.job_id !== deleteTarget.job_id));
    } catch {
      // Could show a toast here
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight">
              Projects
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Your processed audio files
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
          </div>
        ) : error ? (
          <EmptyState
            icon={FolderOpen}
            title="Something went wrong"
            description={error}
            action={
              <Button onClick={() => window.location.reload()}>
                Try again
              </Button>
            }
          />
        ) : projects.length === 0 ? (
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
            <AnimatePresence mode="popLayout">
              {projects.map((project, i) => (
                <motion.div
                  key={project.job_id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  onDoubleClick={() => openProject(project)}
                  className={`glass rounded-2xl p-5 gradient-border hover:bg-white/[0.04] transition-colors ${project.status === "completed" ? "cursor-pointer" : ""}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="rounded-lg bg-accent-violet-muted p-2">
                      <FileAudio className="h-4 w-4 text-accent-violet" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant={statusVariant[project.status] ?? "outline"}
                      >
                        {project.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-md hover:bg-white/10 transition-colors text-text-muted">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startRename(project)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(project)}
                            className="text-red-400 focus:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {editingId === project.job_id ? (
                    <div className="flex items-center gap-1.5">
                      <Input
                        ref={renameInputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") submitRename(project.job_id);
                          if (e.key === "Escape") cancelRename();
                        }}
                        disabled={renaming}
                        className="h-7 text-sm"
                      />
                      <button
                        onClick={() => submitRename(project.job_id)}
                        disabled={renaming}
                        className="p-1 rounded-md hover:bg-white/10 text-green-400"
                      >
                        {renaming ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={cancelRename}
                        disabled={renaming}
                        className="p-1 rounded-md hover:bg-white/10 text-text-muted"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <h3 className="text-sm font-display font-semibold text-text-primary truncate">
                      {project.project_name || project.original_filename}
                    </h3>
                  )}

                  <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                    <Clock className="h-3 w-3" />
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                  {project.processing_type && (
                    <p className="text-xs text-text-muted mt-1 capitalize">
                      {project.processing_type.replace(/_/g, " ")}
                    </p>
                  )}
                  {(project.duration || project.file_size) && (
                    <p className="text-xs text-text-muted/60 mt-1">
                      {[
                        formatDuration(project.duration),
                        formatFileSize(project.file_size),
                      ]
                        .filter(Boolean)
                        .join(" / ")}
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-text-primary">
                {deleteTarget?.project_name || deleteTarget?.original_filename}
              </span>
              ? This will permanently remove the file and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
