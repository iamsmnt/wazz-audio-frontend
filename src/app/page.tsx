"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AudioWaveform,
  Zap,
  Shield,
  ArrowRight,
  Mic,
  Video,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

const stagger = {
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const features = [
  {
    icon: Zap,
    title: "Lightning-Fast Noise Removal",
    description:
      "Remove background noise from hours of audio in minutes. GPU-accelerated AI processing handles wind, traffic, static, and hum automatically.",
  },
  {
    icon: AudioWaveform,
    title: "Studio-Quality Audio Output",
    description:
      "AI models trained on millions of samples deliver broadcast-ready voice clarity. Enhance audio quality for podcasts, videos, and recordings.",
  },
  {
    icon: Shield,
    title: "Private & Secure Processing",
    description:
      "Your audio files are encrypted in transit and at rest. Auto-deleted after processing completes. Zero data retention.",
  },
];

const presets = [
  {
    icon: Mic,
    name: "Podcast Cleanup",
    desc: "Remove echo, hiss, and room noise from podcast recordings",
  },
  {
    icon: Video,
    name: "Video Denoiser",
    desc: "Eliminate wind, traffic, and outdoor noise from vlogs",
  },
  {
    icon: Users,
    name: "Interview Audio",
    desc: "Balance multiple voices and reduce background noise",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary relative overflow-hidden grain">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] rounded-full bg-accent-violet/[0.04] blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-accent-cyan/[0.03] blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        initial="initial"
        animate="animate"
        variants={stagger}
        className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-32 text-center"
      >
        <motion.div variants={fadeUp} className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-violet-muted border border-accent-violet/20 px-4 py-1.5 text-xs font-semibold text-accent-violet">
            <Zap className="h-3 w-3" />
            Free Online Audio Denoiser
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-[1.1]"
        >
          Remove Background Noise
          <br />
          <span className="gradient-text">from Any Audio</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-6 text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed"
        >
          AI-powered audio denoiser that cleans audio, enhances voice clarity,
          and delivers studio-quality sound in seconds. Built for podcasters,
          vloggers, and content creators.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <Button size="lg" asChild>
            <Link href="/signup">
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/login">Try as guest</Link>
          </Button>
        </motion.div>

        {/* Animated waveform bars */}
        <motion.div
          variants={fadeUp}
          className="mt-16 flex items-end justify-center gap-[3px] h-16"
        >
          {Array.from({ length: 40 }).map((_, i) => {
            // Pre-round to whole numbers to avoid SSR/client hydration mismatch
            const low = Math.round(20 + Math.sin(i * 0.5) * 30);
            const high = Math.round(50 + Math.cos(i * 0.7) * 40);

            return (
              <motion.div
                key={i}
                className="w-[3px] rounded-full bg-gradient-to-t from-accent-violet to-accent-cyan"
                animate={{
                  height: [`${low}%`, `${high}%`, `${low}%`],
                }}
                transition={{
                  duration: 1.8 + (i % 5) * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.04,
                }}
                style={{ height: `${low}%` }}
              />
            );
          })}
        </motion.div>
      </motion.section>

      {/* Presets Preview */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {presets.map((preset, i) => (
            <motion.div
              key={preset.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 + 0.2 }}
              className="glass rounded-2xl p-6 gradient-border"
            >
              <div className="rounded-xl bg-accent-violet-muted p-3 w-fit mb-4">
                <preset.icon className="h-5 w-5 text-accent-violet" />
              </div>
              <h3 className="text-base font-display font-semibold text-text-primary mb-1">
                {preset.name}
              </h3>
              <p className="text-sm text-text-muted">{preset.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            The Best Online <span className="gradient-text">Audio Denoiser</span>
          </h2>
          <p className="mt-3 text-text-secondary max-w-lg mx-auto">
            Professional noise reduction and voice enhancement without the learning curve. Upload, clean, and download.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 + 0.1 }}
              className="glass rounded-2xl p-6 hover:bg-white/[0.06] transition-colors"
            >
              <div className="rounded-xl bg-accent-cyan/10 p-3 w-fit mb-4">
                <feature.icon className="h-5 w-5 text-accent-cyan" />
              </div>
              <h3 className="text-base font-display font-semibold text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-10"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
            Ready to remove background noise?
          </h2>
          <p className="text-text-secondary mb-6">
            Free to start. No credit card required. Clean your audio in seconds.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-subtle py-8 px-6 text-center">
        <p className="text-xs text-text-muted">
          &copy; {new Date().getFullYear()} WazzAudio. Built for creators.
        </p>
      </footer>
    </div>
  );
}
