import { api } from "./api.js";

export const notificationApi = {
  app: () => api.get("/notifications").then((response) => response.data.notifications),
  dismiss: (id) => api.delete(`/notifications/${id}`).then((response) => response.data)
};
