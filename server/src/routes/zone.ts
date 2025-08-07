import { Router } from "express";
import {
  getZones,
  getZoneById,
  createZone,
  updateZone,
  deleteZone,
} from "../controllers/zone.controller";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();
router.use(authenticate);

// READ for all roles
router.get("/", getZones);
router.get("/:id", getZoneById);

// ADMIN only for mutations
router.post("/", authorize("ADMIN"), createZone);
router.put("/:id", authorize("ADMIN"), updateZone);
router.delete("/:id", authorize("ADMIN"), deleteZone);

export default router;
