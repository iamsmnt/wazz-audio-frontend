"use client";

import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  settingsPanelOpen: boolean;
  mobileNavOpen: boolean;

  toggleSidebar: () => void;
  toggleSettingsPanel: () => void;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  settingsPanelOpen: true,
  mobileNavOpen: false,

  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleSettingsPanel: () =>
    set((s) => ({ settingsPanelOpen: !s.settingsPanelOpen })),
  toggleMobileNav: () =>
    set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
  closeMobileNav: () => set({ mobileNavOpen: false }),
}));
