'use client';

import { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import TokenAnkrPrice from "@/components/token/AnkrPrice";
import TokenAnkrChart, { AnkrPriceHistoryQuote } from "@/components/token/AnkrChart";
import TokenTimeAgoChange from "@/components/token/TimeAgoChange";

interface AnkrPriceHistoryResponse {
  jsonrpc: string;
  id: number;
  result?: {
    quotes: AnkrPriceHistoryQuote[];
  };
  error?: { code: number; message: string };
}

interface TokenContainerProps {
  blockchain: string;
  contract: string;
}

// Proxy route keeps the Ankr API key server-side
const ANKR_PROXY = '/api/ankr';

export default function TradingListingContainer({ blockchain, contract }: TokenContainerProps) {
  const chain = blockchain || 'eth';
  const contractAddress = contract || '';

  const [quotes, setQuotes] = useState<AnkrPriceHistoryQuote[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchHistory = async () => {
      if (!chain || !contractAddress) return;
      try {
        const body = {
          jsonrpc: '2.0',
          method: 'ankr_getTokenPriceHistory',
          params: { blockchain: chain, contractAddress },
          id: 1,
        };
        const res = await fetch(ANKR_PROXY, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        const data: AnkrPriceHistoryResponse = await res.json();
        if (data.error) throw new Error(data.error.message || 'RPC Error');
        setQuotes(data.result?.quotes ?? []);
        setError(null);
      } catch (e: unknown) {
        const err = e as { name?: string; message?: string };
        if (err?.name === 'AbortError') return;
        setError(err?.message || 'Failed to load history');
        setQuotes([]);
      }
    };
    fetchHistory();
    return () => controller.abort();
  }, [chain, contractAddress]);

  return (
    <ScrollArea className="max-h-[calc(100vh-40px)] overflow-y-auto">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-row gap-4 items-start">
          <div className="flex-1 min-w-0">
            <TokenAnkrChart blockchain={chain} contractAddress={contractAddress} quotes={quotes} />
          </div>
          <div className="w-full max-w-sm space-y-2">
            <TokenAnkrPrice blockchain={chain} contractAddress={contractAddress} />
            <TokenTimeAgoChange quotes={quotes.map(q => ({ timestamp: q.timestamp, usdPrice: q.usdPrice }))} />
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
