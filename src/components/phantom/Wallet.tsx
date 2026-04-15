"use client";

import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { Wallet, Loader2, RefreshCw, Coins, AlertCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePhantomWalletWithConnection } from "@/hooks/usePhantomWallet";
import PhantomConnect from "@/components/phantom/Connect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PhantomWalletManageTokens from "@/components/phantom/ManageTokens";

interface TokenAccount {
  mint: string;
  amount: number;
  decimals: number;
  uiAmount: number;
  symbol?: string;
  name?: string;
}

interface WalletAsset {
  type: "SOL" | "SPL";
  balance: number;
  symbol: string;
  name: string;
  mint?: string;
  decimals?: number;
}

// Common token metadata (you can expand this or use an API)
const TOKEN_METADATA: Record<string, { symbol: string; name: string }> = {
  "So11111111111111111111111111111111111111112": { symbol: "SOL", name: "Solana" },
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": { symbol: "USDC", name: "USD Coin" },
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": { symbol: "USDT", name: "Tether" },
  "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": { symbol: "mSOL", name: "Marinade SOL" },
  "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs": { symbol: "ETH", name: "Ethereum (Wormhole)" },
};

export default function PhantomWalletAssets() {
  const { wallet, connection, isPhantomInstalled } = usePhantomWalletWithConnection();
  const [assets, setAssets] = useState<WalletAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  const fetchWalletAssets = useCallback(async () => {
    if (!wallet.publicKey || !connection) {
      setAssets([]);
      return;
    }
    // Test connection by getting version
    try {
      await connection.getVersion();
    } catch (testErr) {
      setError("Failed to connect to Solana RPC. Please check your network connection.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const assetsList: WalletAsset[] = [];
      // Fetch SOL balance
      const solBalance = await connection.getBalance(wallet.publicKey);
      const solAmount = solBalance / 1e9; // Convert lamports to SOL
      // Always show SOL balance, even if it's 0 (or very small)
      assetsList.push({
        type: "SOL",
        balance: solAmount,
        symbol: "SOL",
        name: "Solana",
      });
      // Fetch SPL token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        wallet.publicKey,
        {
          programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        }
      );
      // Process token accounts
      for (const tokenAccount of tokenAccounts.value) {
        const parsedInfo = tokenAccount.account.data.parsed?.info;
        if (!parsedInfo) continue;
        const mint = parsedInfo.mint as string;
        const tokenAmount = parsedInfo.tokenAmount;
        const uiAmount = tokenAmount.uiAmount || 0;
        // Skip zero balance tokens
        if (uiAmount === 0) continue;
        // Get token metadata
        const metadata = TOKEN_METADATA[mint] || {
          symbol: mint.slice(0, 4).toUpperCase(),
          name: `Token ${mint.slice(0, 8)}...`,
        };
        assetsList.push({
          type: "SPL",
          balance: uiAmount,
          symbol: metadata.symbol,
          name: metadata.name,
          mint: mint,
          decimals: tokenAmount.decimals,
        });
      }
      // Sort by balance (highest first)
      assetsList.sort((a, b) => b.balance - a.balance);
      setAssets(assetsList);
      // Calculate total value (simplified - in production you'd fetch real prices)
      // For now, we'll just show SOL balance as the primary value
      setTotalValue(solAmount);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch wallet assets";
      // Check if it's an RPC error (403, 429, etc.)
      const isRpcError = err instanceof Error && (
        errorMessage.includes("403") || 
        errorMessage.includes("429") || 
        errorMessage.includes("Access forbidden") ||
        errorMessage.includes("rate limit")
      );
      if (isRpcError) {
        setError(
          "RPC endpoint rate limited. Please wait a moment and try again, or consider using a custom RPC endpoint with higher rate limits."
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey, connection]);

  useEffect(() => {
    if (wallet.connected && wallet.publicKey && connection) {
      fetchWalletAssets();
    } else {
      setAssets([]);
      setTotalValue(0);
    }
  }, [wallet.connected, wallet.publicKey, connection, fetchWalletAssets]);

  const formatBalance = (balance: number, decimals: number = 9): string => {
    if (balance === 0) return "0";
    if (balance < 0.000001) return balance.toExponential(2);
    return balance.toLocaleString(undefined, {
      maximumFractionDigits: decimals > 6 ? 6 : decimals,
      minimumFractionDigits: 0,
    });
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const copyWalletAddress = async () => {
    if (!wallet.publicKey) return;
    try {
      await navigator.clipboard.writeText(wallet.publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Silently fail - user will see the copy didn't work
    }
  };

  if (!isPhantomInstalled) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Phantom Wallet Required</h2>
            <p className="text-gray-400 mb-6">
              Please install Phantom wallet to view your assets.
            </p>
            <PhantomConnect />
          </div>
        </div>
      </div>
    );
  }

  if (!wallet.connected) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 text-center">
            <Wallet className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Connect your Phantom wallet to view your Solana assets.
            </p>
            <PhantomConnect size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="p-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Wallet className="h-8 w-8 text-purple-500" />
            Wallet Assets
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWalletAssets}
            disabled={loading}
            className="bg-gray-900 border-gray-700 hover:bg-gray-800"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
        {/* Wallet Address */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-6 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
            <p className="text-white font-mono text-sm break-all">
              {wallet.publicKey?.toBase58()}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyWalletAddress}
            className="bg-gray-800 border-gray-600 hover:bg-gray-700 shrink-0"
            title="Copy wallet address"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-green-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
        {/* Total Balance */}
        {assets.length > 0 && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-400 mb-2">Total Balance</p>
            <p className="text-3xl font-bold text-white">
              {formatBalance(totalValue)} SOL
            </p>
          </div>
        )}
      </div>
      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}
      {/* Loading State */}
      {loading && assets.length === 0 && (
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-12 text-center">
          <Loader2 className="h-12 w-12 text-purple-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Loading wallet assets...</p>
        </div>
      )}
      {/* Assets List */}
      {!loading && assets.length === 0 && !error && (
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-12 text-center">
          <Coins className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No assets found</p>
          <p className="text-gray-500 text-sm">
            Your wallet doesn&apos;t have any SOL or SPL tokens.
          </p>
        </div>
      )}
      {/* Assets Grid */}
      {assets.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Wallet className="h-8 w-8 text-purple-500" />
              Tokens
            </h2>
            <Button onClick={() => setManageOpen(true)} className="bg-gray-900 border border-gray-700 hover:bg-gray-800">
              Manage Tokens
            </Button>
          </div>
          <div className="space-y-4">
            {assets.map((asset, index) => (
              <div
                key={`${asset.type}-${asset.mint || "SOL"}-${index}`}
                className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                      <Coins className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {asset.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {asset.symbol}
                        {asset.type === "SPL" && asset.mint && (
                          <span className="ml-2 text-xs">
                            ({formatAddress(asset.mint)})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">
                      {formatBalance(asset.balance, asset.decimals)}
                    </p>
                    <p className="text-sm text-gray-400">{asset.symbol}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {/* Info Footer */}
      {assets.length > 0 && (
        <div className="mt-8 bg-gray-900/30 border border-gray-700 rounded-lg p-4">
          <p className="text-xs text-gray-500 text-center">
            Token prices and values are not displayed. This is a simplified view of your wallet assets.
            {assets.filter(a => a.type === "SPL").length > 0 && (
              <span className="block mt-1">
                Some token names and symbols may be abbreviated if not found in the metadata registry.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
    {/* Manage Tokens Dialog */}
    <Dialog open={manageOpen} onOpenChange={setManageOpen}>
      <DialogContent className="bg-black text-white border border-gray-800">
        <DialogHeader>
          <DialogTitle>Manage Tokens</DialogTitle>
          <DialogDescription>Enable, disable, or reorder tokens in your wallet view.</DialogDescription>
        </DialogHeader>
        <PhantomWalletManageTokens assets={assets} onClose={() => setManageOpen(false)} />
      </DialogContent>
    </Dialog>
    </>
  );
}
