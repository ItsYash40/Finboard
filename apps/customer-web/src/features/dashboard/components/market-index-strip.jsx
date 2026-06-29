import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function MarketIndexStrip({ indices }) {
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-3 pb-1">
        {indices.map(([name, value, change]) => {
          const isUp = !String(change).startsWith("-");

          return (
            <Card key={name} size="sm" className="min-w-[148px] shrink-0 border-border/80 bg-muted/20">
              <CardContent className="space-y-1 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{name}</p>
                <p className="text-base font-semibold tabular-nums">{value}</p>
                <p className={cn("flex items-center gap-1 text-xs font-medium", isUp ? "text-up" : "text-down")}>
                  {isUp ? <TrendingUp className="size-3.5" aria-hidden /> : <TrendingDown className="size-3.5" aria-hidden />}
                  {change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
