const router = require("express").Router();
const ctrl = require("../controllers/product.controller");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);
router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);
router.post("/", authorize("ADMIN", "MANAGER"), ctrl.create);
router.put("/:id", authorize("ADMIN", "MANAGER"), ctrl.update);
router.delete("/:id", authorize("ADMIN", "MANAGER"), ctrl.remove);

module.exports = router;
