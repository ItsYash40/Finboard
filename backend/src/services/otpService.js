import crypto from "crypto";
import twilio from "twilio";
import { env } from "../config/env.js";

const otpStore = new Map();
const verifiedPhoneStore = new Map();

function markPhoneVerified(phone) {
  verifiedPhoneStore.set(phone, Date.now() + env.twilio.otpTtlMinutes * 60 * 1000);
}

function consumePhoneVerification(phone) {
  const expiresAt = verifiedPhoneStore.get(phone);

  if (!expiresAt) {
    return false;
  }

  verifiedPhoneStore.delete(phone);
  return Date.now() <= expiresAt;
}

function isTwilioVerifyConfigured() {
  return Boolean(env.twilio.accountSid && (hasApiKeyAuth() || env.twilio.authToken) && env.twilio.verifyServiceSid);
}

function isTwilioMessageConfigured() {
  return Boolean(
    env.twilio.accountSid &&
      (hasApiKeyAuth() || env.twilio.authToken) &&
      (env.twilio.fromPhone || env.twilio.messagingServiceSid)
  );
}

function hasApiKeyAuth() {
  return Boolean(env.twilio.apiKeySid && env.twilio.apiKeySecret);
}

function getClient() {
  if (env.twilio.accountSid && env.twilio.authToken) {
    return twilio(env.twilio.accountSid, env.twilio.authToken);
  }

  return twilio(env.twilio.apiKeySid, env.twilio.apiKeySecret, {
    accountSid: env.twilio.accountSid
  });
}

function createOtp() {
  if (env.nodeEnv === "development" && env.twilio.devOtp) {
    return env.twilio.devOtp;
  }

  return String(crypto.randomInt(100000, 999999));
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

export async function sendPhoneOtp(phone) {
  if (isTwilioVerifyConfigured()) {
    const verification = await getClient().verify.v2.services(env.twilio.verifyServiceSid).verifications.create({
      to: phone,
      channel: "sms"
    });
    return {
      provider: "twilio_verify",
      sid: verification.sid,
      status: verification.status,
      to: verification.to,
      channel: verification.channel
    };
  }

  const otp = createOtp();
  const expiresAt = Date.now() + env.twilio.otpTtlMinutes * 60 * 1000;
  otpStore.set(phone, { otpHash: hashOtp(otp), expiresAt, attempts: 0 });

  if (isTwilioMessageConfigured()) {
    const payload = {
      to: phone,
      body: `Your Finboard verification code is ${otp}. It expires in ${env.twilio.otpTtlMinutes} minutes.`
    };

    if (env.twilio.messagingServiceSid) {
      payload.messagingServiceSid = env.twilio.messagingServiceSid;
    } else {
      payload.from = env.twilio.fromPhone;
    }

    await getClient().messages.create(payload);
    return { provider: "twilio_messages" };
  }

  console.log(`Development OTP for ${phone}: ${otp}`);
  console.warn("Twilio SMS sender is not configured. Add TWILIO_FROM_PHONE or TWILIO_MESSAGING_SERVICE_SID to send real SMS.");
  return {
    provider: "development",
    devOtp: env.nodeEnv === "development" ? otp : undefined
  };
}

export async function verifyPhoneOtp(phone, otp) {
  if (consumePhoneVerification(phone)) {
    return true;
  }

  const result = await verifyPhoneOtpDetailed(phone, otp);
  if (result.approved) {
    consumePhoneVerification(phone);
  }

  return result.approved;
}

export async function verifyPhoneOtpDetailed(phone, otp) {
  if (isTwilioVerifyConfigured()) {
    const result = await getClient().verify.v2.services(env.twilio.verifyServiceSid).verificationChecks.create({
      to: phone,
      code: otp
    });
    const approved = result.status === "approved";
    if (approved) {
      markPhoneVerified(phone);
    }

    return {
      provider: "twilio_verify",
      approved,
      status: result.status,
      sid: result.sid,
      to: result.to
    };
  }

  const record = otpStore.get(phone);
  if (!record) {
    return { provider: "development", approved: false, status: "not_found" };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return { provider: "development", approved: false, status: "expired" };
  }

  record.attempts += 1;
  if (record.attempts > 5) {
    otpStore.delete(phone);
    return { provider: "development", approved: false, status: "too_many_attempts" };
  }

  const valid = record.otpHash === hashOtp(otp);
  if (valid) {
    otpStore.delete(phone);
    markPhoneVerified(phone);
  }

  return { provider: "development", approved: valid, status: valid ? "approved" : "pending" };
}
