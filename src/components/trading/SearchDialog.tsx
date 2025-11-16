"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import axios from "axios";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface TradingSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TradingSearchDialog({ open, onOpenChange }: TradingSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
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
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const url = `https://public-api.birdeye.so/defi/v3/search?chain=${encodeURIComponent(
        chain
      )}&target=all&search_mode=exact&search_by=symbol&sort_by=volume_24h_usd&sort_type=desc&offset=0&limit=20&ui_amount_mode=scaled&keyword=${encodeURIComponent(
        query.trim()
      )}`;
      const res = await axios.get(url, {
        headers: {
          accept: "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_BIRDEYE_API_KEY,
        },
      });
      const items = (res.data?.data?.items ?? res.data?.data ?? res.data?.items ?? []) as any[];
      setResults(items);
    } catch (e: any) {
      const msg = (e?.response?.data as { message?: string } | undefined)?.message || "Search failed";
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
            placeholder="Type a symbol (e.g. SOL, ETH) and press Enter"
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
        <div className="text-sm text-gray-400">
          {loading ? (
            <p className="m-0">Searching…</p>
          ) : error ? (
            <p className="m-0 text-red-400">{error}</p>
          ) : results.length > 0 ? (
            <p className="m-0">Found {results.length} result(s).</p>
          ) : query ? (
            <p className="m-0">No results yet. Press Enter to search.</p>
          ) : (
            <p className="m-0">Start typing to search</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
