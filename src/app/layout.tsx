import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import News from "./components/News";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Football Info",
  description: "Your ultimate hub for real-time football scores, standings, and top headlines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-textPrimary min-h-screen bg-[#121824]`}
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
          <Navbar />
          <section className="flex flex-col lg:flex-row gap-6 mt-6 items-start">
            <Sidebar />
            <div className="w-full lg:max-w-[600px] flex-grow flex justify-center">
              {children}
            </div>
            <News />
          </section>
        </main>
      </body>
    </html>
  );
}
