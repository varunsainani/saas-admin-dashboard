import { cn } from "@/lib/utils";

export function Logo({ showText = true, className }: { showText?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M2.5 20h11L8 8.2a1 1 0 0 0-1.82 0L2.5 20Z" fill="currentColor" />
          <path d="M11 20h10.5l-4.1-8.9a1 1 0 0 0-1.82 0L11 20Z" fill="currentColor" fillOpacity="0.55" />
        </svg>
      </div>
      {showText && <span className="text-[15px] font-semibold tracking-tight">Vantage</span>}
    </div>
  );
}
