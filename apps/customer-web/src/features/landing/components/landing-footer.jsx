"use client";

import Link from "next/link";
import { navLinks } from "../data/content";

export default function LandingFooter() {
  return (
    <footer className="bg-[#0e0f0c]">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--fb-primary)]/30 to-transparent" aria-hidden />
      </div>
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-12 sm:gap-10 sm:px-5 sm:py-16 md:grid-cols-[1.2fr_1fr_1fr] md:px-8">
        <div>
          <p className="text-2xl font-black tracking-tight text-[var(--fb-primary)]">Finboard</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#e8ebe6]/75">
            From identity verification to your first investment — Finboard gives you a fast, secure,
            and fully auditable path to the markets.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--fb-primary)]/60">Explore</p>
          <ul className="mt-4 space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-sm text-[#e8ebe6]/80 transition-colors duration-200 hover:text-[var(--fb-primary)]">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--fb-primary)]/60">Product</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/signup" className="text-[#e8ebe6]/80 transition-colors duration-200 hover:text-[var(--fb-primary)]">Sign up</Link></li>
            <li><Link href="/signin" className="text-[#e8ebe6]/80 transition-colors duration-200 hover:text-[var(--fb-primary)]">Sign in</Link></li>
            <li><Link href="/dashboard" className="text-[#e8ebe6]/80 transition-colors duration-200 hover:text-[var(--fb-primary)]">Dashboard</Link></li>
            <li><Link href="/admin/login" className="text-[#e8ebe6]/80 transition-colors duration-200 hover:text-[var(--fb-primary)]">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--fb-primary)]/10">
        <p className="mx-auto max-w-[1200px] px-4 py-5 text-xs text-[#e8ebe6]/50 sm:px-5 sm:py-6 md:px-8">
          © {new Date().getFullYear()} Finboard. For demonstration purposes — transaction values are simulated.
        </p>
      </div>
    </footer>
  );
}
