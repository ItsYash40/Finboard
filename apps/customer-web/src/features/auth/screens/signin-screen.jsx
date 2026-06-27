"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import AuthShell from "../components/auth-shell";
import { getAuthErrorMessage } from "../lib/auth-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useAuth } from "../context/auth-context";
import Link from "next/link";

export default function SigninPage() {
  const [form, setForm]     = useState({ email: "", password: "", phone: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const router     = useRouter();

  function updateField(event) {
    setForm((c) => ({ ...c, [event.target.name]: event.target.value }));
    if (event.target.name === "phone") {
      setOtpSent(false);
      setForm((c) => ({ ...c, otp: "" }));
    }
  }

  async function passwordSignin(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/signin", { email: form.email.trim(), password: form.password });
      login(res.data);
      router.push("/dashboard");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp() {
    if (!form.phone.startsWith("+")) {
      toast.error("Include your country code, e.g. +919876543210");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { phone: form.phone.trim() });
      setOtpSent(true);
      toast.success("OTP sent to your phone");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function phoneSignin(event) {
    event.preventDefault();
    if (!otpSent) { toast.error("Send OTP first"); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/phone-login", { phone: form.phone.trim(), otp: form.otp.trim() });
      login(res.data);
      router.push("/dashboard");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Finboard account to continue."
    >
      <Tabs defaultValue="password">
        {/* Tab list — sage bg, white active pill (Wise card pattern) */}
        <TabsList className="grid w-full grid-cols-2 rounded-[14px] bg-[var(--fb-canvas-soft)] p-1">
          <TabsTrigger
            value="password"
            className="rounded-[10px] text-sm font-semibold text-[var(--fb-body)] transition-all data-[state=active]:bg-card data-[state=active]:text-[var(--fb-ink)] data-[state=active]:shadow-sm"
          >
            Email
          </TabsTrigger>
          <TabsTrigger
            value="otp"
            className="rounded-[10px] text-sm font-semibold text-[var(--fb-body)] transition-all data-[state=active]:bg-card data-[state=active]:text-[var(--fb-ink)] data-[state=active]:shadow-sm"
          >
            Phone OTP
          </TabsTrigger>
        </TabsList>

        {/* ── Email + password ── */}
        <TabsContent value="password" className="mt-5">
          <form className="space-y-4" onSubmit={passwordSignin}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-semibold text-[var(--fb-ink)]">
                Email address
              </Label>
              <Input
                id="email" name="email" type="email"
                value={form.email} onChange={updateField}
                placeholder="you@example.com"
                className="h-11 rounded-xl border-[var(--fb-ink)]/15 bg-[var(--fb-canvas-soft)] text-[var(--fb-ink)] placeholder:text-[var(--fb-mute)] focus-visible:border-[var(--fb-ink)] focus-visible:ring-0"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[13px] font-semibold text-[var(--fb-ink)]">
                Password
              </Label>
              <Input
                id="password" name="password" type="password"
                value={form.password} onChange={updateField}
                placeholder="••••••••"
                className="h-11 rounded-xl border-[var(--fb-ink)]/15 bg-[var(--fb-canvas-soft)] text-[var(--fb-ink)] placeholder:text-[var(--fb-mute)] focus-visible:border-[var(--fb-ink)] focus-visible:ring-0"
                required
              />
            </div>

            {/* Primary CTA — lime green per design system */}
            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 w-full rounded-2xl bg-[var(--fb-primary)] text-[15px] font-semibold text-[var(--fb-on-primary)] hover:bg-[var(--fb-primary-active)] disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </TabsContent>

        {/* ── Phone OTP ── */}
        <TabsContent value="otp" className="mt-5">
          <form className="space-y-4" onSubmit={phoneSignin}>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-[13px] font-semibold text-[var(--fb-ink)]">
                Phone number
              </Label>
              <div className="flex gap-2">
                <Input
                  id="phone" name="phone"
                  value={form.phone} onChange={updateField}
                  placeholder="+919876543210"
                  className="h-11 flex-1 rounded-xl border-[var(--fb-ink)]/15 bg-[var(--fb-canvas-soft)] text-[var(--fb-ink)] placeholder:text-[var(--fb-mute)] focus-visible:border-[var(--fb-ink)] focus-visible:ring-0"
                  required
                />
                <Button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading || otpSent}
                  className="h-11 shrink-0 rounded-xl border border-[var(--fb-ink)]/15 bg-card px-4 text-sm font-semibold text-[var(--fb-ink)] hover:bg-[var(--fb-canvas-soft)] disabled:opacity-50"
                  variant="outline"
                >
                  {otpSent ? "Sent ✓" : "Send OTP"}
                </Button>
              </div>
              <p className="text-xs text-[var(--fb-mute)]">
                Must be the phone number on your registered account.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="otp" className="text-[13px] font-semibold text-[var(--fb-ink)]">
                One-time code
              </Label>
              <Input
                id="otp" name="otp"
                inputMode="numeric"
                value={form.otp} onChange={updateField}
                placeholder="6-digit code from SMS"
                disabled={!otpSent}
                className="h-11 rounded-xl border-[var(--fb-ink)]/15 bg-[var(--fb-canvas-soft)] text-[var(--fb-ink)] placeholder:text-[var(--fb-mute)] focus-visible:border-[var(--fb-ink)] focus-visible:ring-0 disabled:opacity-40"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !otpSent}
              className="mt-2 h-12 w-full rounded-2xl bg-[var(--fb-primary)] text-[15px] font-semibold text-[var(--fb-on-primary)] hover:bg-[var(--fb-primary-active)] disabled:opacity-60"
            >
              {loading ? "Verifying…" : "Sign in with OTP"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="mt-6">
        <Separator className="bg-[var(--fb-ink)]/6" />
        <p className="mt-5 text-center text-sm text-[var(--fb-mute)]">
          New to Finboard?{" "}
          <Link href="/signup" className="font-semibold text-[var(--fb-ink)] underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
