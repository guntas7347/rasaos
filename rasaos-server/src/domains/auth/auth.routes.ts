import { Router } from "express";
import {
  login,
  loginSchema,
  getMe,
  signup,
  signupSchema,
  register,
  registerSchema,
  requestPasswordReset,
  requestPasswordResetSchema,
  validatePasswordResetLink,
  validatePasswordResetLinkSchema,
  resetPassword,
  resetPasswordSchema,
} from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/signup", validateRequest(signupSchema), signup);
router.post("/login", validateRequest(loginSchema), login);
router.get("/me", authenticate, getMe);
router.post(
  "/reset-password",
  validateRequest(requestPasswordResetSchema),
  requestPasswordReset,
);
router.post(
  "/reset-password/validate",
  validateRequest(validatePasswordResetLinkSchema),
  validatePasswordResetLink,
);
router.post(
  "/reset-password/confirm",
  validateRequest(resetPasswordSchema),
  resetPassword,
);

export default router;
