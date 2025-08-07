// server/src/controllers/inventory.controller.ts

import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * POST /api/inventory/adjust
 * Adjust stock (add/remove) at a location.
 * Body: { locationId, productId, change }
 */
export async function adjustInventory(req: AuthRequest, res: Response) {
  const { locationId, productId, change } = req.body as {
    locationId: number;
    productId: number;
    change: number;
  };

  // Only ADMIN or INVENTORY_SUP can adjust
  if (req.user.role !== "ADMIN" && req.user.role !== "INVENTORY_SUP") {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Verify the user's warehouse matches the location's warehouse
  const loc = await prisma.location.findUnique({
    where: { id: locationId },
    include: { zone: true },
  });
  if (!loc || (req.user.role !== "ADMIN" && loc.zone.warehouseId !== req.user.warehouseId)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Upsert the Inventory row
  const inv = await prisma.inventory.upsert({
    where: { locationId_productId: { locationId, productId } },
    create: { locationId, productId, quantity: change },
    update: { quantity: { increment: change } },
  });

  // Log the change
  await prisma.inventoryLog.create({
    data: {
      userId: req.user.userId,    // <-- use userId, not id
      locationId,
      productId,
      change,
    },
  });

  res.json({ locationId, productId, quantity: inv.quantity });
}

/**
 * GET /api/inventory?locationId=…
 * Returns inventory rows for a specific location.
 */
export async function getInventoryByLocation(req: AuthRequest, res: Response) {
  const locationId = Number(req.query.locationId);
  const list = await prisma.inventory.findMany({
    where: { locationId },
    include: { product: true },
  });
  res.json(list);
}
