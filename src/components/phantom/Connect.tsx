"use client";

import { useState } from "react";
import { Wallet, LogOut, Copy, Check, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { usePhantomWallet } from "@/hooks/usePhantomWallet";

interface PhantomConnectProps {
  className?: string; // Custom className for the connect button
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"; // Button variant from shadcn UI
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"; // Button size from shadcn UI
  showAddress?: boolean; // Show wallet address when connected (default: true)
  rpcEndpoint?: string; // Custom RPC endpoint (optional)
}

export default function PhantomConnect({
  className,
  variant = "default",
  size = "default",
  showAddress = true,
  rpcEndpoint,
}: PhantomConnectProps) {
  const {
    wallet,
    connecting,
    disconnecting,
    error,
    connect,
    disconnect,
    isPhantomInstalled,
  } = usePhantomWallet(rpcEndpoint);

  const [copied, setCopied] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
      setShowDialog(true);
    } catch (err) {
      // Error is handled by the hook
      setShowDialog(true);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setShowDialog(false);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const copyAddress = () => {
    if (wallet.publicKey) {
      navigator.clipboard.writeText(wallet.publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 8) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Not installed state
  if (!isPhantomInstalled) {
    return (
      <>
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={() => setShowDialog(true)}
        >
          <Wallet className="mr-2 h-4 w-4" />
          Install Phantom
        </Button>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-black text-white border border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Phantom Wallet Not Installed
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                To connect your wallet, you need to install the Phantom browser extension.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-400 mb-4">
                Phantom is a secure wallet for Solana that allows you to manage your digital assets.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-300 mb-4">
                <li>Secure and easy to use</li>
                <li>Manage SOL and SPL tokens</li>
                <li>Connect to Solana dApps</li>
              </ul>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="bg-transparent border-gray-600 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  window.open("https://phantom.app", "_blank");
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Install Phantom
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Connected state
  if (wallet.connected && wallet.publicKey) {
    return (
      <>
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={() => setShowDialog(true)}
        >
          <Wallet className="mr-2 h-4 w-4" />
          {showAddress && formatAddress(wallet.publicKey.toBase58())}
          {!showAddress && "Wallet Connected"}
        </Button>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-black text-white border border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-purple-500" />
                Wallet Connected
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Your Phantom wallet is connected to this application.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Wallet Address
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-900 rounded-md border border-gray-700">
                  <code className="flex-1 text-sm text-gray-200 font-mono break-all">
                    {wallet.publicKey.toBase58()}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={copyAddress}
                    className="h-8 w-8 hover:bg-gray-800"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-700 rounded-md">
                  <p className="text-sm text-red-400">{error.message}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="bg-transparent border-gray-600 hover:bg-gray-800"
              >
                Close
              </Button>
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {disconnecting ? "Disconnecting..." : "Disconnect"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Not connected state
  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleConnect}
        disabled={connecting}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {connecting ? "Connecting..." : "Connect Wallet"}
      </Button>
      {error && showDialog && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-black text-white border border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Connection Error
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                {error.message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                }}
                className="bg-transparent border-gray-600 hover:bg-gray-800"
              >
                Close
              </Button>
              <Button
                onClick={handleConnect}
                disabled={connecting}
                // className="bg-gradient-to-r bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Try Again
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

