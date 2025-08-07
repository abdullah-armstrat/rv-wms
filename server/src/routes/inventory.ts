import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { adjustInventory, getInventoryByLocation } from "../controllers/inventory.controller";

const router = Router();
router.use(authenticate);

// get current stock at a location
router.get("/", getInventoryByLocation);

// adjust (add/remove)
router.post("/adjust", adjustInventory);

export default router;
