import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function SectorBreadthCard({ sectors, title = "Sector breadth", description = "Advances vs declines across key sectors" }) {
  if (!sectors?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardDescription>{description}</CardDescription>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {sectors.map(([name, advances, declines, change]) => {
            const total = advances + declines;
            const breadth = total ? Math.round((advances / total) * 100) : 50;
            const isUp = !String(change).startsWith("-");

            return (
              <div key={name} className="rounded-xl border border-border/80 bg-muted/30 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {advances} up · {declines} down
                    </p>
                  </div>
                  <span className={cn("flex items-center gap-1 text-xs font-semibold", isUp ? "text-up" : "text-down")}>
                    {isUp ? <TrendingUp className="size-3.5" aria-hidden /> : <TrendingDown className="size-3.5" aria-hidden />}
                    {change}
                  </span>
                </div>
                <Progress value={breadth} className="mt-3 gap-0">
                  <ProgressTrack className="h-1.5">
                    <ProgressIndicator className={isUp ? "bg-[var(--positive)]" : "bg-[var(--negative)]"} />
                  </ProgressTrack>
                </Progress>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
