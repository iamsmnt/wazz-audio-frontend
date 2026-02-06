"use client";

import { useState, useCallback } from "react";
import { Bell, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useJobsList } from "@/lib/stores/jobs-store";

export function NotificationBell() {
  const [lastSeenAt, setLastSeenAt] = useState(Date.now);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const jobs = useJobsList();

  const notifications = jobs.filter(
    (j) =>
      (j.status === "completed" || j.status === "failed") &&
      !dismissedIds.has(j.id)
  );

  const unreadCount = notifications.filter(
    (j) => j.createdAt > lastSeenAt
  ).length;

  const handleOpen = useCallback((open: boolean) => {
    if (open) {
      setLastSeenAt(Date.now());
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  }, []);

  return (
    <DropdownMenu onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="text-text-muted relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-accent-violet text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-text-muted">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            {notifications.map((job) => (
              <div
                key={job.id}
                className="flex items-start gap-3 px-3 py-2.5 hover:bg-white/[0.05] rounded-lg transition-colors"
              >
                {job.status === "completed" ? (
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-error mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {job.fileName}
                  </p>
                  <p className="text-xs text-text-muted">
                    {job.status === "completed"
                      ? "Processing complete"
                      : job.error ?? "Processing failed"}
                  </p>
                </div>
                <button
                  onClick={() => dismiss(job.id)}
                  className="text-xs text-text-muted hover:text-text-secondary transition-colors shrink-0"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
