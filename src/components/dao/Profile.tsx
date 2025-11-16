import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Sailboat } from "lucide-react";

export default function DAOProfile() {

  return (
    <Card className="bg-black">
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-white text-lg m-0">DAO Wallet</h1>
          <div className="flex flex-row items-center gap-2">
            <Button size="icon" asChild>
              <Link href="https://app.ens.domains/scmoneyclub.eth">
                <Image src="/crypto/ens.svg" alt="ENS" className="h-4 w-4" height={16} width={16} />
              </Link>
            </Button>
            <Button size="icon" asChild>
              <Link href="https://opensea.io/scmoneyclub" target="_blank">
                <Sailboat className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-400 m-0 mb-2">Address: <span className="text-white font-mono break-all">0x04de341da572ef3fed9919fbc7a368d5b577164c</span></p>
      </CardContent>
    </Card>
  )
}