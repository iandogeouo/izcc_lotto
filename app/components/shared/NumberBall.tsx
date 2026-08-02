export function NumberBall({
  n,
  special = false,
  size = "md",
}: {
  n: number;
  special?: boolean;
  size?: "sm" | "md";
}) {
  const dimension = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";
  return (
    <span
      className={`inline-flex ${dimension} items-center justify-center rounded-full font-bold text-white ${
        special ? "bg-amber-500" : "bg-blue-600"
      }`}
    >
      {n}
    </span>
  );
}
