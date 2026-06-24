import { Router } from "express";
import {
  createBeneficiary,
  deleteNotification,
  freezeAccount,
  getAccount,
  getAdminTransactions,
  getAdminUsers,
  getDemoAccounts,
  getLinkedAccounts,
  getNotifications,
  lookupBankAccount,
  removeLinkedAccount,
  getTransactions,
  resetBalance,
  transfer,
  verifyBank
} from "../controllers/bankingController.js";
import { requireAdmin, requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { requireBankingConfigured } from "../middleware/requireBankingConfigured.js";
import { beneficiarySchema, freezeSchema, resetBalanceSchema, transferSchema, verifyBankSchema } from "../schemas/bankingSchemas.js";

export const bankingRouter = Router();

bankingRouter.use(requireAuth);
bankingRouter.use(requireBankingConfigured);

bankingRouter.get("/demo-accounts", getDemoAccounts);
bankingRouter.get("/account", getAccount);
bankingRouter.get("/accounts", getLinkedAccounts);
bankingRouter.get("/balance", getAccount);
bankingRouter.get("/lookup/:accountNumber", lookupBankAccount);
bankingRouter.delete("/accounts/:id", removeLinkedAccount);
bankingRouter.post("/verify-bank", validate(verifyBankSchema), verifyBank);
bankingRouter.post("/beneficiary", validate(beneficiarySchema), createBeneficiary);
bankingRouter.post("/transfer", validate(transferSchema), transfer);
bankingRouter.get("/transactions", getTransactions);
bankingRouter.get("/notifications", getNotifications);
bankingRouter.delete("/notifications/:id", deleteNotification);

bankingRouter.get("/admin/users", requireAdmin, getAdminUsers);
bankingRouter.get("/admin/transactions", requireAdmin, getAdminTransactions);
bankingRouter.patch("/admin/users/:id/freeze", requireAdmin, validate(freezeSchema), freezeAccount);
bankingRouter.patch("/admin/users/:id/reset-balance", requireAdmin, validate(resetBalanceSchema), resetBalance);
