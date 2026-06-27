"use client";

import { problemStats } from "../data/content";
import { DisplayHeading, Eyebrow, Reveal, SectionInner, SectionShell } from "./primitives";

const pains = [
  {
    index: "01",
    title: "Weeks of waiting, just to get started",
    body: "Most platforms ask you to upload documents to one system, verify your bank on another, and wait days to hear back — each step feeling like a fresh application."
  },
  {
    index: "02",
    title: "No visibility into where you stand",
    body: "You upload your documents and then hear nothing. No status updates, no estimated time, no clear next step — just uncertainty."
  },
  {
    index: "03",
    title: "Trust breaks before you invest a single rupee",
    body: "When the process feels slow and opaque, investors walk away — even when the investment product itself is excellent."
  }
];

const statTone = {
  "14+": "text-[var(--fb-ink)]",
  "63%": "text-[var(--negative)]",
  "7+": "text-[var(--fb-ink)]"
};

export default function ProblemSection() {
  return (
    <SectionShell tone="white">
      <SectionInner>
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
          <Reveal>
            <Eyebrow>The problem</Eyebrow>
            <DisplayHeading className="mt-4 max-w-[16ch] text-4xl leading-[1.02] md:text-5xl lg:text-[3.25rem]">
              Traditional KYC was built for auditors — not investors.
            </DisplayHeading>
            <p className="mt-6 max-w-[42ch] text-lg leading-[1.65] text-[var(--fb-body)] md:text-xl md:leading-[1.7]">
              Most platforms make you wait. Finboard moves with you — verifying your identity, approving your account,
              linking your bank, and unlocking your portfolio in one seamless experience.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {problemStats.map((stat, index) => (
              <Reveal
                key={stat.label}
                delay={index * 0.08}
                className="flex min-h-[120px] flex-col justify-between rounded-[24px] bg-[var(--fb-canvas-soft)] px-4 py-5 sm:min-h-[148px] sm:px-5 sm:py-6"
              >
                <p
                  className={`text-[2rem] font-black leading-none tracking-tight sm:text-[2.5rem] ${statTone[stat.value] ?? "text-[var(--fb-ink)]"}`}
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {stat.value}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[var(--fb-body)]">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden rounded-[28px] border border-[var(--fb-ink)]/8 bg-[var(--fb-ink)]/8 sm:mt-14 md:grid-cols-3">
          {pains.map((item, index) => (
            <Reveal key={item.title} delay={0.12 + index * 0.08} className="h-full bg-card">
              <article className="flex h-full flex-col p-5 sm:p-6 md:p-7">
                <p className="text-xs font-semibold tabular-nums tracking-[0.22em] text-[var(--fb-mute)]">
                  {item.index}
                </p>
                <h3 className="mt-4 text-lg font-bold leading-snug tracking-tight text-[var(--fb-ink)] md:text-xl">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--fb-body)]">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </SectionInner>
    </SectionShell>
  );
}
