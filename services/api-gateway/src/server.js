import { loadEnv } from "@finboard/config";
import { getServiceEnv } from "@finboard/shared";
import { buildGatewayApp } from "./app.js";

loadEnv();

const env = getServiceEnv({ port: 4000, serviceName: "api-gateway" });
const app = buildGatewayApp();

app.listen(env.port, () => {
  console.log(`${env.serviceName} running on http://localhost:${env.port}`);
});

export default app;
