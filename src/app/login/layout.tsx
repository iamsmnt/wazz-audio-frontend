import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Access Your Audio Denoiser Dashboard",
  description:
    "Sign in to WazzAudio to remove background noise from audio, clean up podcasts, and enhance voice recordings with AI-powered noise reduction.",
  robots: { index: false, follow: true },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
