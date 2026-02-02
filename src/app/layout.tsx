import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://wazzaudio.com";
const APP_NAME = "WazzAudio";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default:
      "WazzAudio — Remove Background Noise from Audio Online | AI Audio Denoiser",
    template: "%s | WazzAudio",
  },
  description:
    "Remove background noise from audio and video online with AI. Free audio denoiser for podcasters, vloggers, and content creators. Clean audio, reduce noise, and enhance voice clarity in seconds.",
  keywords: [
    "remove background noise",
    "audio denoiser",
    "noise reduction",
    "clean audio",
    "background noise remover",
    "AI noise removal",
    "audio cleaner",
    "remove noise from audio",
    "podcast noise removal",
    "voice enhancer",
    "audio enhancer",
    "remove background noise from video",
    "noise cancellation",
    "audio noise reduction online",
    "free noise removal tool",
    "studio quality audio",
    "wind noise removal",
    "remove static from audio",
    "voice cleaner",
    "sound cleaner",
  ],
  applicationName: APP_NAME,
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: APP_NAME,
    title:
      "WazzAudio — Remove Background Noise from Audio Online | AI Audio Denoiser",
    description:
      "Remove background noise from audio and video with AI. Free online audio denoiser for podcasters, vloggers, and content creators. Studio-quality results in seconds.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WazzAudio — AI-Powered Audio Noise Removal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WazzAudio — Remove Background Noise from Audio Online",
    description:
      "AI-powered audio denoiser. Remove noise, enhance voice clarity, clean up podcasts and vlogs in seconds. Free to start.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: APP_URL,
  },
  category: "Technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: APP_NAME,
  url: APP_URL,
  description:
    "AI-powered audio denoiser that removes background noise from audio and video files. Built for podcasters, vloggers, and content creators.",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free tier with limited monthly processing",
  },
  featureList: [
    "AI-powered background noise removal",
    "Voice clarity enhancement",
    "Podcast audio cleanup",
    "Wind and traffic noise reduction",
    "Static and hum elimination",
    "Multiple audio format support",
    "Real-time waveform preview",
    "Batch audio processing",
  ],
  screenshot: `${APP_URL}/og-image.png`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${bricolage.variable} antialiased bg-bg-primary text-text-primary`}
      >
        {children}
      </body>
    </html>
  );
}
