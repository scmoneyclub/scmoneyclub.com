
export const formatUsd = (n?: number | null, digits = 2) =>
  typeof n === "number" ? `$${n.toLocaleString(undefined, { maximumFractionDigits: digits })}` : "—";

export const formatPercent = (n?: number | null) =>
  typeof n === "number" ? `${n.toFixed(2)}%` : "—";

export const formatTime = (unix?: number | null) =>
  typeof unix === "number" && unix > 0 ? new Date(unix * 1000).toLocaleString() : "—";

export const formatContractAddress = (addr: string, head = 6, tail = 4) => {
  if (!addr) return '';
  if (addr.length <= head + tail) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
};
