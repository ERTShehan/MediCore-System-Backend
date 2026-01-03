import { Router } from "express";
import { registerDoctor, login, refreshToken, getMyProfile, sendForgotPasswordOTP, resetPasswordWithOTP, updateProfile, changePassword } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { Role } from "../models/user.model";
import { upload } from "../middleware/upload";

const router = Router();

router.post("/register-doctor", registerDoctor);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.get("/me", authenticate, getMyProfile);

router.post("/password/forgot/otp", sendForgotPasswordOTP);
router.post("/password/reset", resetPasswordWithOTP);

router.put("/profile/update", authenticate, upload.single("profileImage"), updateProfile);

router.put("/password/change", authenticate, changePassword);

// // Protected: Only Doctors can create Counter accounts
// router.post(
//   "/register-counter",
//   authenticate,
//   requireRole([Role.DOCTOR]),
//   registerCounter
// );

export default router;