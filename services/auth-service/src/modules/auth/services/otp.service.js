import crypto from "crypto";
import { getServiceEnv } from "@finboard/config";
import { isResendConfigured, sendOtpEmail } from "@finboard/email";

const otpStore = new Map();
const verifiedEmailStore = new Map();

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function createOtp() {
  return String(crypto.randomInt(100000, 999999));
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

function getOtpTtlMs() {
  return getServiceEnv().otp.ttlMinutes * 60 * 1000;
}

function markEmailVerified(email) {
  verifiedEmailStore.set(normalizeEmail(email), Date.now() + getOtpTtlMs());
}

function consumeEmailVerification(email) {
  const key = normalizeEmail(email);
  const expiresAt = verifiedEmailStore.get(key);

  if (!expiresAt) {
    return false;
  }

  verifiedEmailStore.delete(key);
  return Date.now() <= expiresAt;
}

function storeOtp(email, otp) {
  otpStore.set(normalizeEmail(email), {
    otpHash: hashOtp(otp),
    expiresAt: Date.now() + getOtpTtlMs(),
    attempts: 0
  });
}

function logDevOtp({ email, otp, reason }) {
  console.log(`[DEV] Email OTP for ${email}: ${otp}`);
  if (reason) {
    console.warn(`[OTP] ${reason}`);
  }
}

export async function sendEmailOtp(email, { name } = {}) {
  const normalizedEmail = normalizeEmail(email);
  const otp = createOtp();
  storeOtp(normalizedEmail, otp);
  const ttlMinutes = getServiceEnv().otp.ttlMinutes;

  try {
    const result = await sendOtpEmail({
      to: normalizedEmail,
      otp,
      ttlMinutes,
      purpose: "verification",
      name
    });

    if (result.provider === "development") {
      logDevOtp({
        email: normalizedEmail,
        otp,
        reason: isResendConfigured()
          ? null
          : "Resend is not configured. Add RESEND_API_KEY and RESEND_FROM to send real email."
      });
    }

    return {
      provider: result.provider,
      to: normalizedEmail,
      channel: "email"
    };
  } catch (error) {
    logDevOtp({
      email: normalizedEmail,
      otp,
      reason: `Resend delivery failed (${error.message}). Using dev fallback OTP from logs.`
    });

    return {
      provider: "development",
      to: normalizedEmail,
      channel: "email",
      resendError: error.message
    };
  }
}

export async function verifyEmailOtp(email, otp) {
  if (consumeEmailVerification(email)) {
    return true;
  }

  const result = await verifyEmailOtpDetailed(email, otp);
  if (result.approved) {
    consumeEmailVerification(email);
  }

  return result.approved;
}

export async function verifyEmailOtpDetailed(email, otp) {
  const key = normalizeEmail(email);
  const record = otpStore.get(key);

  if (!record) {
    return { provider: "resend", approved: false, status: "not_found", channel: "email" };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { provider: "resend", approved: false, status: "expired", channel: "email" };
  }

  record.attempts += 1;
  if (record.attempts > 5) {
    otpStore.delete(key);
    return { provider: "resend", approved: false, status: "too_many_attempts", channel: "email" };
  }

  const valid = record.otpHash === hashOtp(otp);
  if (valid) {
    otpStore.delete(key);
    markEmailVerified(key);
  }

  return {
    provider: "resend",
    approved: valid,
    status: valid ? "approved" : "pending",
    channel: "email"
  };
}
