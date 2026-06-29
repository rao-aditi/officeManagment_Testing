const express = require("express");
const router = express.Router();

const enumsController = require("./enums.controller");

router.post("/", enumsController.listEnums);

module.exports = router;