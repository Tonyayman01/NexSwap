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
}

const APTOS_ACCOUNT_ADDRESS =
  process.env.SHELBY_ACCOUNT_ADDRESS ||
  process.env.APTOS_ACCOUNT_ADDRESS ||
  "0x2b1abb3c4369ae67c04d4d8eb0758a7e2846a136dd48249b805fab871a974f39";

const SHELBY_API_KEY = process.env.SHELBY_API_KEY || "";
const SHELBY_ACCOUNT_PRIVATE_KEY =
  process.env.SHELBY_ACCOUNT_PRIVATE_KEY || process.env.APTOS_PRIVATE_KEY || "";

export async function storeSwapTransaction(tx: SwapTransaction): Promise<StoreResult> {
  const blobName = `swaps/${tx.wallet.slice(0, 10)}/${tx.timestamp}.json`;
  const explorerUrl = `https://explorer.shelby.xyz/shelbynet/account/${APTOS_ACCOUNT_ADDRESS}/blobs`;

  if (!SHELBY_API_KEY) {
    throw new Error("Missing SHELBY_API_KEY in server environment");
  }

  if (!SHELBY_ACCOUNT_PRIVATE_KEY) {
    throw new Error("Missing SHELBY_ACCOUNT_PRIVATE_KEY in server environment");
  }

  const { ShelbyNodeClient } = await import("@shelby-protocol/sdk/node");
  const { Account, Ed25519PrivateKey, Network } = await import("@aptos-labs/ts-sdk");

  const signer = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(SHELBY_ACCOUNT_PRIVATE_KEY),
  });

  const client = new ShelbyNodeClient({
    network: Network.SHELBYNET,
    apiKey: SHELBY_API_KEY,
  });

  const blobData = new TextEncoder().encode(JSON.stringify(tx));
  const expirationMicros = Date.now() * 1000 + 30 * 24 * 60 * 60 * 1_000_000;

  await client.upload({ blobData, signer, blobName, expirationMicros });

  console.log("Swap stored on Shelby:", blobName);
  return {
    success: true,
    blobName,
    accountAddress: APTOS_ACCOUNT_ADDRESS,
    timestamp: tx.timestamp,
    explorerUrl,
  };
}
