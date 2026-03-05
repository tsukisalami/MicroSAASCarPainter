import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuotePaint — Professional Paint Job Quotes",
  description:
    "Create professional auto body paint quotes in under 2 minutes. Built for independent shops.",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    title: "QuotePaint — Professional Paint Job Quotes",
    description:
      "Create professional auto body paint quotes in under 2 minutes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
