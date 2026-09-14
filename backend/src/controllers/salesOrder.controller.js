const prisma = require("../lib/prisma");

function genReference(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

async function list(req, res, next) {
  try {
    const orders = await prisma.salesOrder.findMany({
      include: {
        customer: true,
        warehouse: true,
        user: { select: { id: true, name: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const order = await prisma.salesOrder.findUnique({
      where: { id: req.params.id },
      include: { customer: true, warehouse: true, items: { include: { product: true } } },
    });
    if (!order) return res.status(404).json({ message: "Commande introuvable." });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

// Corps: { customerId, warehouseId, items: [{ productId, quantity, unitPrice }] }
// La vente déduit immédiatement le stock (statut CONFIRMED) après vérification de disponibilité.
async function create(req, res, next) {
  try {
    const { customerId, warehouseId, items } = req.body;
    if (!customerId || !warehouseId || !items?.length) {
      return res.status(400).json({ message: "customerId, warehouseId et items sont requis." });
    }

    const order = await prisma.$transaction(async (tx) => {
      // Vérification de la disponibilité du stock
      for (const item of items) {
        const stockItem = await tx.stockItem.findUnique({
          where: { productId_warehouseId: { productId: item.productId, warehouseId } },
        });
        if (!stockItem || stockItem.quantity < item.quantity) {
          throw Object.assign(
            new Error(`Stock insuffisant pour le produit ${item.productId}.`),
            { status: 400 }
          );
        }
      }

      const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

      const created = await tx.salesOrder.create({
        data: {
          reference: genReference("SO"),
          customerId,
          warehouseId,
          userId: req.user.id,
          status: "CONFIRMED",
          totalAmount,
          items: { create: items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })) },
        },
        include: { items: { include: { product: true } }, customer: true, warehouse: true },
      });

      // Déduction du stock + traçabilité du mouvement
      for (const item of items) {
        await tx.stockItem.update({
          where: { productId_warehouseId: { productId: item.productId, warehouseId } },
          data: { quantity: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            type: "OUT",
            productId: item.productId,
            quantity: item.quantity,
            fromWarehouseId: warehouseId,
            reason: `Vente ${created.reference}`,
            userId: req.user.id,
          },
        });
      }

      return created;
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const order = await prisma.salesOrder.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, updateStatus };
