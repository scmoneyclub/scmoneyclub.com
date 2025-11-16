"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, Lock, Search } from "lucide-react";
import { usePhantomWallet } from "@/hooks/usePhantomWallet";
import PhantomConnect from "@/components/phantom/Connect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LoginForm from "@/components/form/Login";
import { useState } from "react";
import TradingSearchDialog from "@/components/trading/SearchDialog";

interface TradingTopbarProps {
  title?: string;
  className?: string;
}

export default function TradingTopbar({ title = "Trading", className }: TradingTopbarProps) {
  const { wallet } = usePhantomWallet();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className={`sticky top-0 z-30 w-full border-b border-gray-900 bg-black/70 backdrop-blur supports-[backdrop-filter]:bg-black/50 ${className ?? ""}`}>
        <div className="mx-auto flex h-14 items-center justify-between px-4 gap-2">
          <h1 className="text-lg font-semibold text-white m-0">{title}</h1>
          <div className="flex flex-1 items-center gap-2">
            <Button variant="outline" onClick={() => setSearchOpen(true)} className="flex-1 bg-black border-gray-700 hover:bg-gray-900 text-gray-200 inline-flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </Button>
            {/* Secure Login or Wallet (Desktop) */}
            {wallet.connected && wallet.publicKey ? (
              <div className="hidden lg:inline-flex ml-4">
                <PhantomConnect
                  variant="outline"
                  size="sm"
                  className="bg-black"
                  showAddress={true}
                />
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="bg-black ml-4 hidden lg:inline-flex flex-row items-center justify-between"
                onClick={() => setLoginDialogOpen(true)}
              >
                <Lock size={18} className="mr-1" />
                <span>Secure Login</span>
              </Button>
            )}
            <Link href="/account" aria-label="Account">
              <Button variant="outline" size="sm" className="bg-black border-gray-700 hover:bg-gray-900 text-gray-200">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <TradingSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="bg-black text-white border border-gray-700">
          <DialogHeader>
            <DialogTitle>Secure Login</DialogTitle>
            <DialogDescription>Enter your credentials to access your account.</DialogDescription>
          </DialogHeader>
          <LoginForm />
          <PhantomConnect />
          <div className="text-center">
            <p className="text-sm text-gray-300 m-0">Don't have an account? <Link href="/join" className="text-white underline">Create Account</Link></p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
