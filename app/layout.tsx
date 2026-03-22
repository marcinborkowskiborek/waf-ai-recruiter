import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AI Recruiter Demo | WeAreFuture",
  description:
    "Zobacz jak AI może wspierać Twój zespół HR w wyszukiwaniu kandydatów.",
  openGraph: {
    title: "AI Recruiter Demo | WeAreFuture",
    description: "Wpisz rolę — AI znajdzie kandydatów w kilkadziesiąt sekund.",
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
