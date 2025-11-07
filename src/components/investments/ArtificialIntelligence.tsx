"use client";

import { motion } from "framer-motion";
import { Brain, TrendingUp, Shield, Zap, Database, Network, Mail } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

const features = [
  {
    icon: Brain,
    title: "Neural Analytics",
    description: "Advanced machine learning algorithms analyze market patterns, predict trends, and optimize portfolio performance with institutional-grade precision.",
    gradient: "from-purple-500/20 to-blue-500/20",
    border: "border-purple-500/30",
  },
  {
    icon: TrendingUp,
    title: "Predictive Intelligence",
    description: "Real-time predictive modeling identifies opportunities before market movements, giving you a strategic advantage in high-stakes investments.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
  },
  {
    icon: Shield,
    title: "Secure AI Infrastructure",
    description: "Enterprise-level security protocols protect AI-driven operations, ensuring confidentiality and compliance at every transaction point.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/30",
  },
  {
    icon: Zap,
    title: "Quantum Processing",
    description: "Ultra-fast computational systems process complex investment scenarios in milliseconds, enabling real-time decision-making capabilities.",
    gradient: "from-amber-500/20 to-yellow-500/20",
    border: "border-amber-500/30",
  },
  {
    icon: Database,
    title: "Data Synthesis",
    description: "Synthesize vast datasets from global markets, commodities, and alternative assets to create comprehensive investment intelligence.",
    gradient: "from-indigo-500/20 to-purple-500/20",
    border: "border-indigo-500/30",
  },
  {
    icon: Network,
    title: "Autonomous Networks",
    description: "Self-optimizing AI networks continuously learn and adapt, improving investment strategies through machine learning evolution.",
    gradient: "from-rose-500/20 to-pink-500/20",
    border: "border-rose-500/30",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function ArtificialIntelligence() {
  return (
    <section className="relative py-24 lg:py-32 px-4 overflow-hidden bg-black">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center mb-6"
          >
            <div className="relative">
              <Brain className="w-16 h-16 text-[#b28f3f] animate-pulse" />
              <div className="absolute inset-0 bg-[#b28f3f]/20 blur-xl rounded-full" />
            </div>
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-semibold mb-6 bg-gradient-to-r from-white via-[#fcd770] to-white bg-clip-text text-transparent">
            Artificial Intelligence
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Harnessing the power of next-generation AI to revolutionize investment strategy, 
            optimize portfolio performance, and unlock unprecedented opportunities in global markets.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#b28f3f] to-transparent" />
            <div className="w-2 h-2 bg-[#b28f3f] rounded-full animate-pulse" />
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#b28f3f] to-transparent" />
          </div>
        </motion.div>
        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative"
              >
                <div className={`
                  relative h-full p-8 rounded-2xl backdrop-blur-xl
                  bg-gradient-to-br ${feature.gradient}
                  border ${feature.border}
                  hover:border-opacity-60 transition-all duration-500
                  overflow-hidden
                  before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-500
                `}>
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%)] bg-[length:20px_20px]" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="mb-6 inline-flex p-3 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10 group-hover:border-[#b28f3f]/50 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-[#b28f3f] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="text-xl font-playfair font-semibold mb-3 text-white group-hover:text-[#fcd770] transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        {/* Bottom CTA Section
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <div className="relative max-w-4xl mx-auto p-12 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-[#b28f3f]/10 via-black/50 to-[#b28f3f]/10 border border-[#b28f3f]/30 overflow-hidden">
            <motion.div 
              className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#b28f3f]/0 via-[#b28f3f]/20 to-[#b28f3f]/0"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-playfair font-semibold mb-4 text-white">
                Intelligence-Driven Investment Strategy
              </h3>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Experience the future of investment management. Our AI-powered platform combines 
                institutional expertise with cutting-edge technology to deliver superior returns 
                while maintaining the highest standards of security and discretion.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#b28f3f] rounded-full animate-pulse" />
                  Real-time Analysis
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#b28f3f] rounded-full animate-pulse" />
                  Secure Infrastructure
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#b28f3f] rounded-full animate-pulse" />
                  Institutional Grade
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        */}
        <Button variant="outline" className="bg-black border-gray-600 hover:bg-green-500 hover:border-green-500 flex items-center gap-2 w-[fit-content] mx-auto" asChild>
          <Link href="/contact">
            <Mail size={18} />
            <span>Contact Us</span>
          </Link>
        </Button>
      </div>
    </section>
  );
}
