const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@stock.app" },
    update: {},
    create: {
      name: "Administrateur",
      email: "admin@stock.app",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  const warehouse = await prisma.warehouse.upsert({
    where: { code: "WH-01" },
    update: {},
    create: { name: "Entrepôt Principal", code: "WH-01", address: "Ouagadougou" },
  });

  const category = await prisma.category.upsert({
    where: { name: "Électronique" },
    update: {},
    create: { name: "Électronique", description: "Appareils et accessoires électroniques" },
  });

  const supplier = await prisma.supplier.upsert({
    where: { id: "seed-supplier-1" },
    update: {},
    create: {
      id: "seed-supplier-1",
      name: "Fournisseur Général SARL",
      email: "contact@fournisseur.example",
      phone: "+226 70 00 00 00",
    },
  });

  const product = await prisma.product.upsert({
    where: { sku: "SKU-0001" },
    update: {},
    create: {
      sku: "SKU-0001",
      name: "Câble USB-C 1m",
      description: "Câble de charge et transfert de données",
      unit: "pcs",
      costPrice: 800,
      sellingPrice: 1500,
      minStockLevel: 20,
      categoryId: category.id,
      supplierId: supplier.id,
    },
  });

  await prisma.stockItem.upsert({
    where: { productId_warehouseId: { productId: product.id, warehouseId: warehouse.id } },
    update: {},
    create: { productId: product.id, warehouseId: warehouse.id, quantity: 50 },
  });

  console.log("Seed terminé.");
  console.log("Connexion admin -> email: admin@stock.app / mot de passe: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
