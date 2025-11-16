"use client";

import { useState } from "react";
import EthereumTokenList from "@/components/trading/EthereumTokenList";
import SolanaTokenList from "@/components/trading/SolanaTokenList";
import TradingChains, { ChainValue } from "@/components/trading/Chains";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TradingListingContainer() {
  const [chain, setChain] = useState<ChainValue>("ethereum");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-gray-900 bg-black/50 sticky top-0 z-10">
        <TradingChains value={chain} onChange={setChain} />
      </div>
      <ScrollArea className="max-h-[calc(100vh-40px)] overflow-y-auto">
        {chain === "ethereum" ? <EthereumTokenList /> : <SolanaTokenList />}
      </ScrollArea>
    </div>
  );
}