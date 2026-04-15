import { ProtectedRouteLoading, TokenListSkeleton } from "@/components/loading/RouteLoading";

export default function TradingLoading() {
  return (
    <ProtectedRouteLoading>
      <TokenListSkeleton />
    </ProtectedRouteLoading>
  );
}
