import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorRole: { type: String, enum: ["user", "admin", "system"], default: "system" },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: String,
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: String,
    userAgent: String
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);

