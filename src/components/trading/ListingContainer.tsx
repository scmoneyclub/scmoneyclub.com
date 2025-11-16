
import EthereumTokenList from "@/components/trading/EthereumTokenList";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ListingContainer() {

  return (
    <ScrollArea className="max-h-[100vh] overflow-y-auto">
      <EthereumTokenList />
    </ScrollArea>
  )
}