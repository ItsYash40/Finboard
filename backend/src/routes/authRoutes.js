import { Router } from "express";
import { signup, signin, adminSignin, phoneLogin, me, changePassword, sendOtp, verifyOtp } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { changePasswordSchema, phoneLoginSchema, sendOtpSchema, signinSchema, signupSchema, verifyOtpSchema } from "../schemas/authSchemas.js";

export const authRouter = Router();

authRouter.post("/signup", validate(signupSchema), signup);
authRouter.post("/signin", validate(signinSchema), signin);
authRouter.post("/admin/signin", validate(signinSchema), adminSignin);
authRouter.post("/send-otp", validate(sendOtpSchema), sendOtp);
authRouter.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
authRouter.post("/phone-login", validate(phoneLoginSchema), phoneLogin);
authRouter.get("/me", requireAuth, me);
authRouter.patch("/change-password", requireAuth, validate(changePasswordSchema), changePassword);
