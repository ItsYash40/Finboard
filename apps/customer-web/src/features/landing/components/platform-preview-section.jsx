"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Landmark,
  ScanText,
  Shield,
  TrendingUp,
  UserCheck,
  Wallet,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DisplayHeading, Eyebrow, Reveal, SectionInner, SectionShell } from "./primitives";

const screens = [
  {
    id: "dashboard",
    title: "Investor dashboard",
    meta: "Market watchlists + portfolio gate",
    href: "/dashboard",
    icon: BarChart3,
    badge: "Gated",
    badgeTone: "outline"
  },
  {
    id: "kyc",
    title: "KYC submission",
    meta: "PAN/Aadhaar upload flow",
    href: "/kyc",
    icon: ScanText,
    badge: "Upload",
    badgeTone: "secondary"
  },
  {
    id: "rta",
    title: "RTA review",
    meta: "Approve / reject with OCR context",
    href: "/admin/kyc",
    icon: UserCheck,
    badge: "Admin",
    badgeTone: "default"
  },
  {
    id: "banking",
    title: "Banking",
    meta: "Verify · transfer · ledger",
    href: "/banking",
    icon: Landmark,
    badge: "Live",
    badgeTone: "outline"
  }
];

function MockRow({ label, value, accent = false }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-[var(--fb-mute)]">{label}</span>
      <span className={`text-xs font-semibold ${accent ? "text-[var(--fb-positive-deep)]" : "text-[var(--fb-ink)]"}`}>
        {value}
      </span>
    </div>
  );
}

function MockBar({ w, tone = "primary" }) {
  const colors = {
    primary: "bg-[var(--fb-primary)]",
    mute: "bg-[var(--fb-canvas-soft)]",
    positive: "bg-[var(--fb-positive)]"
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--fb-canvas-soft)]">
      <div className={`h-full rounded-full ${colors[tone]}`} style={{ width: w }} />
    </div>
  );
}

function DashboardMock() {
  const holdings = [
    { name: "HDFC Bank", alloc: "32%", change: "+2.4%", w: "32%" },
    { name: "Infosys", alloc: "28%", change: "+1.1%", w: "28%" },
    { name: "Reliance", alloc: "22%", change: "-0.7%", w: "22%" },
    { name: "TCS", alloc: "18%", change: "+3.2%", w: "18%" }
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--fb-mute)]">Portfolio value</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-[var(--fb-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            ₹4,82,310
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-[var(--fb-positive)]">
            <TrendingUp className="size-3" aria-hidden /> +12.4% this month
          </p>
        </div>
        <Badge className="rounded-full border-0 bg-[var(--fb-primary-pale)] px-3 py-1 text-[var(--fb-positive-deep)]">
          KYC verified
        </Badge>
      </div>

      <Separator className="bg-[var(--fb-ink)]/6" />

      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--fb-mute)]">Holdings</p>
        {holdings.map((h) => (
          <div key={h.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--fb-ink)]">{h.name}</span>
              <span className={h.change.startsWith("+") ? "text-[var(--fb-positive)]" : "text-[var(--negative)]"}>
                {h.change}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <MockBar w={h.w} />
              </div>
              <span className="w-7 text-right text-[10px] text-[var(--fb-mute)]">{h.alloc}</span>
            </div>
          </div>
        ))}
      </div>

      <Separator className="bg-[var(--fb-ink)]/6" />
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Watchlist", value: "14 stocks", icon: BarChart3 },
          { label: "Investments", value: "3 MF SIPs", icon: Wallet }
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-[var(--fb-canvas-soft)] px-3 py-2.5">
            <item.icon className="size-3.5 text-[var(--fb-mute)]" aria-hidden />
            <p className="mt-1.5 text-sm font-bold text-[var(--fb-ink)]">{item.value}</p>
            <p className="text-[10px] text-[var(--fb-mute)]">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function KycMock() {
  const steps = [
    { label: "PAN upload", done: true },
    { label: "Aadhaar upload", done: true },
    { label: "OCR extraction", done: true },
    { label: "Identity match", active: true },
    { label: "RTA review", done: false }
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--fb-mute)]">KYC application</p>
          <p className="mt-1 text-lg font-black tracking-tight text-[var(--fb-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            Priya Menon
          </p>
        </div>
        <Badge className="rounded-full border-[var(--fb-ink)]/15 bg-[var(--fb-canvas-soft)] px-3 py-1 text-[var(--fb-body)]">
          In review
        </Badge>
      </div>

      <Separator className="bg-[var(--fb-ink)]/6" />

      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--fb-mute)]">Pipeline</p>
        {steps.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5">
            {s.done ? (
              <CheckCircle2 className="size-4 shrink-0 text-[var(--fb-positive)]" aria-hidden />
            ) : s.active ? (
              <div className="size-4 shrink-0 rounded-full border-2 border-[var(--fb-primary)] bg-[var(--fb-primary)]/20" aria-hidden />
            ) : (
              <div className="size-4 shrink-0 rounded-full border-2 border-[var(--fb-ink)]/15" aria-hidden />
            )}
            <span className={`text-sm ${s.done ? "text-[var(--fb-body)]" : s.active ? "font-semibold text-[var(--fb-ink)]" : "text-[var(--fb-mute)]"}`}>
              {s.label}
            </span>
            {s.active && (
              <span className="ml-auto rounded-full bg-[var(--fb-primary-pale)] px-2 py-0.5 text-[10px] font-semibold text-[var(--fb-positive-deep)]">
                Active
              </span>
            )}
          </div>
        ))}
      </div>

      <Separator className="bg-[var(--fb-ink)]/6" />

      <div className="rounded-2xl bg-[var(--fb-canvas-soft)] p-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--fb-mute)]">OCR result</p>
        <div className="mt-2 space-y-0.5 divide-y divide-[var(--fb-ink)]/6">
          <MockRow label="Name" value="PRIYA MENON" accent />
          <MockRow label="PAN" value="AEFPM1234K" accent />
          <MockRow label="DOB" value="12/08/1991" />
        </div>
      </div>
    </div>
  );
}

