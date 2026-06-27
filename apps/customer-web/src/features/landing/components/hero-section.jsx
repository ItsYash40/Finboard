"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { kycSteps } from "../data/content";
import { Reveal } from "./primitives";

function PipelineVisual() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce) return undefined;
    const id = window.setInterval(() => {
      setActive((c) => (c + 1) % kycSteps.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <div className="relative rounded-[20px] border border-[var(--fb-ink)]/8 bg-card p-6 shadow-[0_16px_64px_-24px_rgba(14,15,12,0.18)]">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--fb-mute)]">
          Live pipeline
        </p>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--fb-positive-deep)]">
          <span className="size-1.5 rounded-full bg-[var(--fb-positive)]" aria-hidden />
          Demo mode
        </span>
      </div>

      <ol className="space-y-1" aria-label="KYC pipeline steps">
        {kycSteps.map((step, index) => {
          const isActive = index === active;
          const isDone = step.status === "done" || index < active;

          return (
            <li
              key={step.id}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-300 ${
                isActive ? "bg-[var(--fb-canvas-soft)]" : ""
              }`}
            >
              <span
                className={`size-2 shrink-0 rounded-full transition-colors duration-300 ${
                  isDone
                    ? "bg-[var(--fb-positive)]"
                    : isActive
                    ? "bg-[var(--fb-primary)]"
                    : "bg-[var(--fb-ink)]/15"
                }`}
                aria-hidden
              />
              {isActive && !reduce && (
                <motion.span
                  className="absolute left-3 size-2 shrink-0 rounded-full bg-[var(--fb-primary)]"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  aria-hidden
                />
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium leading-snug ${
                    isDone || isActive ? "text-[var(--fb-ink)]" : "text-[var(--fb-mute)]"
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {isActive && !reduce && (
                <motion.div
                  className="absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--fb-primary)]/40"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 3.2, ease: "linear" }}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[var(--fb-ink)]/6 pt-5">
        {[
          { label: "OCR confidence", value: "94.2%" },
          { label: "Review queue",   value: "12 pending" },
          { label: "Time to invest", value: "4 min" },
        ].map((m) => (
          <div key={m.label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fb-mute)]">
              {m.label}
            </p>
            <p className="mt-1 text-sm font-bold text-[var(--fb-ink)]">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HeroSection() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto grid max-w-[1200px] gap-12 px-5 pb-20 pt-10 md:px-8 md:pb-28 md:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-32 lg:pt-14">

        <div>
          <Reveal>
            <h1 className="max-w-[14ch] text-[clamp(2.75rem,8vw,5.5rem)] font-black leading-[0.92] tracking-[-0.045em] text-[var(--fb-ink)]">
              Onboard
              <span className="block text-[var(--fb-ink-deep)]">investors</span>
              <span className="block text-[var(--fb-body)]">without the friction.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--fb-body)] md:text-xl">
              Verify your identity, link your bank account, and start investing —
              all in one place, in minutes.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                className="h-12 gap-2 rounded-2xl bg-[var(--fb-primary)] px-6 text-base font-semibold text-[var(--fb-on-primary)] hover:bg-[var(--fb-primary-active)]"
              >
                <Link href="/signup">
                  Create investor account
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-2xl border-[var(--fb-ink)] bg-card px-6 text-base font-semibold text-[var(--fb-ink)] hover:bg-[var(--card)]/80"
              >
                <Link href="/signin">View live demo</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-[var(--fb-ink)]/10 pt-8">
              {[
                { k: "< 5 min", v: "from signup to first investment" },
                { k: "₹2", v: "bank verification, refunded instantly" },
                { k: "100%", v: "secure, audited onboarding" },
              ].map((item) => (
                <div key={item.v}>
                  <dt className="text-2xl font-black tracking-tight text-[var(--fb-ink)]">{item.k}</dt>
                  <dd className="mt-1 text-xs font-medium uppercase tracking-wider text-[var(--fb-mute)]">{item.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={reduce ? 0 : 0.15}>
          <PipelineVisual />
        </Reveal>
      </div>

      {!reduce && (
        <motion.div
          aria-hidden
          className="absolute bottom-0 left-1/2 h-px w-[min(90%,900px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-[var(--fb-ink)]/15 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 1.2 }}
        />
      )}
    </section>
  );
}
