const { PrismaClient } = require("@prisma/client");

// Instance unique de PrismaClient réutilisée dans toute l'app
const prisma = new PrismaClient();

module.exports = prisma;
