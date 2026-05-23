import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { swaps, wallet } = await req.json();

    const validSwaps = (swaps || []).filter((s: any) => 
      s !== null && 
      s !== undefined && 
      typeof s === 'object' &&
      s.fromAmount && 
      s.fromToken
    );

    const swapHistory = validSwaps.length > 0 
      ? validSwaps.map((s: any) => `${s.fromAmount} ${s.fromToken} → ${s.toAmount} ${s.toToken}`).join("\n")
      : "No swaps yet - just getting started!";

    const prompt = `You are a DeFi swap advisor for NexSwap on Aptos.
Analyze this wallet's swap history and give 3 short insights:

Wallet: ${wallet?.slice(0, 10)}...
Swaps:
${swapHistory || "No swaps yet"}

Give exactly 3 insights, each under 15 words.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://nexswap.vercel.app",
        "X-Title": "NexSwap",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
      }),
    });

    console.log("OpenRouter status:", response.status);
    const data = await response.json();
    console.log("OpenRouter data:", JSON.stringify(data));

    const analysis = data.choices?.[0]?.message?.content || "Keep swapping to get insights!";
    return NextResponse.json({ success: true, analysis });

  } catch (error: any) {
    console.error("AI Error:", error.message);
    return NextResponse.json({ success: false, analysis: "AI advisor temporarily unavailable." });
  }
}