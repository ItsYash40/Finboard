import { Router } from "express";
import { processDocument } from "../services/ocr.service.js";

export function createInternalOcrRouter({ requireInternalService }) {
  const router = Router();

  router.post("/process", requireInternalService, async (req, res, next) => {
    try {
      const { filePath, type } = req.body;
      const result = await processDocument(filePath, type);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
