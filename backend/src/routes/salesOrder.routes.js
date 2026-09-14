const router = require("express").Router();
const ctrl = require("../controllers/salesOrder.controller");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);
router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);
router.post("/", ctrl.create);
router.patch("/:id/status", ctrl.updateStatus);

module.exports = router;
