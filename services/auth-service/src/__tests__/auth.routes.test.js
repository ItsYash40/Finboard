import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

// Set env vars before any module that reads them is invoked
process.env.JWT_SECRET = "test-jwt-secret-32chars-minimum-ok";
process.env.JWT_EXPIRES_IN = "1h";
process.env.NODE_ENV = "development";
process.env.BCRYPT_SALT_ROUNDS = "1";
process.env.INTERNAL_SERVICE_KEY = "dev-internal-key";
process.env.TWILIO_DEV_OTP = "111111";

import { registerLocalProfileHandler } from "@finboard/contracts";
import { buildApp } from "../app.js";
import { registerAuthHandlers } from "../bootstrap/register-handlers.js";
import { User } from "../modules/auth/models/user.model.js";
import { signJwt } from "../common/helpers/jwt.helper.js";

// Wire local handlers so signup doesn't call profile-service over HTTP
registerLocalProfileHandler({
  createInitialProfile: async () => ({ id: "test-profile-id" })
});
registerAuthHandlers();

const DEV_OTP = "111111";
const TEST_PHONE = "+919876543210";
const TEST_EMAIL = "user@test.com";
const TEST_PASSWORD = "Password@123";

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  app = buildApp();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

// ── Helpers ──────────────────────────────────────────────────────────────────

async function createUser(overrides = {}) {
  const user = new User({
    name: overrides.name ?? "Test User",
    email: overrides.email ?? TEST_EMAIL,
    phone: overrides.phone ?? TEST_PHONE,
    role: overrides.role ?? "user",
    phoneVerified: true,
    emailVerified: overrides.emailVerified ?? false
  });
  await user.setPassword(overrides.password ?? TEST_PASSWORD);
  await user.save();
  return user;
}

function bearerToken(user) {
  return `Bearer ${signJwt(user)}`;
}

// ── POST /api/auth/send-otp ───────────────────────────────────────────────────

