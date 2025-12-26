import { Router } from "express";
import { 
    createVisit, 
    requestNextPatient, 
    submitTreatment, 
    getPatientHistory, 
    getQueueStatus,
    getVisitDetails,
    getAllTodayVisits,
    createEmergencyVisit
} from "../controllers/visit.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { Role } from "../models/user.model";

const router = Router();

router.get("/today", authenticate, getAllTodayVisits);

// Create Visit (Register Patient)
router.post("/create", authenticate, requireRole([Role.COUNTER]), createVisit);

// Request Next Patient
router.post("/next", authenticate, requireRole([Role.DOCTOR]), requestNextPatient);

router.put("/complete/:id", authenticate, requireRole([Role.DOCTOR]), submitTreatment);

router.get("/history/:phone", authenticate, requireRole([Role.DOCTOR]), getPatientHistory);

// Get Queue Status (Current Patient & Completed List)
router.get("/status", authenticate, getQueueStatus);

// For Print
router.get("/details/:id", authenticate, getVisitDetails);

router.post("/emergency", authenticate, requireRole([Role.DOCTOR]), createEmergencyVisit);

export default router;