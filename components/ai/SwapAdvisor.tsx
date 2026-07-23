"use client";
import { useCallback, useEffect, useState } from "react";
import { Brain, Sparkles, Loader2, TrendingUp } from "lucide-react";

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

interface SwapAdvisorProps {
  wallet: string;
  swaps: SwapPayload[];
  trigger: number;
}

export default function SwapAdvisor({ wallet, swaps, trigger }: SwapAdvisorProps) {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const getAnalysis = useCallback(async () => {
    if (!wallet) return;
    console.log("Swaps being sent to AI:", JSON.stringify(swaps));
    setLoading(true);
    try {
      const response = await fetch("/api/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ swaps, wallet }),
      });
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch {
      setAnalysis("Keep swapping to get AI insights!");
    }
    setLoading(false);
  }, [swaps, wallet]);

  useEffect(() => {
    if (wallet && trigger > 0) {
      const timeoutId = window.setTimeout(() => getAnalysis(), 500);
      return () => window.clearTimeout(timeoutId);
    }
  }, [getAnalysis, trigger, wallet]);

  if (!wallet) return null;

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
        <Brain className="h-4 w-4 text-violet-300" />
        AI Swap Advisor
        <Sparkles className="h-3 w-3 text-amber-300" />
      </h3>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-5 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing your swaps...
        </div>
      ) : analysis ? (
        <div className="space-y-2">
          {analysis.split("\n").filter(Boolean).map((line, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <TrendingUp className="mt-0.5 h-3 w-3 flex-shrink-0 text-violet-300" />
              <p className="text-slate-300">{line}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-5 text-center">
          <p className="text-sm text-slate-400">Make a swap to get AI insights.</p>
        </div>
      )}

      {!loading && wallet && (
        <button
          onClick={getAnalysis}
          className="mt-4 min-h-11 w-full rounded-xl border border-violet-300/20 bg-violet-300/10 px-4 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-300/15"
        >
          Refresh Analysis
        </button>
      )}
    </div>
  );
}
