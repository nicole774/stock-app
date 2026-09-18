const prisma = require("../lib/prisma");

const MOVEMENT_TYPES = ["IN", "OUT", "TRANSFER", "ADJUSTMENT"];

// Récupère ou crée la ligne de stock produit/entrepôt
async function upsertStockItem(tx, productId, warehouseId, delta) {
  const existing = await tx.stockItem.findUnique({
    where: { productId_warehouseId: { productId, warehouseId } },
  });

  const newQuantity = (existing?.quantity || 0) + delta;
  if (newQuantity < 0) {
    const err = new Error("Stock insuffisant dans l'entrepôt pour cette opération.");
    err.status = 400;
    throw err;
  }

  return tx.stockItem.upsert({
    where: { productId_warehouseId: { productId, warehouseId } },
    update: { quantity: newQuantity },
    create: { productId, warehouseId, quantity: newQuantity },
  });
}

async function listMovements(req, res, next) {
  try {
    const { productId, warehouseId, type } = req.query;
    const movements = await prisma.stockMovement.findMany({
      where: {
        ...(productId && { productId }),
        ...(type && { type }),
        ...(warehouseId && {
          OR: [{ fromWarehouseId: warehouseId }, { toWarehouseId: warehouseId }],
        }),
      },
      include: {
        product: true,
        fromWarehouse: true,
        toWarehouse: true,
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    res.json(movements);
  } catch (err) {
    next(err);
  }
}

// Corps attendu: { type, productId, quantity, fromWarehouseId?, toWarehouseId?, reason? }
// Pour ADJUSTMENT, quantity peut être négatif (retrait d'inventaire).
async function createMovement(req, res, next) {
  try {
    const { type, productId, quantity, fromWarehouseId, toWarehouseId, reason } = req.body;

    if (!MOVEMENT_TYPES.includes(type)) {
      return res.status(400).json({ message: `type invalide. Valeurs autorisées : ${MOVEMENT_TYPES.join(", ")}.` });
    }
    if (!productId || !quantity || type !== "ADJUSTMENT" && quantity <= 0) {
      return res.status(400).json({ message: "productId et quantity (>0) sont requis." });
    }
    if (type === "IN" && !toWarehouseId) {
      return res.status(400).json({ message: "toWarehouseId requis pour une entrée." });
    }
    if (type === "OUT" && !fromWarehouseId) {
      return res.status(400).json({ message: "fromWarehouseId requis pour une sortie." });
    }
    if (type === "TRANSFER" && (!fromWarehouseId || !toWarehouseId)) {
      return res.status(400).json({ message: "fromWarehouseId et toWarehouseId requis pour un transfert." });
    }
    if (type === "TRANSFER" && fromWarehouseId === toWarehouseId) {
      return res.status(400).json({ message: "Les entrepôts source et destination doivent être différents." });
    }
    if (type === "ADJUSTMENT" && !toWarehouseId && !fromWarehouseId) {
      return res.status(400).json({ message: "Un entrepôt est requis pour un ajustement." });
    }
    if (type === "ADJUSTMENT" && quantity === 0) {
      return res.status(400).json({ message: "La quantité d'un ajustement ne peut pas être nulle." });
    }

    const movement = await prisma.$transaction(async (tx) => {
      if (type === "IN") {
        await upsertStockItem(tx, productId, toWarehouseId, quantity);
      } else if (type === "OUT") {
        await upsertStockItem(tx, productId, fromWarehouseId, -quantity);
      } else if (type === "TRANSFER") {
        await upsertStockItem(tx, productId, fromWarehouseId, -quantity);
        await upsertStockItem(tx, productId, toWarehouseId, quantity);
      } else if (type === "ADJUSTMENT") {
        // quantity positif = ajout, négatif = retrait
        const warehouseId = toWarehouseId || fromWarehouseId;
        await upsertStockItem(tx, productId, warehouseId, quantity);
      }

      return tx.stockMovement.create({
        data: {
          type,
          productId,
          // signe conservé pour les ajustements (négatif = retrait)
          quantity,
          fromWarehouseId: fromWarehouseId || null,
          toWarehouseId: toWarehouseId || null,
          reason: type === "ADJUSTMENT" && quantity < 0 ? reason || "Retrait d'inventaire" : reason,
          userId: req.user.id,
        },
        include: { product: true, fromWarehouse: true, toWarehouse: true },
      });
    });

    res.status(201).json(movement);
  } catch (err) {
    next(err);
  }
}

module.exports = { listMovements, createMovement };
