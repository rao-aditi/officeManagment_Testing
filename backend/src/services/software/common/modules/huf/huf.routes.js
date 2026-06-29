const express = require("express");
const router = express.Router();

const hufController = require("./huf.controller");

router.post("/", hufController.create);
router.get("/", hufController.getAll);
router.get("/:id", hufController.getById);
router.put("/:id", hufController.update);    // PUT support
router.patch("/:id", hufController.update);
router.delete("/:id", hufController.remove);


module.exports = router;