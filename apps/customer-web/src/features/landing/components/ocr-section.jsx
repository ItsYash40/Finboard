"use client";

import { ScanLine, Sparkles } from "lucide-react";
import { DisplayHeading, Eyebrow, Reveal, SectionInner, SectionShell } from "./primitives";

export default function OcrSection() {
  return (
    <SectionShell tone="white">
      <SectionInner className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <Eyebrow>Smart document reading</Eyebrow>
          <DisplayHeading className="mt-4 text-4xl md:text-5xl">
            Upload once. We read the rest.
          </DisplayHeading>
          <p className="mt-6 text-lg leading-relaxed text-[var(--fb-body)]">
            Just take a photo of your PAN and Aadhaar and upload them. Your name, ID number, and details
            are read and verified automatically — no manual data entry required.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-[var(--fb-body)]">
            <li className="flex gap-2"><ScanLine className="mt-0.5 size-4 shrink-0" /> No typing — your documents are read for you</li>
            <li className="flex gap-2"><Sparkles className="mt-0.5 size-4 shrink-0" /> Your name and ID are verified automatically</li>
            <li className="flex gap-2"><ScanLine className="mt-0.5 size-4 shrink-0" /> Any discrepancies are flagged and reviewed by our team</li>
          </ul>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="rounded-[28px] border border-[var(--fb-ink)] bg-white p-6 font-mono text-sm shadow-[0_20px_60px_-30px_rgba(14,15,12,0.25)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fb-mute)]">Verified details</p>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-[var(--fb-canvas-soft)] p-4 text-[13px] leading-relaxed text-[var(--fb-ink)]">
{`{
  "type": "pan",
  "verified": {
    "name": "ADYA SHARMA",
    "panNumber": "ABCDE1234F"
  },
  "status": "confirmed",
  "match": true
}`}
            </pre>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[var(--fb-primary-pale)] px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-[var(--fb-mute)]">From your document</p>
                <p className="mt-1 text-xs text-[var(--fb-ink)]">INCOME TAX DEPARTMENT · GOVT OF INDIA</p>
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
