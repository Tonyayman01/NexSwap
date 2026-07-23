# NexSwap

AI-powered token swap demo built with Next.js, Aptos wallet identity, and Shelby Protocol hot storage.

Every successful swap record is uploaded as a JSON blob to Shelby on Shelbynet, then linked back to the user wallet for history and AI insights.

Live demo: [nex-swapshelby.vercel.app](https://nex-swapshelby.vercel.app)  
GitHub: [Tonyayman01/NexSwap](https://github.com/Tonyayman01/NexSwap)

## Why NexSwap

Most swap demos forget user activity as soon as the session ends. NexSwap keeps a verifiable memory layer:

| Feature | Traditional Swap UI | NexSwap |
| --- | --- | --- |
| Swap history | Local/session data | Shelby blob storage |
| User identity | App-controlled | Aptos wallet address |
| Storage | Centralized database | Shelby hot storage |
| AI insights | None | OpenRouter-powered advisor |
| Verification | App trust | Explorer-visible blob records |

## Features

- Token swap interface for APT, USDC, USDT, WETH, and BTC demo pairs
- Aptos wallet connection with Petra wallet adapter
- Shelby Protocol upload for each successful swap JSON record
- Explorer link for stored Shelby blobs
- AI Swap Advisor that analyzes recent swap activity
- Responsive pink/violet Shelby-inspired frontend with Framer Motion animations
- Clear error handling for missing env vars, unfunded accounts, and upload timeouts

## How It Works

```text
User connects Petra wallet
        |
User submits a swap
        |
Next.js API creates a swap JSON record
        |
Server-side Shelby account uploads the blob to Shelbynet
        |
Frontend shows blob name + Shelby Explorer link
        |
AI advisor can analyze the user's recent swap history
```

Important: the Petra wallet is used for user identity in the app. Shelby uploads are signed server-side with `SHELBY_ACCOUNT_PRIVATE_KEY`, so the Shelby account must be funded on Shelbynet.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, Tailwind CSS |
| Animation | Framer Motion |
| Wallet | Aptos Wallet Adapter / Petra |
| Storage | `@shelby-protocol/sdk` |
| Chain | Shelbynet / Aptos |
| AI | OpenRouter API |

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- Petra wallet browser extension
- Shelby API key
- Funded Shelbynet account for server-side uploads

### Install

```bash
git clone https://github.com/Tonyayman01/NexSwap.git
cd NexSwap
npm install
```

### Environment Variables

Create `.env.local`:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
SHELBY_API_KEY=your_shelby_api_key
SHELBY_ACCOUNT_ADDRESS=your_shelbynet_account_address
SHELBY_ACCOUNT_PRIVATE_KEY=your_shelbynet_private_key
```

Do not expose `SHELBY_ACCOUNT_PRIVATE_KEY` in client-side code. It must stay server-side only.

### Fund the Shelby Account

The account in `SHELBY_ACCOUNT_ADDRESS` needs APT for transaction fees on Shelbynet. If uploads fail with `INSUFFICIENT_BALANCE_FOR_TRANSACTION_FEE`, fund that exact address.

Useful links:

- [Shelby Aptos Faucet](https://docs.shelby.xyz/apis/faucet/aptos)
- [ShelbyUSD Faucet](https://docs.shelby.xyz/apis/faucet/shelbyusd)
- [Shelby Explorer](https://explorer.shelby.xyz/shelbynet)

### Run Locally

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

If port `3000` is busy, use another port:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3002
```

## Vercel Deployment

1. Push the repo to GitHub.
2. Import [Tonyayman01/NexSwap](https://github.com/Tonyayman01/NexSwap) into Vercel.
3. Add these Environment Variables in Vercel Project Settings:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
SHELBY_API_KEY=your_shelby_api_key
SHELBY_ACCOUNT_ADDRESS=your_shelbynet_account_address
SHELBY_ACCOUNT_PRIVATE_KEY=your_shelbynet_private_key
```

4. Redeploy after saving env vars.
5. Test a swap and verify the blob in [Shelby Explorer](https://explorer.shelby.xyz/shelbynet).

Build command:

```bash
npm run build
```

Start command:

```bash
npm run start
```

## Verification

After a successful swap, the API returns:

```json
{
  "success": true,
  "blobName": "swaps/0xwallet/1234567890.json",
  "explorerUrl": "https://explorer.shelby.xyz/shelbynet/account/..."
}
```

Open `explorerUrl`, then check:

```text
Account -> Blobs -> swaps/...
```

The blob status should show `Ready`.

## Troubleshooting

| Error | Meaning | Fix |
| --- | --- | --- |
| `Missing SHELBY_API_KEY` | Server env var is missing | Add it locally or in Vercel |
| `Missing SHELBY_ACCOUNT_PRIVATE_KEY` | Upload signer is missing | Add server-side private key |
| `INSUFFICIENT_BALANCE_FOR_TRANSACTION_FEE` | Shelby upload signer has no APT | Fund `SHELBY_ACCOUNT_ADDRESS` |
| `Shelby upload timed out` | Shelby network/API took too long | Retry and check account funding |
| Wallet popup does not appear | Shelby upload is server-side | Connect wallet only identifies the user |

## Roadmap

- [x] Swap interface
- [x] Shelby storage integration
- [x] AI Swap Advisor
- [x] Petra wallet connection
- [x] Shelby-inspired animated frontend
- [ ] Real on-chain swap execution
- [ ] Cross-session history retrieval from Shelby
- [ ] Multi-wallet analytics

## Built for the Shelby Ecosystem

NexSwap demonstrates a DeFi interface with a verifiable memory layer: every successful swap can be stored as a Shelby blob and inspected through the Shelby Explorer.

Built by [Tonyayman01](https://github.com/Tonyayman01), powered by [Shelby Protocol](https://shelby.xyz).
