import TokenList from "@/components/trading/TokenList";

interface TradingEthereumTokenListProps {
  limit?: number;
}

export default function EthereumTokenList({ limit = 50 }: TradingEthereumTokenListProps) {
  return <TokenList chain="ethereum" limit={limit} />;
}