describe("POST /api/auth/send-otp", () => {
  it("returns devOtp in development mode", async () => {
    const res = await request(app)
      .post("/api/auth/send-otp")
      .send({ phone: TEST_PHONE });

    expect(res.status).toBe(200);
    expect(res.body.provider).toBe("development");
    expect(res.body.devOtp).toBe(DEV_OTP);
  });

  it("rejects invalid phone format", async () => {
    const res = await request(app)
      .post("/api/auth/send-otp")
      .send({ phone: "9876543210" });

    expect(res.status).toBe(400);
  });
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────

describe("POST /api/auth/verify-otp", () => {
  it("returns approved:true with devOtp after send-otp", async () => {
    await request(app).post("/api/auth/send-otp").send({ phone: TEST_PHONE });

    const res = await request(app)
      .post("/api/auth/verify-otp")
      .send({ phone: TEST_PHONE, otp: DEV_OTP });

    expect(res.status).toBe(200);
    expect(res.body.approved).toBe(true);
  });

  it("returns approved:false with wrong OTP", async () => {
    await request(app).post("/api/auth/send-otp").send({ phone: TEST_PHONE });

    const res = await request(app)
      .post("/api/auth/verify-otp")
      .send({ phone: TEST_PHONE, otp: "000000" });

    expect(res.status).toBe(200);
    expect(res.body.approved).toBe(false);
  });
});

// ── POST /api/auth/signup ─────────────────────────────────────────────────────

describe("POST /api/auth/signup", () => {
  it("creates a user and returns token", async () => {
    await request(app).post("/api/auth/send-otp").send({ phone: TEST_PHONE });

    const res = await request(app).post("/api/auth/signup").send({
      name: "New User",
      email: TEST_EMAIL,
      phone: TEST_PHONE,
      password: TEST_PASSWORD,
      otp: DEV_OTP
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(TEST_EMAIL);
    expect(res.body.user.role).toBe("user");
  });

  it("returns 409 on duplicate email", async () => {
    await createUser();
    await request(app).post("/api/auth/send-otp").send({ phone: "+919876543211" });

    const res = await request(app).post("/api/auth/signup").send({
      name: "Dup User",
      email: TEST_EMAIL,
      phone: "+919876543211",
      password: TEST_PASSWORD,
      otp: DEV_OTP
    });

    expect(res.status).toBe(409);
  });

  it("returns 409 on duplicate phone", async () => {
    await createUser();
    await request(app).post("/api/auth/send-otp").send({ phone: TEST_PHONE });

    const res = await request(app).post("/api/auth/signup").send({
      name: "Dup User",
      email: "other@test.com",
      phone: TEST_PHONE,
      password: TEST_PASSWORD,
      otp: DEV_OTP
    });

    expect(res.status).toBe(409);
  });

  it("returns 400 when no OTP or firebaseIdToken provided", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "No OTP",
      email: TEST_EMAIL,
      phone: TEST_PHONE,
      password: TEST_PASSWORD
    });

    expect(res.status).toBe(400);
  });
});

// ── POST /api/auth/signin ─────────────────────────────────────────────────────

describe("POST /api/auth/signin", () => {
  it("returns token on valid credentials", async () => {
    await createUser();

    const res = await request(app)
      .post("/api/auth/signin")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(TEST_EMAIL);
  });

  it("returns 401 on wrong password", async () => {
    await createUser();

    const res = await request(app)
      .post("/api/auth/signin")
      .send({ email: TEST_EMAIL, password: "WrongPass@1" });

    expect(res.status).toBe(401);
  });

  it("returns 401 on unknown email", async () => {
    const res = await request(app)
      .post("/api/auth/signin")
      .send({ email: "nobody@test.com", password: TEST_PASSWORD });

    expect(res.status).toBe(401);
  });
});

// ── POST /api/auth/admin/signin ───────────────────────────────────────────────

describe("POST /api/auth/admin/signin", () => {
  it("allows admin role to sign in", async () => {
    await createUser({ email: "admin@test.com", phone: "+910000000099", role: "admin" });

    const res = await request(app)
      .post("/api/auth/admin/signin")
      .send({ email: "admin@test.com", password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("admin");
  });

  it("allows rta_admin role", async () => {
    await createUser({ email: "rta@test.com", phone: "+910000000098", role: "rta_admin" });

    const res = await request(app)
      .post("/api/auth/admin/signin")
      .send({ email: "rta@test.com", password: TEST_PASSWORD });

    expect(res.status).toBe(200);
  });

  it("returns 403 when user role attempts admin login", async () => {
    await createUser();

    const res = await request(app)
      .post("/api/auth/admin/signin")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(403);
  });

  it("returns 403 when adminRole does not match user role", async () => {
    await createUser({ email: "rta@test.com", phone: "+910000000097", role: "rta_admin" });

    const res = await request(app)
      .post("/api/auth/admin/signin")
      .send({ email: "rta@test.com", password: TEST_PASSWORD, adminRole: "amc_admin" });

    expect(res.status).toBe(403);
  });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

describe("GET /api/auth/me", () => {
  it("returns user with valid JWT", async () => {
    const user = await createUser();

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", bearerToken(user));

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(TEST_EMAIL);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 with tampered token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid.token.here");

    expect(res.status).toBe(401);
  });
});

// ── PATCH /api/auth/change-password ──────────────────────────────────────────

describe("PATCH /api/auth/change-password", () => {
  it("updates password successfully", async () => {
    const user = await createUser();

    const res = await request(app)
      .patch("/api/auth/change-password")
      .set("Authorization", bearerToken(user))
      .send({ currentPassword: TEST_PASSWORD, newPassword: "NewPass@456" });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
  });

  it("returns 401 when currentPassword is wrong", async () => {
    const user = await createUser();

    const res = await request(app)
      .patch("/api/auth/change-password")
      .set("Authorization", bearerToken(user))
      .send({ currentPassword: "WrongPass@1", newPassword: "NewPass@456" });

    expect(res.status).toBe(401);
  });

  it("returns 400 when newPassword is too short", async () => {
    const user = await createUser();

    const res = await request(app)
      .patch("/api/auth/change-password")
      .set("Authorization", bearerToken(user))
      .send({ currentPassword: TEST_PASSWORD, newPassword: "short" });

    expect(res.status).toBe(400);
  });
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────────

describe("POST /api/auth/forgot-password", () => {
  it("returns 200 and devOtp when account exists in dev mode", async () => {
    await createUser();

    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: TEST_EMAIL });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("reset code");
    expect(res.body.devOtp).toBe(DEV_OTP);
  });

  it("returns 200 but no devOtp when account does not exist", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "nobody@test.com" });

    expect(res.status).toBe(200);
    expect(res.body.devOtp).toBeUndefined();
  });

  it("returns 400 on invalid email format", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "not-an-email" });

    expect(res.status).toBe(400);
  });
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────

describe("POST /api/auth/reset-password", () => {
  it("resets password and allows login with new password", async () => {
    await createUser();

    await request(app).post("/api/auth/forgot-password").send({ email: TEST_EMAIL });

    const resetRes = await request(app).post("/api/auth/reset-password").send({
      email: TEST_EMAIL,
      otp: DEV_OTP,
      newPassword: "ResetPass@789"
    });
    expect(resetRes.status).toBe(200);
    expect(resetRes.body.message).toMatch(/reset/i);

    const loginRes = await request(app)
      .post("/api/auth/signin")
      .send({ email: TEST_EMAIL, password: "ResetPass@789" });
    expect(loginRes.status).toBe(200);
  });

  it("returns 400 on wrong OTP", async () => {
    await createUser();
    await request(app).post("/api/auth/forgot-password").send({ email: TEST_EMAIL });

    const res = await request(app).post("/api/auth/reset-password").send({
      email: TEST_EMAIL,
      otp: "000000",
      newPassword: "ResetPass@789"
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it("returns 400 when no forgot-password was requested", async () => {
    // Use a distinct email so no OTP from prior tests leaks into this one
    await createUser({ email: "nootp@test.com", phone: "+919000000001" });

    const res = await request(app).post("/api/auth/reset-password").send({
      email: "nootp@test.com",
      otp: DEV_OTP,
      newPassword: "ResetPass@789"
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 for unknown email", async () => {
    const res = await request(app).post("/api/auth/reset-password").send({
      email: "nobody@test.com",
      otp: DEV_OTP,
      newPassword: "ResetPass@789"
    });

    expect(res.status).toBe(400);
  });
});
