import { Router } from "express";
import {
  signup,
  signin,
  adminSignin,
  emailLogin,
  me,
  changePassword,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword
} from "../controllers/auth.controller.js";
import { requireAuth } from "@finboard/contracts";
import { validate } from "@finboard/shared";
import {
  adminSigninSchema,
  changePasswordSchema,
  emailLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  sendOtpSchema,
  signinSchema,
  signupSchema,
  verifyOtpSchema
} from "../validators/auth.schema.js";

export const authRouter = Router();

authRouter.post("/signup", validate(signupSchema), signup);
authRouter.post("/signin", validate(signinSchema), signin);
authRouter.post("/admin/signin", validate(adminSigninSchema), adminSignin);
authRouter.post("/send-otp", validate(sendOtpSchema), sendOtp);
authRouter.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
authRouter.post("/email-login", validate(emailLoginSchema), emailLogin);
authRouter.get("/me", requireAuth, me);
authRouter.patch("/change-password", requireAuth, validate(changePasswordSchema), changePassword);
authRouter.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
authRouter.post("/reset-password", validate(resetPasswordSchema), resetPassword);
