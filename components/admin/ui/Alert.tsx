import type { LucideIcon } from "lucide-react";
import { Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertTone = "info" | "success" | "warning" | "error";

const TONE_CONFIG: Record<AlertTone, { icon: LucideIcon; classes: string; iconClass: string }> = {
  info: {
    icon: Info,
    classes: "border-status-progress/30 bg-status-progress/5",
    iconClass: "text-status-progress",
  },
  success: {
    icon: CheckCircle2,
    classes: "border-status-success/30 bg-status-success/5",
    iconClass: "text-status-success",
  },
  warning: {
    icon: AlertTriangle,
    classes: "border-status-waiting/30 bg-status-waiting/5",
    iconClass: "text-status-waiting",
  },
  error: {
    icon: XCircle,
    classes: "border-status-failure/30 bg-status-failure/5",
    iconClass: "text-status-failure",
  },
};

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Alert({ tone = "info", title, children, className }: AlertProps) {
  const { icon: Icon, classes, iconClass } = TONE_CONFIG[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-sm border p-4", classes, className)}
    >
      <Icon className={cn("h-5 w-5 shrink-0", iconClass)} aria-hidden />
      <div className="min-w-0 text-body-sm">
        {title && <p className="font-semibold text-ink">{title}</p>}
        <div className={cn(title && "mt-0.5", "text-ink-muted")}>{children}</div>
      </div>
    </div>
  );
}
