function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === "P2002") {
    const field = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : err.meta?.target;
    return res.status(409).json({ message: `Cette valeur est déjà utilisée${field ? ` (${field})` : ""}.` });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ message: "Ressource introuvable." });
  }
  if (err.code === "P2003") {
    return res.status(400).json({ message: "Référence invalide : l'élément lié (catégorie, produit, entrepôt...) n'existe pas." });
  }

  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Erreur serveur interne." });
}

module.exports = errorHandler;
