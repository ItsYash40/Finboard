import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function rupee(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function InstrumentCard({ item, actionLabel = "View" }) {
  const isUp = item.trend !== "down";
  const priceLabel = item.type === "mutual_fund" ? `${rupee(item.nav)} NAV` : rupee(item.price);

  return (
    <Card className="group border-border/80 transition-all hover:border-primary/25 hover:shadow-md">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="font-mono text-[11px]">
            {item.symbol}
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {item.exchange}
          </Badge>
        </div>
        <CardTitle className="mt-2 line-clamp-2 text-base leading-snug">
          <Link href={`/stocks/${item.symbol}`} className="hover:text-primary">
            {item.name}
          </Link>
        </CardTitle>
        <CardDescription>{item.sector}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-1 pt-3">
        <p className="text-xl font-semibold tracking-tight tabular-nums">{priceLabel}</p>
        <div className={cn("flex items-center gap-1.5 text-sm font-medium", isUp ? "text-up" : "text-down")}>
          {isUp ? (
            <TrendingUp className="size-4 shrink-0" aria-hidden />
          ) : (
            <TrendingDown className="size-4 shrink-0" aria-hidden />
          )}
          <span>{item.change}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full gap-1.5" asChild>
          <Link href={`/stocks/${item.symbol}`}>
            {actionLabel}
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" aria-hidden />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
