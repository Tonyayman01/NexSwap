"use client";
import { useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpDown,
  BarChart2,
  CircleDollarSign,
  Database,
  History,
  Network,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import SwapBox from "@/components/swap/SwapBox";
import TxHistory from "@/components/history/TxHistory";
import WalletConnect from "@/components/wallet/WalletConnect";
import SwapAdvisor from "@/components/ai/SwapAdvisor";

interface SwapPayload {
  wallet: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  slippage: string;
  priceImpact: string;
  fee: string;
  timestamp: number;
  network: string;
  storage: string;
}

export default function Home() {
  const [wallet, setWallet] = useState<string>("");
  const [view, setView] = useState<"swap" | "history">("swap");
  const [swapCount, setSwapCount] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [swaps, setSwaps] = useState<SwapPayload[]>([]);
  const [advisorTrigger, setAdvisorTrigger] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const rise = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    visible: { opacity: 1, y: 0 },
  };
  const stats = [
    {
      label: "Total Volume",
      value: `$${totalVolume.toFixed(2)}`,
      icon: CircleDollarSign,
      tone: "text-emerald-300",
    },
    {
      label: "Total Swaps",
      value: `${swapCount}`,
      icon: ArrowUpDown,
      tone: "text-pink-300",
    },
    {
      label: "Network",
      value: "Aptos",
      icon: Network,
      tone: "text-amber-300",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={rise}
          transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: "easeOut" }}
          className="mb-6 flex flex-col gap-4 rounded-[1.5rem] border border-pink-300/20 bg-slate-950/50 p-4 shadow-2xl shadow-fuchsia-950/20 backdrop-blur-xl sm:p-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex min-w-0 items-center gap-4">
            <motion.div
              animate={shouldReduceMotion ? undefined : { rotate: [0, -4, 4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="shelby-ring flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-pink-300/25 bg-pink-300/10 shadow-lg shadow-fuchsia-950/40"
            >
              <Zap className="h-6 w-6 text-pink-200" />
            </motion.div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="shelby-glow-text text-2xl font-black sm:text-3xl">
                  NexSwap
                </h1>
                <span className="rounded-full border border-pink-300/25 bg-pink-300/10 px-2.5 py-1 text-xs font-semibold text-pink-100">
                  Shelby powered
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                Token swaps with every successful record written to Shelby hot
                storage.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <LayoutGroup>
              <nav className="grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
                {[
                  { id: "swap" as const, label: "Swap", icon: Zap },
                  { id: "history" as const, label: "History", icon: History },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = view === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setView(tab.id)}
                      className={`relative flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                        active ? "text-slate-950" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="active-tab"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-300 via-violet-300 to-amber-200 shadow-lg shadow-fuchsia-950/30"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        />
                      )}
                      <Icon className="relative h-4 w-4" />
                      <span className="relative">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </LayoutGroup>
            <WalletConnect onWalletChange={setWallet} />
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: shouldReduceMotion ? 0 : 0.08 }}
          className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={rise}
                whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.01 }}
                className="glass flex items-center gap-3 rounded-2xl p-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                  <Icon className={`h-5 w-5 ${stat.tone}`} />
                </div>
                <div>
                  <p className="text-xl font-black text-white">{stat.value}</p>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={rise}
          transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: 0.12 }}
          className="mb-6 grid gap-3 lg:grid-cols-3"
        >
          <div className="glass rounded-2xl border-pink-300/15 p-4 lg:col-span-2">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 h-5 w-5 flex-shrink-0 text-amber-300" />
              <div>
                <p className="font-semibold text-white">
                  Frontend ready. Storage needs funded server account.
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Petra wallet connects the user identity. Shelby writes use the
                  server account from `.env.local`.
                </p>
              </div>
            </div>
          </div>
          <div className="glass flex items-center gap-3 rounded-2xl p-4">
            <ShieldCheck className="h-6 w-6 text-pink-200" />
            <div>
              <p className="font-bold text-white">Verified path</p>
              <p className="text-sm text-slate-400">SDK upload + explorer link</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 w-full">
            {view === "swap" ? (
              <SwapBox
                wallet={wallet}
                onSwapSuccess={(count, volume, swap) => {
                  setSwapCount(count);
                  setTotalVolume(volume);
                  setSwaps((prev) => [swap, ...prev]);
                  setAdvisorTrigger((prev) => prev + 1);
                }}
              />
            ) : (
              <TxHistory wallet={wallet} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <SwapAdvisor wallet={wallet} swaps={swaps} trigger={advisorTrigger} />
            
            {/* Shelby Info */}
            <div className="glass rounded-2xl p-5">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
                <Database className="h-4 w-4 text-pink-300" />
                Shelby Storage
              </h3>
              <div className="space-y-3 text-sm">
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
                  <span className="text-emerald-300">On-chain</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
                <BarChart2 className="h-4 w-4 text-amber-300" />
                Flow
              </h3>
              <div className="space-y-3">
                {[
                  { step: "1", text: "Connect your Petra wallet" },
                  { step: "2", text: "Select tokens and amount" },
                  { step: "3", text: "Confirm the swap" },
                  { step: "4", text: "Transaction saved on Shelby" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-pink-300/20 bg-pink-300/10 text-xs font-bold text-pink-100">
                      {item.step}
                    </div>
                    <p className="text-sm text-slate-400">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-600">
          NexSwap | Shelby Protocol storage layer | Aptos Testnet
        </div>
      </div>
    </main>
  );
}
