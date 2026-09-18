const router = require("express").Router();
const ctrl = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate, authorize("ADMIN"));
router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);

module.exports = router;
