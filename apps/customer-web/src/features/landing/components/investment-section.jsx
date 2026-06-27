"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { DisplayHeading, Eyebrow, Reveal, SectionInner, SectionShell } from "./primitives";

const holdings = [
  { symbol: "NIFTYBEES",   label: "Nifty BeES ETF",     alloc: 42, color: "bg-[var(--fb-primary)]" },
  { symbol: "HDFCBANK",    label: "HDFC Bank Ltd.",      alloc: 28, color: "bg-[var(--fb-ink)]" },
  { symbol: "PARAGPARIKH", label: "Parag Parikh Flexi",  alloc: 18, color: "bg-[var(--fb-accent-cyan)]" },
  { symbol: "CASH",        label: "Cash & Equivalents",  alloc: 12, color: "bg-[var(--fb-mute)]/40" },
];

const features = [
  "Stocks & ETFs",
  "Mutual Funds",
  "SIP automation",
  "AMC approval flow",
];

export default function InvestmentSection() {
  return (
    <SectionShell id="invest" tone="white">
      <SectionInner>
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">

          {/* ── Portfolio card ── */}
          <Reveal delay={0.08}>
            <Card className="overflow-hidden rounded-[28px] bg-[var(--fb-ink)] text-[var(--fb-primary)] shadow-[0_24px_80px_-24px_rgba(14,15,12,0.35)]">
              <CardHeader className="border-b border-white/8 px-6 pb-4 pt-6">
                <div>
                  <CardDescription className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--fb-primary)]/55">
                    Portfolio preview
                  </CardDescription>
                  <CardTitle className="mt-3 text-[2.25rem] font-black tracking-tight text-[var(--fb-primary)] leading-none">
                    ₹2,84,120
                  </CardTitle>
                </div>
                <CardAction>
                  <Badge className="flex items-center gap-1 rounded-full border-0 bg-[var(--fb-primary)]/15 px-2.5 py-1 text-[11px] font-semibold text-[var(--fb-primary)]">
                    <TrendingUp className="size-3" aria-hidden />
                    +12.4%
                  </Badge>
                </CardAction>
              </CardHeader>

              <CardContent className="px-6 pb-6 pt-5">
                {/* Stacked allocation bar */}
                <div className="flex h-2 w-full overflow-hidden rounded-full">
                  {holdings.map((h) => (
                    <div
                      key={h.symbol}
                      className={`${h.color} h-full transition-all`}
                      style={{ width: `${h.alloc}%` }}
                      title={`${h.symbol} ${h.alloc}%`}
                    />
                  ))}
                </div>

                <Separator className="my-5 bg-white/8" />

                {/* Holdings list with individual bars */}
                <ul className="space-y-3.5">
                  {holdings.map((h) => (
                    <li key={h.symbol}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`size-2 shrink-0 rounded-full ${h.color}`} aria-hidden />
                          <span className="text-[13px] font-semibold text-[var(--fb-primary)]">
                            {h.symbol}
                          </span>
                        </div>
                        <span className="text-[13px] font-medium text-[var(--fb-primary)]/60">
                          {h.alloc}%
                        </span>
                      </div>
                      {/* Allocation bar */}
                      <div className="h-1 w-full overflow-hidden rounded-full bg-white/8">
                        <div
                          className={`h-full rounded-full ${h.color} opacity-80`}
                          style={{ width: `${h.alloc}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>

                <Separator className="my-5 bg-white/8" />

                <p className="text-[11px] font-medium text-[var(--fb-primary)]/45">
                  Demo portfolio · Values are simulated
                </p>
              </CardContent>
            </Card>
          </Reveal>

          {/* ── Text column ── */}
          <Reveal>
            <Eyebrow>Investment engine</Eyebrow>
            <DisplayHeading className="mt-4 text-4xl md:text-5xl">
              Unlock stocks, mutual funds, and SIPs after compliance — not before.
            </DisplayHeading>
            <p className="mt-6 text-lg leading-relaxed text-[var(--fb-body)]">
              Purchases debit the linked bank account in PostgreSQL, create MongoDB portfolio
              holdings, and route mutual fund orders to AMC admins for approval — mirroring
              real RTA workflows.
            </p>

            {/* Feature chips */}
            <div className="mt-6 flex flex-wrap gap-2">
              {features.map((f) => (
                <Badge
                  key={f}
                  variant="outline"
                  className="rounded-full border-[var(--fb-ink)]/12 bg-[var(--fb-canvas-soft)] px-3 py-1 text-[12px] font-medium text-[var(--fb-body)]"
                >
                  {f}
                </Badge>
              ))}
            </div>

            <Button
              asChild
              className="mt-8 h-12 gap-2 rounded-2xl bg-[var(--fb-primary)] px-6 text-base font-semibold text-[var(--fb-on-primary)] hover:bg-[var(--fb-primary-active)]"
            >
              <Link href="/dashboard">
                Explore demo dashboard
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </Reveal>
        </div>
      </SectionInner>
    </SectionShell>
  );
}
