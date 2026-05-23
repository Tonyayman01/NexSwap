"use client";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Wallet, LogOut, Copy, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface WalletConnectProps {
  onWalletChange: (address: string) => void;
}

export default function WalletConnect({ onWalletChange }: WalletConnectProps) {
  const { connect, disconnect, account, connected, wallets } = useWallet();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (account?.address) {
      onWalletChange(account.address.toString());
    } else {
      onWalletChange("");
    }
  }, [account]);

  const handleConnect = async () => {
    try {
      if (wallets && wallets.length > 0) {
        await connect(wallets[0].name);
      } else {
        window.open("https://petra.app", "_blank");
      }
    } catch (e: any) {
      console.error("Connect error:", e);
    }
  };

  const copyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shortAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (connected && account) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass text-emerald-400 text-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono">{shortAddress(account.address.toString())}</span>
          <button onClick={copyAddress} className="hover:text-white transition">
            {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        <button onClick={disconnect}
          className="p-2 rounded-xl glass text-red-400 hover:text-red-300 transition">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleConnect}
      className="btn-primary flex items-center gap-2 px-4 py-2 text-white text-sm">
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  );
}