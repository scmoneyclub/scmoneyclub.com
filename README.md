# SC Money Club

A private cryptocurrency portfolio and trading dashboard for SC Money Club members. Built with Next.js 15, TypeScript, and Tailwind CSS, the platform provides real-time token data across Solana and Ethereum, Phantom wallet integration, and an invite-only membership system backed by a WordPress REST API.

---

## Features

- **Multi-chain token explorer** — Browse and search tokens on Solana and Ethereum with live price data, market cap, volume, and liquidity metrics
- **Token detail pages** — Price history charts, transfer activity, and metadata for individual tokens
- **Phantom wallet integration** — Connect a Phantom wallet to view on-chain balances and assets
- **Trading dashboard** — Collapsible sidebar navigation with chain selector and search
- **Invite-only membership** — Join flow with invite code validation; authentication via WordPress backend
- **User account management** — Profile and settings pages for authenticated members
- **DAO section** — Governance features for club members
- **Investment portfolio view** — Portfolio overview for connected accounts
- **Security-first API proxying** — All third-party API keys are server-side only; Ankr and Birdeye calls are proxied through Next.js API routes with method whitelisting

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix UI primitives) |
| Icons | Lucide React |
| Animation | Framer Motion |
| Charts | Recharts |
| Blockchain | `@solana/web3.js`, Phantom wallet |
| HTTP client | Axios + native `fetch` |
| Font | Geist (Vercel) |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # Login & logout endpoints
│   │   ├── ankr/           # Ankr RPC proxy (prices, balances, history)
│   │   └── birdeye/        # Birdeye API proxy (token data, listings)
│   ├── page.tsx            # Home / landing page
│   ├── login/              # Login page
│   ├── join/               # Invite-code registration
│   ├── account/            # User account settings
│   ├── wallet/             # Phantom wallet viewer
│   ├── tokens/             # Token directory
│   ├── tokens/[symbol]/    # Token detail (by symbol)
│   ├── solana/             # Solana token list
│   ├── solana/[contract]/  # Solana token detail (by contract)
│   ├── ethereum/           # Ethereum token list
│   ├── ethereum/[contract]/# Ethereum token detail (by contract)
│   ├── trading/            # Trading dashboard
│   ├── investments/        # Portfolio overview
│   ├── dao/                # DAO governance
│   ├── about/              # About page
│   ├── connect/            # Wallet connection instructions
│   ├── privacy/            # Privacy policy
│   └── terms/              # Terms of service
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── layout/             # Header, Footer
│   ├── form/               # LoginForm
│   ├── auth/               # JoinForm, ValidateInvite
│   ├── trading/            # Sidebar, Topbar, token lists, search
│   ├── token/              # Token charts, price display, transfers
│   ├── phantom/            # Wallet connection UI
│   ├── dao/                # DAO components
│   ├── home/               # Landing page sections
│   └── investments/        # Portfolio components
├── hooks/
│   ├── usePhantomWallet.tsx # Phantom wallet connection & events
│   └── useAnkrTokenPrice.tsx# Live token price fetching
├── data/                   # Static / fallback JSON (token lists, price history)
├── lib/                    # Shared utilities
└── utils/
    └── formats.ts          # Number / date formatting helpers
```

---

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended) — or npm/yarn/bun
- A [Phantom wallet](https://phantom.app) browser extension for wallet features
- API keys for [Ankr](https://www.ankr.com/rpc/) and [Birdeye](https://birdeye.so)
- Access to the SCMC WordPress API backend

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Then fill in `.env.local`:

```env
# WordPress / SCMC backend (required for auth)
SCMC_API_BASE_URL=https://api.scmoneyclub.com/wp-json

# Ankr Advanced API key — server-side only (never expose client-side)
ANKR_API_KEY=your_ankr_api_key_here

# Birdeye API key — server-side only
BIRDEYE_API_KEY=your_birdeye_api_key_here

# Optional: override the default Solana RPC endpoint (safe to expose)
# NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

> **Note:** `ANKR_API_KEY` and `BIRDEYE_API_KEY` are never sent to the browser. All external API calls are proxied through `/api/ankr` and `/api/birdeye`.

### 3. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build optimized production bundle |
| `pnpm start` | Serve the production build locally |
| `pnpm lint` | Run ESLint across the codebase |

---

## API Routes

### Authentication

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate via WordPress backend; sets httpOnly cookie |
| `POST` | `/api/auth/logout` | Clear the auth cookie |

Authentication tokens are stored as **httpOnly, Secure, SameSite=Strict** cookies with a 30-day expiry. Non-sensitive profile data is stored in `sessionStorage`.

### Ankr Proxy

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/ankr` | Whitelisted Ankr RPC methods (see below) |

Whitelisted methods: `ankr_getTokenPrice`, `ankr_getTokenPriceHistory`, `ankr_getAccountBalance`

### Birdeye Proxy

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/birdeye/price` | Token spot price (15s cache) |
| `GET` | `/api/birdeye/token-overview` | Token metadata and stats (30s cache) |
| `GET` | `/api/birdeye/tokenlist` | Paginated token listing with sort/filter (60s cache) |

---

## Authentication Flow

1. User submits email + password on `/login`
2. `POST /api/auth/login` proxies credentials to the WordPress SCMC API
3. On success, an httpOnly cookie is set on the response
4. Subsequent requests include the cookie automatically (no client-side token handling)
5. `/join` requires a valid invite code before account creation

---

## Phantom Wallet Integration

The `usePhantomWallet` hook (`src/hooks/usePhantomWallet.tsx`) manages the full Phantom wallet lifecycle:

- Detects whether the Phantom extension is installed
- Handles connect, disconnect, and account change events
- Reads the connected public key for downstream queries
- The Solana RPC endpoint is configurable via `NEXT_PUBLIC_SOLANA_RPC_URL`

Wallet assets are displayed on `/wallet` after connecting.

---

## Security

- All third-party API keys are **server-side only** — no `NEXT_PUBLIC_` prefix
- Ankr RPC proxy enforces a **method allowlist** to prevent arbitrary RPC calls
- Birdeye proxy validates query parameters and sets short cache TTLs
- Security headers are configured in `next.config.ts`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security` with preload
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - Content Security Policy restricting inline scripts and framing
- Input addresses are validated (Solana base58 / Ethereum hex) before RPC calls

---

## Deployment

The app is optimized for deployment on [Vercel](https://vercel.com). No `vercel.json` is required — Next.js defaults handle routing and serverless function packaging.

**Steps:**

1. Push to your connected Git repository
2. Set all environment variables from `.env.example` in the Vercel project dashboard under **Settings → Environment Variables**
3. Vercel will build and deploy automatically on every push to `main`

Production cookies use `secure: true` and are scoped correctly for the domain.

---

## Contributing

1. Create a feature branch from `main`
2. Run `pnpm lint` and fix any issues before committing
3. Open a pull request with a clear description of the change
