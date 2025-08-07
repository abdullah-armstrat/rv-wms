import { Router } from "express";
import { uploadProducts, getProducts, deleteProduct } from "../controllers/product.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();
router.use(authenticate);

// list
router.get("/", getProducts);

// upload
router.post("/upload", uploadProducts);

// delete
router.delete("/:id", deleteProduct);

export default router;
