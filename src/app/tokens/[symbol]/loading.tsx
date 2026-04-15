import { ProtectedRouteLoading, TokenDetailsSkeleton } from "@/components/loading/RouteLoading";

export default function TokenDetailsLoading() {
  return (
    <ProtectedRouteLoading title="Token Details">
      <TokenDetailsSkeleton />
    </ProtectedRouteLoading>
  );
}
