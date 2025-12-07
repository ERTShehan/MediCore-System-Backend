import { Router } from "express";
import { 
    createStaff, 
    getMyStaff, 
    updateStaff, 
    deleteStaff, 
    toggleStaffStatus 
} from "../controllers/staff.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { Role } from "../models/user.model";

const router = Router();

router.use(authenticate, requireRole([Role.DOCTOR]));

router.post("/create", createStaff);       
router.get("/all", getMyStaff);            
router.put("/update/:id", updateStaff);    
router.delete("/delete/:id", deleteStaff); 
router.patch("/status/:id", toggleStaffStatus);

export default router;