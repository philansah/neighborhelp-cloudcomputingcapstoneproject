import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "NeighborHelp – Neighborhood Skill & Service Exchange",
  description: "Community-driven platform connecting residents needing service assistance with skilled local neighbors and verified providers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${atkinson.variable} light h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8f9ff] text-[#121c28] font-body">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
