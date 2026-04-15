import { streamText, tool, convertToModelMessages, stepCountIs, gateway } from "ai";
import { z } from "zod";
import type { UIMessage } from "ai";

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "";
const ANKR_API_KEY = process.env.ANKR_API_KEY || "";
const ANKR_ENDPOINT = `https://rpc.ankr.com/multichain/${encodeURIComponent(ANKR_API_KEY)}`;
const BIRDEYE_BASE = "https://public-api.birdeye.so";

const SYSTEM_PROMPT = `You are an expert portfolio analyst and investment advisor for SC Money Club — an exclusive, invite-only investment community for serious crypto investors.

Your role is to deliver sharp, actionable intelligence — not generic commentary. Think like a seasoned fund manager who has access to live on-chain data.

When answering questions:
- Always fetch live data using the available tools before commenting on prices, volumes, or market metrics
- Be specific: quote exact prices, percentages, market caps, and volumes from tool results
- Surface non-obvious signals: RSI context, liquidity depth, unusual volume patterns, price vs. 24h range
- Keep responses concise and high-signal — no filler, no disclaimers, no unnecessary caveats
- Format your response in clean markdown with headers, bullets, and bold for key metrics

Available tools:
- getTokenPrice: Get the current price and 24h change for any token by contract address
- getTokenOverview: Get full market data (MC, volume, liquidity, price history) for a token
- getTopTokens: Get the top-performing tokens on Solana or Ethereum by market cap or volume

Always use tools to fetch real data before making any claims. If a user asks about a specific token, fetch its data first. If they ask for a market overview, fetch the top tokens.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    // Routes through Vercel AI Gateway — OIDC auth (VERCEL_OIDC_TOKEN) provisioned
    // automatically on Vercel deployments or via `vercel env pull` locally.
    model: gateway("anthropic/claude-sonnet-4.6"),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    stopWhen: stepCountIs(8),
    tools: {
      getTokenPrice: tool({
        description:
          "Get the current price and 24h change for a token. Use this whenever the user asks about a specific token's price.",
        inputSchema: z.object({
          address: z
            .string()
            .describe("The token contract address (Solana base58 or Ethereum 0x hex)"),
          chain: z
            .enum(["solana", "ethereum", "arbitrum", "bsc", "polygon"])
            .default("solana")
            .describe("The blockchain network"),
        }),
        execute: async ({ address, chain }) => {
          try {
            const url = `${BIRDEYE_BASE}/defi/price?address=${encodeURIComponent(address)}&ui_amount_mode=raw`;
            const res = await fetch(url, {
              headers: {
                accept: "application/json",
                "x-chain": chain,
                "x-api-key": BIRDEYE_API_KEY,
              },
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
              return { error: `Birdeye returned: ${data.message || res.statusText}` };
            }
            return {
              address,
              chain,
              price: data.data?.value ?? null,
              priceChange24h: data.data?.priceChange24h ?? null,
              updateUnixTime: data.data?.updateUnixTime ?? null,
            };
          } catch {
            return { error: "Failed to fetch token price from Birdeye." };
          }
        },
      }),

      getTokenOverview: tool({
        description:
          "Get comprehensive market data for a token: name, symbol, price, market cap, 24h volume, liquidity, and price history. Use for deep-dives on specific tokens.",
        inputSchema: z.object({
          address: z
            .string()
            .describe("The token contract address (Solana base58 or Ethereum 0x hex)"),
          chain: z
            .enum(["solana", "ethereum", "arbitrum", "bsc", "polygon"])
            .default("solana")
            .describe("The blockchain network"),
        }),
        execute: async ({ address, chain }) => {
          try {
            const url = `${BIRDEYE_BASE}/defi/token_overview?address=${encodeURIComponent(address)}&ui_amount_mode=scaled`;
            const res = await fetch(url, {
              headers: {
                accept: "application/json",
                "x-chain": chain,
                "x-api-key": BIRDEYE_API_KEY,
              },
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
              return { error: `Birdeye returned: ${data.message || res.statusText}` };
            }
            const d = data.data ?? {};
            return {
              address,
              chain,
              name: d.name,
              symbol: d.symbol,
              price: d.price,
              mc: d.mc,
              realMc: d.realMc,
              v24hUSD: d.v24hUSD,
              v24hChangePercent: d.v24hChangePercent,
              liquidity: d.liquidity,
              priceChange1hPercent: d.priceChange1hPercent,
              priceChange4hPercent: d.priceChange4hPercent,
              priceChange24hPercent: d.priceChange24hPercent,
              holder: d.holder,
              supply: d.supply,
            };
          } catch {
            return { error: "Failed to fetch token overview from Birdeye." };
          }
        },
      }),

      getTopTokens: tool({
        description:
          "Get a ranked list of the top tokens on a given chain. Use for market overviews, trend spotting, or when the user wants to know what's moving.",
        inputSchema: z.object({
          chain: z
            .enum(["solana", "ethereum", "arbitrum", "bsc", "polygon"])
            .default("solana")
            .describe("The blockchain to scan"),
          sortBy: z
            .enum(["mc", "v24hUSD", "priceChange24hPercent"])
            .default("mc")
            .describe("Sort by: mc=market cap, v24hUSD=24h volume, priceChange24hPercent=24h price change"),
          limit: z
            .number()
            .int()
            .min(1)
            .max(20)
            .default(10)
            .describe("Number of tokens to return (max 20)"),
        }),
        execute: async ({ chain, sortBy, limit }) => {
          try {
            const url = `${BIRDEYE_BASE}/defi/tokenlist?sort_by=${encodeURIComponent(sortBy)}&sort_type=desc&offset=0&limit=${limit}&min_liquidity=100000&ui_amount_mode=scaled`;
            const res = await fetch(url, {
              headers: {
                accept: "application/json",
                "x-chain": chain,
                "x-api-key": BIRDEYE_API_KEY,
              },
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
              return { error: `Birdeye returned: ${data.message || res.statusText}` };
            }
            const tokens = (data.data?.tokens ?? []).map(
              (t: {
                address: string;
                name: string;
                symbol: string;
                price: number;
                mc: number;
                v24hUSD: number;
                priceChange24hPercent: number;
                liquidity: number;
              }) => ({
                address: t.address,
                name: t.name,
                symbol: t.symbol,
                price: t.price,
                mc: t.mc,
                v24hUSD: t.v24hUSD,
                priceChange24hPercent: t.priceChange24hPercent,
                liquidity: t.liquidity,
              })
            );
            return { chain, sortBy, tokens };
          } catch {
            return { error: "Failed to fetch token list from Birdeye." };
          }
        },
      }),

      getWalletBalance: tool({
        description:
          "Get the token balances for a Solana or EVM wallet address. Use when the user asks about their holdings or portfolio value.",
        inputSchema: z.object({
          walletAddress: z.string().describe("The wallet address to query"),
          blockchain: z
            .enum(["solana", "eth", "bsc", "polygon_pos", "arbitrum"])
            .default("solana")
            .describe("The blockchain network"),
        }),
        execute: async ({ walletAddress, blockchain }) => {
          try {
            const body = {
              jsonrpc: "2.0",
              method: "ankr_getAccountBalance",
              params: {
                walletAddress,
                blockchain: [blockchain],
              },
              id: 1,
            };
            const res = await fetch(ANKR_ENDPOINT, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.error) {
              return { error: data.error.message };
            }
            const assets = (data.result?.assets ?? []).map(
              (a: {
                blockchain: string;
                tokenName: string;
                tokenSymbol: string;
                balance: string;
                balanceUsd: string;
              }) => ({
                blockchain: a.blockchain,
                tokenName: a.tokenName,
                tokenSymbol: a.tokenSymbol,
                balance: a.balance,
                balanceUsd: a.balanceUsd,
              })
            );
            const totalBalanceUsd = data.result?.totalBalanceUsd ?? null;
            return { walletAddress, blockchain, assets, totalBalanceUsd };
          } catch {
            return { error: "Failed to fetch wallet balance from Ankr." };
          }
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
