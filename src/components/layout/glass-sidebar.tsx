"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  AudioWaveform,
  FolderOpen,
  Settings,
  CreditCard,
  LogOut,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Logo } from "@/components/shared/logo";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", icon: AudioWaveform, label: "Process" },
  { href: "/dashboard/projects", icon: FolderOpen, label: "Projects" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
];

export function GlassSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 w-[72px] flex flex-col items-center py-5 gap-2 glass border-r border-border-subtle"
    >
      {/* Logo */}
      <Link href="/dashboard" className="mb-6">
        <Logo size="sm" showText={false} />
      </Link>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-1.5 flex-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-accent-violet/15 text-accent-violet"
                      : "text-text-muted hover:text-text-secondary hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute inset-0 rounded-xl bg-accent-violet/15 border border-accent-violet/20"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                  <item.icon className="h-5 w-5 relative z-10" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Logout */}
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            onClick={() => logout()}
            className="flex items-center justify-center w-11 h-11 rounded-xl text-text-muted hover:text-error hover:bg-error/10 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">Sign out</TooltipContent>
      </Tooltip>
    </motion.aside>
  );
}
