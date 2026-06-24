import { z } from "zod";

const phoneRegex = /^\+[1-9]\d{7,14}$/;

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().regex(phoneRegex, "Phone number must be in E.164 format, for example +919876543210"),
  password: z.string().min(8).max(72),
  otp: z.string().trim().regex(/^\d{4,8}$/, "OTP must be 4 to 8 digits")
});

export const sendOtpSchema = z.object({
  phone: z.string().trim().regex(phoneRegex, "Phone number must be in E.164 format, for example +919876543210")
});

export const signinSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

export const phoneLoginSchema = z.object({
  phone: z.string().trim().regex(phoneRegex, "Phone number must be in E.164 format, for example +919876543210"),
  otp: z.string().trim().regex(/^\d{4,8}$/, "OTP must be 4 to 8 digits")
});

export const verifyOtpSchema = phoneLoginSchema;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72)
});
