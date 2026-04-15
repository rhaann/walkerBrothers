/**
 * Root layout for the actual insight beverage inventory app.
 * Applies the Inter font, dark base theme, and wraps all pages.
 * All child layouts (dashboard, auth) extend from here.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "actual insight — Inventory Intelligence",
  description: "Live inventory analytics and AI assistant for beverage retail operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-brand-navy text-neutral-white antialiased">
        {children}
      </body>
    </html>
  );
}
