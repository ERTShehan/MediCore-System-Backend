import express from "express";
import { registerDoctor, login, getMe } from "../controllers/auth";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/register-doctor", registerDoctor);
router.post("/login", login);
router.get("/me", protect, getMe);

export default router;