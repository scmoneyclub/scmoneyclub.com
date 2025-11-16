'use client';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface TokenAnkrChartProps {
  blockchain: 'eth' | 'bsc' | 'polygon' | 'avax' | 'fantom' | string;
  contractAddress: string;
  /** Optional params for history; you can expand later */
  timeRange?: string; // e.g., '24h', '7d', '30d'
  interval?: string; // e.g., 'hour', 'day'
}

interface AnkrPriceHistoryQuote {
  timestamp: number;
  blockHeight: number;
  usdPrice: string; // numeric string
}

interface AnkrPriceHistoryResponse {
  jsonrpc: string;
  id: number;
  result?: {
    quotes: AnkrPriceHistoryQuote[];
    syncStatus?: { timestamp: number; lag: string; status: string };
  };
  error?: { code: number; message: string };
}

export default function TokenAnkrChart({
  blockchain,
  contractAddress,
  timeRange,
  interval,
}: TokenAnkrChartProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<AnkrPriceHistoryQuote[]>([]);
  const [copied, setCopied] = useState(false);

  const endpoint = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_ANKR_API_KEY || '';
    return `https://rpc.ankr.com/multichain/${encodeURIComponent(key)}`;
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!blockchain || !contractAddress) return;
      setLoading(true);
      setError(null);
      try {
        const body: any = {
          jsonrpc: '2.0',
          method: 'ankr_getTokenPriceHistory',
          params: {
            blockchain,
            contractAddress,
          },
          id: 1,
        };
        if (timeRange) body.params.timeRange = timeRange;
        if (interval) body.params.interval = interval;
        const res = await axios.post<AnkrPriceHistoryResponse>(endpoint, body, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.data.error) {
          throw new Error(res.data.error.message || 'RPC Error');
        }
        const items = res.data.result?.quotes ?? [];
        setQuotes(items);
      } catch (e: any) {
        const msg = e?.message || 'Failed to load Ankr price history';
        setError(msg);
        setQuotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [endpoint, blockchain, contractAddress, timeRange, interval]);

  const chartData = useMemo(() => {
    return quotes.map((q) => {
      const dateObj = new Date(q.timestamp * 1000);
      const priceNum = Number(q.usdPrice);
      return {
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dateShort: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: priceNum,
      };
    });
  }, [quotes]);

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;
  const previousPrice = chartData.length > 1 ? chartData[chartData.length - 2].price : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? ((priceChange / previousPrice) * 100).toFixed(2) : '0.00';

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).
      format(value);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_e) {
      // no-op
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-semibold mb-2">{d.date}</p>
          <div className="space-y-1 text-xs">
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Close:</span> {formatPrice(d.price)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section>
      <div className="p-4">
        <div className="w-full space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className=" text-2xl font-bold text-white">Token Price</h2>
              <p className="text-sm">Price History</p>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <span className="truncate">Contract: <span className="text-white">{contractAddress}</span></span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 bg-black border-gray-700 hover:bg-gray-900"
                  onClick={onCopy}
                  title="Copy contract address"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <span className="sr-only">Copy</span>}
                  {!copied && <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-3xl font-bold">
                {formatPrice(currentPrice)}
              </div>
              <div className={`text-sm font-medium ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange >= 0 ? '+' : ''}
                {formatPrice(priceChange)} ({priceChangePercent}%)
              </div>
            </div>
          </div>
          {loading && (
            <div className="w-full h-[400px] flex items-center justify-center">
              <div className="text-gray-500">Loading price history…</div>
            </div>
          )}
          {error && !loading && (
            <div className="w-full h-[400px] flex items-center justify-center">
              <div className="text-red-400 text-sm">{error}</div>
            </div>
          )}
          {!loading && !error && chartData.length > 0 && (
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorAnkrPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="dateShort"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickLine={{ stroke: '#6b7280' }}
                    axisLine={{ stroke: '#6b7280' }}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickLine={{ stroke: '#6b7280' }}
                    axisLine={{ stroke: '#6b7280' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAnkrPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
