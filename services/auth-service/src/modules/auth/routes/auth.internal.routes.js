import { Router } from "express";
import { User } from "../models/user.model.js";

function toSafeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    phoneVerified: user.phoneVerified,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export function createInternalAuthRouter({ requireInternalService }) {
  const router = Router();

  router.get("/users/:id", requireInternalService, async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id).lean();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user: toSafeUser(user) });
    } catch (error) {
      next(error);
    }
  });

  router.post("/users/batch", requireInternalService, async (req, res, next) => {
    try {
      const ids = req.body.ids || [];
      const users = await User.find({ _id: { $in: ids } }).lean();
      res.json({ users: users.map(toSafeUser) });
    } catch (error) {
      next(error);
    }
  });

  router.get("/users", requireInternalService, async (req, res, next) => {
    try {
      const query = req.query.role ? { role: req.query.role } : {};
      const users = await User.find(query).select("name email phone role createdAt").lean();
      res.json({ users: users.map(toSafeUser) });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
