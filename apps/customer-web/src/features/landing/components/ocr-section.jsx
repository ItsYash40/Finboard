"use client";

import { CheckCircle2, ScanLine, Sparkles } from "lucide-react";
import { DisplayHeading, Eyebrow, Reveal, SectionInner, SectionShell } from "./primitives";

const verifiedFields = [
  { label: "Full name", value: "Adya Sharma" },
  { label: "PAN number", value: "ABCDE1234F" },
  { label: "Status", value: "Confirmed" },
];

export default function OcrSection() {
  return (
    <SectionShell tone="white">
      <SectionInner className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
        <Reveal className="min-w-0">
          <Eyebrow>Smart document reading</Eyebrow>
          <DisplayHeading className="mt-4 text-3xl sm:text-4xl md:text-5xl">
            Upload once. We read the rest.
          </DisplayHeading>
          <p className="mt-6 text-base leading-relaxed text-[var(--fb-body)] sm:text-lg">
            Just take a photo of your PAN and Aadhaar and upload them. Your name, ID number, and details
            are read and verified automatically — no manual data entry required.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-[var(--fb-body)] sm:mt-8">
            <li className="flex gap-2">
              <ScanLine className="mt-0.5 size-4 shrink-0" aria-hidden />
              No typing — your documents are read for you
            </li>
            <li className="flex gap-2">
              <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden />
              Your name and ID are verified automatically
            </li>
            <li className="flex gap-2">
              <ScanLine className="mt-0.5 size-4 shrink-0" aria-hidden />
              Any discrepancies are flagged and reviewed by our team
            </li>
          </ul>
        </Reveal>

        <Reveal delay={0.12} className="min-w-0">
          <div className="rounded-[24px] border border-[var(--fb-ink)]/10 bg-card p-4 shadow-[0_20px_60px_-30px_rgba(14,15,12,0.25)] sm:rounded-[28px] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fb-mute)]">Verified details</p>

            <ul className="mt-4 space-y-2">
              {verifiedFields.map((field) => (
                <li
                  key={field.label}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[var(--fb-canvas-soft)] px-3 py-2.5 sm:px-4"
                >
                  <span className="text-xs text-[var(--fb-mute)]">{field.label}</span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--fb-ink)]">
                    {field.value}
                    {field.label === "Status" ? (
                      <CheckCircle2 className="size-3.5 text-[var(--fb-positive-deep)]" aria-hidden />
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[var(--fb-primary-pale)] px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-[var(--fb-mute)]">From your document</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--fb-ink)]">
                  Income Tax Department · Govt of India
                </p>
              </div>
              <div className="rounded-xl bg-[var(--fb-canvas-soft)] px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-[var(--fb-mute)]">Verification status</p>
                <p className="mt-1 text-xs text-[var(--fb-ink)]">Confirmed and ready</p>
              </div>
            </div>
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
