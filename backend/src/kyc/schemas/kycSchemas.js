import { z } from "zod";

export const submitKycSchema = z.object({
  name: z.string().trim().min(2).max(100),
  panNumber: z.string().trim().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/i),
  aadhaarNumber: z.string().trim().regex(/^\d{12}$/)
});

export const reviewKycSchema = z.object({
  remarks: z.string().trim().max(500).optional()
});

export const buyStockSchema = z.object({
  symbol: z.string().trim().min(1).max(12),
  name: z.string().trim().min(1).max(80),
  price: z.coerce.number().positive(),
  quantity: z.coerce.number().int().positive()
});

