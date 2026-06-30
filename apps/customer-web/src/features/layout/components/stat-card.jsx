import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatCard({ icon: Icon, label, value, description, tone }) {
  return (
    <Card
      className={cn(
        "border-border/80",
        tone === "warning" && "border-amber-500/30 bg-amber-500/5",
        tone === "success" && "border-emerald-500/30 bg-emerald-500/5",
        tone === "danger" && "border-rose-500/30 bg-rose-500/5"
      )}
    >
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
            <Icon className="size-4 text-primary" aria-hidden />
          </span>
        ) : null}
        <CardTitle className="truncate text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{value}</p>
        {description ? <p className="mt-1 truncate text-sm text-muted-foreground">{description}</p> : null}
      </CardContent>
    </Card>
  );
}
