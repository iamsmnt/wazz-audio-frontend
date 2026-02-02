import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up Free — AI Audio Noise Removal Tool",
  description:
    "Create a free WazzAudio account. Remove background noise from audio and video, clean podcast recordings, and get studio-quality sound in seconds.",
  robots: { index: true, follow: true },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
