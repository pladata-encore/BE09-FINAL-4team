import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { NotificationToastManager } from "@/components/ui/notification-toast";
import GlobalAIChat from "./aichat/GlobalAIChat";
import { QueryProvider } from "@/providers/query-provider";

export const metadata: Metadata = {
  title: "Hermes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <QueryProvider>
          <AuthProvider>
            <NotificationProvider>
              {children}
              <NotificationToastManager />
            </NotificationProvider>
          </AuthProvider>
        </QueryProvider>

        <Toaster position="top-center" richColors closeButton duration={4000} />
      </body>
    </html>
  );
}