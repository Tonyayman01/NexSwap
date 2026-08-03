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

const SHELBY_API_KEY = process.env.SHELBY_API_KEY || "";
const SHELBY_ACCOUNT_PRIVATE_KEY =
  process.env.SHELBY_ACCOUNT_PRIVATE_KEY || process.env.APTOS_PRIVATE_KEY || "";

export async function storeSwapTransaction(tx: SwapTransaction): Promise<StoreResult> {
  const blobName = `${tx.timestamp}`;

  if (!SHELBY_API_KEY) {
    throw new Error("Missing SHELBY_API_KEY in server environment");
  }

  if (!SHELBY_ACCOUNT_PRIVATE_KEY) {
    throw new Error("Missing SHELBY_ACCOUNT_PRIVATE_KEY in server environment");
  }

  const { generateCommitments, ShelbyNodeClient } = await import("@shelby-protocol/sdk/node");
  type ErasureCodingProvider = Parameters<typeof generateCommitments>[0];
  const { Account, Ed25519PrivateKey, Network } = await import("@aptos-labs/ts-sdk");

  const signer = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(SHELBY_ACCOUNT_PRIVATE_KEY),
  });
  const accountAddress = signer.accountAddress.toString();
  const explorerUrl = `https://explorer.shelby.xyz/shelbynet/account/${accountAddress}/blobs`;

  const client = new ShelbyNodeClient({
    network: Network.SHELBYNET,
    apiKey: SHELBY_API_KEY,
  });

  const blobData = new TextEncoder().encode(JSON.stringify(tx));
  const expirationMicros = Date.now() * 1000 + 30 * 24 * 60 * 60 * 1_000_000;

  const provider = await (
    client as unknown as { getProvider: () => Promise<ErasureCodingProvider> }
  ).getProvider();
  const blobCommitments = await generateCommitments(provider, blobData);
  const { transaction } = await client.coordination.registerBlob({
    account: signer,
    blobName,
    blobMerkleRoot: blobCommitments.blob_merkle_root,
    size: blobData.length,
    expirationMicros: expirationMicros.toString() as unknown as number,
    config: provider.config,
  });

  await client.coordination.aptos.waitForTransaction({
    transactionHash: transaction.hash,
  });

  await client.rpc.putBlobResumable({
    account: signer,
    blobName,
    blobData,
  });

  console.log("Swap stored on Shelby:", blobName);
  return {
    success: true,
    blobName,
    accountAddress,
    timestamp: tx.timestamp,
    explorerUrl,
  };
}
