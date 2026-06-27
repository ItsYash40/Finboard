"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import AuthShell from "../components/auth-shell";
import AuthStepper from "../components/auth-stepper";
import { getAuthErrorMessage, isPendingVerificationConflict } from "../lib/auth-errors";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { useAuth } from "../context/auth-context";

const initialForm = { name: "", email: "", phone: "", password: "", otp: "" };

const INPUT_CLS =
  "h-11 rounded-xl border-[var(--fb-ink)]/15 bg-[var(--fb-canvas-soft)] px-3.5 text-[var(--fb-ink)] placeholder:text-[var(--fb-mute)] focus-visible:border-[var(--fb-ink)] focus-visible:ring-0";

const LABEL_CLS = "block w-full text-[13px] font-semibold text-[var(--fb-ink)]";

export default function SignupPage() {
  const [form, setForm]       = useState(initialForm);
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { login }  = useAuth();
  const router     = useRouter();

  function updateField(e) {
    setForm((c) => ({ ...c, [e.target.name]: e.target.value }));
  }

  function goToVerify() { setOtpSent(true); setStep(2); }

  async function submitDetails(event) {
    event.preventDefault();
    if (!form.phone.startsWith("+")) {
      toast.error("Include your country code, e.g. +919876543210");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/signup", {
        name: form.name.trim(), email: form.email.trim(),
        phone: form.phone.trim(), password: form.password,
      });
      goToVerify();
      toast.success("Account created. Check your phone for the OTP.");
    } catch (err) {
      if (isPendingVerificationConflict(err)) { goToVerify(); toast.message(getAuthErrorMessage(err)); return; }
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { phone: form.phone.trim() });
      setOtpSent(true);
      toast.success("OTP sent again");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function verifyAndComplete(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { phone: form.phone.trim(), otp: form.otp.trim() });
      if (!res.data.approved) { toast.error("Invalid or expired OTP"); return; }
      if (!res.data.registrationComplete || !res.data.token) {
        toast.error("Registration could not be completed. Check the OTP and try again.");
        return;
      }
      login(res.data);
      toast.success("You're verified — welcome to Finboard!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Enter your details, then verify your phone to get started."
    >
      <AuthStepper step={step} />

      {/* Step 1 — personal details */}
      {step === 1 && (
        <form className="space-y-4" onSubmit={submitDetails}>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="name" className={LABEL_CLS}>Full name</FieldLabel>
            <Input
              id="name" name="name" value={form.name} onChange={updateField}
              placeholder="Adya Sharma"
              className={INPUT_CLS} required minLength={2}
            />
          </Field>

          <Field className="gap-1.5">
            <FieldLabel htmlFor="email" className={LABEL_CLS}>Email address</FieldLabel>
            <Input
              id="email" name="email" type="email" value={form.email} onChange={updateField}
              placeholder="you@example.com"
              className={INPUT_CLS} required
            />
          </Field>

          <Field className="gap-1.5">
            <FieldLabel htmlFor="phone" className={LABEL_CLS}>Phone number</FieldLabel>
            <Input
              id="phone" name="phone" value={form.phone} onChange={updateField}
              placeholder="+919876543210"
              className={INPUT_CLS} required
            />
            <FieldDescription className="text-xs text-[var(--fb-mute)]">
              Include your country code. We'll send an OTP to verify.
            </FieldDescription>
          </Field>

          <Field className="gap-1.5">
            <FieldLabel htmlFor="password" className={LABEL_CLS}>Password</FieldLabel>
            <Input
              id="password" name="password" type="password" value={form.password} onChange={updateField}
              placeholder="Minimum 8 characters"
              className={INPUT_CLS} required minLength={8}
            />
          </Field>

          <Button
            type="submit" disabled={loading}
            className="mt-2 h-12 w-full rounded-2xl bg-[#0e0f0c] text-[15px] font-semibold text-[var(--fb-primary)] hover:bg-[var(--fb-ink-deep)] disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Continue"}
          </Button>
        </form>
      )}

      {/* Step 2 — OTP verification */}
      {step === 2 && (
        <form className="space-y-4" onSubmit={verifyAndComplete}>
          {/* Summary card */}
          <div className="rounded-2xl border border-[var(--fb-ink)]/8 bg-[var(--fb-canvas-soft)] px-4 py-3.5">
            <p className="text-sm font-semibold text-[var(--fb-ink)]">{form.name}</p>
            <p className="mt-0.5 text-xs text-[var(--fb-body)]">{form.email}</p>
            <p className="mt-0.5 text-xs text-[var(--fb-body)]">{form.phone}</p>
            {otpSent && (
              <p className="mt-2 text-xs font-medium text-[var(--fb-positive-deep)]">
                OTP sent — check your SMS and enter the code below.
              </p>
            )}
          </div>

          <Field className="gap-1.5">
            <FieldLabel htmlFor="otp" className={LABEL_CLS}>One-time code</FieldLabel>
            <Input
              id="otp" name="otp" inputMode="numeric"
              value={form.otp} onChange={updateField}
              placeholder="6-digit OTP"
              className={INPUT_CLS} required
            />
          </Field>

          {/* Secondary actions */}
          <div className="flex gap-2">
            <Button
              type="button" variant="outline" onClick={() => setStep(1)}
              className="h-11 flex-1 rounded-xl border-[var(--fb-ink)]/12 text-sm font-semibold text-[var(--fb-ink)] hover:bg-[var(--fb-canvas-soft)]"
            >
              Back
            </Button>
            <Button
              type="button" variant="outline" onClick={resendOtp} disabled={loading}
              className="h-11 flex-1 rounded-xl border-[var(--fb-ink)]/12 text-sm font-semibold text-[var(--fb-ink)] hover:bg-[var(--fb-canvas-soft)] disabled:opacity-50"
            >
              Resend OTP
            </Button>
          </div>

          {/* Primary CTA */}
          <Button
            type="submit" disabled={loading}
            className="h-12 w-full rounded-2xl bg-[var(--fb-primary)] text-[15px] font-semibold text-[var(--fb-on-primary)] hover:bg-[var(--fb-primary-active)] disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Verify and open account"}
          </Button>
        </form>
      )}

      {/* Footer */}
      <div className="mt-6">
        <Separator className="bg-[var(--fb-ink)]/6" />
        <p className="mt-5 text-center text-sm text-[var(--fb-mute)]">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-[var(--fb-ink)] underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
