"use client";

import { useState } from "react";
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
  { symbol: "APT", name: "Aptos", icon: "🔵", price: 8.5 },
  { symbol: "USDC", name: "USD Coin", icon: "🔵", price: 1.0 },
  { symbol: "USDT", name: "Tether", icon: "🔵", price: 1.0 },
  { symbol: "WETH", name: "Wrapped ETH", icon: "🔵", price: 3200 },
  { symbol: "BTC", name: "Bitcoin", icon: "🔵", price: 65000 },
];

interface SwapBoxProps {
  wallet: string;
  onSwapSuccess?: (count: number, volume: number, swap: any) => void;
}

interface SwapResult {
  success: boolean;
  blobName?: string;
  explorerUrl?: string;
}

export default function SwapBox({ wallet, onSwapSuccess }: SwapBoxProps) {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [lastSwapJson, setLastSwapJson] = useState<any>(null);
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

  const priceImpact = fromAmount ? (Math.random() * 0.3).toFixed(2) : "0.00";
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
      const response = await fetch("/api/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(swapJson),
      });

      const data = await response.json();
      setSwapResult(data);

      if (data.success) {
        const newCount = swapCount + 1;
        const newVolume = totalVolume + parseFloat(fromAmount) * fromToken.price;

        setSwapCount(newCount);
        setTotalVolume(newVolume);

        if (onSwapSuccess) {
          onSwapSuccess(newCount, newVolume, swapJson);
        }
      }

      setFromAmount("");
    } catch {
      setSwapResult({ success: false });
    }

    setIsSwapping(false);
  };

  const TokenButton = ({ type }: { type: "from" | "to" }) => {
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
          className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 font-medium text-white transition hover:bg-white/20"
        >
          <span className="text-xs font-bold">{token.icon}</span>
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
              className="w-64 rounded-2xl border border-white/10 p-4"
              style={{
                background: "#0d1220",
                boxShadow: "0 25px 50px rgba(0,0,0,0.9)",
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
                    <span className="w-10 text-center text-xs font-bold">
                      {token.icon}
                    </span>
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
      <div className="glass glow-blue rounded-2xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Swap</h2>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {showSettings && (
          <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="mb-2 text-xs text-slate-400">Slippage Tolerance</p>

            <div className="flex gap-2">
              {["0.1", "0.5", "1.0"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSlippage(s)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                    slippage === s
                      ? "bg-blue-500 text-white"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {s}%
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="swap-input mb-2 overflow-hidden p-4">
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
              className="flex-1 bg-transparent text-2xl font-bold text-white outline-none placeholder-slate-600"
            />

            <TokenButton type="from" />
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
            className="glass rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>

        <div className="swap-input mb-4 overflow-hidden p-4">
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
              className="flex-1 bg-transparent text-2xl font-bold text-white outline-none placeholder-slate-600"
            />

            <TokenButton type="to" />
          </div>

          {toAmount && (
            <p className="mt-1 text-xs text-slate-500">
              ≈ ${parseFloat(toAmount).toFixed(2)}
            </p>
          )}
        </div>

        {fromAmount && (
          <div className="mb-4 space-y-1 rounded-xl bg-white/5 p-3">
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

        <button
          onClick={handleSwap}
          disabled={!fromAmount || !wallet || isSwapping}
          className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-white"
        >
          {isSwapping ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Swapping...
            </>
          ) : !wallet ? (
            "Connect Wallet to Swap"
          ) : !fromAmount ? (
            "Enter Amount"
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Swap {fromToken.symbol} → {toToken.symbol}
            </>
          )}
        </button>

        {swapResult && (
          <div
            className={`mt-4 rounded-xl border p-3 ${
              swapResult.success
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {swapResult.success ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Swap Successful! Saved on Shelby
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
              <p className="text-sm">Swap failed. Please try again.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}