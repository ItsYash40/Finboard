import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { profileUpdateSchema } from "../schemas/profileSchemas.js";

export const profileRouter = Router();

profileRouter.use(requireAuth);
profileRouter.get("/me", getProfile);
profileRouter.put("/me", validate(profileUpdateSchema), updateProfile);

