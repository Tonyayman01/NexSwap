"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpDown,
  Settings,
  Zap,
  CheckCircle,
  Loader2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

const TOKENS = [
  { symbol: "APT", name: "Aptos", color: "from-pink-300 to-violet-300", price: 8.5 },
  { symbol: "USDC", name: "USD Coin", color: "from-violet-300 to-amber-200", price: 1.0 },
  { symbol: "USDT", name: "Tether", color: "from-emerald-300 to-pink-300", price: 1.0 },
  { symbol: "WETH", name: "Wrapped ETH", color: "from-violet-300 to-fuchsia-300", price: 3200 },
  { symbol: "BTC", name: "Bitcoin", color: "from-amber-300 to-orange-400", price: 65000 },
];

interface SwapBoxProps {
  wallet: string;
  onSwapSuccess?: (count: number, volume: number, swap: SwapPayload) => void;
}

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

interface SwapResult {
  success: boolean;
  blobName?: string;
  explorerUrl?: string;
  error?: string;
}

export default function SwapBox({ wallet, onSwapSuccess }: SwapBoxProps) {
  const shouldReduceMotion = useReducedMotion();
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [lastSwapJson, setLastSwapJson] = useState<SwapPayload | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapResult, setSwapResult] = useState<SwapResult | null>(null);
  const [slippage, setSlippage] = useState("0.5");
  const [showSettings, setShowSettings] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"from" | "to" | null>(
    null
  );
  const [swapCount, setSwapCount] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);

  const toAmount = fromAmount
    ? ((parseFloat(fromAmount) * fromToken.price) / toToken.price).toFixed(6)
    : "";

  const priceImpact = useMemo(() => {
    if (!fromAmount) return "0.00";
    const seed = `${fromAmount}-${fromToken.symbol}-${toToken.symbol}`;
    const hash = Array.from(seed).reduce(
      (total, char) => total + char.charCodeAt(0),
      0
    );

    return (((hash % 30) + 1) / 100).toFixed(2);
  }, [fromAmount, fromToken.symbol, toToken.symbol]);

  const fee = fromAmount ? (parseFloat(fromAmount) * 0.003).toFixed(6) : "0.00";

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
  };

  const handleSwap = async () => {
    if (!fromAmount || !wallet) return;

    setIsSwapping(true);
    setSwapResult(null);
    setShowJson(false);

    const swapJson = {
      wallet,
      fromToken: fromToken.symbol,
      toToken: toToken.symbol,
      fromAmount,
      toAmount,
      slippage,
      priceImpact,
      fee,
      timestamp: Date.now(),
      network: "shelbynet",
      storage: "Shelby Hot Storage",
    };

    setLastSwapJson(swapJson);

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 50_000);
      const response = await fetch("/api/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(swapJson),
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      const data = await response.json();
      setSwapResult(data);

      if (response.ok && data.success) {
        const newCount = swapCount + 1;
        const newVolume = totalVolume + parseFloat(fromAmount) * fromToken.price;

        setSwapCount(newCount);
        setTotalVolume(newVolume);

        if (onSwapSuccess) {
          onSwapSuccess(newCount, newVolume, swapJson);
        }

        setFromAmount("");
      }
    } catch (error) {
      setSwapResult({
        success: false,
        error:
          error instanceof DOMException && error.name === "AbortError"
            ? "Shelby upload timed out. Check SHELBY_ACCOUNT_ADDRESS balance and try again."
            : "Could not reach the swap API.",
      });
    }

    setIsSwapping(false);
  };

  const renderTokenButton = (type: "from" | "to") => {
    const token = type === "from" ? fromToken : toToken;
    const isOpen = activeDropdown === type;
    const otherToken = type === "from" ? toToken : fromToken;

    return (
      <>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveDropdown(isOpen ? null : type);
          }}
          className="flex min-h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 font-semibold text-white transition hover:bg-white/20"
        >
          <span
            className={`h-5 w-5 rounded-full bg-gradient-to-br ${token.color} shadow-sm`}
          />
          <span>{token.symbol}</span>
          <ChevronDown
            className={`h-3 w-3 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 99999 }}
            onClick={() => setActiveDropdown(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-72 rounded-2xl border border-white/10 p-4"
              style={{
                background: "#101622",
                boxShadow: "0 25px 70px rgba(0,0,0,0.85)",
              }}
            >
              <p className="mb-3 text-sm font-bold text-white">Select Token</p>

              {TOKENS.filter((t) => t.symbol !== otherToken.symbol).map(
                (token) => (
                  <button
                    key={token.symbol}
                    onClick={() => {
                      if (type === "from") setFromToken(token);
                      else setToToken(token);
                      setActiveDropdown(null);
                    }}
                    className="mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-white transition hover:bg-white/10"
                  >
                    <span
                      className={`h-9 w-9 rounded-full bg-gradient-to-br ${token.color}`}
                    />
                    <div>
                      <p className="font-medium">{token.symbol}</p>
                      <p className="text-xs text-slate-400">{token.name}</p>
                    </div>
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="w-full">
      <div className="glass glow-blue shelby-panel rounded-2xl p-5 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white">Swap Console</h2>
            <p className="mt-1 text-sm text-slate-500">
              Quote tokens and persist the record to Shelby.
            </p>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Swap settings"
            className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {showSettings && (
          <div className="mb-4 rounded-xl border border-pink-300/15 bg-pink-300/[0.04] p-3">
            <p className="mb-2 text-xs text-slate-400">Slippage Tolerance</p>

            <div className="flex gap-2">
              {["0.1", "0.5", "1.0"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSlippage(s)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                    slippage === s
                      ? "bg-pink-300 text-slate-950"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {s}%
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="swap-input mb-2 overflow-hidden p-4 sm:p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">From</span>
            <span className="text-xs text-slate-400">Balance: 0.00</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-3xl font-black text-white outline-none placeholder-slate-600"
            />

            {renderTokenButton("from")}
          </div>

          {fromAmount && (
            <p className="mt-1 text-xs text-slate-500">
              ≈ ${(parseFloat(fromAmount) * fromToken.price).toFixed(2)}
            </p>
          )}
        </div>

        <div className="my-2 flex justify-center">
          <button
            onClick={handleSwapTokens}
            aria-label="Invert token pair"
            className="glass rounded-xl p-3 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>

        <div className="swap-input mb-4 overflow-hidden p-4 sm:p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">To</span>
            <span className="text-xs text-slate-400">Balance: 0.00</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="0.0"
              value={toAmount}
              readOnly
              className="min-w-0 flex-1 bg-transparent text-3xl font-black text-white outline-none placeholder-slate-600"
            />

            {renderTokenButton("to")}
          </div>

          {toAmount && (
            <p className="mt-1 text-xs text-slate-500">
              ≈ ${parseFloat(toAmount).toFixed(2)}
            </p>
          )}
        </div>

        {fromAmount && (
          <div className="mb-4 space-y-2 rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Rate</span>
              <span className="text-white">
                1 {fromToken.symbol} ={" "}
                {(fromToken.price / toToken.price).toFixed(4)} {toToken.symbol}
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Price Impact</span>
              <span className="text-emerald-400">{priceImpact}%</span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Fee 0.3%</span>
              <span className="text-white">
                {fee} {fromToken.symbol}
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Slippage</span>
              <span className="text-white">{slippage}%</span>
            </div>
          </div>
        )}

        <motion.button
          onClick={handleSwap}
          disabled={!fromAmount || !wallet || isSwapping}
          whileHover={
            !shouldReduceMotion && fromAmount && wallet && !isSwapping
              ? { scale: 1.01, y: -2 }
              : undefined
          }
          whileTap={!shouldReduceMotion ? { scale: 0.98 } : undefined}
          className="btn-primary flex min-h-14 w-full items-center justify-center gap-2 px-4 py-4 text-white"
        >
          {isSwapping ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Swapping...
            </>
          ) : !wallet ? (
            "Connect Wallet"
          ) : !fromAmount ? (
            "Enter Amount"
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Swap {fromToken.symbol} to {toToken.symbol}
            </>
          )}
        </motion.button>

        {swapResult && (
          <div
            className={`mt-4 rounded-xl border p-3 ${
              swapResult.success
                ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
                : "border-red-300/20 bg-red-400/10 text-red-200"
            }`}
          >
            {swapResult.success ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Swap Successful! Stored on Shelby
                </div>

                {swapResult.blobName && (
                  <p className="break-all text-xs opacity-70">
                    {swapResult.blobName}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {swapResult.explorerUrl && (
                    <a
                      href={swapResult.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1 text-xs transition hover:bg-white/20"
                    >
                      View on Shelby <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {lastSwapJson && (
                    <button
                      onClick={() => setShowJson(!showJson)}
                      className="rounded-lg bg-white/10 px-3 py-1 text-xs transition hover:bg-white/20"
                    >
                      {showJson ? "Hide Raw JSON" : "View Raw JSON"}
                    </button>
                  )}
                </div>

                {showJson && lastSwapJson && (
                  <pre className="mt-3 max-h-64 overflow-auto rounded-lg border border-emerald-400/20 bg-black/40 p-3 text-xs text-green-300">
                    {JSON.stringify(lastSwapJson, null, 2)}
                  </pre>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium">Shelby storage failed.</p>
                {swapResult.error && (
                  <p className="break-words text-xs opacity-80">
                    {swapResult.error}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
