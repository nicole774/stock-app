const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

const ROLES = ["ADMIN", "MANAGER", "EMPLOYEE"];
const SELECT = { id: true, name: true, email: true, role: true, isActive: true, createdAt: true };

async function list(req, res, next) {
  try {
    const users = await prisma.user.findMany({ select: SELECT, orderBy: { createdAt: "asc" } });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

// Un administrateur crée un compte pour un membre de son équipe.
async function create(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nom, email et mot de passe requis." });
    }
    if (role && !ROLES.includes(role)) {
      return res.status(400).json({ message: `Rôle invalide. Valeurs autorisées : ${ROLES.join(", ")}.` });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role || "EMPLOYEE" },
      select: SELECT,
    });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

// Modifie le nom/rôle/statut actif d'un compte, ou réinitialise son mot de passe.
async function update(req, res, next) {
  try {
    const { name, role, isActive, password } = req.body;
    if (role && !ROLES.includes(role)) {
      return res.status(400).json({ message: `Rôle invalide. Valeurs autorisées : ${ROLES.join(", ")}.` });
    }
    if (req.params.id === req.user.id && (role || isActive === false)) {
      return res.status(400).json({ message: "Vous ne pouvez pas modifier votre propre rôle ou vous désactiver." });
    }

    const data = {};
    if (name !== undefined) data.name = name;
    if (role !== undefined) data.role = role;
    if (isActive !== undefined) data.isActive = isActive;
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: SELECT,
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update };
