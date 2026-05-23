# NexSwap 🔄
### AI-Powered Decentralized Swap — Built on Aptos & Shelby Protocol

> Swap tokens on Aptos with every transaction permanently saved on Shelby's decentralized hot storage — and get real AI insights after every swap.

 **Live Demo:** Coming Soon |  **GitHub:** [Tonyayman01/NexSwap](https://github.com/Tonyayman01/NexSwap)

---

## The Problem
Most DEX swaps are anonymous and forgotten. You have no memory of your trading history, no insights on your patterns, and no ownership of your data. Centralized platforms store your data  not you.

## The Solution
NexSwap combines **decentralized swapping** with **AI-powered memory**. Every swap is stored as a verifiable blob on Shelby Protocol hot storage, tied to your Aptos wallet. The AI analyzes your swap history and gives personalized insights  data you own, forever.

---

## What Makes NexSwap Different 

| Feature | Traditional DEX | NexSwap |
|---------|----------------|---------|
| Swap History | Centralized | On Shelby decentralized 
| AI Insights | None | After every swap |
| Data Ownership | Platform | Your wallet |
| Storage | Database | Shelby hot storage |
| Retrieval Speed | Fast | ~50ms (Shelby) |

---

## Features

-  **Token Swap** — Swap APT, USDC, USDT, WETH, BTC on Aptos
-  **AI Swap Advisor** — Personalized insights after every swap
-  **Shelby Storage** — Every swap saved as a verified blob on-chain
-  **Wallet Identity** — Swap history tied to your Aptos wallet
-  **Personal Dashboard** — Track your volume and swap history
-  **Millisecond Retrieval** — Shelby hot storage for instant access
-  **Verifiable** — Every swap cryptographically verified on Aptos

---

## How It Works

```
User Swaps → Transaction Saved on Shelby → AI Analyzes History → Insights Shown
     │                    │                        │
  Petra Wallet      Blob on-chain            OpenRouter AI
  (Aptos)          (Shelbynet)              (Free Models)
```

---

## AI Swap Advisor 

After every swap the AI gives 3 personalized insights:

```
1. Single swap suggests very low recent trading activity.
2. USDC to APT indicates a directional bet on Aptos upside.  
3. Small-size trade implies cautious testing before larger swaps.
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TailwindCSS |
| AI Engine | OpenRouter (Free Models) |
| Storage | Shelby Protocol SDK |
| Blockchain | Aptos Testnet |
| Wallet | Petra (Aptos Wallet Adapter) |

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm
- Petra Wallet browser extension

### Installation
```bash
git clone https://github.com/Tonyayman01/NexSwap.git
cd NexSwap
npm install
```

### Environment Setup
Create `.env.local`:
```
OPENROUTER_API_KEY=your_openrouter_key
SHELBY_API_KEY=your_shelby_key
APTOS_ACCOUNT_ADDRESS=your_aptos_address
APTOS_PRIVATE_KEY=your_private_key
```

### Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Roadmap 🗺️

- [x] Token swap interface
- [x] Shelby storage integration
- [x] AI swap advisor
- [x] Wallet connect (Petra)
- [ ] Real on-chain swap (LiquidSwap DEX)
- [ ] Swap score system
- [ ] Cross-session AI memory
- [ ] Multi-wallet support

---

## Built for the Shelby Ecosystem 

NexSwap proves that DeFi can be smarter — every swap remembered, every pattern analyzed, all data owned by the user.

Built with  by [Tonyayman01](https://github.com/Tonyayman01) — powered by [Shelby Protocol](https://shelby.xyz) on Aptos
