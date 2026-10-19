import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, JetBrains_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { I18nProvider } from "@/lib/i18n";
import { AppStateProvider } from "@/lib/state/provider";
import "./globals.css";

const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic", "latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AI Learning OS",
    template: "%s | AI Learning OS",
  },
  description:
    "نظام شخصي لتتبع مسار تعلم هندسة الذكاء الاصطناعي — 37 أسبوعًا من الأساسيات حتى المشروع المتكامل.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      data-theme="dark"
      className={`${arabic.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AppStateProvider>
          <I18nProvider>
            <AppShell>{children}</AppShell>
          </I18nProvider>
        </AppStateProvider>
      </body>
    </html>
  );
}
