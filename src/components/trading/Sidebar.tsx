"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LineChart, Wallet, Settings, LifeBuoy, User, Coins } from "lucide-react";

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

  return (
    <aside
      className="group/sidebar sticky top-0 h-screen z-40 bg-black/80 border-r border-gray-900 backdrop-blur supports-[backdrop-filter]:bg-black/60"
    >
      <div className="flex h-full flex-col items-stretch transition-[width] duration-300 ease-out w-[64px] group-hover/sidebar:w-[220px]">
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-gray-900">
          <div className="relative h-10 w-10 shrink-0">
            <Image src="/scmc-logo.svg" alt="SCMC" fill sizes="40px" className="object-contain" />
          </div>
          <div className="overflow-hidden">
            <span className="text-white font-bold text-lg whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">SC Money Club</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`mx-2 flex items-center gap-3 rounded-md px-3 py-2 transition-colors
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
        <div className="mt-auto px-3 py-3 text-[10px] text-gray-300 text-center">
          <span className="block opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">&copy; {new Date().getFullYear()} SCMC</span>
        </div>
      </div>
    </aside>
  );
}
