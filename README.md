# StockFlow — Application de gestion de stock

Application complète de gestion de stock multi-entrepôts : catalogue produits,
fournisseurs, clients, mouvements de stock, commandes d'achat et de vente.

**Stack** : React (Vite) · Tailwind CSS · Recharts · Node.js / Express · PostgreSQL · Prisma

> 📖 Pour comprendre le projet en détail (où se trouve chaque fichier, comment
> tout fonctionne, comment modifier), lis **[DOCUMENTATION.md](DOCUMENTATION.md)**.

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
Annuler une vente CONFIRMED réintègre automatiquement le stock (mouvement de contrepassation).

## Fonctionnalités

- **Tableau de bord** : valeur du stock, CA vendu, alertes stock bas, graphique des
  entrées/sorties sur 14 jours, répartition du stock par entrepôt
- **Catalogue** : produits avec CRUD complet, recherche, filtre par catégorie,
  activation/désactivation, seuils d'alerte
- **Stock** : entrepôts, mouvements tracés (entrée, sortie, transfert, ajustement
  signé +/-) avec filtres par type, produit et entrepôt
- **Achats** : commandes fournisseurs avec réception (incrémente le stock) et annulation
- **Ventes** : commande client avec vérification du stock disponible en direct,
  prix pré-rempli, annulation avec réintégration du stock
- **Interface** : design system complet (composants réutilisables, badges de statut,
  toasts de confirmation, dialogues de confirmation, modales accessibles au clavier),
  responsive mobile avec menu latéral

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
npm run seed                          # crée les comptes + données de démo
npm run dev                           # démarre l'API sur http://localhost:4000
```

Comptes de démonstration créés par le seed :

| Rôle | Email | Mot de passe |
|---|---|---|
| ADMIN | `admin@stock.app` | `admin123` |
| MANAGER | `manager@stock.app` | `staff123` |
| EMPLOYEE | `employee@stock.app` | `staff123` |

Le seed crée également 3 entrepôts, 12 produits, l'historique de mouvements
et des commandes d'achat/vente de démonstration (ré-exécutable sans doublons).

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
| GET | `/api/products` | Liste des produits (stock total calculé, filtres `search`, `categoryId`) |
| GET | `/api/stock/movements` | Historique (filtres `type`, `productId`, `warehouseId`) |
| POST | `/api/stock/movements` | Créer un mouvement (IN/OUT/TRANSFER/ADJUSTMENT signé) |
| POST | `/api/purchase-orders` | Créer une commande d'achat |
| PATCH | `/api/purchase-orders/:id/receive` | Réceptionner (incrémente le stock) |
| PATCH | `/api/purchase-orders/:id/status` | Changer le statut (PENDING/CONFIRMED/CANCELLED) |
| POST | `/api/sales-orders` | Créer une vente (décrémente le stock si disponible) |
| PATCH | `/api/sales-orders/:id/status` | Changer le statut (annulation = réintégration du stock) |
| GET | `/api/dashboard/stats` | Statistiques + séries pour les graphiques |

Toutes les routes (sauf `/auth/login` et `/auth/register`) nécessitent un header
`Authorization: Bearer <token>`.

---

## Pistes d'évolution

- Export PDF/Excel des commandes et de l'inventaire
- Codes-barres / QR codes pour la saisie rapide
- Notifications automatiques par email pour les stocks bas
- Historique de prix et gestion des lots / dates de péremption
- Tests automatisés (Jest pour l'API, Vitest pour le frontend)
