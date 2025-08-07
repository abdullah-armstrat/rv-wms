// server/src/controllers/warehouse.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middlewares/auth";

const prisma = new PrismaClient();

// GET /api/warehouses
export async function getWarehouses(req: AuthRequest, res: Response) {
  const { role, warehouseId } = req.user;
  const where = role === "ADMIN" ? {} : { id: warehouseId };
  const list = await prisma.warehouse.findMany({ where });
  res.json(list);
}

// GET /api/warehouses/:id
export async function getWarehouseById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const wh = await prisma.warehouse.findUnique({ where: { id } });
  if (!wh) return res.status(404).json({ error: "Not found" });
  res.json(wh);
}

// POST /api/warehouses
export async function createWarehouse(req: Request, res: Response) {
  const { name, address, country, timezone, manager, logoUrl } = req.body;
  const wh = await prisma.warehouse.create({
    data: { name, address, country, timezone, manager, logoUrl },
  });
  res.status(201).json(wh);
}

// PUT /api/warehouses/:id
export async function updateWarehouse(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { name, address, country, timezone, manager, logoUrl } = req.body;
  const wh = await prisma.warehouse.update({
    where: { id },
    data: { name, address, country, timezone, manager, logoUrl },
  });
  res.json(wh);
}

// DELETE /api/warehouses/:id
export async function deleteWarehouse(req: Request, res: Response) {
  const id = Number(req.params.id);
  await prisma.warehouse.delete({ where: { id } });
  res.status(204).send();
}
