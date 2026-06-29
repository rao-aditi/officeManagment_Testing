const express = require("express");

const router = express.Router();

const clientsController = require("./clients.controller");

router.get("/", clientsController.getAll);

module.exports = router;