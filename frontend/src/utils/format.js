export const CURRENCY_SUFFIX = "F";

export function formatMoney(value) {
  const n = Number(value || 0);
  return `${n.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} ${CURRENCY_SUFFIX}`;
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString("fr-FR");
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ROLE_LABELS = {
  ADMIN: "Administrateur",
  MANAGER: "Gestionnaire",
  EMPLOYEE: "Opérateur",
};

export function roleLabel(role) {
  return ROLE_LABELS[role] || role;
}

export function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export const STATUS_LABELS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  RECEIVED: "Réceptionnée",
  CANCELLED: "Annulée",
};

export function statusLabel(status) {
  return STATUS_LABELS[status] || status;
}
