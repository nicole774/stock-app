const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const daysAgo = (n, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d;
};

async function main() {
  // ------------------------------------------------------------
  // Utilisateurs (admin / manager / employé)
  // ------------------------------------------------------------
  const adminHash = await bcrypt.hash("admin123", 10);
  const staffHash = await bcrypt.hash("staff123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@stock.app" },
    update: {},
    create: { name: "Awa Ouédraogo", email: "admin@stock.app", password: adminHash, role: "ADMIN" },
  });

  await prisma.user.upsert({
    where: { email: "manager@stock.app" },
    update: {},
    create: { name: "Ibrahim Kaboré", email: "manager@stock.app", password: staffHash, role: "MANAGER" },
  });

  await prisma.user.upsert({
    where: { email: "employee@stock.app" },
    update: {},
    create: { name: "Fatou Sawadogo", email: "employee@stock.app", password: staffHash, role: "EMPLOYEE" },
  });

  // ------------------------------------------------------------
  // Entrepôts
  // ------------------------------------------------------------
  const warehousesData = [
    { code: "WH-01", name: "Entrepôt Principal", address: "Zone industrielle, Ouagadougou" },
    { code: "WH-02", name: "Dépôt Bobo", address: "Route de Dogona, Bobo-Dioulasso" },
    { code: "WH-03", name: "Boutique Centre", address: "Avenue Kwame N'Krumah, Ouagadougou" },
  ];
  const warehouses = {};
  for (const w of warehousesData) {
    warehouses[w.code] = await prisma.warehouse.upsert({
      where: { code: w.code },
      update: {},
      create: w,
    });
  }

  // ------------------------------------------------------------
  // Catégories
  // ------------------------------------------------------------
  const categoriesData = [
    { name: "Électronique", description: "Appareils et accessoires électroniques" },
    { name: "Informatique", description: "Périphériques et stockage" },
    { name: "Papeterie", description: "Fournitures de bureau et scolaires" },
    { name: "Mobilier", description: "Mobilier de bureau" },
    { name: "Consommables", description: "Consommables d'impression et entretien" },
  ];
  const categories = {};
  for (const c of categoriesData) {
    categories[c.name] = await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  // ------------------------------------------------------------
  // Fournisseurs & clients (identifiants fixes pour l'idempotence)
  // ------------------------------------------------------------
  const suppliersData = [
    { id: "seed-supplier-1", name: "Fournisseur Général SARL", email: "contact@fournisseur-general.example", phone: "+226 70 11 22 33", address: "Ouagadougou, Secteur 4" },
    { id: "seed-supplier-2", name: "MobiImport Burkina", email: "ventes@mobiimport.example", phone: "+226 70 44 55 66", address: "Bobo-Dioulasso" },
    { id: "seed-supplier-3", name: "Bureau Plus SA", email: "commandes@bureauplus.example", phone: "+226 70 77 88 99", address: "Ouagadougou, Secteur 15" },
  ];
  const suppliers = [];
  for (const s of suppliersData) {
    suppliers.push(
      await prisma.supplier.upsert({ where: { id: s.id }, update: {}, create: s })
    );
  }

  const customersData = [
    { id: "seed-customer-1", name: "Librairie Notre Dame", email: "achats@lnd.example", phone: "+226 71 00 11 22", address: "Ouagadougou" },
    { id: "seed-customer-2", name: "TechSolutions BF", email: "contact@techsolutions.example", phone: "+226 71 33 44 55", address: "Ouagadougou, Zone du Bois" },
    { id: "seed-customer-3", name: "École Privée Les Palmiers", email: "gestion@lespalmiers.example", phone: "+226 71 66 77 88", address: "Koudougou" },
    { id: "seed-customer-4", name: "Cabinet Comptable Faso", email: "cabinet@faso-compta.example", phone: "+226 71 99 00 11", address: "Bobo-Dioulasso" },
  ];
  const customers = [];
  for (const c of customersData) {
    customers.push(
      await prisma.customer.upsert({ where: { id: c.id }, update: {}, create: c })
    );
  }

  // ------------------------------------------------------------
  // Produits (SKU stables pour l'idempotence)
  // ------------------------------------------------------------
  const productsData = [
    { sku: "SKU-0001", name: "Câble USB-C 1m", description: "Câble de charge et transfert de données", unit: "pcs", costPrice: 800, sellingPrice: 1500, minStockLevel: 20, categoryName: "Électronique", supplierId: suppliers[0].id },
    { sku: "SKU-0002", name: "Chargeur rapide 30W", description: "Chargeur mural USB-C Power Delivery", unit: "pcs", costPrice: 3500, sellingPrice: 6000, minStockLevel: 10, categoryName: "Électronique", supplierId: suppliers[0].id },
    { sku: "SKU-0003", name: "Écouteurs Bluetooth", description: "Écouteurs sans fil avec micro", unit: "pcs", costPrice: 8500, sellingPrice: 14000, minStockLevel: 8, categoryName: "Électronique", supplierId: suppliers[1].id },
    { sku: "SKU-0004", name: "Souris sans fil", description: "Souris optique 2.4 GHz", unit: "pcs", costPrice: 2200, sellingPrice: 4000, minStockLevel: 15, categoryName: "Informatique", supplierId: suppliers[0].id },
    { sku: "SKU-0005", name: "Clavier USB", description: "Clavier filaire AZERTY", unit: "pcs", costPrice: 4000, sellingPrice: 7000, minStockLevel: 10, categoryName: "Informatique", supplierId: suppliers[0].id },
    { sku: "SKU-0006", name: "Clé USB 64 Go", description: "Clé USB 3.0", unit: "pcs", costPrice: 5000, sellingPrice: 8500, minStockLevel: 12, categoryName: "Informatique", supplierId: suppliers[1].id },
    { sku: "SKU-0007", name: "Cahier 200 pages", description: "Cahier piquré format 17×22", unit: "pcs", costPrice: 350, sellingPrice: 700, minStockLevel: 100, categoryName: "Papeterie", supplierId: suppliers[2].id },
    { sku: "SKU-0008", name: "Stylo bille (lot de 10)", description: "Stylos bleus en lot", unit: "lot", costPrice: 500, sellingPrice: 1000, minStockLevel: 50, categoryName: "Papeterie", supplierId: suppliers[2].id },
    { sku: "SKU-0009", name: "Ramette papier A4", description: "Papier 80 g/m², 500 feuilles", unit: "ramette", costPrice: 2800, sellingPrice: 4200, minStockLevel: 30, categoryName: "Papeterie", supplierId: suppliers[2].id },
    { sku: "SKU-0010", name: "Chaise de bureau", description: "Chaise ergonomique à roulettes", unit: "pcs", costPrice: 18000, sellingPrice: 28000, minStockLevel: 5, categoryName: "Mobilier", supplierId: suppliers[2].id },
    { sku: "SKU-0011", name: "Lampe de bureau LED", description: "Lampe articulée 3 intensités", unit: "pcs", costPrice: 6500, sellingPrice: 11000, minStockLevel: 6, categoryName: "Mobilier", supplierId: suppliers[1].id },
    { sku: "SKU-0012", name: "Cartouche encre noire", description: "Cartouche laser compatible", unit: "pcs", costPrice: 9500, sellingPrice: 15000, minStockLevel: 8, categoryName: "Consommables", supplierId: suppliers[2].id },
  ];

  const products = {};
  for (const p of productsData) {
    const { categoryName, ...data } = p;
    products[p.sku] = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: { ...data, categoryId: categories[categoryName].id },
    });
  }

  // ------------------------------------------------------------
  // Stock final par produit/entrepôt (l'upsert écrase, donc re-jouable)
  // ------------------------------------------------------------
  const stockPlan = [
    ["SKU-0001", { "WH-01": 120, "WH-03": 40 }],
    ["SKU-0002", { "WH-01": 45, "WH-02": 15 }],
    ["SKU-0003", { "WH-01": 5, "WH-03": 3 }],
    ["SKU-0004", { "WH-01": 60, "WH-02": 22 }],
    ["SKU-0005", { "WH-01": 30 }],
    ["SKU-0006", { "WH-01": 25, "WH-03": 18 }],
    ["SKU-0007", { "WH-01": 400, "WH-02": 150 }],
    ["SKU-0008", { "WH-01": 90, "WH-03": 45 }],
    ["SKU-0009", { "WH-01": 55, "WH-02": 20 }],
    ["SKU-0010", { "WH-02": 9 }],
    ["SKU-0011", { "WH-02": 4, "WH-03": 2 }],
    ["SKU-0012", { "WH-01": 3, "WH-02": 2 }],
  ];

  for (const [sku, perWarehouse] of stockPlan) {
    for (const [whCode, quantity] of Object.entries(perWarehouse)) {
      await prisma.stockItem.upsert({
        where: {
          productId_warehouseId: { productId: products[sku].id, warehouseId: warehouses[whCode].id },
        },
        update: { quantity },
        create: { productId: products[sku].id, warehouseId: warehouses[whCode].id, quantity },
      });
    }
  }

  // ------------------------------------------------------------
  // Historique de mouvements (une seule fois : la table doit être vide)
  // ------------------------------------------------------------
  const existingMovements = await prisma.stockMovement.count();
  if (existingMovements === 0) {
    for (const [sku, perWarehouse] of stockPlan) {
      for (const [whCode, quantity] of Object.entries(perWarehouse)) {
        // Stock initial il y a 30 jours
        await prisma.stockMovement.create({
          data: {
            type: "IN",
            productId: products[sku].id,
            quantity: Math.max(1, Math.round(quantity * 0.7)),
            toWarehouseId: warehouses[whCode].id,
            reason: "Stock initial d'inventaire",
            userId: admin.id,
            createdAt: daysAgo(30, 9),
          },
        });
        // Réapprovisionnement récent
        await prisma.stockMovement.create({
          data: {
            type: "IN",
            productId: products[sku].id,
            quantity: Math.max(1, Math.round(quantity * 0.3)),
            toWarehouseId: warehouses[whCode].id,
            reason: "Réapprovisionnement",
            userId: admin.id,
            createdAt: daysAgo(6 + (quantity % 5), 11),
          },
        });
        // Sortie comptoir
        if (quantity > 10) {
          await prisma.stockMovement.create({
            data: {
              type: "OUT",
              productId: products[sku].id,
              quantity: Math.max(1, Math.round(quantity * 0.05)),
              fromWarehouseId: warehouses[whCode].id,
              reason: "Vente comptoir",
              userId: admin.id,
              createdAt: daysAgo(2 + (quantity % 3), 16),
            },
          });
        }
      }
    }

    // Quelques transferts entre entrepôts
    await prisma.stockMovement.create({
      data: {
        type: "TRANSFER",
        productId: products["SKU-0001"].id,
        quantity: 20,
        fromWarehouseId: warehouses["WH-01"].id,
        toWarehouseId: warehouses["WH-03"].id,
        reason: "Transfert vers boutique",
        userId: admin.id,
        createdAt: daysAgo(4, 14),
      },
    });
    await prisma.stockMovement.create({
      data: {
        type: "TRANSFER",
        productId: products["SKU-0007"].id,
        quantity: 50,
        fromWarehouseId: warehouses["WH-01"].id,
        toWarehouseId: warehouses["WH-02"].id,
        reason: "Transfert dépôt régional",
        userId: admin.id,
        createdAt: daysAgo(3, 10),
      },
    });

    console.log("Historique de mouvements de démonstration créé.");
  }

  // ------------------------------------------------------------
  // Commandes d'achat / vente de démonstration (si aucune)
  // ------------------------------------------------------------
  const poCount = await prisma.purchaseOrder.count();
  if (poCount === 0) {
    await prisma.purchaseOrder.create({
      data: {
        reference: "PO-DEMO-001",
        status: "RECEIVED",
        totalAmount: 30 * 3500 + 50 * 800,
        supplierId: suppliers[0].id,
        warehouseId: warehouses["WH-01"].id,
        userId: admin.id,
        createdAt: daysAgo(20),
        items: {
          create: [
            { productId: products["SKU-0002"].id, quantity: 30, unitCost: 3500 },
            { productId: products["SKU-0001"].id, quantity: 50, unitCost: 800 },
          ],
        },
      },
    });

    await prisma.purchaseOrder.create({
      data: {
        reference: "PO-DEMO-002",
        status: "PENDING",
        totalAmount: 10 * 18000 + 8 * 6500,
        supplierId: suppliers[2].id,
        warehouseId: warehouses["WH-02"].id,
        userId: admin.id,
        createdAt: daysAgo(3),
        items: {
          create: [
            { productId: products["SKU-0010"].id, quantity: 10, unitCost: 18000 },
            { productId: products["SKU-0011"].id, quantity: 8, unitCost: 6500 },
          ],
        },
      },
    });

    await prisma.purchaseOrder.create({
      data: {
        reference: "PO-DEMO-003",
        status: "CONFIRMED",
        totalAmount: 15 * 9500,
        supplierId: suppliers[2].id,
        warehouseId: warehouses["WH-01"].id,
        userId: admin.id,
        createdAt: daysAgo(1),
        items: {
          create: [{ productId: products["SKU-0012"].id, quantity: 15, unitCost: 9500 }],
        },
      },
    });
  }

  const soCount = await prisma.salesOrder.count();
  if (soCount === 0) {
    await prisma.salesOrder.create({
      data: {
        reference: "SO-DEMO-001",
        status: "CONFIRMED",
        totalAmount: 25 * 1500 + 20 * 1000,
        customerId: customers[0].id,
        warehouseId: warehouses["WH-01"].id,
        userId: admin.id,
        createdAt: daysAgo(5),
        items: {
          create: [
            { productId: products["SKU-0001"].id, quantity: 25, unitPrice: 1500 },
            { productId: products["SKU-0008"].id, quantity: 20, unitPrice: 1000 },
          ],
        },
      },
    });

    await prisma.salesOrder.create({
      data: {
        reference: "SO-DEMO-002",
        status: "CONFIRMED",
        totalAmount: 5 * 14000 + 10 * 8500,
        customerId: customers[1].id,
        warehouseId: warehouses["WH-03"].id,
        userId: admin.id,
        createdAt: daysAgo(2),
        items: {
          create: [
            { productId: products["SKU-0003"].id, quantity: 5, unitPrice: 14000 },
            { productId: products["SKU-0006"].id, quantity: 10, unitPrice: 8500 },
          ],
        },
      },
    });

    await prisma.salesOrder.create({
      data: {
        reference: "SO-DEMO-003",
        status: "CANCELLED",
        totalAmount: 3 * 28000,
        customerId: customers[3].id,
        warehouseId: warehouses["WH-02"].id,
        userId: admin.id,
        createdAt: daysAgo(8),
        items: {
          create: [{ productId: products["SKU-0010"].id, quantity: 3, unitPrice: 28000 }],
        },
      },
    });
  }

  console.log("Seed terminé.");
  console.log("Comptes de démonstration :");
  console.log("  ADMIN    admin@stock.app / admin123");
  console.log("  MANAGER  manager@stock.app / staff123");
  console.log("  EMPLOYEE employee@stock.app / staff123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
