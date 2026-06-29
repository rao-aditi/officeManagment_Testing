const express = require("express");
const router = express.Router();
const individualController = require("./individual.controller");

router.post("/", individualController.create);
router.get("/", individualController.getAll);
router.get("/:id", individualController.getById);
router.put("/:id", individualController.update);
router.delete("/:id", individualController.remove);

module.exports = router;