"use client";
import { useState, useEffect } from "react";
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

  const fetchHistory = async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/swap?wallet=${wallet}`);
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Failed to fetch history");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [wallet]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!wallet) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-500 text-sm">Connect wallet to see history</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          Swap History
        </h3>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-500 text-sm">No swaps yet</p>
          <p className="text-slate-600 text-xs mt-1">Your swaps will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition"
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
                  className="p-1.5 rounded-lg hover:bg-white/10 text-blue-400 hover:text-blue-300 transition"
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