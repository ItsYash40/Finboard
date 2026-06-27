"use client";

import { Lock, Server, Shield } from "lucide-react";
import { DisplayHeading, Eyebrow, Reveal, SectionInner, SectionShell } from "./primitives";

const pillars = [
  {
    icon: Shield,
    title: "Only you can see your account",
    body: "Every role — investor, reviewer, and manager — has strictly limited access. No one can see your personal information or account activity unless they are directly responsible for it."
  },
  {
    icon: Lock,
    title: "A permanent record of every decision",
    body: "Every step of your verification — submission, review, and approval — is permanently recorded. There is never any ambiguity about what happened or when."
  },
  {
    icon: Server,
    title: "Your data stays private",
    body: "Your personal information and credentials are protected by industry-standard encryption at every layer — in transit and at rest."
  }
];

export default function SecuritySection() {
  return (
    <SectionShell id="security" tone="ink">
      <SectionInner>
        <Reveal>
          <Eyebrow className="text-[var(--fb-primary)]/70">Security & compliance</Eyebrow>
          <DisplayHeading className="mt-4 max-w-2xl text-4xl text-[var(--fb-primary)] md:text-5xl">
            Trust is engineered — not marketed.
          </DisplayHeading>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pillars.map((item, index) => (
            <Reveal
              key={item.title}
              delay={index * 0.08}
              className="group rounded-[28px] border border-[var(--fb-primary)]/20 bg-[var(--fb-primary)]/[0.06] p-7 transition-all duration-300 hover:bg-[var(--fb-primary)]/[0.1] hover:border-[var(--fb-primary)]/30"
            >
              <item.icon className="size-5 text-[var(--fb-primary)]" aria-hidden />
              <h3 className="mt-4 text-xl font-bold text-[var(--fb-primary)]">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--fb-primary)]/70">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </SectionInner>
    </SectionShell>
  );
}
