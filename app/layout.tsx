import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AI Recruiter | WeAreFuture — Znajdź kandydatów w 60 sekund",
  description:
    "Bez LinkedIn Recruitera. Bez subskrypcji. Wklej opis stanowiska — resztę zrobi AI.",
  openGraph: {
    title: "AI Recruiter | WeAreFuture — Znajdź kandydatów w 60 sekund",
    description: "Bez LinkedIn Recruitera. Bez subskrypcji. Wklej opis stanowiska — resztę zrobi AI.",
    siteName: "WeAreFuture",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${roboto.variable} dark`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
