// server/src/controllers/product.controller.ts

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import fs from "fs";
import path from "path";
import { AuthRequest } from "../middlewares/auth";
// We use require() so we don’t need separate TypeScript types
const csvParser = require("csv-parser");

const prisma = new PrismaClient();

// Ensure a tmp directory exists for uploads
const tmpDir = path.join(__dirname, "../../tmp");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// Multer setup for CSV uploads
const upload = multer({ dest: tmpDir });

/**
 * POST /api/products/upload
 * Admin-only bulk import. Auto-detects tabs vs commas.
 * Expects first row to be headers: name,sku,category
 * - Trims whitespace
 * - Skips blank rows
 * - Deduplicates by SKU in-memory
 * - Uses Prisma createMany with skipDuplicates to avoid inserting existing SKUs
 */
export const uploadProducts = [
  upload.single("file"),
  async (req: AuthRequest, res: Response) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const filePath = req.file!.path;

    // Detect delimiter by peeking at the first line
    let delimiter = ",";
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const firstLine = raw.split(/\r?\n/)[0];
      if (firstLine.includes("\t")) {
        delimiter = "\t";
      }
    } catch {
      // default to comma if read fails
    }

    const rows: Array<{ name: string; sku: string; category: string }> = [];

    fs.createReadStream(filePath)
      .pipe(
        csvParser({
          separator: delimiter,
          mapHeaders: ({ header }) => header.trim().toLowerCase(),
          mapValues:  ({ value })  => value.trim(),
          strict: false,
        })
      )
      .on("data", (row: any) => {
        // Skip completely blank rows
        if (!row.name && !row.sku && !row.category) return;
        // Only import rows with all three fields non-empty
        if (row.name && row.sku && row.category) {
          rows.push({
            name:     String(row.name),
            sku:      String(row.sku),
            category: String(row.category),
          });
        }
      })
      .on("end", async () => {
        try {
          // Deduplicate by SKU in-memory
          const unique = Array.from(
            rows.reduce((map, item) => map.set(item.sku, item), new Map<string, typeof rows[0]>())
              .values()
          );

          // Bulk insert, skipping existing SKUs
          const result = await prisma.product.createMany({
            data: unique,
            skipDuplicates: true,
          });

          fs.unlinkSync(filePath);
          res.json({ imported: result.count });
        } catch (err: any) {
          fs.unlinkSync(filePath);
          console.error(err);
          res.status(500).json({ error: err.message });
        }
      })
      .on("error", (err: any) => {
        fs.unlinkSync(filePath);
        res.status(400).json({ error: err.message });
      });
  },
];

/**
 * GET /api/products
 * Fetch all products, ordered by name.
 */
export async function getProducts(req: Request, res: Response) {
  try {
    const list = await prisma.product.findMany({ orderBy: { name: "asc" } });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * DELETE /api/products/:id
 * Admin only: delete a product by ID.
 */
export async function deleteProduct(req: AuthRequest, res: Response) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const id = Number(req.params.id);
  try {
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
