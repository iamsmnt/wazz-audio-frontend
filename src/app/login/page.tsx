"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/logo";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useAuthStore } from "@/lib/stores/auth-store";

const loginSchema = z.object({
  username_or_email: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      await login(data.username_or_email, data.password);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid credentials"
      );
    }
  };

  const handleGuestMode = () => {
    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem("guestId", guestId);
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 bg-bg-primary">
        <div className="absolute top-[-30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent-violet/8 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent-cyan/6 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[400px] mx-4"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        {/* Card */}
        <div className="glass-strong rounded-3xl p-7">
          <div className="mb-6">
            <h1 className="text-xl font-display font-bold text-text-primary">Welcome back</h1>
            <p className="text-sm text-text-muted mt-1">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username_or_email">Username or Email</Label>
              <Input
                id="username_or_email"
                placeholder="you@example.com"
                autoComplete="username"
                {...register("username_or_email")}
              />
              {errors.username_or_email && (
                <p className="text-xs text-error">
                  {errors.username_or_email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-error">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-error/10 border border-error/20 px-3 py-2"
              >
                <p className="text-xs text-error">{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-xs text-text-muted">or</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          {/* Guest mode */}
          <Button
            variant="outline"
            onClick={handleGuestMode}
            className="w-full"
          >
            Continue as guest
          </Button>
        </div>

        {/* Signup link */}
        <p className="text-center text-sm text-text-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-accent-violet hover:text-accent-violet/80 font-medium transition-colors"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
