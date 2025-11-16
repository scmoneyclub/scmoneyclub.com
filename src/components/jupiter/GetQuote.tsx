"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";

const JUP_BASE_URL = "https://quote-api.jup.ag";

interface JupiterRouteStep {
  label?: string;
  mint?: string;
}

interface JupiterQuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  slippageBps: number;
  platformFee?: { amount: string; bps: number } | null;
  priceImpactPct?: string;
  routePlan?: JupiterRouteStep[];
  contextSlot?: number;
}

interface JupiterGetQuoteProps {
  inputMint: string;
  outputMint: string;
  /**
   * Amount in the smallest unit (e.g., lamports for SOL, 6-decimals for USDC)
   */
  amount: string | number;
  slippageBps?: number;
  /**
   * Enable/disable auto refresh. Default false.
   */
  autoRefresh?: boolean;
  /**
   * Auto-refresh interval in ms when autoRefresh is true.
   */
  autoRefreshMs?: number;
  className?: string;
}

export default function JupiterGetQuote({
  inputMint,
  outputMint,
  amount,
  slippageBps = 50,
  autoRefresh = false,
  autoRefreshMs = 5000,
  className,
}: JupiterGetQuoteProps) {
  const [quote, setQuote] = useState<JupiterQuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(
    () => ({ inputMint, outputMint, amount: String(amount), slippageBps }),
    [inputMint, outputMint, amount, slippageBps]
  );

  async function fetchQuote() {
    if (!query.inputMint || !query.outputMint || !query.amount) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<JupiterQuoteResponse>(`${JUP_BASE_URL}/v6/quote`, {
        params: query,
        headers: { accept: "application/json" },
      });
      setQuote(res.data);
    } catch (e: any) {
      const msg = (e?.response?.data as { message?: string } | undefined)?.message || "Failed to load quote";
      setError(msg);
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuote();
    if (!autoRefresh || !autoRefreshMs || autoRefreshMs <= 0) return;
    const id = setInterval(fetchQuote, autoRefreshMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.inputMint, query.outputMint, query.amount, query.slippageBps, autoRefresh, autoRefreshMs]);

  return (
    <div className={`rounded-lg border border-gray-800 bg-gray-900/40 p-4 text-gray-200 ${className ?? ""}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white m-0">Jupiter Quote</h3>
        {loading && <span className="text-xs text-gray-400">Loading…</span>}
      </div>

      <div className="text-xs text-gray-400 mb-3">
        <p className="m-0">Input: <span className="text-white">{inputMint}</span></p>
        <p className="m-0">Output: <span className="text-white">{outputMint}</span></p>
        <p className="m-0">Amount (smallest unit): <span className="text-white">{String(amount)}</span></p>
        <p className="m-0">Slippage (bps): <span className="text-white">{slippageBps}</span></p>
      </div>

      {error && <p className="text-xs text-red-400 m-0">{error}</p>}

      {!error && quote && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 m-0">Out Amount (smallest unit)</p>
              <p className="text-white m-0">{quote.outAmount}</p>
            </div>
            <div>
              <p className="text-gray-400 m-0">Min Out (slippage)</p>
              <p className="text-white m-0">{quote.otherAmountThreshold}</p>
            </div>
            <div>
              <p className="text-gray-400 m-0">Price Impact</p>
              <p className="text-white m-0">{quote.priceImpactPct ?? "—"}</p>
            </div>
            <div>
              <p className="text-gray-400 m-0">Context Slot</p>
              <p className="text-white m-0">{quote.contextSlot ?? "—"}</p>
            </div>
          </div>

          {quote.routePlan && quote.routePlan.length > 0 && (
            <div>
              <p className="text-gray-400 text-sm m-0 mb-2">Route Plan</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {quote.routePlan.map((step, idx) => (
                  <li key={idx} className="text-gray-300">
                    <span className="text-white">{step.label ?? "Step"}</span>
                    {step.mint ? <span className="text-gray-400"> – {step.mint}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
