import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { ToastProvider } from "@/components/ui/toast";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://provia-developer.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Provia — Professional Portfolio Generation Platform",
    template: "%s | Provia",
  },
  description:
    "Create stunning professional portfolios from your existing online profiles and resume. AI-powered identity platform for ambitious professionals.",
  keywords: [
    "portfolio generator",
    "professional portfolio",
    "AI portfolio builder",
    "resume to website",
    "developer portfolio",
    "executive identity",
    "digital footprint",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Provia — Professional Portfolio Generation Platform",
    description:
      "Create stunning professional portfolios from your existing online profiles and resume. AI-powered identity platform for ambitious professionals.",
    url: "/",
    siteName: "Provia",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/dashboard-mockup.png",
        width: 1200,
        height: 630,
        alt: "Provia Professional Portfolio Generation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Provia — Professional Portfolio Generation Platform",
    description:
      "Create stunning professional portfolios from your existing online profiles and resume. AI-powered identity platform for ambitious professionals.",
    images: ["/dashboard-mockup.png"],
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
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  verification: {
    google: "jL2-mH0VIO0U4cOAVCRPIteZ1fjXh2YXo43r-kQ5NNg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-text-primary">
        <SmoothScroll>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </SmoothScroll>
        <Analytics />
      </body>
    </html>
  );
}
