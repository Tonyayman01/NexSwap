import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import WalletProvider from "@/components/wallet/WalletProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexSwap — Decentralized Swap on Aptos",
  description: "Swap tokens on Aptos with every transaction saved on Shelby Protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#080b14] text-slate-100 antialiased`}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}