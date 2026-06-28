import crypto from "crypto";
import { getServiceEnv } from "@finboard/config";
import { isResendConfigured, sendOtpEmail } from "@finboard/email";

const emailOtpStore = new Map();

function createOtp() {
  return String(crypto.randomInt(100000, 999999));
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

function getPasswordResetTtlMs() {
  return getServiceEnv().otp.passwordResetTtlMinutes * 60 * 1000;
}

export async function sendPasswordResetOtp(email) {
  const key = email.toLowerCase();
  const otp = createOtp();
  const ttlMinutes = getServiceEnv().otp.passwordResetTtlMinutes;

  emailOtpStore.set(key, {
    otpHash: hashOtp(otp),
    expiresAt: Date.now() + getPasswordResetTtlMs()
  });

  const result = await sendOtpEmail({
    to: email,
    otp,
    ttlMinutes,
    purpose: "password_reset"
  });

  if (result.provider === "development") {
    console.log(`[DEV] Password reset OTP for ${email}: ${otp}`);
    if (!isResendConfigured()) {
      console.warn("[OTP] Resend is not configured. Add RESEND_API_KEY and RESEND_FROM to send real email.");
    }
  }

  return { provider: result.provider };
}

export function verifyPasswordResetOtp(email, otp) {
  const key = email.toLowerCase();
  const record = emailOtpStore.get(key);
  if (!record) return { valid: false, reason: "not_found" };
  if (Date.now() > record.expiresAt) {
    emailOtpStore.delete(key);
    return { valid: false, reason: "expired" };
  }
  const valid = record.otpHash === hashOtp(otp);
  if (valid) emailOtpStore.delete(key);
  return { valid, reason: valid ? "ok" : "invalid" };
}
