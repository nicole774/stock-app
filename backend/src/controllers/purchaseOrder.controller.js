const prisma = require("../lib/prisma");

function genReference(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

async function list(req, res, next) {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
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
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id },
      include: { supplier: true, warehouse: true, items: { include: { product: true } } },
    });
    if (!order) return res.status(404).json({ message: "Commande introuvable." });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

// Corps: { supplierId, warehouseId, items: [{ productId, quantity, unitCost }] }
async function create(req, res, next) {
  try {
    const { supplierId, warehouseId, items } = req.body;
    if (!supplierId || !warehouseId || !items?.length) {
      return res.status(400).json({ message: "supplierId, warehouseId et items sont requis." });
    }

    const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);

    const order = await prisma.purchaseOrder.create({
      data: {
        reference: genReference("PO"),
        supplierId,
        warehouseId,
        userId: req.user.id,
        totalAmount,
        items: { create: items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitCost: i.unitCost })) },
      },
      include: { items: { include: { product: true } }, supplier: true, warehouse: true },
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

// Marque la commande comme reçue et incrémente le stock de l'entrepôt
async function receive(req, res, next) {
  try {
    const order = await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: req.params.id },
        include: { items: true },
      });
      if (!po) throw Object.assign(new Error("Commande introuvable."), { status: 404 });
      if (po.status === "RECEIVED") throw Object.assign(new Error("Commande déjà réceptionnée."), { status: 400 });

      for (const item of po.items) {
        await tx.stockItem.upsert({
          where: { productId_warehouseId: { productId: item.productId, warehouseId: po.warehouseId } },
          update: { quantity: { increment: item.quantity } },
          create: { productId: item.productId, warehouseId: po.warehouseId, quantity: item.quantity },
        });

        await tx.stockMovement.create({
          data: {
            type: "IN",
            productId: item.productId,
            quantity: item.quantity,
            toWarehouseId: po.warehouseId,
            reason: `Réception commande ${po.reference}`,
            userId: req.user.id,
          },
        });
      }

      return tx.purchaseOrder.update({
        where: { id: po.id },
        data: { status: "RECEIVED" },
        include: { items: { include: { product: true } }, supplier: true, warehouse: true },
      });
    });

    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const order = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, receive, updateStatus };
