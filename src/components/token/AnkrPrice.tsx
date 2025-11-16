'use client';

import { formatUsd } from '@/utils/formats';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

interface AnkrPriceResult {
  usdPrice: string;
  blockchain: string;
  contractAddress: string;
}

interface AnkrRpcResponse {
  jsonrpc: string;
  id: number;
  result?: AnkrPriceResult;
  error?: { code: number; message: string };
}

interface TokenAnkrPriceProps {
  blockchain: 'eth' | 'bsc' | 'polygon' | 'avax' | 'fantom' | string;
  contractAddress: string;
  /** Optional: refresh interval in ms */
  autoRefreshMs?: number;
  className?: string;
}

export default function TokenAnkrPrice({
  blockchain,
  contractAddress,
  autoRefreshMs,
  className,
}: TokenAnkrPriceProps) {
  const [price, setPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_ANKR_API_KEY || '';
    return `https://rpc.ankr.com/multichain/${encodeURIComponent(key)}`;
  }, []);

  const fetchPrice = async () => {
    if (!blockchain || !contractAddress) return;
    setLoading(true);
    setError(null);
    try {
      const body = {
        jsonrpc: '2.0',
        method: 'ankr_getTokenPrice',
        params: {
          blockchain,
          contractAddress,
        },
        id: 1,
      };
      const res = await axios.post<AnkrRpcResponse>(endpoint, body, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.data.error) {
        throw new Error(res.data.error.message || 'RPC Error');
      }
      const usd = res.data.result?.usdPrice ?? null;
      setPrice(usd);
    } catch (e: any) {
      const msg = e?.message || 'Failed to load Ankr price';
      setError(msg);
      setPrice(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    if (!autoRefreshMs || autoRefreshMs <= 0) return;
    const id = setInterval(fetchPrice, autoRefreshMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockchain, contractAddress, autoRefreshMs]);

  return (
    <section className="p-4">
      <div className={`rounded-md border border-gray-800 bg-gray-900/40 p-3 text-gray-200 ${className ?? ''}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Ankr Price</span>
          {loading && <span className="text-[10px] text-gray-500">Loading…</span>}
        </div>
        <div className="text-xs text-gray-400 mb-2">
          <p className="m-0">Chain: <span className="text-white">{blockchain}</span></p>
          <p className="m-0">Contract: <span className="text-white break-all">{contractAddress}</span></p>
        </div>
        {error && <p className="text-xs text-red-400 m-0">{error}</p>}
        {!error && (
          <p className="text-sm text-white m-0">USD Price: {price ? formatUsd(Number(price), 2) : '—'}</p>
        )}
      </div>
    </section>
  );
}
