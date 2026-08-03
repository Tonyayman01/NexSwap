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

  const { ShelbyBlobClient, ShelbyNodeClient } = await import("@shelby-protocol/sdk/node");
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

  const createRegisterBlobPayload = ShelbyBlobClient.createRegisterBlobPayload;
  ShelbyBlobClient.createRegisterBlobPayload = (params) => {
    const payload = createRegisterBlobPayload(params);
    const [
      blobNameArg,
      expirationMicrosArg,
      blobMerkleRootArg,
      numChunksetsArg,
      blobSizeArg,
      reservedArg,
      encodingArg,
    ] = payload.functionArguments;

    payload.functionArguments = [
      blobNameArg,
      "",
      "",
      expirationMicrosArg,
      blobMerkleRootArg,
      numChunksetsArg,
      blobSizeArg,
      reservedArg,
      0,
      encodingArg,
    ];

    return payload;
  };

  const coordination = client.coordination as unknown as {
    getBlobMetadata: () => Promise<null>;
  };
  coordination.getBlobMetadata = async () => null;

  await client.upload({
    blobData,
    signer,
    blobName,
    expirationMicros,
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
