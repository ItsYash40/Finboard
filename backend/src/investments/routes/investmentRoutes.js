import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { UserProfile } from "../../models/UserProfile.js";
import { PortfolioHolding } from "../../models/PortfolioHolding.js";
import { buyStockSchema } from "../../kyc/schemas/kycSchemas.js";
import { debitForInvestment, getLinkedAccount } from "../../banking/services/bankingService.js";
import { notifyUser } from "../../kyc/services/appNotificationService.js";

export const investmentRouter = Router();

investmentRouter.use(requireAuth);

investmentRouter.get("/portfolio", async (req, res, next) => {
  try {
    const holdings = await PortfolioHolding.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ holdings });
  } catch (error) {
    next(error);
  }
});

investmentRouter.post("/buy", validate(buyStockSchema), async (req, res, next) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.user._id });
    if (profile?.kycStatus !== "approved") {
      return res.status(403).json({ message: "Complete KYC approval before investing" });
    }

    const bankAccount = await getLinkedAccount(req.user._id.toString());
    if (!bankAccount) {
      return res.status(400).json({ message: "Complete bank verification before investing" });
    }

    const totalAmount = req.body.price * req.body.quantity;
    await debitForInvestment(req.user._id.toString(), totalAmount, `Investment purchase: ${req.body.quantity} ${req.body.symbol.toUpperCase()}`);

    const holding = await PortfolioHolding.create({
      userId: req.user._id,
      symbol: req.body.symbol.toUpperCase(),
      name: req.body.name,
      quantity: req.body.quantity,
      purchasePrice: req.body.price,
      currentPrice: req.body.price,
      totalAmount
    });

    await notifyUser(req.user._id, "Stock Purchased", `Purchased ${req.body.quantity} ${req.body.symbol.toUpperCase()} units for Rs. ${totalAmount}.`, "investment");
    res.status(201).json({ holding });
  } catch (error) {
    next(error);
  }
});
