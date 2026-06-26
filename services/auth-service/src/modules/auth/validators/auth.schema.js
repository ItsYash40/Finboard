import { z } from "zod";

const phoneRegex = /^\+[1-9]\d{7,14}$/;

export const signupSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(120),
    phone: z.string().trim().regex(phoneRegex, "Phone number must be in E.164 format, for example +919876543210"),
    password: z.string().min(8).max(72),
    otp: z
      .string()
      .trim()
      .regex(/^\d{4,8}$/, "OTP must be 4 to 8 digits")
      .optional(),
    firebaseIdToken: z.string().trim().min(20).optional()
  })
  .superRefine((data, ctx) => {
    if (!data.otp && !data.firebaseIdToken) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone verification is required via OTP or Firebase token",
        path: ["otp"]
      });
    }
  });

export const sendOtpSchema = z.object({
  phone: z.string().trim().regex(phoneRegex, "Phone number must be in E.164 format, for example +919876543210")
});

export const signinSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

export const adminSigninSchema = signinSchema.extend({
  adminRole: z.enum(["admin", "rta_admin", "amc_admin"]).optional()
});

export const phoneLoginSchema = z
  .object({
    phone: z.string().trim().regex(phoneRegex, "Phone number must be in E.164 format, for example +919876543210"),
    otp: z
      .string()
      .trim()
      .regex(/^\d{4,8}$/, "OTP must be 4 to 8 digits")
      .optional(),
    firebaseIdToken: z.string().trim().min(20).optional()
  })
  .superRefine((data, ctx) => {
    if (!data.otp && !data.firebaseIdToken) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone verification is required via OTP or Firebase token",
        path: ["otp"]
      });
    }
  });

export const verifyOtpSchema = phoneLoginSchema;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72)
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email()
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email(),
  otp: z.string().trim().regex(/^\d{4,8}$/, "OTP must be 4 to 8 digits"),
  newPassword: z.string().min(8).max(72)
});
