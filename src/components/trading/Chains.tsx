"use client";

import { Button } from "@/components/ui/button";
import { Coins, BadgeDollarSign } from "lucide-react";

export type ChainValue = "ethereum" | "solana";

interface TradingChainsProps {
  value: ChainValue;
  onChange: (value: ChainValue) => void;
  className?: string;
}

export default function TradingChains({ value, onChange, className }: TradingChainsProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <span className="text-xs text-gray-400">Chain:</span>
      <div className="inline-flex gap-2">
        <Button
          variant={value === "ethereum" ? "default" : "outline"}
          size="sm"
          className={value === "ethereum" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-black border-gray-800 text-gray-200"}
          onClick={() => onChange("ethereum")}
        >
          <Coins className="h-4 w-4 mr-2" /> Ethereum
        </Button>
        <Button
          variant={value === "solana" ? "default" : "outline"}
          size="sm"
          className={value === "solana" ? "bg-purple-600 hover:bg-purple-700" : "bg-black border-gray-800 text-gray-200"}
          onClick={() => onChange("solana")}
        >
          <BadgeDollarSign className="h-4 w-4 mr-2" /> Solana
        </Button>
      </div>
    </div>
  );
}