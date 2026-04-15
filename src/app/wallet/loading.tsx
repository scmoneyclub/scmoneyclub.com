import { ProtectedRouteLoading, WalletSkeleton } from "@/components/loading/RouteLoading";

export default function WalletLoading() {
  return (
    <ProtectedRouteLoading>
      <WalletSkeleton />
    </ProtectedRouteLoading>
  );
}
