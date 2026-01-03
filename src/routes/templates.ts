import { Router } from "express";
import { 
  addTemplate, 
  getMyTemplates, 
  deleteTemplate, 
  searchMedicineImage,
  searchSavedTemplates
} from "../controllers/template.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { Role } from "../models/user.model";

const router = Router();

router.use(authenticate, requireRole([Role.DOCTOR]));

router.post("/search-image", searchMedicineImage);
router.post("/create", addTemplate)
router.get("/all", getMyTemplates);
router.get("/suggestions", searchSavedTemplates);
router.delete("/:id", deleteTemplate);

export default router;