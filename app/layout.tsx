import type { Metadata } from "next";

import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatButton from "@/components/ChatButton";

export const metadata: Metadata = {
  title: "TrekMate",
  description: "TrekMate Japan — Get real-time travel advice for trekking and sightseeing in Japan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="relative overflow-hidden">
          {children}
        </main>

        <Footer />
        <ChatButton />
      </body>
    </html>
  );
}
