import { PrismaClient } from "@prisma/client";
import { env } from "../../config/env.js";

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn"] : ["error"]
});

export const bankingConfigured = env.bankingConfigured;

export function isPrismaConnectionError(error) {
  return (
    error?.code === "P1017" ||
    error?.message?.includes("Server has closed the connection") ||
    error?.message?.includes("forcibly closed by the remote host") ||
    error?.cause?.message?.includes("forcibly closed by the remote host")
  );
}

export async function resetPrismaConnection() {
  try {
    await prisma.$disconnect();
  } catch {
    // Prisma reconnects lazily on the next query.
  }
}
