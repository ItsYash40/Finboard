import { loadEnv } from "@finboard/config";
import { registerLocalAuthHandler } from "@finboard/contracts";
import { bootstrapService } from "@finboard/service-kit";
import { connectMongo } from "@finboard/shared";
import { buildApp } from "./app.js";
import { registerAuthHandlers } from "./bootstrap/register-handlers.js";

loadEnv();
registerAuthHandlers();

export async function start() {
  await bootstrapService({
    serviceName: "auth-service",
    port: 4001,
    createApp: async () => buildApp(),
    connectDatabases: async (log) => {
      const { getServiceEnv } = await import("@finboard/config");
      await connectMongo(getServiceEnv().mongoUri, "Auth MongoDB");
      log.info("MongoDB connected");
    }
  });
}

start();
