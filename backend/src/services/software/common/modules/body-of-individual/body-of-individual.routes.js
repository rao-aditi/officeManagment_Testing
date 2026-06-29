const express = require("express");
const router = express.Router();
const boiController = require("./body-of-individual.controller");

router.post(  "/",    boiController.createBoi);
router.get(   "/",    boiController.getAllBoi);
router.get(   "/:id", boiController.getBoiById);
router.put("/:id", boiController.updateBoi);
router.patch("/:id", boiController.updateBoi);  // ADD THIS
router.delete("/:id", boiController.deleteBoi);

module.exports = router;