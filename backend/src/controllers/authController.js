import { User } from "../models/User.js";
import { UserProfile } from "../models/UserProfile.js";
import { sendPhoneOtp, verifyPhoneOtp, verifyPhoneOtpDetailed } from "../services/otpService.js";
import { signJwt } from "../utils/jwt.js";

export async function sendOtp(req, res, next) {
  try {
    const result = await sendPhoneOtp(req.body.phone);
    return res.json({
      message: "OTP sent successfully",
      provider: result.provider,
      sid: result.sid,
      status: result.status,
      to: result.to,
      channel: result.channel,
      devOtp: result.devOtp
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const result = await verifyPhoneOtpDetailed(req.body.phone, req.body.otp);
    return res.json({
      message: result.approved ? "OTP verified successfully" : "Invalid or expired OTP",
      ...result
    });
  } catch (error) {
    next(error);
  }
}

export async function signup(req, res, next) {
  try {
    const { name, email, phone, password, otp } = req.body;
    const otpVerified = await verifyPhoneOtp(phone, otp);

    if (!otpVerified) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(409).json({ message: "Email or phone number is already registered" });
    }

    const user = new User({
      name,
      email,
      phone,
      phoneVerified: true
    });
    await user.setPassword(password);
    await user.save();

    await UserProfile.create({
      userId: user._id,
      fullName: name,
      mobileNumber: phone,
      emailAddress: email
    });

    const token = signJwt(user);
    return res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (error) {
    next(error);
  }
}

export async function signin(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
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
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid admin email or password" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "This account is not allowed to access the admin dashboard" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    return res.json({ token: signJwt(user), user: user.toSafeJSON() });
  } catch (error) {
    next(error);
  }
}

export async function phoneLogin(req, res, next) {
  try {
    const otpVerified = await verifyPhoneOtp(req.body.phone, req.body.otp);

    if (!otpVerified) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ phone: req.body.phone });

    if (!user) {
      return res.status(404).json({ message: "No account exists for this verified phone number" });
    }

    user.lastLoginAt = new Date();
    user.phoneVerified = true;
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
