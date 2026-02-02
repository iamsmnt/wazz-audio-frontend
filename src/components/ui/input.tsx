import * as React from "react";
import { cn } from "@/lib/utils/cn";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl bg-white/5 border border-border-subtle px-4 py-2 text-sm text-text-primary placeholder:text-text-muted",
        "transition-all duration-200",
        "hover:border-white/15",
        "focus:outline-none focus:border-accent-violet/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
