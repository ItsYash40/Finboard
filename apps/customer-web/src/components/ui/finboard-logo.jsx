/**
 * Finboard logo mark — three ascending bars.
 *
 * Concept: each bar maps to a phase of the onboarding pipeline
 * (document capture → identity verification → portfolio unlock).
 * Height and opacity increase left-to-right, reading as both a
 * bar chart (growth) and a sequenced workflow (steps).
 *
 * The mark is self-contained — it ships its own dark container so
 * it renders correctly on any background without wrapper styling.
 */

export function FinboardMark({ size = 36, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      focusable="false"
    >
      {/* Container */}
      <rect width="36" height="36" rx="10" fill="#0e0f0c" />

      {/* Bar 1 — document capture (shortest, 40% opacity) */}
      <rect x="7" y="20" width="6" height="8"  rx="1.5" fill="#9fe870" fillOpacity="0.38" />

      {/* Bar 2 — identity verification (medium, 68% opacity) */}
      <rect x="15" y="14" width="6" height="14" rx="1.5" fill="#9fe870" fillOpacity="0.68" />

      {/* Bar 3 — portfolio unlock (tallest, full opacity) */}
      <rect x="23" y="8"  width="6" height="20" rx="1.5" fill="#9fe870" fillOpacity="1" />
    </svg>
  );
}

/**
 * Full wordmark — mark + logotype.
 * Use `compact` to hide the tagline in tight spaces.
 */
export function FinboardWordmark({ markSize = 36, compact = false, className = "" }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <FinboardMark size={markSize} />
      <span className="flex flex-col leading-none">
        <span
          className="font-black tracking-[-0.045em] text-[var(--fb-ink)]"
          style={{ fontSize: markSize * 0.47 }}
        >
          Finboard
        </span>
        {!compact && (
          <span
            className="mt-1 font-semibold uppercase tracking-[0.2em] text-[var(--fb-mute)]"
            style={{ fontSize: markSize * 0.26 }}
          >
            KYC · Banking · Invest
          </span>
        )}
      </span>
    </span>
  );
}
