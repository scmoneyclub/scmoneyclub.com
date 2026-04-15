# SC Money Club — Development Tasklist
**Generated:** April 14, 2026  
**Codebase:** Next.js 15 (App Router) · TypeScript 5 · Tailwind CSS v4 · Solana + Ethereum

---

## Executive Summary

SC Money Club is a confidently-built, security-conscious cryptocurrency dashboard — the foundations are genuinely solid: API keys stay server-side, cookies are hardened, and the App Router architecture is correctly oriented. What it hasn't yet reached is its ceiling. The most thrilling opportunities aren't about fixing broken things — they're about upgrading good patterns to legendary ones: replacing manual `useState` waterfalls with edge-streamed real-time data, collapsing ~400 lines of duplicated token-list code into a single composable abstraction, and shipping the one feature this platform was born for — a live, AI-powered portfolio intelligence layer that turns price data into actionable insight. The gap between "working app" and "unforgettable platform" is smaller than it looks. Let's close it.

---

## Table of Contents

1. [Visionary Major Feature Innovations](#1-visionary-major-feature-innovations)
2. [Creative Minor Enhancements & Delightful Polish](#2-creative-minor-enhancements--delightful-polish)
3. [Critical Fixes & Architectural Modernizations](#3-critical-fixes--architectural-modernizations)
4. [Minor Fixes & Code Elegance Improvements](#4-minor-fixes--code-elegance-improvements)
5. [Strategic Recommendations](#5-strategic-recommendations)

---

## 1. Visionary Major Feature Innovations

---

### 1.1 — AI Portfolio Intelligence Stream
**Priority:** High

**Description:**  
The app currently shows prices and charts. That's table stakes. The 2026 frontier is an AI layer that watches a member's portfolio in real time and surfaces *meaning* — not just "SOL is up 12%" but "SOL's 4-hour RSI is overbought, your position is up 340%, and three similar club members trimmed theirs this week." This is the feature that makes SC Money Club feel like having a private analyst.

**Proposed Solution:**  
Integrate the Vercel AI SDK (`ai` package) with a streaming `streamText` endpoint at `/api/intelligence/stream`. Use tool calls to pull live Birdeye and Ankr data, cross-reference the authenticated user's portfolio, and stream structured insight cards back to the UI via `useChat` or a custom `useObject` hook. The AI layer runs at the Vercel Edge for zero cold starts.

```ts
// app/api/intelligence/stream/route.ts
import { streamText, tool, gateway } from 'ai';

export async function POST(req: Request) {
  const { portfolio, question, userId } = await req.json();
  return streamText({
    // Routes through Vercel AI Gateway — OIDC auth, failover, cost tracking
    model: gateway('anthropic/claude-sonnet-4.6'),
    system: 'You are a private portfolio analyst for SC Money Club members...',
    messages: [{ role: 'user', content: question }],
    tools: {
      getTokenPrice: tool({ /* pulls live Birdeye price */ }),
      getPortfolioSummary: tool({ /* reads user portfolio */ }),
    },
    providerOptions: {
      gateway: {
        order: ['anthropic', 'bedrock'],   // failover to Bedrock if Anthropic is down
        user: userId,                       // per-user cost tracking
        tags: ['feature:ai-intelligence', 'env:production'],
      },
    },
  }).toUIMessageStreamResponse();
}
```

**Estimated Effort:** Large  
*(AI SDK integration + tool wiring + UI components + prompt engineering)*

**Rationale:**  
This is the feature that justifies the "club" concept. Members pay for access to something they can't get publicly. An AI analyst that knows your wallet, knows your history, and streams insights in real time is that thing.

**Innovation Angle:**  
Streaming tool-call responses, edge-deployed inference, and portfolio-aware context put this at the absolute frontier of AI-native finance applications in 2026.

**Dependencies / Risks:**  
- Requires Anthropic API key in environment  
- Portfolio data model must be defined server-side  
- Cost-per-query should be metered per user

---

### 1.2 — Real-Time Token Feed via Server-Sent Events
**Priority:** High

**Description:**  
Both `SolanaTokenList` and `EthereumTokenList` fetch token data once on mount, then sit static until the user manually refreshes. In a volatile market, a price table that's 60 seconds stale is a liability. The app needs live, streaming price updates that flow continuously to connected clients.

**Proposed Solution:**  
Replace the one-shot `fetch` in both token list components with a Server-Sent Events subscription. Build a `/api/stream/tokens?chain=solana` edge route that holds the connection open, polls Birdeye on a 10-second interval, and pushes delta updates. The client side uses the native `EventSource` API wrapped in a custom `useTokenStream` hook.

```ts
// app/api/stream/tokens/route.ts
export const runtime = 'edge';

export async function GET(req: Request) {
  const chain = new URL(req.url).searchParams.get('chain');
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const interval = setInterval(async () => {
        const data = await fetchBirdeyeTokens(chain);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }, 10_000);
      req.signal.addEventListener('abort', () => clearInterval(interval));
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
}
```

**Estimated Effort:** Medium  
*(Edge route + custom hook + component wiring)*

**Rationale:**  
Real-time data is the single most visceral upgrade a trading platform can ship. When numbers move without the user touching anything, the platform feels alive.

**Innovation Angle:**  
Edge-deployed SSE with Vercel's global network means sub-100ms latency to users worldwide — competing with dedicated WebSocket infrastructure at zero marginal complexity.

**Dependencies / Risks:**  
- Birdeye API rate limits must be respected (server-side pooling needed if many concurrent users)  
- Add connection heartbeat to handle long-lived SSE reconnects

---

### 1.3 — Protected Route Middleware with Edge Session Validation
**Priority:** High

**Description:**  
There is currently **no `middleware.ts`** in this codebase. Routes like `/account`, `/wallet`, `/trading`, `/investments`, and `/dao` are completely unprotected — any unauthenticated user can access them directly by URL. This is the single most critical architectural gap in the application.

**Proposed Solution:**  
Add `middleware.ts` at the root of `src/` that runs on Vercel's Edge Runtime. It reads the `scmc_token` httpOnly cookie, validates it against the WordPress API (or a lightweight JWT check), and redirects unauthenticated requests to `/login` with a `?next=` param for post-login redirect.

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/account', '/wallet', '/trading', '/investments', '/dao'];

export function middleware(req: NextRequest) {
  const token = req.cookies.get('scmc_token')?.value;
  const isProtected = PROTECTED.some(p => req.nextUrl.pathname.startsWith(p));
  if (isProtected && !token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = { matcher: ['/account/:path*', '/wallet/:path*', '/trading/:path*'] };
```

**Estimated Effort:** Small  
*(~50 lines, but requires verifying cookie name and token shape)*

**Rationale:**  
This isn't a "nice to have" — it's a security baseline. An invite-only platform with no route protection is open to any user who guesses a URL.

**Innovation Angle:**  
Edge middleware runs before any page renders, at ~0ms overhead globally. This is the 2026-native way to do auth — no server round-trips, no layout shifts, no flickering.

**Dependencies / Risks:**  
- Must not break public routes (`/`, `/login`, `/join`, `/about`)  
- Token validation strategy (JWT vs. API ping) affects latency — JWT preferred at Edge

---

### 1.4 — Unified `<TokenList>` Component + React Query Data Layer
**Priority:** High

**Description:**  
`SolanaTokenList.tsx` (201 lines) and `EthereumTokenList.tsx` (203 lines) are byte-for-byte duplicates — same state shape, same fetch logic, same table columns, same sorting, same search. This isn't a style issue; it's a compounding maintenance liability. Every bug fix, every feature addition, every UI change must be made twice. Simultaneously, all data fetching is manual `useState` + `useEffect` with no caching, deduplication, or background refresh — exactly what React Query was designed to solve.

**Proposed Solution:**  
1. Extract a single `<TokenList chain="solana" | "ethereum" />` component  
2. Install `@tanstack/react-query` and wrap the app in `QueryClientProvider`  
3. Replace all manual fetch hooks with `useQuery` for automatic caching, deduplication, and stale-while-revalidate

```tsx
// components/trading/TokenList.tsx
export function TokenList({ chain }: { chain: 'solana' | 'ethereum' }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tokens', chain],
    queryFn: () => fetch(`/api/birdeye/tokenlist?chain=${chain}`).then(r => r.json()),
    staleTime: 60_000,
    refetchInterval: 30_000,
  });
  // single render path for both chains
}
```

**Estimated Effort:** Medium  
*(Refactor + React Query setup + testing both chain views)*

**Rationale:**  
Cutting 200+ duplicate lines while adding caching, automatic background refresh, and loading/error states as a side effect — this is the highest-leverage refactor in the codebase.

**Innovation Angle:**  
React Query's `refetchInterval` gives the token list a heartbeat — prices refresh automatically in the background while the user reads, with no spinners interrupting their flow.

**Dependencies / Risks:**  
- `@tanstack/react-query` adds ~13KB gzipped — worth it for what it replaces  
- Pair with React Query Devtools in development for instant visibility

---

## 2. Creative Minor Enhancements & Delightful Polish

---

### 2.1 — Skeleton Loader Screens (Bye, Spinners)
**Priority:** High

**Description:**  
Every loading state in the app is a bare spinner with a text label. This makes the UI feel empty and uncertain during data fetches. The 2026 standard is skeleton screens — ghost placeholders that match the shape of incoming content, making the UI feel fast and intentional even before data arrives.

**Proposed Solution:**  
Use `shadcn/ui`'s `Skeleton` primitive to build skeleton variants for the token table rows, price cards, and chart areas. Wire them to the `isLoading` state from React Query.

```tsx
// When loading: show 8 skeleton rows that match table columns
{isLoading && Array.from({ length: 8 }).map((_, i) => (
  <TableRow key={i}>
    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
    <TableCell><div className="flex gap-2"><Skeleton className="h-6 w-6 rounded-full" /><Skeleton className="h-4 w-24" /></div></TableCell>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    {/* ... */}
  </TableRow>
))}
```

**Estimated Effort:** Small  
**Rationale:** The perceived performance improvement is significant — users feel the app is faster even when nothing changed in the network layer. This is pure delight at near-zero cost.  
**Innovation Angle:** Skeleton loaders are table stakes in 2026 premium applications. Their absence is what makes an app feel unfinished.

---

### 2.2 — Phantom Wallet Connection: Animated State Transitions
**Priority:** Medium

**Description:**  
The three wallet states (not installed → not connected → connected) snap between views with hard cuts. Framer Motion is already in the dependency tree and used for the hero video — it should be put to work here.

**Proposed Solution:**  
Wrap the three dialog states in `<AnimatePresence>` with slide/fade transitions. The wallet address appearing on successful connection should animate in with a satisfying scale effect.

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={walletState}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.18 }}
  >
    {/* state content */}
  </motion.div>
</AnimatePresence>
```

**Estimated Effort:** Small  
**Rationale:** Connecting your wallet is a high-stakes UX moment — the first time a user links their real assets to the platform. It should feel ceremonial and trustworthy.  
**Innovation Angle:** Framer Motion is already installed and paid for. Using it here costs nothing except the minutes to write the animation.

---

### 2.3 — Token Search: `useTransition` for Non-Blocking Input
**Priority:** Medium

**Description:**  
`SearchDialog.tsx` filters a potentially large token list on every keystroke. As the dataset grows, this will cause input lag. React 18's `useTransition` lets you mark the filter work as low-priority so the input stays responsive.

**Proposed Solution:**  
```tsx
const [isPending, startTransition] = useTransition();
const [query, setQuery] = useState('');
const [filtered, setFiltered] = useState(tokens);

function handleChange(value: string) {
  setQuery(value);
  startTransition(() => {
    setFiltered(tokens.filter(t => t.name.toLowerCase().includes(value.toLowerCase())));
  });
}
```

**Estimated Effort:** Small  
**Rationale:** Zero library additions, zero API changes. Pure React — and it makes the search feel instant even on low-end devices.  
**Innovation Angle:** `useTransition` is a 2024+ React primitive that most production apps still underuse. It's the right tool exactly here.

---

### 2.4 — Token Detail: `<Link prefetch>` Hover Prefetching
**Priority:** Low

**Description:**  
Clicking a token in the list triggers a full page load for its detail page because no data is prefetched. Next.js `<Link>` components already prefetch in production on viewport entry — but the API data itself doesn't load until the page mounts.

**Proposed Solution:**  
Add route segment config to enable partial prerendering on token detail pages, and ensure the token list uses `<Link prefetch="intent">` (fires on hover). This makes token detail navigation feel instantaneous.

**Estimated Effort:** Small  
**Rationale:** The gap between clicking a token and seeing its chart is the most friction-heavy moment in the user flow. Eliminating it makes the app feel like a native app.  
**Innovation Angle:** Next.js Partial Prerendering (PPR) ships the static shell instantly while streaming in the dynamic data — the 2026 gold standard for data-heavy pages.

---

### 2.5 — Retry UI for Failed Data Fetches
**Priority:** Medium

**Description:**  
When a Birdeye or Ankr request fails, the app shows an error message with no recovery path. The user must manually reload the page. This is a cliff.

**Proposed Solution:**  
React Query's `refetch` function makes this trivial. Every error state gets a "Try again" button that calls `refetch()` — no reload, no lost state.

```tsx
{error && (
  <div className="flex flex-col items-center gap-3 py-12">
    <p className="text-sm text-red-400">{error.message}</p>
    <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
  </div>
)}
```

**Estimated Effort:** Small (prerequisite: task 1.4 React Query)  
**Rationale:** A dead-end error state signals distrust. A retry button signals confidence. Users don't leave — they retry.  
**Innovation Angle:** With React Query's exponential backoff, the retry can be automatic with a countdown timer — "Retrying in 3s…"

---

## 3. Critical Fixes & Architectural Modernizations

---

### 3.1 — Zod Schema Validation on All API Routes
**Priority:** High

**Description:**  
Every API route currently validates inputs manually with `if (!login || !password)` guards — no type coercion, no min/max length enforcement, no structured error responses. The Ankr proxy passes `params` from the request body directly to the upstream RPC without sanitization, creating a potential SSRF amplification vector.

**Proposed Solution:**  
Install `zod` and define input schemas for every route. Use `schema.safeParse(body)` and return structured `400` responses on validation failure.

```ts
// app/api/auth/login/route.ts
import { z } from 'zod';

const LoginSchema = z.object({
  login: z.string().min(3).max(100).email(),
  password: z.string().min(8).max(256),
});

export async function POST(req: Request) {
  const body = await req.json();
  const result = LoginSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }
  // proceed with validated data
}
```

**Estimated Effort:** Small  
**Rationale:** Zod costs one dependency and pays back with type-safe API boundaries, structured error messages for the client, and a sanitization layer that stops malformed inputs reaching upstream services.  
**Innovation Angle:** Zod schemas become the single source of truth for request shapes — shareable between server and client for end-to-end type inference.

---

### 3.2 — Fix Content Security Policy: Remove `unsafe-eval`
**Priority:** High

**Description:**  
`next.config.ts` includes `'unsafe-eval'` in `script-src`. This completely defeats the code injection protection that CSP provides — any XSS that achieves script execution can use `eval()` to run arbitrary code. This is a security regression masquerading as a configuration choice.

**Proposed Solution:**  
Identify what requires `unsafe-eval` (likely `recharts` or a Radix UI component in development) and eliminate it. For Recharts, the culprit is usually its use of `new Function()` internally. Switching to `@tremor/react` or `Victory` (both CSP-safe) resolves this. Alternatively, use a strict CSP nonce via Next.js middleware.

**Estimated Effort:** Medium  
*(Auditing dependencies + potential charting library swap or nonce implementation)*

**Rationale:**  
A financial platform handling real wallet data must not carry `unsafe-eval` in production. This is a compliance issue, not a configuration preference.

**Dependencies / Risks:**  
- If Recharts is the culprit, evaluate `@tremor/react` as a drop-in replacement — it's CSP-safe and produces better-looking financial charts

---

### 3.3 — Error Boundaries for All Async Pages and Data Components
**Priority:** High

**Description:**  
There are zero React Error Boundaries in the codebase. If `AnkrChart`, `CryptoCompareDetails`, or `PhantomWallet` throws — from a network error, a malformed API response, or an unexpected `null` — the entire page crashes with a white screen. In a financial app where data is inherently unreliable, this is unacceptable.

**Proposed Solution:**  
Wrap every async data component in a combination of Next.js's built-in `error.tsx` boundary files (for page-level errors) and a reusable `<DataBoundary>` client component for component-level errors.

```tsx
// components/ui/DataBoundary.tsx
'use client';
import { Component, type ReactNode } from 'react';

export class DataBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError
      ? (this.props.fallback ?? <p className="text-sm text-red-400">Failed to load data.</p>)
      : this.props.children;
  }
}
```

Add `app/trading/error.tsx`, `app/tokens/[symbol]/error.tsx`, etc. for page-level boundaries.

**Estimated Effort:** Small  
**Rationale:** This is not optional for a production financial app. A single malformed API response should never crash the entire page.  
**Innovation Angle:** Pair with `Suspense` boundaries to enable streaming HTML — the page shell renders instantly while data loads in parallel, with graceful fallbacks if anything fails.

---

### 3.4 — Proxy `CryptoCompare` Calls Through a Server Route
**Priority:** High

**Description:**  
`CryptoCompareDetails.tsx` calls `https://min-api.cryptocompare.com` directly from the browser using `axios`. This exposes the CryptoCompare endpoint to the client (a future API key would be leaked), bypasses the app's server-side caching, and fires a cross-origin request that CSP may block. It is the only data source not proxied through the app's API layer.

**Proposed Solution:**  
Add `/api/cryptocompare/history/route.ts` following the same pattern as the existing Birdeye proxy. Move the API call server-side, add `next: { revalidate: 300 }` caching, and remove `axios` from this component entirely.

**Estimated Effort:** Small  
**Rationale:** Consistency with the rest of the architecture, plus eliminates client-side exposure of a third-party endpoint. Also removes one `axios` usage, moving toward axios elimination (see task 4.3).  
**Dependencies / Risks:**  
- CryptoCompare free tier has rate limits — server-side caching makes these manageable

---

## 4. Minor Fixes & Code Elegance Improvements

---

### 4.1 — Replace `any` Types with Proper Interfaces
**Priority:** Medium

**Description:**  
Six `any` type usages were found across the codebase. The most impactful are the Recharts tooltip callbacks, which appear in `CryptoCompareDetails.tsx`, `AnkrChart.tsx`, and `FeaturedCrypto.tsx`.

**Proposed Solution:**  
```ts
// Before
const CustomTooltip = ({ active, payload }: any) => { ... }

// After
interface TooltipPayload {
  value: number;
  name: string;
  payload: { date: string; price: number };
}
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => { ... }
```

Also: replace `} catch (e: any)` with `} catch (e: unknown)` and use `instanceof Error` narrowing.

**Estimated Effort:** Small  
**Rationale:** TypeScript is only as useful as its weakest types. These six instances are small but they create blind spots exactly where data from external APIs flows into the UI.

---

### 4.2 — Environment Variable Validation at Startup
**Priority:** Medium

**Description:**  
If `BIRDEYE_API_KEY` or `ANKR_API_KEY` is missing, the app starts normally and only fails at runtime when an API route is hit. The error message at that point gives no guidance. Startup validation catches this immediately.

**Proposed Solution:**  
```ts
// src/lib/env.ts
import { z } from 'zod';

const EnvSchema = z.object({
  SCMC_API_BASE_URL: z.string().url(),
  ANKR_API_KEY: z.string().min(10),
  BIRDEYE_API_KEY: z.string().min(10),
});

export const env = EnvSchema.parse(process.env); // throws at startup if invalid
```

Import `env` in every API route instead of `process.env` directly.

**Estimated Effort:** Small  
**Rationale:** Environment misconfiguration is the #1 cause of "works on my machine" bugs. Catching it at startup with a descriptive error eliminates an entire class of confusion.

---

### 4.3 — Remove `axios`, Standardize on Native `fetch`
**Priority:** Low

**Description:**  
`axios` is listed as a dependency but is only used in `CryptoCompareDetails.tsx`. The rest of the codebase uses `fetch`. This inconsistency adds ~13KB to the bundle for one file.

**Proposed Solution:**  
Once task 3.4 is complete (CryptoCompare proxied server-side), `axios` can be removed from `package.json` entirely. The one remaining client usage disappears.

**Estimated Effort:** Small  
**Rationale:** One fewer dependency, smaller bundle, consistent patterns across the codebase.

---

### 4.4 — Sanitize Token Icon URLs in `SearchDialog`
**Priority:** Medium

**Description:**  
`SearchDialog.tsx` renders token icons with `<img src={item.icon} />` where `icon` comes directly from the Birdeye API response. If Birdeye's CDN is ever compromised or returns a `javascript:` URI, this is an XSS vector.

**Proposed Solution:**  
Validate the icon URL before rendering:
```tsx
function isSafeUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === 'https:';
  } catch { return false; }
}

// In render:
{isSafeUrl(item.icon) && <img src={item.icon} alt={item.symbol} />}
```

Or switch to `next/image` with the Birdeye domain already in `remotePatterns`.

**Estimated Effort:** Small  
**Rationale:** Defense in depth. The Birdeye proxy already validates inputs — this closes the one gap where upstream content flows into a DOM element without inspection.

---

### 4.5 — Add API Route Fetch Timeouts
**Priority:** Medium

**Description:**  
No API route sets a timeout on its upstream fetch calls. A slow Birdeye or Ankr response will hold the connection open until the Vercel function hits its maximum execution limit, causing a poor UX and wasting compute.

**Proposed Solution:**  
Use `AbortController` with a 10-second timeout on every upstream fetch:

```ts
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10_000);

try {
  const res = await fetch(url, { signal: controller.signal });
  return await res.json();
} catch (e) {
  if (e instanceof DOMException && e.name === 'AbortError') {
    return Response.json({ error: 'Upstream timeout' }, { status: 504 });
  }
  throw e;
} finally {
  clearTimeout(timeout);
}
```

**Estimated Effort:** Small  
**Rationale:** External APIs fail. Timeouts ensure they fail fast and clean rather than slowly and expensively.

---

### 4.6 — `loading.tsx` Files for All Protected Routes
**Priority:** Low

**Description:**  
Next.js App Router supports `loading.tsx` files that stream an instant skeleton while the page's async data fetches. None exist in this project. Adding them to `/trading`, `/tokens/[symbol]`, `/wallet`, and `/investments` enables React Suspense streaming automatically.

**Proposed Solution:**  
Create minimal `loading.tsx` files using the skeleton components from task 2.1:

```tsx
// app/trading/loading.tsx
export default function TradingLoading() {
  return <TokenListSkeleton />;
}
```

**Estimated Effort:** Small  
**Rationale:** Three lines per route. Eliminates blank screens on navigation for free.  
**Innovation Angle:** `loading.tsx` + React Streaming = the page shell renders at the Edge in ~10ms while data loads in parallel. This is the TTFB breakthrough of Next.js App Router.

---

## 5. Strategic Recommendations

### Phase 1 — Harden the Foundation (Week 1–2)
Address everything that blocks production confidence:

| Task | Why First |
|---|---|
| 3.1 — Route Protection Middleware | Security baseline — non-negotiable |
| 3.1 — Zod API Validation | Closes SSRF and input risks |
| 3.2 — Fix CSP `unsafe-eval` | Financial app compliance |
| 3.3 — Error Boundaries | Prevents white-screen crashes |
| 3.4 — Proxy CryptoCompare | Architecture consistency |

### Phase 2 — Modernize the Data Layer (Week 3–4)
Unlock automatic caching, real-time updates, and the component cleanup:

| Task | Why Second |
|---|---|
| 1.4 — Unified `<TokenList>` + React Query | Highest-leverage refactor in the codebase |
| 2.1 — Skeleton Loaders | Instant DX payoff once React Query is in |
| 2.5 — Retry UI | Comes free with React Query |
| 4.2 — Env Validation | Catches config bugs in staging, not prod |

### Phase 3 — Go Live (Week 5–6)
Performance polish and streaming infrastructure:

| Task | Why Third |
|---|---|
| 1.2 — SSE Real-Time Token Feed | Makes the platform feel alive |
| 4.6 — `loading.tsx` Route Boundaries | Free streaming with zero effort |
| 2.2 — Wallet Connection Animations | Framer Motion is already installed |
| 4.3 — Remove `axios` | Clean up after phase 2 |

### Phase 4 — Legendary (Month 2+)
The features that define the platform's identity:

| Task | Why Last |
|---|---|
| 1.1 — AI Portfolio Intelligence | Requires stable data layer underneath |
| 2.4 — Prefetch on Hover | Requires stable route structure |
| 2.3 — `useTransition` Search | Polish after feature completeness |

---

### Forward-Looking Advice

**Invest in the AI layer early.** The token explorer and wallet viewer are features every crypto dashboard has. The AI intelligence layer is the moat. Once the data plumbing is solid (Phase 1–2), the jump to AI-powered portfolio insights is a week of work with the Vercel AI SDK — and it's the difference between a tool and an experience members tell their friends about.

**Treat the WordPress auth dependency as temporary.** The current architecture delegates authentication to a WordPress backend, which introduces latency and a fragile dependency. A medium-term migration to a native JWT system (or Clerk, which has a native Vercel Marketplace integration) would reduce auth latency from ~300ms to ~5ms at the Edge and eliminate the WordPress coupling entirely.

**Build the portfolio model server-side.** Right now there's no server-side representation of a member's portfolio — positions are inferred from wallet data. Defining a portfolio model (positions, cost basis, targets) server-side unlocks the AI layer, enables push notifications ("SOL just hit your target"), and opens the door to club-wide analytics.

**The design language is already strong.** The dark theme, clean typography, and component consistency are genuinely good. Don't redesign — refine. The skeleton loaders, transition animations, and micro-interactions in this list will make the existing design feel premium without touching its identity.

---

*SC Money Club is a few focused engineering sprints away from being a platform that stops feeling like "a Next.js app" and starts feeling like the thing it was always meant to be — an exclusive, intelligent, real-time window into the most exciting markets in the world.*
