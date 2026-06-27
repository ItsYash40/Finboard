"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionInner, SectionShell } from "./primitives";

export default function CtaSection() {
  return (
    <SectionShell tone="white">
      <SectionInner>
        <Reveal>
          <div className="relative overflow-hidden rounded-[24px] bg-[#0e0f0c] px-4 py-10 sm:rounded-[36px] sm:px-6 sm:py-12 md:px-12 md:py-16">
            <div className="pointer-events-none absolute -right-10 top-0 size-56 rounded-full bg-[var(--fb-primary)]/20 blur-3xl" aria-hidden />
            <div className="relative min-w-0 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--fb-primary)]/70">Ready when you are</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-[var(--fb-primary)] sm:text-4xl md:text-5xl">
                Start the onboarding journey in under five minutes.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--fb-primary)]/75 sm:text-lg">
                Create your account, verify your identity, link your bank, and place your first investment —
                all in one place, without switching apps or waiting days for a response.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-11 w-full gap-2 rounded-2xl bg-[var(--fb-primary)] px-6 text-base font-semibold text-[var(--fb-on-primary)] hover:bg-[var(--fb-primary-active)] sm:h-12 sm:w-auto"
                >
                  <Link href="/signup">
                    Get started free
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 w-full rounded-2xl border-[var(--fb-primary)]/40 bg-transparent px-6 text-base font-semibold text-[var(--fb-primary)] hover:bg-[var(--fb-primary)]/10 sm:h-12 sm:w-auto"
                >
                  <Link href="/signin">Sign in to your account</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
