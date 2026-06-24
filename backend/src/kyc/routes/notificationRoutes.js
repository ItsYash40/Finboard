import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { AppNotification } from "../../models/AppNotification.js";

export const appNotificationRouter = Router();

appNotificationRouter.use(requireAuth);

appNotificationRouter.get("/", async (req, res, next) => {
  try {
    const notifications = await AppNotification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
});

appNotificationRouter.delete("/:id", async (req, res, next) => {
  try {
    await AppNotification.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ message: "Notification removed" });
  } catch (error) {
    next(error);
  }
});
