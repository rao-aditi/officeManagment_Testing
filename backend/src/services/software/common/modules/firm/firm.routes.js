const express = require("express");
const router = express.Router();
const firmController = require("./firm.controller");

router.post(  "/",    firmController.createFirm);
router.get(   "/",    firmController.getAllFirm);
router.get(   "/:id", firmController.getFirmById);
router.put("/:id", firmController.updateFirm);
router.patch("/:id", firmController.updateFirm);  // ADD THIS
router.delete("/:id", firmController.deleteFirm);

module.exports = router;