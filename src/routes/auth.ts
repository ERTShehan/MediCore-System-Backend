import { Router } from "express";
import { registerDoctor, login, refreshToken, getMyProfile } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { Role } from "../models/user.model";

const router = Router();

router.post("/register-doctor", registerDoctor);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.get("/me", authenticate, getMyProfile);

// // Protected: Only Doctors can create Counter accounts
// router.post(
//   "/register-counter",
//   authenticate,
//   requireRole([Role.DOCTOR]),
//   registerCounter
// );

export default router;