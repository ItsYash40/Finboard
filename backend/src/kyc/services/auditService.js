import { AuditLog } from "../../models/AuditLog.js";

export function audit(req, action, resourceType, resourceId, details = {}) {
  return AuditLog.create({
    actorId: req.user?._id,
    actorRole: req.user?.role || "system",
    action,
    resourceType,
    resourceId,
    details,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });
}

