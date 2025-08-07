import { AuthRequest } from "../middlewares/auth";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/zones
export async function getZones(req: AuthRequest, res: Response) {
  const { role, warehouseId } = req.user;
  const where = role === "ADMIN" ? {} : { warehouseId };
  const zones = await prisma.zone.findMany({ where });
  res.json(zones);
}

// GET /api/zones/:id
export async function getZoneById(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const zone = await prisma.zone.findUnique({ where: { id } });
  if (!zone) return res.status(404).json({ error: "Zone not found" });
  // enforce warehouse scoping for non-admin
  if (req.user.role !== "ADMIN" && zone.warehouseId !== req.user.warehouseId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.json(zone);
}

// POST /api/zones
export async function createZone(req: AuthRequest, res: Response) {
  const { name, description, warehouseId } = req.body;
  const zone = await prisma.zone.create({ data: { name, description, warehouseId } });
  res.status(201).json(zone);
}

// PUT /api/zones/:id
export async function updateZone(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const { name, description } = req.body;
  // ensure only ADMIN can update any, others block
  const zone = await prisma.zone.update({
    where: { id },
    data: { name, description },
  });
  res.json(zone);
}

// DELETE /api/zones/:id
export async function deleteZone(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  await prisma.zone.delete({ where: { id } });
  res.status(204).send();
}
