import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "OpenAI Learning Platform - Master AI Technologies and Applications",
  description: "Professional OpenAI training with real-time analytics, individual progress tracking, and certification. Learn about GPT, ChatGPT, DALL-E and more.",
  keywords: "OpenAI, GPT, ChatGPT, DALL-E, AI training, artificial intelligence, machine learning, AI education, language models",
  authors: [{ name: "Learning Platform Team" }],
  creator: "Interactive Learning Platform",
  publisher: "OpenAI Training Center",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/images/icons/co-pilot-1.0.png", sizes: "32x32", type: "image/png" },
      { url: "/images/icons/co-pilot-1.0.png", sizes: "16x16", type: "image/png" },
      { url: "/images/icons/co-pilot-1.0.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/images/icons/co-pilot-1.0.png",
    apple: [
      { url: "/images/icons/co-pilot-1.0.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-domain.com",
    siteName: "OpenAI Learning Platform",
    title: "OpenAI Learning Platform - Master AI Technologies and Applications",
    description: "Professional OpenAI training with real-time analytics, individual progress tracking, and certification. Learn about GPT, ChatGPT, DALL-E and more.",
    images: [
      {
        url: "/images/og/co-pilot-1.0.png",
        width: 1200,
        height: 630,
        alt: "OpenAI Learning Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenAI Learning Platform - Master AI Technologies and Applications",
    description: "Professional OpenAI training with real-time analytics and certification",
    images: ["/images/og/co-pilot-1.0.png"],
    creator: "@yourtwitterhandle",
  },
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
  other: {
    "theme-color": "#3b82f6",
    "msapplication-TileColor": "#3b82f6",
    "msapplication-TileImage": "/images/icons/co-pilot-1.0.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
