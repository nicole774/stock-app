function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === "P2002") {
    return res.status(409).json({ message: `Valeur déjà utilisée: ${err.meta?.target}` });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ message: "Ressource introuvable." });
  }

  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Erreur serveur interne." });
}

module.exports = errorHandler;