function RtaMock() {
  const checks = [
    { label: "Name match", status: "Matched" },
    { label: "PAN dataset", status: "Matched" },
    { label: "Aadhaar dataset", status: "Matched" },
    { label: "OCR PAN", status: "Matched" },
    { label: "OCR Aadhaar", status: "Review" }
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--fb-mute)]">Review queue</p>
          <p className="mt-1 text-lg font-black tracking-tight text-[var(--fb-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            Application #KYC-0041
          </p>
        </div>
        <Badge variant="outline" className="rounded-full">
          12 pending
        </Badge>
      </div>

      <Separator className="bg-[var(--fb-ink)]/6" />

      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--fb-mute)]">Verification checks</p>
        {checks.map((c) => (
          <div key={c.label} className="flex items-center justify-between rounded-xl bg-[var(--fb-canvas-soft)] px-3 py-2 text-sm">
            <span className="font-medium text-[var(--fb-ink)]">{c.label}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              c.status === "Matched"
                ? "bg-[var(--fb-primary-pale)] text-[var(--fb-positive-deep)]"
                : "bg-[var(--fb-canvas-soft)] text-[var(--fb-body)]"
            }`}>
              {c.status}
            </span>
          </div>
        ))}
      </div>

      <Separator className="bg-[var(--fb-ink)]/6" />

      <div className="flex gap-2">
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[var(--fb-primary)] px-4 py-2 text-sm font-semibold text-[var(--fb-on-primary)]" tabIndex={-1} aria-hidden>
          <CheckCircle2 className="size-4" /> Approve
        </button>
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-[var(--fb-ink)]/12 bg-card px-4 py-2 text-sm font-semibold text-[var(--fb-ink)]" tabIndex={-1} aria-hidden>
          <XCircle className="size-4" /> Reject
        </button>
      </div>
    </div>
  );
}

function BankingMock() {
  const txns = [
    { label: "Penny drop verify", amount: "-₹2.00", tag: "Debit", positive: false },
    { label: "Auto refund", amount: "+₹2.00", tag: "Credit", positive: true },
    { label: "SIP — HDFC MF", amount: "-₹5,000", tag: "Debit", positive: false },
    { label: "Dividend credit", amount: "+₹312", tag: "Credit", positive: true }
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--fb-mute)]">Demo ledger</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-[var(--fb-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            ₹1,24,802
          </p>
          <p className="mt-0.5 text-xs text-[var(--fb-mute)]">Available balance · DEMO</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--fb-primary-pale)]">
          <Shield className="size-5 text-[var(--fb-positive-deep)]" aria-hidden />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Transfer", icon: CreditCard },
          { label: "Statements", icon: FileText }
        ].map((a) => (
          <div key={a.label} className="flex items-center gap-2 rounded-2xl border border-[var(--fb-ink)]/8 px-3 py-2.5">
            <a.icon className="size-4 text-[var(--fb-mute)]" aria-hidden />
            <span className="text-sm font-medium text-[var(--fb-ink)]">{a.label}</span>
          </div>
        ))}
      </div>

      <Separator className="bg-[var(--fb-ink)]/6" />

      <div className="space-y-0.5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--fb-mute)]">Recent transactions</p>
        {txns.map((t) => (
          <div key={t.label} className="flex flex-wrap items-center justify-between gap-2 py-1.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                t.positive
                  ? "bg-[var(--fb-primary-pale)] text-[var(--fb-positive-deep)]"
                  : "bg-[var(--fb-canvas-soft)] text-[var(--fb-mute)]"
              }`}>
                {t.tag}
              </span>
              <span className="truncate text-xs text-[var(--fb-ink)]">{t.label}</span>
            </div>
            <span className={`shrink-0 text-xs font-semibold ${t.positive ? "text-[var(--fb-positive)]" : "text-[var(--fb-ink)]"}`}>
              {t.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const MOCKS = {
  dashboard: DashboardMock,
  kyc: KycMock,
  rta: RtaMock,
  banking: BankingMock
};

export default function PlatformPreviewSection() {
  const [active, setActive] = useState("dashboard");
  const reduce = useReducedMotion();
  const activeScreen = screens.find((s) => s.id === active);
  const MockComponent = MOCKS[active];

  return (
    <SectionShell tone="white">
      <SectionInner>
        <Reveal>
          <Eyebrow>Platform preview</Eyebrow>
          <DisplayHeading className="mt-4 max-w-2xl text-4xl md:text-5xl">
            Skip the slide deck — walk through the live product.
          </DisplayHeading>
        </Reveal>

        <Reveal delay={0.1}>
          <Tabs value={active} onValueChange={setActive} className="mt-8 min-w-0 sm:mt-12">
            <TabsList className="relative z-10 mb-0 grid w-full grid-cols-2 gap-2 rounded-none bg-transparent p-0 !h-auto group-data-horizontal/tabs:h-auto sm:flex sm:flex-wrap">
              {screens.map((screen) => {
                const Icon = screen.icon;
                return (
                  <TabsTrigger
                    key={screen.id}
                    value={screen.id}
                    className={[
                      "group flex h-auto min-w-0 items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-semibold transition-all duration-200 sm:flex-1 sm:gap-2.5 sm:px-4 sm:py-3 sm:text-sm",
                      "data-active:border-[var(--fb-ink)] data-active:bg-[var(--fb-ink)] data-active:text-[var(--fb-primary)]",
                      "border-[var(--fb-ink)]/10 bg-[var(--fb-canvas-soft)] text-[var(--fb-body)]",
                      "hover:border-[var(--fb-ink)]/25 hover:text-[var(--fb-ink)]",
                      "after:hidden"
                    ].join(" ")}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    <span className="hidden sm:inline">{screen.title}</span>
                    <span className="sm:hidden">{screen.title.split(" ")[0]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="mt-4 min-w-0 overflow-hidden rounded-[24px] border border-[var(--fb-ink)]/8 bg-card shadow-[0_16px_60px_-24px_rgba(14,15,12,0.14)] sm:rounded-[28px]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--fb-ink)]/8 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <div className="flex gap-1.5" aria-hidden>
                    <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
                    <span className="size-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="hidden h-5 w-px bg-[var(--fb-ink)]/10 sm:block" aria-hidden />
                  <div className="hidden items-center gap-1.5 sm:flex">
                    <span className="text-[10px] text-[var(--fb-mute)]">finboard.app</span>
                    <ChevronRight className="size-3 text-[var(--fb-mute)]" aria-hidden />
                    <span className="text-[10px] font-medium text-[var(--fb-body)]">
                      {activeScreen?.href}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full border-[var(--fb-ink)]/10 text-[var(--fb-mute)]"
                  >
                    Demo mode
                  </Badge>
                  <span className="flex items-center gap-1 text-[10px] text-[var(--fb-positive)]">
                    <span className="relative flex size-1.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--fb-positive)]/60" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-[var(--fb-positive)]" />
                    </span>
                    Live
                  </span>
                </div>
              </div>

              <div className="grid min-w-0 gap-0 lg:grid-cols-[1fr_1.1fr]">
                <div className="flex min-w-0 flex-col justify-between gap-5 border-b border-[var(--fb-ink)]/8 p-4 sm:gap-6 sm:p-6 lg:border-b-0 lg:border-r md:p-8">
                  <div>
                    <div className="flex items-center gap-2">
                      {activeScreen && (
                        <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--fb-canvas-soft)]">
                          <activeScreen.icon className="size-4.5 text-[var(--fb-ink-deep)]" aria-hidden />
                        </div>
                      )}
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--fb-mute)]">
                        Live route
                      </p>
                    </div>
                    <h3
                      className="mt-4 text-xl font-black tracking-tight text-[var(--fb-ink)] sm:text-2xl md:text-3xl"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {activeScreen?.title}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-[var(--fb-body)]">
                      {activeScreen?.meta}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <Link
                      href={activeScreen?.href ?? "/"}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#0e0f0c] px-5 py-2.5 text-sm font-semibold text-[var(--fb-primary)] transition-opacity hover:opacity-90 sm:h-auto sm:w-auto"
                    >
                      Open screen
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                    <span className="text-center text-xs text-[var(--fb-mute)] sm:text-left">No sign-up needed</span>
                  </div>
                </div>

                <div className="min-w-0 overflow-x-auto p-4 sm:p-6 md:p-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <MockComponent />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </Tabs>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
