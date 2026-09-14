const router = require("express").Router();
const ctrl = require("../controllers/stock.controller");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);
router.get("/movements", ctrl.listMovements);
router.post("/movements", ctrl.createMovement);

module.exports = router;
