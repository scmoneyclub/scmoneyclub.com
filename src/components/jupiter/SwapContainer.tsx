
import JupiterGetQuote from "@/components/jupiter/GetQuote";

export default function JupiterSwapContainer() {

  return (
    <section className="p-4">
      <JupiterGetQuote
        inputMint="So11111111111111111111111111111111111111112"
        outputMint="63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9"
        amount={1_000_000_000} // 1 SOL in lamports
        slippageBps={50}
        autoRefresh={false}
        autoRefreshMs={5000}
      />
    </section>
  );
}
