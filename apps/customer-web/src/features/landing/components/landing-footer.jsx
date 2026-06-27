"use client";

import Link from "next/link";
import { FinboardMark } from "@/components/ui/finboard-logo";
import { navLinks } from "../data/content";

const productLinks = [
  { href: "/signup", label: "Sign up" },
  { href: "/signin", label: "Sign in" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/admin/login", label: "Admin" },
];

export default function LandingFooter() {
  return (
    <footer className="overflow-hidden bg-[#0e0f0c]">
      <div
        className="pointer-events-none h-px bg-gradient-to-r from-transparent via-[var(--fb-primary)]/30 to-transparent"
        aria-hidden
      />

      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-5 sm:py-14 md:px-8">
        {/* Brand */}
        <div className="border-b border-[var(--fb-primary)]/10 pb-8 sm:pb-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <FinboardMark size={32} />
            <span className="text-xl font-black tracking-tight text-[var(--fb-primary)] sm:text-2xl">
              Finboard
            </span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#e8ebe6]/75">
            From identity verification to your first investment — Finboard gives you a fast, secure,
            and fully auditable path to the markets.
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 pt-8 sm:gap-10 sm:pt-10 md:grid-cols-[1fr_1fr] md:gap-16 lg:max-w-xl lg:justify-items-start">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--fb-primary)]/60">
              Explore
            </p>
            <ul className="mt-3 space-y-1 sm:mt-4 sm:space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block py-1.5 text-sm text-[#e8ebe6]/80 transition-colors duration-200 hover:text-[var(--fb-primary)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--fb-primary)]/60">
              Product
            </p>
            <ul className="mt-3 space-y-1 sm:mt-4 sm:space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block py-1.5 text-sm text-[#e8ebe6]/80 transition-colors duration-200 hover:text-[var(--fb-primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--fb-primary)]/10">
        <p className="mx-auto max-w-[1200px] px-4 py-5 text-center text-[11px] leading-relaxed text-[#e8ebe6]/50 sm:px-5 sm:py-6 sm:text-left md:px-8 md:text-xs">
          © {new Date().getFullYear()} Finboard. For demonstration purposes — transaction values are simulated.
        </p>
      </div>
    </footer>
  );
}
