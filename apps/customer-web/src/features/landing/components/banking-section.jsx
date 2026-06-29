"use client";

import { ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react";
import { DisplayHeading, Eyebrow, Reveal, SectionInner, SectionShell } from "./primitives";

export default function BankingSection() {
  return (
    <SectionShell id="banking" tone="pale">
      <SectionInner>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-start">
          <Reveal>
            <Eyebrow>Bank account linking</Eyebrow>
            <DisplayHeading className="mt-4 text-4xl md:text-5xl">
              Your bank, linked in seconds — with full peace of mind.
            </DisplayHeading>
            <p className="mt-6 text-lg leading-relaxed text-[var(--fb-body)]">
              We verify your bank account with a small ₹2 test deposit, automatically refunded within seconds —
              so every future investment is debited from exactly the right account.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-[24px] border border-[var(--fb-ink)]/10 bg-card p-4 sm:rounded-[28px] sm:p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-[var(--fb-mute)]">Your linked account</p>
                  <p className="mt-1 text-xl font-black text-[var(--fb-ink)] sm:text-2xl">₹48,234.50</p>
                </div>
                <span className="shrink-0 rounded-full bg-[var(--fb-primary-pale)] px-3 py-1 text-xs font-semibold text-[var(--fb-positive-deep)]">
                  Verified
                </span>
              </div>

              <div className="mt-6 space-y-3 sm:mt-8">
                {[
                  { icon: ArrowDownLeft, label: "Verification debit", amount: "- ₹2.00", tone: "neutral" },
                  { icon: RefreshCw, label: "Auto refund", amount: "+ ₹2.00", tone: "positive" },
                  { icon: ArrowUpRight, label: "Mutual fund purchase", amount: "- ₹5,000", tone: "neutral" }
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--fb-canvas-soft)] px-3 py-3 sm:px-4"
                  >
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                      <row.icon className="size-4 shrink-0 text-[var(--fb-ink-deep)]" aria-hidden />
                      <span className="truncate text-sm font-medium text-[var(--fb-ink)]">{row.label}</span>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-bold ${
                        row.tone === "positive" ? "text-[var(--fb-positive-deep)]" : "text-[var(--fb-ink)]"
                      }`}
                    >
                      {row.amount}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-xs leading-relaxed text-[var(--fb-mute)]">
                Your ₹2 verification deposit is refunded automatically — usually within 30 seconds of linking.
              </p>
            </div>
          </Reveal>
        </div>
      </SectionInner>
    </SectionShell>
  );
}
