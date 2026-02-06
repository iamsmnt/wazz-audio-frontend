"use client";

import { useSyncExternalStore, useCallback } from "react";
import { generateId } from "@/lib/utils/id";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error";
  duration?: number;
}

type ToastProps = Omit<Toast, "id">;

let toasts: Toast[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function addToast(props: ToastProps): string {
  const id = generateId();
  const toast: Toast = { id, ...props };
  toasts = [toast, ...toasts];
  notify();

  const duration = props.duration ?? 5000;
  setTimeout(() => {
    dismissToast(id);
  }, duration);

  return id;
}

function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

function getSnapshot() {
  return toasts;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Callable from outside React (e.g. Zustand stores) */
export function emitToast(props: ToastProps) {
  addToast(props);
}

export function useToast() {
  const currentToasts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const toast = useCallback((props: ToastProps) => addToast(props), []);
  const dismiss = useCallback((id: string) => dismissToast(id), []);

  return { toasts: currentToasts, toast, dismiss };
}
