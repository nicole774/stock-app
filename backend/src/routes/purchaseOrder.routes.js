const router = require("express").Router();
const ctrl = require("../controllers/purchaseOrder.controller");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);
router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);
router.post("/", authorize("ADMIN", "MANAGER"), ctrl.create);
router.patch("/:id/receive", authorize("ADMIN", "MANAGER"), ctrl.receive);
router.patch("/:id/status", authorize("ADMIN", "MANAGER"), ctrl.updateStatus);

module.exports = router;
