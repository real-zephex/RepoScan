import "./globals.css";
import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";

import Navbar from "@/components/ui/custom-ui/navbar";
import { RepoProvider } from "@/components/context/RepositoryContext";
import { ToastProvider } from "@/components/context/ToastContext";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "RepoScan",
  description:
    "Scan your repositories for vunlnerabilities and generate comprehensive reports.",
  openGraph: {
    title: "RepoScan",
    description:
      "Scan your repositories for vunlnerabilities and generate comprehensive reports.",
    url: "https://reposcan.vercel.app",
    siteName: "RepoScan",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "RepoScan Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RepoScan",
    description:
      "Scan your repositories for vunlnerabilities and generate comprehensive reports.",
    images: ["/logo.png"],
    creator: "@your_twitter_handle", // TODO: Replace with your Twitter handle
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceMono.className}  antialiased`}>
        <ToastProvider>
          <RepoProvider>
            <div className="flex flex-col items-center w-full">
              <Navbar />
              {children}
            </div>
          </RepoProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
