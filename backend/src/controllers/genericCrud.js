const prisma = require("../lib/prisma");

/**
 * Génère un contrôleur CRUD standard pour un modèle Prisma simple
 * (Category, Supplier, Customer, Warehouse...).
 *
 * @param {string} modelName - nom du modèle Prisma, ex: "category"
 * @param {object} options - { include, orderBy, searchFields }
 */
function createCrudController(modelName, options = {}) {
  const model = prisma[modelName];
  const { include, orderBy = { createdAt: "desc" }, searchFields = [] } = options;

  return {
    async list(req, res, next) {
      try {
        const { search } = req.query;
        const where =
          search && searchFields.length
            ? {
                OR: searchFields.map((field) => ({
                  [field]: { contains: search, mode: "insensitive" },
                })),
              }
            : {};

        const items = await model.findMany({ where, include, orderBy });
        res.json(items);
      } catch (err) {
        next(err);
      }
    },

    async getOne(req, res, next) {
      try {
        const item = await model.findUnique({ where: { id: req.params.id }, include });
        if (!item) return res.status(404).json({ message: "Introuvable." });
        res.json(item);
      } catch (err) {
        next(err);
      }
    },

    async create(req, res, next) {
      try {
        const item = await model.create({ data: req.body, include });
        res.status(201).json(item);
      } catch (err) {
        next(err);
      }
    },

    async update(req, res, next) {
      try {
        const item = await model.update({
          where: { id: req.params.id },
          data: req.body,
          include,
        });
        res.json(item);
      } catch (err) {
        next(err);
      }
    },

    async remove(req, res, next) {
      try {
        await model.delete({ where: { id: req.params.id } });
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = createCrudController;
