"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/theme-selector";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { navLinks, navSectionIds } from "../data/content";
import { scrollToSection, useActiveSection } from "../lib/use-active-section";
import { FinboardMark } from "@/components/ui/finboard-logo";
import { useIsMobile } from "@/hooks/use-mobile";

function FinboardWordmarkNav({ compact = false }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="transition-transform duration-300 group-hover:scale-[1.04]">
        <FinboardMark size={compact ? 30 : 36} />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-black tracking-[-0.045em] text-[var(--fb-ink)]",
            compact ? "text-[15px]" : "text-[17px]"
          )}
        >
          Finboard
        </span>
      </span>
    </Link>
  );
}

function NavLinkItem({ link, active, onSelect }) {
  const isActive = active === link.id;

  const handleClick = (event) => {
    event.preventDefault();
    onSelect(link.id);
    scrollToSection(link.id);
  };

  return (
    <a
      href={link.href}
      onClick={handleClick}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "relative rounded-full px-3.5 py-2 text-[13px] font-semibold tracking-[-0.01em] transition-colors duration-200 xl:px-4",
        isActive ? "text-[var(--fb-ink)]" : "text-[var(--fb-body)] hover:text-[var(--fb-ink)]"
      )}
    >
      {isActive ? (
        <motion.span
          layoutId="landing-nav-active"
          className="absolute inset-0 rounded-full bg-[var(--fb-primary-pale)] ring-1 ring-[var(--fb-ink)]/6"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      ) : null}
      <span className="relative">{link.label}</span>
    </a>
  );
}

export default function LandingNav() {
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();
  const { active, setManualActive } = useActiveSection(navSectionIds);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header data-landing-nav className="sticky top-0 z-50 min-w-0 px-3 pt-3 sm:px-4 md:px-6 md:pt-4">
      <div className="mx-auto min-w-0 max-w-[1180px]">
        <div
          className={cn(
            "flex min-w-0 items-center justify-between gap-2 transition-all duration-500 ease-out sm:gap-3",
            scrolled
              ? "rounded-[22px] border border-[var(--fb-ink)]/10 bg-[var(--card)]/92 px-3 py-2.5 shadow-[0_16px_48px_-24px_rgba(14,15,12,0.35)] backdrop-blur-xl md:px-4"
              : "rounded-[22px] border border-transparent bg-[var(--card)]/55 px-2 py-2 backdrop-blur-sm md:px-3"
          )}
        >
          <FinboardWordmarkNav compact={scrolled} />

          <nav className="hidden flex-1 justify-center gap-1 md:flex" aria-label="Primary">
            {navLinks.map((link) => (
              <NavLinkItem key={link.id} link={link} active={active} onSelect={setManualActive} />
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeSelector
              buttonClassName="hidden text-[var(--fb-body)] hover:text-[var(--fb-ink)] sm:inline-flex"
            />
            <Link
              href="/signin"
              className="hidden rounded-full px-3 py-2 text-sm font-semibold text-[var(--fb-body)] transition-colors hover:text-[var(--fb-ink)] sm:inline-flex"
            >
              Sign in
            </Link>
            <Button
              asChild
              className="hidden h-10 gap-1.5 rounded-full bg-[#0e0f0c] px-4 text-sm font-semibold text-[var(--fb-primary)] hover:bg-[var(--fb-ink-deep)] sm:inline-flex"
            >
              <Link href="/signup">
                Open demo
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </Button>

            {isMobile ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full border-[var(--fb-ink)]/12 bg-card text-[var(--fb-ink)] md:hidden"
                aria-label="Open menu"
                onClick={toggleSidebar}
              >
                <Menu className="size-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
