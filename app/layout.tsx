import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { LoaderProvider } from "@/components/ui/LoaderContext";
import ClientLayout from "./client-layout"; // Import Client Layout

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "MediNexus",
  description: "Healthcare for the future",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-[linear-gradient(to_right,#042F2E,#012621,#002A1C)] font-sans antialiased  remove-scrollbar", 
          fontSans.variable
        )}
      >
        <LoaderProvider>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <ClientLayout>{children}</ClientLayout>
          </ThemeProvider>
        </LoaderProvider>
      </body>
    </html>
  );
}
