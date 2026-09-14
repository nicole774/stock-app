const prisma = require("../lib/prisma");

async function stats(req, res, next) {
  try {
    const [productCount, warehouseCount, supplierCount, totalStockAgg, products] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.warehouse.count({ where: { isActive: true } }),
      prisma.supplier.count(),
      prisma.stockItem.aggregate({ _sum: { quantity: true } }),
      prisma.product.findMany({
        where: { isActive: true },
        include: { stockItems: true },
      }),
    ]);

    const lowStockProducts = products
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        minStockLevel: p.minStockLevel,
        totalStock: p.stockItems.reduce((s, i) => s + i.quantity, 0),
      }))
      .filter((p) => p.totalStock <= p.minStockLevel);

    const stockValueAgg = await prisma.$queryRaw`
      SELECT COALESCE(SUM(si.quantity * p."costPrice"), 0) as value
      FROM stock_items si
      JOIN products p ON p.id = si."productId"
    `;

    const recentMovements = await prisma.stockMovement.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { product: true, fromWarehouse: true, toWarehouse: true },
    });

    res.json({
      productCount,
      warehouseCount,
      supplierCount,
      totalStockUnits: totalStockAgg._sum.quantity || 0,
      totalStockValue: Number(stockValueAgg[0]?.value || 0),
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      recentMovements,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { stats };
