export function NumberBall({
  n,
  special = false,
  size = "md",
}: {
  n: number;
  special?: boolean;
  size?: "sm" | "md";
}) {
  const dimension = size === "sm" ? "h-8 w-8 text-sm" : "h-11 w-11 text-base";
  return (
    <span
      className={`inline-flex ${dimension} items-center justify-center rounded-full font-bold text-white shadow-sm ring-1 ring-black/5 ${
        special
          ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30"
          : "bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-600/30"
      }`}
    >
      {n}
    </span>
  );
}
