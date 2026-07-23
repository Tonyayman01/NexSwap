"use client";
import { useCallback, useEffect, useState } from "react";
import { History, ExternalLink, RefreshCw } from "lucide-react";

interface Transaction {
  id: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  timestamp: number;
  blobName: string;
  explorerUrl: string;
  wallet: string;
}

interface TxHistoryProps {
  wallet: string;
}

export default function TxHistory({ wallet }: TxHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/swap?wallet=${wallet}`);
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch {
      console.error("Failed to fetch history");
    }
    setLoading(false);
  }, [wallet]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => fetchHistory(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchHistory]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!wallet) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <History className="mx-auto mb-3 h-9 w-9 text-pink-300/60" />
        <p className="text-sm text-slate-400">Connect wallet to see history</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold text-white">
          <History className="h-4 w-4 text-pink-300" />
          Swap History
        </h3>
        <button
          onClick={fetchHistory}
          disabled={loading}
          aria-label="Refresh history"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] py-10 text-center">
          <p className="text-sm text-slate-400">No swaps yet</p>
          <p className="mt-1 text-xs text-slate-600">Successful Shelby records will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-pink-300/20"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-white">
                    {tx.fromAmount} {tx.fromToken} → {tx.toAmount} {tx.toToken}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatTime(tx.timestamp)}
                  </p>
                </div>
                <a
                  href={tx.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-2 text-pink-300 transition hover:bg-white/10 hover:text-pink-200"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-600 mt-1 truncate">{tx.blobName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
