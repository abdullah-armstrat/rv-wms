import { Router } from "express";
import {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../controllers/location.controller";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();
router.use(authenticate);

router.get("/", getLocations);
router.get("/:id", getLocationById);

// only ADMIN can mutate
router.post("/", authorize("ADMIN"), createLocation);
router.put("/:id", authorize("ADMIN"), updateLocation);
router.delete("/:id", authorize("ADMIN"), deleteLocation);

export default router;
