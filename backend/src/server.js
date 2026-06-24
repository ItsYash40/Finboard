import { app } from "./app.js";
import { startVerificationRefundJob, stopVerificationRefundJob } from "./banking/jobs/refundJob.js";
import { connectDb, disconnectDb } from "./config/db.js";
import { env } from "./config/env.js";

let server;

async function start() {
  await connectDb();

  server = app.listen(env.port, () => {
    console.log(`Backend API running on http://localhost:${env.port}`);
  });
  startVerificationRefundJob();
}

async function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  if (server) {
    server.close(async () => {
      await disconnectDb();
      stopVerificationRefundJob();
      process.exit(0);
    });
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
