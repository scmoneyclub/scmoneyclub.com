import TokenList from "@/components/trading/TokenList";

interface SolanaTokenListProps {
  limit?: number;
}

export default function SolanaTokenList({ limit = 50 }: SolanaTokenListProps) {
  return <TokenList chain="solana" limit={limit} />;
}
