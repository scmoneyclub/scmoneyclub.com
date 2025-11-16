
import { ScrollArea } from "@/components/ui/scroll-area";
import TokenAnkrPrice from "@/components/token/AnkrPrice";
import TokenAnkrChart from "@/components/token/AnkrChart";

export default function TokenContainer({ blockchain, contract }: { blockchain: string, contract: string }) {

  return (
    <ScrollArea className="max-h-[calc(100vh-40px)] overflow-y-auto">
      <div className="flex flex-row">
        <div className="flex-1">
          <TokenAnkrChart blockchain="eth" contractAddress={contract} />
        </div>
        <div>
          <TokenAnkrPrice blockchain="eth" contractAddress={contract} />
        </div>
      </div>
    </ScrollArea>
  );
}