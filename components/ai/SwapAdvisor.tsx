"use client";
import { useState, useEffect } from "react";
import { Brain, Sparkles, Loader2, TrendingUp } from "lucide-react";

interface SwapAdvisorProps {
  wallet: string;
  swaps: any[];
  trigger: number;
}

export default function SwapAdvisor({ wallet, swaps, trigger }: SwapAdvisorProps) {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wallet && trigger > 0) {
      setTimeout(() => getAnalysis(), 500);
    }
  }, [trigger, swaps]);

    const getAnalysis = async () => {
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
    } catch (error) {
      setAnalysis("Keep swapping to get AI insights!");
    }
    setLoading(false);
  };

  if (!wallet) return null;

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="font-bold text-white mb-3 flex items-center gap-2">
        <Brain className="w-4 h-4 text-violet-400" />
        AI Swap Advisor
        <Sparkles className="w-3 h-3 text-yellow-400" />
      </h3>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-4 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing your swaps...
        </div>
      ) : analysis ? (
        <div className="space-y-2">
          {analysis.split("\n").filter(Boolean).map((line, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <TrendingUp className="w-3 h-3 text-violet-400 mt-0.5 flex-shrink-0" />
              <p className="text-slate-300">{line}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-slate-500 text-sm">Make a swap to get AI insights!</p>
        </div>
      )}

      {!loading && wallet && (
        <button
          onClick={getAnalysis}
          className="mt-3 w-full py-2 rounded-xl bg-violet-500/20 text-violet-400 text-xs hover:bg-violet-500/30 transition"
        >
          Refresh Analysis
        </button>
      )}
    </div>
  );
}