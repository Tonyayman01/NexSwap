export interface SwapTransaction {
  id: string;
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
}

export interface StoreResult {
  success: boolean;
  blobName: string;
  accountAddress: string;
  timestamp: number;
  explorerUrl: string;
  simulated?: boolean;
}

const APTOS_ACCOUNT_ADDRESS =
  process.env.APTOS_ACCOUNT_ADDRESS ||
  "0x2b1abb3c4369ae67c04d4d8eb0758a7e2846a136dd48249b805fab871a974f39";

const SHELBY_API_KEY = process.env.SHELBY_API_KEY || "AG-MR5SFEFY8BSVMEMVG9YETVQBZJJ2QYEPF";
const APTOS_PRIVATE_KEY = process.env.APTOS_PRIVATE_KEY || "";

export async function storeSwapTransaction(tx: SwapTransaction): Promise<StoreResult> {
  const blobName = `swaps/${tx.wallet.slice(0, 10)}/${tx.timestamp}.json`;
  const explorerUrl = `https://explorer.shelby.xyz/shelbynet/account/${APTOS_ACCOUNT_ADDRESS}/blobs`;

  if (APTOS_PRIVATE_KEY) {
    try {
      const { ShelbyClient } = await import("@shelby-protocol/sdk/node");
      const { Account, Ed25519PrivateKey } = await import("@aptos-labs/ts-sdk");

      const privateKey = new Ed25519PrivateKey(APTOS_PRIVATE_KEY);
      const account = Account.fromPrivateKey({ privateKey });

      const client = new ShelbyClient({
        network: "shelbynet" as any,
        aptos: {
          network: "shelbynet" as any,
          fullnode: "https://api.shelbynet.shelby.xyz/v1",
          indexer: "https://api.shelbynet.shelby.xyz/v1/graphql",
          clientConfig: { API_KEY: SHELBY_API_KEY },
        },
        shelby: {
          rpc: { baseUrl: "https://api.shelbynet.shelby.xyz/shelby" },
        },
      } as any);

      const blobData = new TextEncoder().encode(JSON.stringify(tx));
      const expirationMicros = (Date.now() + 30 * 24 * 60 * 60 * 1000) * 1000;

      await client.upload({ blobData, signer: account, blobName, expirationMicros });

      console.log("✅ Swap stored on Shelby:", blobName);
      return { success: true, blobName, accountAddress: APTOS_ACCOUNT_ADDRESS, timestamp: tx.timestamp, explorerUrl };

    } catch (error: any) {
      console.error("❌ Shelby Upload Error:", error.message);
    }
  }

  console.log("📝 Demo mode: Swap indexed:", blobName);
  return {
    success: true,
    blobName,
    accountAddress: APTOS_ACCOUNT_ADDRESS,
    timestamp: tx.timestamp,
    explorerUrl,
    simulated: true,
  };
}