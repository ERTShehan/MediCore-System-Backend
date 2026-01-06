import { Router } from "express";
import { initiatePayment, handleNotify, verifyPaymentManual } from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/pay", authenticate, initiatePayment);

router.post("/notify", handleNotify);
router.post("/verify-manual", authenticate, verifyPaymentManual);

export default router;