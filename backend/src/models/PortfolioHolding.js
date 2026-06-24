import mongoose from "mongoose";

const portfolioHoldingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    symbol: { type: String, required: true, uppercase: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    purchasePrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true }
  },
  { timestamps: true }
);

export const PortfolioHolding = mongoose.model("PortfolioHolding", portfolioHoldingSchema);

