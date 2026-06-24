import { AppNotification } from "../../models/AppNotification.js";

export function notifyUser(userId, title, message, type = "general") {
  return AppNotification.create({ userId, title, message, type });
}

