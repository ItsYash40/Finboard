import dotenv from "dotenv";

dotenv.config();

const required = ["MONGODB_URI", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  clientOrigins: (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  mongoUri: process.env.MONGODB_URI,
  bankDatabaseUrl: process.env.BANK_DATABASE_URL,
  bankingConfigured: Boolean(process.env.BANK_DATABASE_URL && !process.env.BANK_DATABASE_URL.includes("your-supabase-host")),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  mistralApiKey: process.env.MISTRAL_API_KEY,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  openRouterModel: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    apiKeySid: process.env.TWILIO_API_KEY_SID,
    apiKeySecret: process.env.TWILIO_API_KEY_SECRET,
    verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID,
    fromPhone: process.env.TWILIO_FROM_PHONE,
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
    otpTtlMinutes: Number(process.env.TWILIO_OTP_TTL_MINUTES || 5),
    devOtp: process.env.TWILIO_DEV_OTP || "123456"
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  }
};
