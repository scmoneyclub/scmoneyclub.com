"use client";

import { useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface WalletAsset {
  type: "SOL" | "SPL";
  balance: number;
  symbol: string;
  name: string;
  mint?: string;
  decimals?: number;
}

export default function PhantomWalletManageTokens({
  assets,
  onClose,
}: {
  assets: WalletAsset[];
  onClose?: () => void;
}) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const a of assets) {
      const key = a.mint || a.symbol || a.name;
      initial[key] = true;
    }
    return initial;
  });

  const visibleCount = useMemo(() => Object.values(enabled).filter(Boolean).length, [enabled]);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-300">
        <p className="m-0">Toggle tokens to show/hide in your wallet list.</p>
        <p className="m-0 text-gray-500">Visible: {visibleCount} / {assets.length}</p>
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-800 rounded border border-gray-800">
        {assets.map((a) => {
          const key = a.mint || a.symbol || a.name;
          return (
            <div key={key} className="flex items-center justify-between px-3 py-2">
              <div className="min-w-0">
                <div className="text-white font-medium truncate">{a.name}</div>
                <div className="text-xs text-gray-400 truncate">{a.symbol}{a.mint ? ` • ${a.mint}` : ""}</div>
              </div>
              <Switch checked={enabled[key]} onCheckedChange={(v) => setEnabled((s) => ({ ...s, [key]: v }))} />
            </div>
          );
        })}
        {assets.length === 0 && (
          <div className="px-3 py-6 text-center text-gray-500 text-sm">No tokens to manage</div>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="bg-black border-gray-700 hover:bg-gray-900" onClick={onClose}>Close</Button>
        <Button className="bg-white text-black hover:bg-gray-100" onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}


