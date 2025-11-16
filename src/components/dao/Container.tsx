
import { ScrollArea } from "@/components/ui/scroll-area";
import DAOProfile from "@/components/dao/Profile";
import DAOWallet from "@/components/dao/Wallet";

export default function DAOContainer() {

  return (
    <ScrollArea className="max-h-[calc(100vh-56px)] overflow-y-auto">
      <div className="flex flex-col space-y-4 p-4">
        <DAOProfile />
        <DAOWallet ethereum_address="0x04de341da572ef3fed9919fbc7a368d5b577164c" />
      </div>
    </ScrollArea>
  );
}