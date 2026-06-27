"use client";

import { trustMetrics } from "../data/content";
import { DisplayHeading, Eyebrow, Reveal, SectionInner, SectionShell } from "./primitives";

export default function TrustSection() {
  return (
    <SectionShell tone="soft">
      <SectionInner>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:items-end">
          <Reveal>
            <Eyebrow>Trust indicators</Eyebrow>
            <DisplayHeading className="mt-4 text-4xl md:text-5xl">
              Security and trust, at every step.
            </DisplayHeading>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {trustMetrics.map((item, index) => (
              <Reveal
                key={item.label}
                delay={index * 0.07}
                className="rounded-[28px] bg-card px-5 py-8 shadow-[0_12px_40px_-24px_rgba(14,15,12,0.2)]"
              >
                <p
                  className="text-3xl font-black tracking-tight text-[var(--fb-ink)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.value}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--fb-body)]">{item.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </SectionInner>
    </SectionShell>
  );
}
