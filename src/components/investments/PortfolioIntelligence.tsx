"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, Loader2, TrendingUp, Wallet, BarChart2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageResponse } from "@/components/ai-elements/message";
import type { UIMessage } from "ai";

// ---------------------------------------------------------------------------
// Tool activity indicator shown while the model is calling a tool
// ---------------------------------------------------------------------------
function ToolBadge({ toolName, state }: { toolName: string; state: string }) {
  const labels: Record<string, string> = {
    getTokenPrice: "Fetching price",
    getTokenOverview: "Fetching token data",
    getTopTokens: "Scanning top tokens",
    getWalletBalance: "Reading wallet",
  };
  const label = labels[toolName] ?? toolName;
  const done = state === "output-available";

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400 py-1">
      {done ? (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      ) : (
        <Loader2 className="h-3 w-3 animate-spin text-[#b28f3f]" />
      )}
      <span>{done ? `${label} ✓` : `${label}…`}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Renders a single UIMessage — iterates parts per AI SDK v6 spec.
// AI text parts are rendered through <MessageResponse> (Streamdown) so
// markdown is parsed and styled — never dangerouslySetInnerHTML.
// ---------------------------------------------------------------------------
function MessageBubble({
  message,
  isStreaming,
}: {
  message: UIMessage;
  isStreaming: boolean;
}) {
  const isUser = message.role === "user";
  const isLastAssistant = !isUser && isStreaming;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="mt-0.5 flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-[#b28f3f] to-[#7a6028] flex items-center justify-center">
          <Brain className="h-3.5 w-3.5 text-black" />
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? "order-first" : ""}`}>
        {isUser ? (
          <div className="rounded-2xl rounded-tr-sm bg-white/10 border border-white/10 px-4 py-2.5 text-sm text-gray-100">
            {message.parts
              .filter((p) => p.type === "text")
              .map((p, i) => (
                <span key={i}>{(p as { type: "text"; text: string }).text}</span>
              ))}
          </div>
        ) : (
          <div className="rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 px-4 py-3 space-y-1.5 text-sm text-gray-200">
            {message.parts.map((part, i) => {
              // Text parts — rendered through MessageResponse (Streamdown) for safe markdown
              if (part.type === "text") {
                return (
                  <MessageResponse
                    key={i}
                    isAnimating={isLastAssistant && i === message.parts.length - 1}
                    className="prose prose-invert prose-sm max-w-none
                      prose-headings:text-[#fcd770] prose-headings:font-semibold
                      prose-strong:text-[#fcd770]
                      prose-code:bg-white/10 prose-code:text-[#fcd770] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                      prose-a:text-[#b28f3f] prose-a:underline
                      prose-li:marker:text-[#b28f3f]
                      prose-hr:border-white/10"
                  >
                    {(part as { type: "text"; text: string }).text}
                  </MessageResponse>
                );
              }

              // Tool-call parts — typed as "tool-<toolName>" in AI SDK v6
              if (part.type.startsWith("tool-")) {
                const toolPart = part as { type: string; toolName: string; state: string };
                return (
                  <ToolBadge
                    key={i}
                    toolName={toolPart.toolName ?? part.type.slice(5)}
                    state={toolPart.state}
                  />
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Quick-start prompt chips
// ---------------------------------------------------------------------------
const PROMPTS = [
  {
    icon: TrendingUp,
    label: "Top Solana movers",
    text: "What are the top 10 Solana tokens by market cap right now? Highlight any with unusual 24h volume.",
  },
  {
    icon: BarChart2,
    label: "Ethereum overview",
    text: "Give me a market overview of the top Ethereum tokens. Which ones have the best 24h performance?",
  },
  {
    icon: Search,
    label: "Analyze a token",
    text: "Analyze the Solana token at address So11111111111111111111111111111111111111112 (Wrapped SOL).",
  },
  {
    icon: Wallet,
    label: "Market conditions",
    text: "What should I be watching on Solana today? Give me a high-signal summary of current market conditions.",
  },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function PortfolioIntelligence() {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/intelligence/stream" }),
  });

  const isStreaming = status === "streaming" || status === "submitted";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    sendMessage({ text });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <section className="relative py-24 px-4 bg-black">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <Brain className="w-14 h-14 text-[#b28f3f] animate-pulse" />
              <div className="absolute inset-0 bg-[#b28f3f]/20 blur-xl rounded-full" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-playfair font-semibold mb-4 bg-gradient-to-r from-white via-[#fcd770] to-white bg-clip-text text-transparent">
            AI Portfolio Intelligence
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base leading-relaxed">
            Your private analyst. Ask about any token, scan the market for opportunities, or get
            live data on your wallet — powered by real-time Solana and Ethereum data.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#b28f3f] to-transparent" />
            <div className="w-1.5 h-1.5 bg-[#b28f3f] rounded-full animate-pulse" />
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#b28f3f] to-transparent" />
          </div>
        </motion.div>

        {/* Chat container */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden"
        >
          {/* Messages area */}
          <div className="min-h-[320px] max-h-[520px] overflow-y-auto p-5 space-y-4 scroll-smooth">
            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center pt-8 pb-4 text-center"
                >
                  <p className="text-gray-500 text-sm mb-6">
                    Ask anything about the market — I have live access to token data.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                    {PROMPTS.map(({ icon: Icon, label, text }) => (
                      <button
                        key={label}
                        onClick={() => {
                          setInput(text);
                          inputRef.current?.focus();
                        }}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#b28f3f]/40 transition-all duration-200 text-left group"
                      >
                        <Icon className="h-4 w-4 text-[#b28f3f] flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                messages.map((message, idx) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isStreaming={isStreaming && idx === messages.length - 1}
                  />
                ))
              )}
            </AnimatePresence>

            {/* Typing indicator — shown while model is thinking before first token */}
            {isStreaming && messages[messages.length - 1]?.role === "user" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 justify-start"
              >
                <div className="mt-0.5 flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-[#b28f3f] to-[#7a6028] flex items-center justify-center">
                  <Brain className="h-3.5 w-3.5 text-black" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 px-4 py-3 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b28f3f] animate-bounce [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b28f3f] animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b28f3f] animate-bounce [animation-delay:300ms]" />
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Input row */}
          <div className="p-4 flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about any token, wallet, or market trend…"
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none bg-transparent text-sm text-gray-200 placeholder:text-gray-600 outline-none disabled:opacity-50 leading-relaxed py-1 max-h-32 overflow-y-auto"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              size="icon"
              className="flex-shrink-0 h-8 w-8 rounded-lg bg-[#b28f3f] hover:bg-[#fcd770] text-black disabled:opacity-30 transition-all duration-200"
            >
              {isStreaming ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </motion.div>

        <p className="text-center text-xs text-gray-600 mt-4">
          Live data via Birdeye &amp; Ankr · Responses are AI-generated and not financial advice
        </p>
      </div>
    </section>
  );
}
