import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { authRouter } from "./routes/authRoutes.js";
import { bankingRouter } from "./banking/routes/bankingRoutes.js";
import { investmentRouter } from "./investments/routes/investmentRoutes.js";
import { kycRouter } from "./kyc/routes/kycRoutes.js";
import { appNotificationRouter } from "./kyc/routes/notificationRoutes.js";
import { profileRouter } from "./routes/profileRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { sanitizeRequest } from "./middleware/sanitize.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(env.uploadDir));
app.use(sanitizeRequest);
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false
  })
);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "kyc-auth-backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/banking", bankingRouter);
app.use("/api/kyc", kycRouter);
app.use("/api/notifications", appNotificationRouter);
app.use("/api/investments", investmentRouter);

app.use(notFound);
app.use(errorHandler);
