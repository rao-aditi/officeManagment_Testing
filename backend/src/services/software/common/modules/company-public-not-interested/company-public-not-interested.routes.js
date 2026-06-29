const express = require("express");

const {
  createController,
  getAllController,
  getSingleController,
  updateController,
  deleteController,
} = require("./company-public-not-interested.controller");

const router = express.Router();

// CREATE
router.post("/", createController);

// GET ALL
router.get("/", getAllController);

// GET SINGLE
router.get("/:id", getSingleController);

// UPDATE
router.put("/:id", updateController);
router.patch("/:id", updateController);  // ADD THIS

// DELETE
router.delete("/:id", deleteController);

module.exports = router;