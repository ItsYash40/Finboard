import { api } from "./api.js";

export const investmentApi = {
  buy: (payload) => api.post("/investments/buy", payload).then((response) => response.data.holding),
  portfolio: () => api.get("/investments/portfolio").then((response) => response.data.holdings)
};

