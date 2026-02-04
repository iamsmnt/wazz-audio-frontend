"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlassSidebar } from "@/components/layout/glass-sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Toaster } from "@/components/ui/toaster";
import { JobStatusPanel } from "@/components/jobs/job-status-panel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Check for guest mode
      const guestId = localStorage.getItem("guestId");
      if (!guestId) {
        router.push("/login");
      }
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-accent-violet border-t-transparent animate-spin" />
          <p className="text-sm text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen bg-bg-primary">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <GlassSidebar />
        </div>

        {/* Mobile nav drawer */}
        <MobileNav />

        {/* Main area */}
        <div className="lg:ml-[72px] flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
      <Toaster />
      <JobStatusPanel />
    </TooltipProvider>
  );
}
