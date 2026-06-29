import { User } from "../models/user.model.js";
import { createInitialProfile } from "@finboard/contracts";
import { sendEmailOtp, verifyEmailOtp, verifyEmailOtpDetailed } from "../services/otp.service.js";
import { sendPasswordResetOtp, verifyPasswordResetOtp } from "../services/email.service.js";
import { signJwt } from "../../../common/helpers/jwt.helper.js";
import { isAdminRole } from "../helpers/roles.helper.js";

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

export async function sendOtp(req, res, next) {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account registered with this email address" });
    }

    const result = await sendEmailOtp(email, { name: user.name });
    return res.json({
      message: "OTP sent successfully to your email",
      provider: result.provider,
      to: result.to,
      channel: result.channel
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const email = normalizeEmail(req.body.email);
    const result = await verifyEmailOtpDetailed(email, req.body.otp);

    if (!result.approved) {
      return res.json({
        message: "Invalid or expired OTP",
        registrationComplete: false,
        ...result
      });
    }

    const pendingUser = await User.findOne({ email, emailVerified: false });

    if (pendingUser) {
      pendingUser.emailVerified = true;
      pendingUser.lastLoginAt = new Date();
      await pendingUser.save();

      await createInitialProfile({
        userId: pendingUser._id,
        fullName: pendingUser.name,
        mobileNumber: pendingUser.phone,
        emailAddress: pendingUser.email
      }).catch(() => {});

      return res.json({
        message: "Registration complete",
        registrationComplete: true,
        token: signJwt(pendingUser),
        user: pendingUser.toSafeJSON(),
        ...result
      });
    }

    return res.json({
      message: "OTP verified successfully",
      registrationComplete: false,
      ...result
    });
  } catch (error) {
    next(error);
  }
}

export async function signup(req, res, next) {
  try {
    const { name, email, phone, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const byEmail = await User.findOne({ email: normalizedEmail });
    const byPhone = await User.findOne({ phone });

    if (byEmail && byPhone && byEmail._id.toString() !== byPhone._id.toString()) {
      return res.status(409).json({
        message: "This email and phone number belong to different pending signups. Use matching details or different credentials."
      });
    }

    const existing = byEmail || byPhone;

    if (existing) {
      if (existing.emailVerified) {
        return res.status(409).json({
          message: "An account with this email or phone already exists. Sign in instead."
        });
      }

      if (existing.email === normalizedEmail && existing.phone === phone) {
        existing.name = name;
        await existing.setPassword(password);
        await existing.save();
        await sendEmailOtp(normalizedEmail, { name: existing.name });

        return res.status(200).json({
          message: "Welcome back. Complete email verification to finish signup.",
          resumeVerification: true,
          requiresEmailVerification: true,
          registrationComplete: false,
          user: existing.toSafeJSON()
        });
      }

      if (existing.email === normalizedEmail) {
        return res.status(409).json({
          message: "This email is awaiting verification with a different phone number. Use that phone or choose a different email."
        });
      }

      return res.status(409).json({
        message: "This phone number is awaiting verification with a different email. Use that email or choose a different phone."
      });
    }

    const user = new User({
      name,
      email: normalizedEmail,
      phone,
      emailVerified: false
    });
    await user.setPassword(password);
    await user.save();

    await sendEmailOtp(normalizedEmail, { name });

    return res.status(201).json({
      message: "Account created. OTP sent to your email for verification.",
      requiresEmailVerification: true,
      registrationComplete: false,
      user: user.toSafeJSON()
    });
  } catch (error) {
    next(error);
  }
}

export async function signin(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: normalizeEmail(email) }).select("+passwordHash");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: "Complete email verification before signing in" });
    }

    if (isAdminRole(user.role)) {
      return res.status(403).json({ message: "This account must sign in through the admin portal" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    return res.json({ token: signJwt(user), user: user.toSafeJSON() });
  } catch (error) {
    next(error);
  }
}

export async function adminSignin(req, res, next) {
  try {
    const { email, password, adminRole } = req.body;
    const user = await User.findOne({ email: normalizeEmail(email) }).select("+passwordHash");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid admin email or password" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: "Complete email verification before signing in" });
    }

    if (!isAdminRole(user.role)) {
      return res.status(403).json({ message: "This account is not allowed to access the admin dashboard" });
    }

    if (adminRole && adminRole !== "admin" && user.role !== adminRole) {
      return res.status(403).json({ message: "Selected admin role does not match this account" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    return res.json({ token: signJwt(user), user: user.toSafeJSON() });
  } catch (error) {
    next(error);
  }
}

export async function emailLogin(req, res, next) {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account registered with this email address" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: "Complete email verification before signing in" });
    }

    if (isAdminRole(user.role)) {
      return res.status(403).json({ message: "This account must sign in through the admin portal" });
    }

    const otpVerified = await verifyEmailOtp(email, req.body.otp);

    if (!otpVerified) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    return res.json({ token: signJwt(user), user: user.toSafeJSON() });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  return res.json({ user: req.user.toSafeJSON() });
}

export async function changePassword(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select("+passwordHash");

    if (!user || !(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    await user.setPassword(req.body.newPassword);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const result = await sendPasswordResetOtp(email);
    return res.json({
      message: "If an account exists with that email, a reset code has been sent",
      provider: result.provider
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");

    if (!user) {
      return res.status(400).json({ message: "Invalid reset request" });
    }

    const { valid, reason } = verifyPasswordResetOtp(email, otp);

    if (!valid) {
      const message = reason === "expired" ? "Reset code has expired" : "Invalid reset code";
      return res.status(400).json({ message });
    }

    await user.setPassword(newPassword);
    await user.save();

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
}
