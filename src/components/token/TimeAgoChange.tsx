'use client';

import { useMemo } from 'react';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card"

export interface TimeQuote { timestamp: number; usdPrice: string };

interface TokenTimeAgoChangeProps {
  quotes: TimeQuote[]; // ascending by time, with fields timestamp (sec) and usdPrice (string)
  className?: string;
}

function findClosestAtOrBefore(quotes: TimeQuote[], targetTs: number): TimeQuote | undefined {
  // binary search could be added; linear scan is fine for small arrays
  let candidate: TimeQuote | undefined;
  for (let i = 0; i < quotes.length; i++) {
    const q = quotes[i];
    if (q.timestamp <= targetTs) {
      candidate = q; // later or equal
    } else {
      break;
    }
  }
  return candidate;
}

export default function TokenTimeAgoChange({ quotes, className }: TokenTimeAgoChangeProps) {
  const { pct1h, pct24h } = useMemo(() => {
    if (!quotes || quotes.length === 0) return { pct1h: null as number | null, pct24h: null as number | null };
    const last = quotes[quotes.length - 1];
    const lastTs = last.timestamp;
    const lastPrice = Number(last.usdPrice);
    const q1h = findClosestAtOrBefore(quotes, lastTs - 3600);
    const q24h = findClosestAtOrBefore(quotes, lastTs - 86400);
    const p1h = q1h ? Number(q1h.usdPrice) : null;
    const p24h = q24h ? Number(q24h.usdPrice) : null;
    const pct1 = p1h !== null && p1h > 0 ? ((lastPrice - p1h) / p1h) * 100 : null;
    const pct24 = p24h !== null && p24h > 0 ? ((lastPrice - p24h) / p24h) * 100 : null;
    return { pct1h: pct1, pct24h: pct24 };
  }, [quotes]);

  const fmt = (v: number | null) => (v === null ? '—' : `${v.toFixed(2)}%`);
  const cls = (v: number | null) => (v == null ? 'text-gray-400' : v >= 0 ? 'text-green-500' : 'text-red-500');

  return (
    <section className={className}>
      <div className="flex items-center gap-2 text-sm">
        <Card className="bg-black border border-gray-800">
          <CardContent className={`flex flex-col items-center ${cls(pct1h)}`}>
            <span>1H</span>
            <span>{fmt(pct1h)}</span>
          </CardContent>
        </Card>
        <Card className="bg-black border border-gray-800">
          <CardContent className={`flex flex-col items-center ${cls(pct24h)}`}>
            <span>24H</span>
            <span>{fmt(pct24h)}</span>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
