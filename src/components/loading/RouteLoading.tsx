import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import TradingSidebar from "@/components/trading/Sidebar";
import TradingTopbar from "@/components/trading/Topbar";
import { TokenListSkeleton } from "@/components/trading/TokenList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteLoadingProps {
  children: React.ReactNode;
  title?: string;
  chain?: string;
}

export function ProtectedRouteLoading({
  children,
  title = "Trading",
  chain,
}: ProtectedRouteLoadingProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-gray-300">
      <TradingSidebar />
      <main className="w-full min-h-screen">
        <TradingTopbar title={title} chain={chain} />
        <ScrollArea className="max-h-[calc(100vh-40px)] overflow-y-auto">
          {children}
        </ScrollArea>
      </main>
    </div>
  );
}

export function WalletSkeleton() {
  return (
    <div className="p-4">
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-gray-700 bg-gray-900/50 p-4">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-full max-w-xl" />
          </div>
          <Skeleton className="h-9 w-24 shrink-0" />
        </div>
        <div className="mb-6 rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6">
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/40 p-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="ml-auto h-5 w-20" />
              <Skeleton className="ml-auto h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TokenDetailsSkeleton() {
  return (
    <div className="p-4">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-y-3 sm:text-right">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    </div>
  );
}

export function InvestmentsSkeleton() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-gray-300">
      <Header />
      <main className="w-full pt-24">
        <section className="px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <Skeleton className="mb-6 h-[420px] w-full rounded-3xl" />
          </div>
        </section>
        <section className="px-4 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col items-center text-center">
              <Skeleton className="mb-5 h-12 w-72" />
              <Skeleton className="mb-3 h-5 w-full max-w-3xl" />
              <Skeleton className="h-5 w-full max-w-2xl" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-gray-800 bg-gray-900/40 p-8">
                  <Skeleton className="mb-6 h-12 w-12 rounded-xl" />
                  <Skeleton className="mb-3 h-6 w-40" />
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export { TokenListSkeleton };
