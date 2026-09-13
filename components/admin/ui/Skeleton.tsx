import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      role="presentation"
      {...rest}
      className={cn(
        "relative overflow-hidden rounded-xs bg-surface-sunken",
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-skeleton bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />
    </div>
  );
}
