"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Lock, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/stores/auth-store";
import { userApi } from "@/lib/api/user";
import type { UsageStats } from "@/types/api";


const usernameSchema = z.object({
  username: z.string().min(3, "At least 3 characters"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const usernameForm = useForm({
    resolver: zodResolver(usernameSchema),
    defaultValues: { username: user?.username ?? "" },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    setLoadingStats(true);
    userApi
      .getUsageStats()
      .then(setUsageStats)
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  const onUpdateUsername = async (data: { username: string }) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await userApi.updateUsername(data.username);
      setSuccessMsg("Username updated");
    } catch {
      setErrorMsg("Failed to update username");
    }
  };

  const onChangePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await userApi.changePassword(data.currentPassword, data.newPassword);
      setSuccessMsg("Password changed");
      passwordForm.reset();
    } catch {
      setErrorMsg("Failed to change password");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-text-muted mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Feedback */}
        {successMsg && (
          <div className="mb-4 rounded-lg bg-success/10 border border-success/20 px-3 py-2 text-xs text-success">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-xs text-error">
            {errorMsg}
          </div>
        )}

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile" className="gap-1.5">
              <User className="h-3.5 w-3.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              Security
            </TabsTrigger>
            <TabsTrigger value="usage" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Usage
            </TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={usernameForm.handleSubmit(onUpdateUsername)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email ?? ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      {...usernameForm.register("username")}
                    />
                    {usernameForm.formState.errors.username && (
                      <p className="text-xs text-error">
                        {usernameForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={usernameForm.formState.isSubmitting}
                  >
                    {usernameForm.formState.isSubmitting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Save changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={passwordForm.handleSubmit(onChangePassword)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      {...passwordForm.register("currentPassword")}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-xs text-error">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      {...passwordForm.register("newPassword")}
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-xs text-error">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      {...passwordForm.register("confirmPassword")}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-error">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={passwordForm.formState.isSubmitting}
                  >
                    {passwordForm.formState.isSubmitting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Update password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage */}
          <TabsContent value="usage">
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
                  </div>
                ) : usageStats ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatItem
                      label="Files uploaded"
                      value={usageStats.total_files_uploaded}
                    />
                    <StatItem
                      label="Files processed"
                      value={usageStats.total_files_processed}
                    />
                    <StatItem
                      label="Files downloaded"
                      value={usageStats.total_files_downloaded}
                    />
                    <StatItem
                      label="Failed"
                      value={usageStats.total_files_failed}
                    />
                    <StatItem
                      label="Input storage"
                      value={`${usageStats.total_input_size_mb.toFixed(1)} MB`}
                    />
                    <StatItem
                      label="Output storage"
                      value={`${usageStats.total_output_size_mb.toFixed(1)} MB`}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-text-muted text-center py-8">
                    No usage data available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function StatItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-border-subtle p-4">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className="text-lg font-bold text-text-primary">{value}</p>
    </div>
  );
}
