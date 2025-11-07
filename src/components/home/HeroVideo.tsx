"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Bot, Coins, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <motion.section
      id="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative min-h-[500px] lg:min-h-screen flex items-center justify-center text-center overflow-hidden"
    >
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <video
          className="absolute top-1/2 left-1/2 w-full h-full object-cover"
          style={{
            transform: "translate(-50%, -50%)",
          }}
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/videos/logo-circuit-board.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/50 z-[1]" />
      </div>
      {/* Overlay Content */}
      <div className="text-white relative z-10 px-6 max-w-xl lg:max-w-2xl text-white">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-playfair font-semibold mb-4">SC Money Club</h1>
        <p className="md:text-lg md:text-xl mb-6">A private club of action takers who want the very best out of life.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <Button variant="outline" className="bg-black border-gray-600 hover:bg-blue-500 hover:border-blue-500 transition-colors flex items-center gap-2" asChild>
            <Link href="/investments/artificial-intelligence">
              <Bot size={18} />
              <span>Artificial Intelligence</span>
            </Link>
          </Button>
          <Button variant="outline" className="bg-black border-gray-600 hover:bg-orange-500 hover:border-orange-500 transition-colors flex items-center gap-2" asChild>
            <Link href="/investments/crypto">
              <Coins size={18} />
              <span>Cryptocurrency</span>
            </Link>
          </Button>
          <Button variant="outline" className="bg-black border-gray-600 hover:bg-yellow-500 hover:border-yellow-500 transition-colors flex items-center gap-2" asChild>
            <Link href="/investments/gold">
              <Gem size={18} />
              <span>Gold</span>
            </Link>
          </Button>
        </div>
      </div>
      {/* Optional dark overlay */}
      <div className="absolute inset-0 bg-black/50 z-[1]" />
    </motion.section>
  );
}
