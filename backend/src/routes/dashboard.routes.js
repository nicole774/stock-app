const router = require("express").Router();
const ctrl = require("../controllers/dashboard.controller");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);
router.get("/stats", ctrl.stats);

module.exports = router;
