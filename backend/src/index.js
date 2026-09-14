require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const supplierRoutes = require("./routes/supplier.routes");
const customerRoutes = require("./routes/customer.routes");
const warehouseRoutes = require("./routes/warehouse.routes");
const productRoutes = require("./routes/product.routes");
const stockRoutes = require("./routes/stock.routes");
const purchaseOrderRoutes = require("./routes/purchaseOrder.routes");
const salesOrderRoutes = require("./routes/salesOrder.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/sales-orders", salesOrderRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => res.status(404).json({ message: "Route introuvable." }));
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API démarrée sur http://localhost:${PORT}`));
