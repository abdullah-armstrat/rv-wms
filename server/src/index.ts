import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/auth";
import warehouseRoutes from "./routes/warehouse";
import zoneRoutes from "./routes/zone";
import locationRoutes from "./routes/location";
import productRoutes from "./routes/product";
import inventoryRoutes from "./routes/inventory";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// serve QR images
app.use("/qrcodes", express.static(path.join(__dirname, "../public/qrcodes")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);

/* ---------------------------------
   Local dev = start a normal server
   Vercel    = export the handler only
----------------------------------*/
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));
}

export default app;        // <-- crucial for Vercel
