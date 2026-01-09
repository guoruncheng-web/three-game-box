import type { Metadata, Viewport } from "next";
import { Nunito, Quicksand } from "next/font/google";
import { ClientInit } from "@/components/ClientInit";
import { ReduxProvider } from "@/components/providers";
import { ToastProvider } from "@/components/toast";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { IOSInstallBanner } from "@/components/IOSInstallBanner";
import { PWATestButton } from "@/components/PWATestButton";
import "./globals.css";

// 显示字体
const nunito = Nunito({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

// 正文字体
const quicksand = Quicksand({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Three Game Box",
    template: "%s | Three Game Box",
  },
  description: "🎮 休闲游戏盒子 - 精选小游戏合集",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GameBox",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Three Game Box",
    title: "Three Game Box",
    description: "🎮 休闲游戏盒子 - 精选小游戏合集",
  },
};

export const viewport: Viewport = {
  themeColor: "#667eea",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${nunito.variable} ${quicksand.variable} font-body antialiased bg-bg-primary text-text-primary`}
      >
        <ClientInit>
          <ReduxProvider>
            <ToastProvider>
              <IOSInstallBanner />
              {children}
              <PWAInstallPrompt />
              <PWATestButton />
            </ToastProvider>
          </ReduxProvider>
        </ClientInit>
      </body>
    </html>
  );
}
