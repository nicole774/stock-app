const prisma = require("../lib/prisma");

async function stats(req, res, next) {
  try {
    const [productCount, warehouseCount, supplierCount, totalStockAgg, products, salesAgg, pendingPurchaseOrders, stockRows] =
      await Promise.all([
        prisma.product.count({ where: { isActive: true } }),
        prisma.warehouse.count({ where: { isActive: true } }),
        prisma.supplier.count(),
        prisma.stockItem.aggregate({ _sum: { quantity: true } }),
        prisma.product.findMany({
          where: { isActive: true },
          include: { stockItems: true },
        }),
        prisma.salesOrder.aggregate({
          where: { status: { not: "CANCELLED" } },
          _sum: { totalAmount: true },
          _count: true,
        }),
        prisma.purchaseOrder.count({ where: { status: { in: ["PENDING", "CONFIRMED"] } } }),
        prisma.warehouse.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            code: true,
            stockItems: { select: { quantity: true } },
          },
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
      .filter((p) => p.totalStock <= p.minStockLevel)
      .sort((a, b) => a.totalStock - b.totalStock);

    const stockValueAgg = await prisma.$queryRaw`
      SELECT COALESCE(SUM(si.quantity * p."costPrice"), 0) as value
      FROM stock_items si
      JOIN products p ON p.id = si."productId"
    `;

    // Mouvements entrées/sorties des 14 derniers jours, groupés par jour
    const movementsPerDay = await prisma.$queryRaw`
      SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day,
             type,
             SUM(quantity)::int AS quantity
      FROM stock_movements
      WHERE "createdAt" >= NOW() - INTERVAL '13 days'
        AND type IN ('IN', 'OUT')
      GROUP BY 1, 2
      ORDER BY 1
    `;

    const stockByWarehouse = stockRows.map((w) => ({
      id: w.id,
      name: w.name,
      code: w.code,
      units: w.stockItems.reduce((s, i) => s + i.quantity, 0),
    }));

    const recentMovements = await prisma.stockMovement.findMany({
      take: 8,
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
      salesRevenue: Number(salesAgg._sum.totalAmount || 0),
      salesCount: salesAgg._count || 0,
      pendingPurchaseOrders,
      stockByWarehouse,
      movementsPerDay,
      recentMovements,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { stats };
