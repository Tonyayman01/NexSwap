import { NextRequest, NextResponse } from "next/server";
import { storeSwapTransaction, SwapTransaction } from "@/lib/shelby-service";

// In-memory transaction store
const transactions: (SwapTransaction & { blobName: string; explorerUrl: string })[] = [];

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected error";
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
}

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

    let result;
    try {
      result = await withTimeout(
        storeSwapTransaction(tx),
        45_000,
        "Shelby upload timed out after 45 seconds. Check the server account balance and try again."
      );
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      console.error("Shelby storage failed:", message);
      return NextResponse.json(
        {
          success: false,
          error: message,
          txId: tx.id,
        },
        { status: 502 }
      );
    }

    // Store in memory
    transactions.unshift({ ...tx, blobName: result.blobName, explorerUrl: result.explorerUrl });
    if (transactions.length > 100) transactions.pop();

    return NextResponse.json({
      success: true,
      blobName: result.blobName,
      explorerUrl: result.explorerUrl,
      txId: tx.id,
    });

  } catch (error: unknown) {
    console.error("Swap API Error:", getErrorMessage(error));
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
