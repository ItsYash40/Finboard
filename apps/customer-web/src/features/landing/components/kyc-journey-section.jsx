"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { DisplayHeading, Eyebrow, Reveal, SectionInner, SectionShell } from "./primitives";

const journey = [
  { label: "Upload your documents", detail: "PAN & Aadhaar, just once" },
  { label: "Instant read & verify", detail: "Your details are extracted automatically" },
  { label: "Identity confirmed", detail: "Cross-checked against official records" },
  { label: "Account approved", detail: "You're cleared to invest" },
  { label: "Bank linked", detail: "₹2 test deposit, refunded in seconds" },
  { label: "Start investing", detail: "Stocks, mutual funds, SIPs" }
];

const verificationChecks = [
  { label: "Name match", status: "Matched", source: "Cross-referenced" },
  { label: "PAN verified", status: "Matched", source: "Official record" },
  { label: "Aadhaar verified", status: "Matched", source: "Official record" },
  { label: "PAN document scan", status: "Matched", source: "Document scan" },
  { label: "Aadhaar document scan", status: "Review", source: "Document scan" }
];

function CheckStatusBadge({ status }) {
  if (status === "Matched") {
    return (
      <Badge className="rounded-full border-0 bg-[var(--fb-primary-pale)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--fb-positive-deep)]">
        <CheckCircle2 className="size-3" aria-hidden />
        Matched
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="rounded-full border-[var(--fb-ink)]/15 bg-[var(--fb-canvas-soft)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--fb-body)]"
    >
      <Clock className="size-3" aria-hidden />
      Review
    </Badge>
  );
}

function AdminReviewPanel() {
  const matchedCount = verificationChecks.filter((c) => c.status === "Matched").length;

  return (
    <div className="mt-12 grid overflow-hidden rounded-[32px] bg-[#0e0f0c] sm:mt-16 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="flex flex-col justify-between gap-6 p-5 sm:gap-8 sm:p-8 md:p-10">
        <div>
          <Badge className="rounded-full border-0 bg-[var(--fb-primary)]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--fb-primary)]">
            Compliance review
          </Badge>
          <h3
            className="mt-4 text-2xl font-black leading-tight tracking-tight text-[var(--fb-primary)] sm:text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            A real person reviews your account — not just an algorithm.
          </h3>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-[var(--fb-primary)]/75">
            Our compliance team reviews your documents and identity in one secure screen — with full context —
            and approves your account in under two minutes.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {[
            { k: `${matchedCount}/5`, v: "checks passed" },
            { k: "12", v: "in queue" },
            { k: "<2 min", v: "avg review" }
          ].map((item) => (
            <div key={item.v} className="rounded-2xl border border-[var(--fb-primary)]/15 bg-[var(--fb-primary)]/8 px-4 py-3">
              <dt
                className="text-xl font-black tracking-tight text-[var(--fb-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.k}
              </dt>
              <dd className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--fb-primary)]/60">
                {item.v}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex items-stretch bg-[var(--fb-primary-pale)] p-4 dark:bg-[var(--fb-accent)] sm:p-5 md:p-7">
        <Card className="flex min-w-0 w-full flex-col rounded-[24px] border border-[var(--fb-ink)]/8 bg-card shadow-[0_20px_60px_-28px_rgba(14,15,12,0.25)]">
          <CardHeader className="gap-3 border-b border-[var(--fb-ink)]/8 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardDescription className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--fb-mute)]">
                  Review queue
                </CardDescription>
                <CardTitle
                  className="mt-1 text-lg font-black tracking-tight text-[var(--fb-ink)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Application #KYC-0041
                </CardTitle>
              </div>
              <Badge variant="outline" className="shrink-0 rounded-full border-[var(--fb-ink)]/10 text-[var(--fb-mute)]">
                In review
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="rounded-full border-0 bg-[var(--fb-primary-pale)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--fb-positive-deep)]">
                {matchedCount} matched
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full border-[var(--fb-ink)]/15 bg-[var(--fb-canvas-soft)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--fb-body)]"
              >
                1 needs review
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="min-w-0 px-0 py-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--fb-ink)]/8 hover:bg-transparent">
                  <TableHead className="h-9 pl-6 text-[10px] font-semibold uppercase tracking-wider text-[var(--fb-mute)]">
                    Check
                  </TableHead>
                  <TableHead className="hidden h-9 text-[10px] font-semibold uppercase tracking-wider text-[var(--fb-mute)] sm:table-cell">
                    Source
                  </TableHead>
                  <TableHead className="h-9 pr-6 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--fb-mute)]">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verificationChecks.map((check) => (
                  <TableRow key={check.label} className="border-[var(--fb-ink)]/6 hover:bg-[var(--fb-canvas-soft)]/50">
                    <TableCell className="py-3 pl-6 font-medium text-[var(--fb-ink)]">{check.label}</TableCell>
                    <TableCell className="hidden py-3 text-xs text-[var(--fb-mute)] sm:table-cell">
                      {check.source}
                    </TableCell>
                    <TableCell className="py-3 pr-6 text-right">
                      <CheckStatusBadge status={check.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>

          <Separator className="bg-[var(--fb-ink)]/8" />

          <CardFooter className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:px-6">
            <Button
              size="sm"
              className="h-10 flex-1 gap-1.5 rounded-2xl bg-[var(--fb-primary)] text-sm font-semibold text-[var(--fb-on-primary)] hover:bg-[var(--fb-primary-active)]"
              tabIndex={-1}
              aria-hidden
            >
              <CheckCircle2 className="size-4" aria-hidden />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-10 flex-1 gap-1.5 rounded-2xl border-[var(--fb-ink)]/12 text-sm font-semibold text-[var(--fb-ink)] hover:bg-[var(--fb-canvas-soft)]"
              tabIndex={-1}
              aria-hidden
            >
              <XCircle className="size-4" aria-hidden />
              Reject
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function KycJourneySection() {
  return (
    <SectionShell id="journey" tone="soft">
      <SectionInner>
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>KYC journey</Eyebrow>
            <DisplayHeading className="mt-4 text-4xl md:text-5xl">
              Your path from sign-up to first investment.
            </DisplayHeading>
          </Reveal>
        </div>

        <ol className="mt-10 grid gap-px overflow-hidden rounded-[28px] bg-[var(--fb-ink)]/8 sm:mt-14 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {journey.map((step, index) => (
            <Reveal key={step.label} delay={index * 0.06} as="li">
              <div className="flex h-full min-w-0 flex-col bg-card p-4 sm:p-5">
                <span className="text-xs font-semibold tabular-nums tracking-[0.22em] text-[var(--fb-mute)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 text-sm font-bold leading-snug text-[var(--fb-ink)]">{step.label}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--fb-body)]">{step.detail}</p>
                {index === journey.length - 1 ? (
                  <span className="mt-3 inline-block w-fit rounded-full bg-[var(--fb-primary)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--fb-on-primary)]">
                    Unlocked
                  </span>
                ) : null}
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.2}>
          <AdminReviewPanel />
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
