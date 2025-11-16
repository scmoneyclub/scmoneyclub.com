
export const formatUsd = (n?: number | null, digits = 2) =>
  typeof n === "number" ? `$${n.toLocaleString(undefined, { maximumFractionDigits: digits })}` : "—";

export const formatPercent = (n?: number | null) =>
  typeof n === "number" ? `${n.toFixed(2)}%` : "—";

export const formatTime = (unix?: number | null) =>
  typeof unix === "number" && unix > 0 ? new Date(unix * 1000).toLocaleString() : "—";
