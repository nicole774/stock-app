# StockFlow — Application de gestion de stock

Application complète de gestion de stock multi-entrepôts : catalogue produits,
fournisseurs, clients, mouvements de stock, commandes d'achat et de vente.

**Stack** : React (Vite) · Node.js / Express · PostgreSQL · Prisma

---

## Structure du projet

```
stock-app/
├── backend/     API REST (Express + Prisma)
└── frontend/    Application React (Vite + Tailwind)
```

## Modèle de données (Prisma)

- **User** — utilisateurs, rôles ADMIN / MANAGER / EMPLOYEE
- **Warehouse** — entrepôts / points de vente
- **Category**, **Supplier**, **Customer**
- **Product** — catalogue, prix d'achat/vente, seuil d'alerte stock bas
- **StockItem** — quantité en stock par produit et par entrepôt (clé unique produit+entrepôt)
- **StockMovement** — traçabilité de chaque IN / OUT / TRANSFER / ADJUSTMENT
- **PurchaseOrder** / **PurchaseOrderItem** — commandes fournisseurs, réception incrémente le stock
- **SalesOrder** / **SalesOrderItem** — commandes clients, création décrémente le stock (avec vérification de disponibilité)

Toutes les opérations qui touchent au stock (réception, vente, transfert, ajustement)
utilisent des **transactions Prisma** pour garantir la cohérence des quantités.

---

## 1. Installation de la base de données

```bash
# Créer une base PostgreSQL, par exemple :
createdb stock_db
```

## 2. Backend

```bash
cd backend
cp .env.example .env
# Éditer .env avec vos identifiants PostgreSQL et un JWT_SECRET

npm install
npx prisma migrate dev --name init   # crée les tables
npm run seed                          # crée un admin + données de démo
npm run dev                           # démarre l'API sur http://localhost:4000
```

Identifiants de démo créés par le seed :
- Email : `admin@stock.app`
- Mot de passe : `admin123`

## 3. Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_URL doit pointer vers l'API

npm install
npm run dev             # démarre l'app sur http://localhost:5173
```

---

## Principales routes API

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Connexion |
| GET | `/api/products` | Liste des produits (avec stock total calculé) |
| POST | `/api/stock/movements` | Créer un mouvement (IN/OUT/TRANSFER/ADJUSTMENT) |
| POST | `/api/purchase-orders` | Créer une commande d'achat |
| PATCH | `/api/purchase-orders/:id/receive` | Réceptionner (incrémente le stock) |
| POST | `/api/sales-orders` | Créer une vente (décrémente le stock si disponible) |
| GET | `/api/dashboard/stats` | Statistiques (stock total, alertes, derniers mouvements) |

Toutes les routes (sauf `/auth/login` et `/auth/register`) nécessitent un header
`Authorization: Bearer <token>`.

---

## Pistes d'évolution

- Export PDF/Excel des commandes et de l'inventaire
- Codes-barres / QR codes pour la saisie rapide
- Notifications automatiques par email pour les stocks bas
- Historique de prix et gestion des lots / dates de péremption
- Tests automatisés (Jest pour l'API, Vitest pour le frontend)
