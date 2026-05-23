import { NextRequest, NextResponse } from "next/server";
import { storeSwapTransaction, SwapTransaction } from "@/lib/shelby-service";

// In-memory transaction store
const transactions: (SwapTransaction & { blobName: string; explorerUrl: string })[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, fromToken, toToken, fromAmount, toAmount, slippage, priceImpact, fee } = body;

    if (!wallet || !fromToken || !toToken || !fromAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tx: SwapTransaction = {
      id: `tx_${Date.now()}`,
      wallet,
      fromToken,
      toToken,
      fromAmount,
      toAmount,
      slippage,
      priceImpact,
      fee,
      timestamp: Date.now(),
      network: "Aptos Testnet",
    };

    const result = await storeSwapTransaction(tx);

    // Store in memory
    transactions.unshift({ ...tx, blobName: result.blobName, explorerUrl: result.explorerUrl });
    if (transactions.length > 100) transactions.pop();

    return NextResponse.json({
      success: true,
      blobName: result.blobName,
      explorerUrl: result.explorerUrl,
      txId: tx.id,
      simulated: result.simulated,
    });

  } catch (error: any) {
    console.error("Swap API Error:", error.message);
    return NextResponse.json({ error: "Swap failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  const filtered = wallet
    ? transactions.filter((tx) => tx.wallet === wallet)
    : transactions;

  return NextResponse.json({ transactions: filtered });
}