"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AuthShell from "../components/auth-shell";
import AuthStepper from "../components/auth-stepper";
import { getAuthErrorMessage, isAlreadyRegisteredConflict } from "../lib/auth-errors";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { isValidE164Phone } from "@/lib/phone";
import PhoneInput from "@/components/phone-input";
import { useAuth } from "../context/auth-context";

const initialForm = { name: "", email: "", phone: "", password: "", otp: "" };
const SIGNUP_STORAGE_KEY = "finboard-signup-pending";

const INPUT_CLS =
  "h-11 rounded-xl border-[var(--fb-ink)]/15 bg-[var(--fb-canvas-soft)] px-3.5 text-[var(--fb-ink)] placeholder:text-[var(--fb-mute)] focus-visible:border-[var(--fb-ink)] focus-visible:ring-0";

const LABEL_CLS = "block w-full text-[13px] font-semibold text-[var(--fb-ink)]";

function readSavedSignup() {
  try {
    const raw = sessionStorage.getItem(SIGNUP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSignupProgress(payload) {
  sessionStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify(payload));
}

function clearSignupProgress() {
  sessionStorage.removeItem(SIGNUP_STORAGE_KEY);
}

export default function SignupPage() {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const shouldResendOnRestore = useRef(false);

  useEffect(() => {
    const saved = readSavedSignup();
    if (!saved || saved.step !== 2 || !saved.email) {
      return;
    }

    setForm((current) => ({
      ...current,
      name: saved.name || current.name,
      email: saved.email || current.email,
      phone: saved.phone || current.phone,
      otp: ""
    }));
    setStep(2);
    setOtpSent(Boolean(saved.otpSent));
    shouldResendOnRestore.current = !saved.otpSent;
  }, []);

  useEffect(() => {
    if (step !== 2 || !form.email) {
      return;
    }

    saveSignupProgress({
      step: 2,
      name: form.name,
      email: form.email,
      phone: form.phone,
      otpSent
    });
  }, [step, form.name, form.email, form.phone, otpSent]);

  useEffect(() => {
    if (!shouldResendOnRestore.current || step !== 2 || !form.email || otpSent) {
      return;
    }

    shouldResendOnRestore.current = false;
    void resendOtp();
  }, [step, form.email, otpSent]);

  function updateField(e) {
    setForm((c) => ({ ...c, [e.target.name]: e.target.value }));
  }

  function goToVerify() {
    setOtpSent(true);
    setStep(2);
  }

  function applyServerUser(user) {
    if (!user) {
      return;
    }

    setForm((current) => ({
      ...current,
      name: user.name || current.name,
      email: user.email || current.email,
      phone: user.phone || current.phone,
      otp: ""
    }));
  }

  function handleSignupSuccess(response, resumed = false) {
    applyServerUser(response.data.user);
    goToVerify();
    toast.success(
      resumed
        ? "You're almost done — enter the OTP we sent to your email."
        : "Account created. Check your email for the OTP."
    );
  }

  async function submitDetails(event) {
    event.preventDefault();
    if (!isValidE164Phone(form.phone)) {
      toast.error("Enter a valid phone number.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/auth/signup", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password
      });
      handleSignupSuccess(response, Boolean(response.data.resumeVerification));
    } catch (err) {
      if (isAlreadyRegisteredConflict(err)) {
        toast.error(getAuthErrorMessage(err), {
          action: { label: "Sign in", onClick: () => router.push("/signin") }
        });
        return;
      }
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    if (!form.email.trim()) {
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/send-otp", { email: form.email.trim() });
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
      const res = await api.post("/auth/verify-otp", {
        email: form.email.trim(),
        otp: form.otp.trim()
      });
      if (!res.data.approved) {
        toast.error("Invalid or expired OTP");
        return;
      }
      if (!res.data.registrationComplete || !res.data.token) {
        toast.error("Registration could not be completed. Check the OTP and try again.");
        return;
      }
      clearSignupProgress();
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
      subtitle={
        step === 2
          ? "Finish verifying your email to complete signup."
          : "Enter your details, then verify your email to get started."
      }
    >
      <AuthStepper step={step} />

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
            <PhoneInput
              id="phone"
              value={form.phone}
              onChange={(phone) => setForm((current) => ({ ...current, phone }))}
              required
            />
            <FieldDescription className="text-xs text-[var(--fb-mute)]">
              Choose your country code, then enter your mobile number. We'll send a verification code to your email.
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
            {loading ? "Continuing…" : "Continue"}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form className="space-y-4" onSubmit={verifyAndComplete}>
          <div className="rounded-2xl border border-[var(--fb-ink)]/8 bg-[var(--fb-canvas-soft)] px-4 py-3.5">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--fb-mute)]">
              Resume signup
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--fb-ink)]">{form.name}</p>
            <p className="mt-0.5 text-xs text-[var(--fb-body)]">{form.email}</p>
            {otpSent ? (
              <p className="mt-2 text-xs font-medium text-[var(--fb-positive-deep)]">
                OTP sent — check your email and enter the code below.
              </p>
            ) : (
              <p className="mt-2 text-xs text-[var(--fb-body)]">
                Enter the verification code sent to your email.
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

          <div className="flex gap-2">
            <Button
              type="button" variant="outline" onClick={() => setStep(1)}
              className="h-11 flex-1 rounded-xl border-[var(--fb-ink)]/12 text-sm font-semibold text-[var(--fb-ink)] hover:bg-[var(--fb-canvas-soft)]"
            >
              Edit details
            </Button>
            <Button
              type="button" variant="outline" onClick={resendOtp} disabled={loading}
              className="h-11 flex-1 rounded-xl border-[var(--fb-ink)]/12 text-sm font-semibold text-[var(--fb-ink)] hover:bg-[var(--fb-canvas-soft)] disabled:opacity-50"
            >
              Resend OTP
            </Button>
          </div>

          <Button
            type="submit" disabled={loading}
            className="h-12 w-full rounded-2xl bg-[var(--fb-primary)] text-[15px] font-semibold text-[var(--fb-on-primary)] hover:bg-[var(--fb-primary-active)] disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Verify and open account"}
          </Button>
        </form>
      )}

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
