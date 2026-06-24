import fs from "fs";
import path from "path";
import multer from "multer";
import { env } from "../../config/env.js";

const uploadRoot = path.resolve(env.uploadDir, "kyc");
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, uploadRoot);
  },
  filename(req, file, callback) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    callback(null, `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`);
  }
});

export const kycUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    if (!["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(file.mimetype)) {
      return callback(new Error("Only PNG, JPG, WEBP, or PDF files are allowed"));
    }
    callback(null, true);
  }
});

