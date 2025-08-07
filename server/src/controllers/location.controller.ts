import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();
const qrDir = path.join(__dirname, "../../public/qrcodes");

// ensure the output directory exists
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

// GET /api/locations
export async function getLocations(req: AuthRequest, res: Response) {
  const { role, warehouseId } = req.user;
  const where = role === "ADMIN"
    ? {}
    : { zone: { warehouseId } };
  const list = await prisma.location.findMany({ where });
  res.json(list);
}

// GET /api/locations/:id
export async function getLocationById(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const loc = await prisma.location.findUnique({ where: { id } });
  if (!loc) return res.status(404).json({ error: "Not found" });
  // enforce scope
  if (req.user.role !== "ADMIN") {
    const zone = await prisma.zone.findUnique({ where: { id: loc.zoneId } });
    if (!zone || zone.warehouseId !== req.user.warehouseId) {
      return res.status(403).json({ error: "Forbidden" });
    }
  }
  res.json(loc);
}

// POST /api/locations
export async function createLocation(req: AuthRequest, res: Response) {
  const { code, type, zoneId } = req.body;
  // generate QR code PNG
  const fileName = `qr_${Date.now()}.png`;
  const filePath = path.join(qrDir, fileName);
  await QRCode.toFile(filePath, code);

  const loc = await prisma.location.create({
    data: { code, type, zoneId, qrPath: `/qrcodes/${fileName}` },
  });
  res.status(201).json(loc);
}

// PUT /api/locations/:id
export async function updateLocation(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const { code, type, zoneId } = req.body;
  // optional: regenerate QR if code changed (omitted for brevity)
  const loc = await prisma.location.update({
    where: { id },
    data: { code, type, zoneId },
  });
  res.json(loc);
}

// DELETE /api/locations/:id
export async function deleteLocation(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  // optionally delete the QR file from disk
  const loc = await prisma.location.findUnique({ where: { id } });
  if (loc?.qrPath) {
    const full = path.join(__dirname, "../../public", loc.qrPath);
    if (fs.existsSync(full)) fs.unlinkSync(full);
  }
  await prisma.location.delete({ where: { id } });
  res.status(204).send();
}
