import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  color,
  className,
}: {
  name: string;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
        className,
      )}
      style={{ backgroundColor: color ?? "#6366f1" }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
