import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { Toaster } from "sonner";  // <-- Import directly from sonner

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadata = {
  title: "PhishGuard Inbox Scan",
  description: "Advanced phishing email detection powered by AI and threat intelligence.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <SessionProviderWrapper>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
          <Toaster richColors position="top-right" /> {/* Use Sonner's Toaster with richColors */}
        </body>
      </SessionProviderWrapper>
    </html>
  );
}
