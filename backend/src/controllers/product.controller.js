const prisma = require("../lib/prisma");

async function list(req, res, next) {
  try {
    const { search, categoryId, lowStock } = req.query;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(categoryId && { categoryId }),
    };

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        supplier: true,
        stockItems: { include: { warehouse: true } },
      },
      orderBy: { name: "asc" },
    });

    const withTotals = products.map((p) => {
      const totalStock = p.stockItems.reduce((sum, s) => sum + s.quantity, 0);
      return { ...p, totalStock };
    });

    const result = lowStock === "true"
      ? withTotals.filter((p) => p.totalStock <= p.minStockLevel)
      : withTotals;

    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        supplier: true,
        stockItems: { include: { warehouse: true } },
      },
    });
    if (!product) return res.status(404).json({ message: "Produit introuvable." });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { sku, name, description, unit, costPrice, sellingPrice, minStockLevel, categoryId, supplierId } = req.body;

    if (!sku || !name || costPrice == null || sellingPrice == null) {
      return res.status(400).json({ message: "sku, name, costPrice et sellingPrice sont requis." });
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        description,
        unit,
        costPrice,
        sellingPrice,
        minStockLevel: minStockLevel ?? 0,
        categoryId: categoryId || null,
        supplierId: supplierId || null,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
