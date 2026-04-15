"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import Link from "next/link";

interface TradingSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface JupiterTokenItem {
  id: string;
  name: string;
  symbol: string;
  icon?: string;
  decimals?: number;
  usdPrice?: number;
}

export default function TradingSearchDialog({ open, onOpenChange }: TradingSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<JupiterTokenItem[]>([]);
  const [chain, setChain] = useState<"ethereum" | "solana">("ethereum");

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const searchTokens = async () => {
    const q = query.trim();
    if (!q) return;

    // Jupiter token search is for Solana; guard when non-Solana selected
    if (chain !== "solana") {
      setError("Jupiter token search supports Solana only");
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<JupiterTokenItem[]>("https://lite-api.jup.ag/tokens/v2/search", {
        params: { query: q },
        headers: { accept: "application/json" },
      });
      const items = Array.isArray(res.data) ? res.data : [];
      setResults(items);
      // optional debug
      // console.log("Jupiter search results", items);
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message || "Search failed"
        : "Search failed";
      setError(msg);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black text-white border border-gray-900">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>Search for tokens and market data by providing a name, symbol, token address, or market address.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 border border-gray-700 rounded-md p-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Select value={chain} onValueChange={(v) => setChain(v as "ethereum" | "solana") }>
            <SelectTrigger className="h-8 w-[130px] rounded-md border border-gray-800 bg-black px-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-700">
              <SelectValue placeholder="Chain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="solana">Solana</SelectItem>
            </SelectContent>
          </Select>
          <Input
            autoFocus
            placeholder="Type a symbol (e.g. SOL) and press Enter"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                searchTokens();
              }
            }}
          />
        </div>
        <div className="mt-3 space-y-3">
          {loading && <p className="m-0 text-sm text-gray-400">Searching…</p>}
          {error && !loading && <p className="m-0 text-sm text-red-400">{error}</p>}
          {!loading && !error && results.length > 0 && (
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-800">
              {results.slice(0, 20).map((item) => (
                <Link
                  key={item.id}
                  href={`/solana/${item.id}`}
                  className="flex items-center gap-3 py-2 hover:bg-gray-800/40 rounded px-2"
                  onClick={() => onOpenChange(false)}
                >
                  {item.icon ? (
                    <Image
                      src={item.icon}
                      alt={item.symbol}
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-full"
                      unoptimized
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-gray-700" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium truncate">{item.name}</span>
                      {typeof item.usdPrice === 'number' && (
                        <span className="text-gray-300 text-sm">${item.usdPrice.toFixed(6)}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 truncate">{item.symbol} • {item.id}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {!loading && !error && results.length === 0 && query && (
            <p className="m-0 text-sm text-gray-400">No results for &quot;{query}&quot;</p>
          )}
          {!loading && !error && !query && (
            <p className="m-0 text-sm text-gray-400">Start typing to search</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
