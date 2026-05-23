"use client";
import { useState } from "react";
import { Zap, BarChart2, History } from "lucide-react";
import SwapBox from "@/components/swap/SwapBox";
import TxHistory from "@/components/history/TxHistory";
import WalletConnect from "@/components/wallet/WalletConnect";
import SwapAdvisor from "@/components/ai/SwapAdvisor";
export default function Home() {
  const [wallet, setWallet] = useState<string>("");
  const [view, setView] = useState<"swap" | "history">("swap");
  const [swapCount, setSwapCount] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [swaps, setSwaps] = useState<any[]>([]);
  const [advisorTrigger, setAdvisorTrigger] = useState(0); 
  return (
    <main className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="glass rounded-2xl px-6 py-4 flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">NexSwap</h1>
              <p className="text-xs text-slate-500">Powered by Shelby Protocol</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <nav className="flex gap-1">
              <button
                onClick={() => setView("swap")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  view === "swap"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Zap className="w-3 h-3 inline mr-1" />
                Swap
              </button>
              <button
                onClick={() => setView("history")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  view === "history"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <History className="w-3 h-3 inline mr-1" />
                History
              </button>
            </nav>
            <WalletConnect onWalletChange={setWallet} />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Volume", value: `$${totalVolume.toFixed(2)}`, icon: "📊" },
            { label: "Total Swaps", value: `${swapCount}`, icon: "🔄" },
            { label: "Network", value: "Aptos", icon: "⚡" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 w-full">
            {view === "swap" ? (
              <SwapBox wallet={wallet} onSwapSuccess={(count, volume, swap) => { 
             setSwapCount(count); 
             setTotalVolume(volume);
             setSwaps(prev => [swap, ...prev]);
             setAdvisorTrigger(prev => prev + 1);
            }} />
            ) : (
              <TxHistory wallet={wallet} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <SwapAdvisor wallet={wallet} swaps={swaps} trigger={advisorTrigger} />
            
            {/* Shelby Info */}
            <div className="glass rounded-2xl p-4">
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-400" />
                Shelby Storage
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Network</span>
                  <span className="text-white">Shelbynet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Storage Type</span>
                  <span className="text-emerald-400">Hot Storage</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Retrieval</span>
                  <span className="text-white">~50ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verified</span>
                  <span className="text-emerald-400">On-Chain ✓</span>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="glass rounded-2xl p-4">
              <h3 className="font-bold text-white mb-3">How It Works</h3>
              <div className="space-y-3">
                {[
                  { step: "1", text: "Connect your Petra wallet" },
                  { step: "2", text: "Select tokens and amount" },
                  { step: "3", text: "Confirm the swap" },
                  { step: "4", text: "Transaction saved on Shelby" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <p className="text-sm text-slate-400">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-600">
          NexSwap — Every swap saved on Shelby Protocol • Aptos Testnet
        </div>
      </div>
    </main>
  );
}