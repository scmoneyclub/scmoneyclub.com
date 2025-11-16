'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ScrollArea } from "@/components/ui/scroll-area";
import TokenAnkrPrice from "@/components/token/AnkrPrice";
import TokenAnkrChart, { AnkrPriceHistoryQuote } from "@/components/token/AnkrChart";
import TokenTimeAgoChange from "@/components/token/TimeAgoChange";

interface TokenContainerProps {
  blockchain: string;
  contract: string;
  timeRange?: string;
  interval?: string;
}

interface AnkrPriceHistoryResponse {
  jsonrpc: string;
  id: number;
  result?: {
    quotes: AnkrPriceHistoryQuote[];
  };
  error?: { code: number; message: string };
}

export default function TradingListingContainer({ blockchain, contract, time }: any) {
  // Backward compatibility with existing props
  const chain = (blockchain as string) || 'eth';
  const contractAddress = (contract as string) || '';

  const [quotes, setQuotes] = useState<AnkrPriceHistoryQuote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const endpoint = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_ANKR_API_KEY || '';
    return `https://rpc.ankr.com/multichain/${encodeURIComponent(key)}`;
  }, []);

  useEffect(() => {
    let active = true;
    const fetchHistory = async () => {
      if (!chain || !contractAddress) return;
      try {
        const body: any = {
          jsonrpc: '2.0',
          method: 'ankr_getTokenPriceHistory',
          params: { blockchain: chain, contractAddress },
          id: 1,
        };
        const res = await axios.post<AnkrPriceHistoryResponse>(endpoint, body, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.data.error) throw new Error(res.data.error.message || 'RPC Error');
        if (active) {
          setQuotes(res.data.result?.quotes ?? []);
          setError(null);
        }
      } catch (e: any) {
        if (active) {
          setError(e?.message || 'Failed to load history');
          setQuotes([]);
        }
      }
    };
    fetchHistory();
    return () => { active = false; };
  }, [endpoint, chain, contractAddress]);

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