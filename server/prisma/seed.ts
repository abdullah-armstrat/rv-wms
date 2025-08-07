// server/prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // 1. Make a default warehouse
  const wh = await prisma.warehouse.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Default Warehouse",
      address: "123 Main St",
      country: "USA",
      timezone: "UTC",
      manager: "Admin",
      logoUrl: "",
    },
  });

  // 2. Hash a known password
  const hash = await bcrypt.hash("admin123", 10);

  // 3. Make an admin user assigned to that warehouse
  await prisma.user.upsert({
    where: { email: "admin@warehouse.com" },
    update: {},
    create: {
      email: "admin@warehouse.com",
      passwordHash: hash,
      name: "Super Admin",
      role: "ADMIN",
      warehouseId: wh.id,
    },
  });

  console.log("✅ Seeded default warehouse + admin user");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
