"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AudioWaveform,
  FolderOpen,
  Settings,
  CreditCard,
  X,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { useUIStore } from "@/lib/stores/ui-store";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", icon: AudioWaveform, label: "Process Audio" },
  { href: "/dashboard/projects", icon: FolderOpen, label: "Projects" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
];

export function MobileNav() {
  const pathname = usePathname();
  const isOpen = useUIStore((s) => s.mobileNavOpen);
  const close = useUIStore((s) => s.closeMobileNav);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-[280px] glass-strong p-5 lg:hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <Logo size="md" />
              <button
                onClick={close}
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-accent-violet/15 text-accent-violet"
                        : "text-text-muted hover:text-text-secondary hover:bg-white/5"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
