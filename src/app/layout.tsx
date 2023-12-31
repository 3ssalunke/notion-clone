import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/providers/next-theme-provider";
import { DM_Sans } from "next/font/google";
import { twMerge } from "tailwind-merge";
import AppStateProvider from "@/lib/providers/state-provider";
import { Toaster } from "@/components/ui/toaster";
import "@/lib/supabase/db";
import { SupabaseUserContextProvider } from "@/lib/providers/supabase-user-provider";
import { SocketProvider } from "@/lib/providers/socket-provider";

const dmsans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={twMerge("bg-background", dmsans.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppStateProvider>
            <SupabaseUserContextProvider>
              <SocketProvider>{children}</SocketProvider>
              <Toaster />
            </SupabaseUserContextProvider>
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
