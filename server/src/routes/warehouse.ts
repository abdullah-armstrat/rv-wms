// server/src/routes/warehouse.ts
import { Router } from "express";
import {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "../controllers/warehouse.controller";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

// everyone must be authenticated
router.use(authenticate);

// both ADMIN and non-admin can list & view
router.get("/", getWarehouses);
router.get("/:id", getWarehouseById);

// only ADMIN can mutate
router.post("/", authorize("ADMIN"), createWarehouse);
router.put("/:id", authorize("ADMIN"), updateWarehouse);
router.delete("/:id", authorize("ADMIN"), deleteWarehouse);

export default router;
