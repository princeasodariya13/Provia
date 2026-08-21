import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { SmoothScroll } from "@/components/layout/smooth-scroll";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Provia — Professional Portfolio Generation Platform",
  description:
    "Create stunning professional portfolios from your existing online profiles and resume. AI-powered identity platform for ambitious professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-text-primary">
        <SmoothScroll>
          <AuthProvider>{children}</AuthProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
