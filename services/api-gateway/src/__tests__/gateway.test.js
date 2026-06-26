import { describe, expect, it } from "@jest/globals";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-32chars-minimum-ok";
process.env.INTERNAL_SERVICE_KEY = "dev-internal-key";

const { buildGatewayApp } = await import("../app.js");

describe("API Gateway", () => {
  it("GET /health returns service status and routes", async () => {
    const app = buildGatewayApp();
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("api-gateway");
    expect(Array.isArray(response.body.routes)).toBe(true);
    expect(response.body.routes.some((route) => route.prefix === "/api/kyc")).toBe(true);
  });
});
