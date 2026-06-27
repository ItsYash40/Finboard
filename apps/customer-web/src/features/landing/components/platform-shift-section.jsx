"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DisplayHeading, Eyebrow, Reveal, SectionInner, SectionShell } from "./primitives";

const shifts = [
  {
    n: "01",
    title: "One seamless platform",
    copy: "Everything from identity verification to your first investment happens in one place — no app-switching, no repeated form-filling, no waiting rooms."
  },
  {
    n: "02",
    title: "Built for your trust",
    copy: "Every rupee you move is tracked with bank-grade accuracy. Your personal information and transactions are stored securely and are always accessible to you."
  },
  {
    n: "03",
    title: "Fast approvals, human oversight",
    copy: "Your documents are read automatically so nothing is missed. A real compliance expert then reviews and approves your account — with full context, not just a checkbox."
  }
];

export default function PlatformShiftSection() {
  const reduce = useReducedMotion();

  return (
    <SectionShell tone="ink" className="text-[var(--fb-primary)]">
      <SectionInner>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-end">
          <Reveal>
            <Eyebrow className="text-[var(--fb-primary)]/70">The shift</Eyebrow>
            <DisplayHeading className="mt-4 text-4xl text-[var(--fb-primary)] md:text-5xl lg:text-[3.5rem]">
              Compliance that feels like product.
            </DisplayHeading>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-xl text-lg leading-relaxed text-[var(--fb-primary)]/80">
              Finboard gives you one clear path from identity to investment — designed to feel as smooth for you
              as it is trustworthy for your compliance team.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 space-y-0">
          {shifts.map((item, index) => (
            <Reveal key={item.n} delay={index * 0.08}>
              <motion.div
                className="grid gap-4 border-t border-[var(--fb-primary)]/20 py-8 md:grid-cols-[120px_1fr_1.2fr] md:items-start"
                whileHover={reduce ? undefined : { x: 6 }}
              >
                <p className="text-sm font-semibold tracking-[0.3em] text-[var(--fb-primary)]/60">{item.n}</p>
                <h3 className="text-2xl font-bold tracking-tight text-[var(--fb-primary)]">{item.title}</h3>
                <p className="text-base leading-relaxed text-[var(--fb-primary)]/75">{item.copy}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </SectionInner>
    </SectionShell>
  );
}
