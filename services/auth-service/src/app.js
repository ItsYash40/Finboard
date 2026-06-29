import { getServiceEnv } from "@finboard/config";
import { createApp } from "@finboard/service-kit";
import { requireInternalService } from "@finboard/shared";
import { authRouter, createInternalAuthRouter } from "./modules/auth/index.js";

export function buildApp() {
  const env = getServiceEnv({ serviceName: "auth-service", port: 4001 });

  return createApp({
    serviceName: env.serviceName,
    clientOrigins: env.clientOrigins,
    routes: [
      { path: "/api/auth", router: authRouter },
      {
        path: "/internal",
        router: createInternalAuthRouter({
          requireInternalService: requireInternalService(env.internalServiceKey)
        })
      }
    ]
  });
}
