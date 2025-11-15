"use client";
import { useState, useEffect, useCallback } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

// Phantom wallet window type
interface PhantomProvider {
  isPhantom?: boolean;
  publicKey: PublicKey | null;
  isConnected: boolean;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: string, handler: (args: any) => void) => void;
  removeListener: (event: string, handler: (args: any) => void) => void;
}

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

interface UsePhantomWalletReturn {
  wallet: {
    publicKey: PublicKey | null;
    connected: boolean;
  };
  connecting: boolean;
  disconnecting: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isPhantomInstalled: boolean;
}

// Default Solana RPC endpoint (can be customized)
// Using Ankr's public RPC which has better rate limits than the official endpoint
// For mainnet, use: "https://rpc.ankr.com/solana"
// For devnet, use: "https://rpc.ankr.com/solana_devnet"
// If you have an Ankr API key, you can use: `https://rpc.ankr.com/solana/${process.env.NEXT_PUBLIC_ANKR_API_KEY}`
const DEFAULT_RPC_ENDPOINT = process.env.NEXT_PUBLIC_ANKR_SOLANA_RPC || 
  (process.env.NEXT_PUBLIC_ANKR_API_KEY 
    ? `https://rpc.ankr.com/solana/${process.env.NEXT_PUBLIC_ANKR_API_KEY}`
    : "https://rpc.ankr.com/solana");

export function usePhantomWallet(
  rpcEndpoint: string = DEFAULT_RPC_ENDPOINT
): UsePhantomWalletReturn {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);

  // Check if Phantom is installed
  useEffect(() => {
    const checkPhantom = () => {
      const provider = window.solana;
      if (provider && provider.isPhantom) {
        setIsPhantomInstalled(true);
        // Check if already connected
        if (provider.isConnected && provider.publicKey) {
          setPublicKey(provider.publicKey);
          setConnected(true);
        }
      } else {
        setIsPhantomInstalled(false);
      }
    };
    checkPhantom();
    // Check again after a short delay in case Phantom loads asynchronously
    const timeout = setTimeout(checkPhantom, 100);
    return () => clearTimeout(timeout);
  }, []);

  // Listen for account changes
  useEffect(() => {
    const provider = window.solana;
    if (!provider || !provider.isPhantom) return;
    const handleAccountChange = (newPublicKey: PublicKey | null) => {
      if (newPublicKey) {
        setPublicKey(newPublicKey);
        setConnected(true);
      } else {
        setPublicKey(null);
        setConnected(false);
      }
    };
    const handleDisconnect = () => {
      setPublicKey(null);
      setConnected(false);
    };
    // Listen for account changes
    provider.on("accountChanged", handleAccountChange);
    provider.on("disconnect", handleDisconnect);
    return () => {
      provider.removeListener("accountChanged", handleAccountChange);
      provider.removeListener("disconnect", handleDisconnect);
    };
  }, [isPhantomInstalled]);

  // Connect to Phantom wallet
  const connect = useCallback(async () => {
    const provider = window.solana;
    if (!provider || !provider.isPhantom) {
      const error = new Error("Phantom wallet is not installed. Please install it from https://phantom.app");
      setError(error);
      throw error;
    }
    setConnecting(true);
    setError(null);
    try {
      const response = await provider.connect({ onlyIfTrusted: false });
      setPublicKey(response.publicKey);
      setConnected(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to connect to Phantom wallet");
      setError(error);
      setConnected(false);
      setPublicKey(null);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, []);

  // Disconnect from Phantom wallet
  const disconnect = useCallback(async () => {
    const provider = window.solana;
    if (!provider || !provider.isPhantom) {
      setError(new Error("Phantom wallet is not installed"));
      return;
    }
    setDisconnecting(true);
    setError(null);
    try {
      await provider.disconnect();
      setPublicKey(null);
      setConnected(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to disconnect from Phantom wallet");
      setError(error);
      throw error;
    } finally {
      setDisconnecting(false);
    }
  }, []);

  return {
    wallet: {
      publicKey,
      connected,
    },
    connecting,
    disconnecting,
    error,
    connect,
    disconnect,
    isPhantomInstalled,
  };
}

// Optional: Export a hook that includes a Connection instance
export function usePhantomWalletWithConnection(
  rpcEndpoint: string = DEFAULT_RPC_ENDPOINT
) {
  const wallet = usePhantomWallet(rpcEndpoint);
  const [connection] = useState(() => new Connection(rpcEndpoint, "confirmed"));

  return {
    ...wallet,
    connection,
  };
}

