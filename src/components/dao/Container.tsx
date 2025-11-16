
import { ScrollArea } from "@/components/ui/scroll-area";
import DAOWallet from "@/components/dao/Wallet";

export default function DAOContainer() {

  return (
    <ScrollArea className="max-h-[calc(100vh-56px)] overflow-y-auto">
      <DAOWallet ethereum_address="0x04de341da572ef3fed9919fbc7a368d5b577164c" />
    </ScrollArea>
  );
}