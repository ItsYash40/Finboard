import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import { getServiceUrls } from "@finboard/contracts";
import { errorHandler, getServiceEnv, notFound, sanitizeRequest } from "@finboard/shared";

export function buildGatewayApp() {
  const env = getServiceEnv({ port: 4000, serviceName: "api-gateway" });
  const targets = getServiceUrls();

  const routeTable = [
    { prefix: "/api/auth", target: targets.auth },
    { prefix: "/api/profile", target: targets.profile },
    { prefix: "/api/kyc", target: targets.kyc },
    { prefix: "/api/documents", target: targets.ocr },
    { prefix: "/api/ocr", target: targets.ocr },
    { prefix: "/api/banking", target: targets.banking },
    { prefix: "/api/investments", target: targets.investment },
    { prefix: "/api/notifications", target: targets.notification },
    { prefix: "/api/audit", target: targets.audit },
    { prefix: "/uploads", target: targets.kyc }
  ];

  const app = express();

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
  app.use(sanitizeRequest);
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: env.nodeEnv === "production" ? 100 : 1000,
      standardHeaders: "draft-8",
      legacyHeaders: false
    })
  );

  app.get("/health", (req, res) => {
    res.json({ status: "ok", service: env.serviceName, routes: routeTable });
  });

  for (const route of routeTable) {
    app.use(
      route.prefix,
      createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        pathRewrite: (path) => `${route.prefix}${path}`
      })
    );
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
