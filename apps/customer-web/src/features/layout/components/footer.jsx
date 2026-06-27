import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Database,
  Layers,
  ScanLine,
  Server,
  Settings2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FinboardMark } from "@/components/ui/finboard-logo";

const techBadges = [
  { label: "MongoDB Auth", Icon: Database },
  { label: "PostgreSQL Banking", Icon: Server },
  { label: "OCR Assisted KYC", Icon: ScanLine }
];

const footerGroups = [
  {
    title: "Platform",
    Icon: Layers,
    links: ["Stocks", "Mutual Funds", "Banking", "KYC", "Documents"]
  },
  {
    title: "Operations",
    Icon: Settings2,
    links: ["RTA Console", "AMC Desk", "Audit Trail", "OCR Review", "Folio Records"]
  },
  {
    title: "Resources",
    Icon: BookOpen,
    links: ["Risk Disclosure", "Demo Data", "API Status", "Security", "Support"]
  }
];

function linkFor(label) {
  if (label === "Banking") return "/banking";
  if (label === "KYC") return "/kyc";
  if (label === "Documents") return "/documents";
  return "/dashboard";
}

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#0e0f0c] text-[#e8ebe6]">
      <div className="pointer-events-none h-px bg-gradient-to-r from-transparent via-[var(--fb-primary)]/30 to-transparent" aria-hidden />

      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)] lg:items-start lg:gap-16">
          {/* Brand column */}
          <section className="flex flex-col gap-5">
            <Link
              href="/dashboard"
              className="inline-flex w-fit items-center gap-2.5 transition-opacity hover:opacity-90"
            >
              <FinboardMark size={36} />
              <span className="text-lg font-black tracking-[-0.04em] text-[var(--fb-primary)]">
                Finboard
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-[#e8ebe6]/70">
              A simulated investor onboarding, KYC, banking, RTA, AMC, and market operations
              platform for learning enterprise fintech workflows.
            </p>

            <div className="flex flex-wrap gap-2">
              {techBadges.map(({ label, Icon }) => (
                <Badge
                  key={label}
                  variant="outline"
                  className="gap-1.5 rounded-full border-[#e8ebe6]/15 bg-[#e8ebe6]/5 px-3 py-1 text-[11px] font-medium text-[#e8ebe6]/85 [&>svg]:size-3"
                >
                  <Icon aria-hidden />
                  {label}
                </Badge>
              ))}
            </div>
          </section>

          {/* Nav columns */}
          <nav
            className="grid gap-10 sm:grid-cols-3 sm:gap-8"
            aria-label="Footer navigation"
          >
            {footerGroups.map(({ title, Icon, links }) => (
              <div key={title} className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--fb-primary)]/10 ring-1 ring-[var(--fb-primary)]/20">
                    <Icon className="size-3.5 text-[var(--fb-primary)]" aria-hidden />
                  </span>
                  <strong className="text-sm font-semibold text-white">{title}</strong>
                </div>

                <ul className="flex flex-col gap-2.5">
                  {links.map((label) => (
                    <li key={label}>
                      <Link
                        href={linkFor(label)}
                        className="group inline-flex items-center gap-1 text-sm text-[#e8ebe6]/70 transition-colors hover:text-[var(--fb-primary)]"
                      >
                        {label}
                        <ArrowUpRight
                          className="size-3 opacity-0 transition-all group-hover:-translate-y-px group-hover:translate-x-px group-hover:opacity-100"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>

      <Separator className="bg-[#e8ebe6]/10" />

      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-[#e8ebe6]/50 sm:flex-row sm:items-center sm:justify-between">
        <span>Finboard Simulation Suite</span>
        <span className="max-w-xl sm:text-right">
          For demo and education only. No real bank, exchange, broker, RTA, or AMC integration.
        </span>
      </div>
    </footer>
  );
}
