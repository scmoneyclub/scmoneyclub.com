"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LineChart, Wallet, Settings, LifeBuoy, User, Coins, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/trading", label: "Trading", icon: LineChart },
  { href: "/tokens", label: "Tokens", icon: Coins },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/account", label: "Account", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/support", label: "Support", icon: LifeBuoy },
];

export default function TradingSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 sm:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      {/* Floating Mobile Sidebar Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-2 left-2 z-20 sm:hidden bg-black hover:bg-black hover:text-white border-none h-10 w-10"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      <aside
        className={`group/sidebar fixed sm:sticky top-0 left-0 sm:left-auto sm:self-start h-screen z-30 bg-black/80 border-r border-gray-900 backdrop-blur supports-[backdrop-filter]:bg-black/60 transition-transform duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}`}
      >
        <div className="flex h-full flex-col items-stretch transition-[width] duration-300 ease-out w-[64px] group-hover/sidebar:w-[220px]">
          {/* Logo */}
          <div className="flex items-center justify-start gap-2 p-2 border-b border-gray-900">
            <div className="relative h-10 w-10 shrink-0">
              <Image src="/scmc-logo.svg" alt="SCMC" fill sizes="40px" className="object-contain" />
            </div>
            <div className="overflow-hidden">
              <span className="text-white font-bold text-lg whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">SC Money Club</span>
            </div>
          </div>
          {/* Nav */}
          <nav className="flex-1 p-2">
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors
                        ${active ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-900/70 hover:text-white"}`}
                      title={label}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="whitespace-nowrap overflow-hidden opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                        {label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {/* Footer Mini Text */}
          <div className="mt-auto p-2 text-[10px] text-gray-300 text-center">
            <span className="block opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">&copy; {new Date().getFullYear()} SCMC</span>
          </div>
        </div>
      </aside>
    </>
  );
}
