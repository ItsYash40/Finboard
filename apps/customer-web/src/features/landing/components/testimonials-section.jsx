"use client";

import { testimonials } from "../data/content";
import { DisplayHeading, Eyebrow, Reveal, SectionInner, SectionShell } from "./primitives";

export default function TestimonialsSection() {
  return (
    <SectionShell tone="pale">
      <SectionInner>
        <Reveal>
          <Eyebrow>Voices</Eyebrow>
          <DisplayHeading className="mt-4 text-4xl md:text-5xl">
            Teams use Finboard to tell a clearer story.
          </DisplayHeading>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {testimonials.map((item, index) => (
            <Reveal
              key={item.name}
              delay={index * 0.1}
              className="relative rounded-[28px] bg-white p-8 shadow-[0_16px_50px_-30px_rgba(14,15,12,0.2)]"
            >
              <figure>
                <blockquote>
                  <p className="text-lg leading-relaxed text-[var(--fb-ink)]">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </blockquote>
                <figcaption className="mt-6 border-t border-[var(--fb-ink)]/8 pt-5">
                  <cite className="not-italic">
                    <p className="font-bold text-[var(--fb-ink)]">{item.name}</p>
                    <p className="text-sm text-[var(--fb-body)]">
                      {item.role} · {item.org}
                    </p>
                  </cite>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </SectionInner>
    </SectionShell>
  );
}
