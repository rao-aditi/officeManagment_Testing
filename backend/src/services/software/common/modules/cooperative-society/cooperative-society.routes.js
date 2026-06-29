
const express = require(
  "express"
);

const controller =
  require(
    "./cooperative-society.controller"
  );

const validateRequest =
  require(
    "../../../../../middlewares/validateRequest"
  );

const {
  createCooperativeSocietyValidation,
  updateCooperativeSocietyValidation,
} = require(
  "./cooperative-society.validation"
);

const router =
  express.Router();

// CREATE
router.post(
  "/",
  validateRequest(
    createCooperativeSocietyValidation
  ),
  controller.create
);

// GET ALL
router.get(
  "/",
  controller.getAll
);

// GET BY ID
router.get(
  "/:id",
  controller.getById
);

// UPDATE
router.put("/:id", validateRequest(updateCooperativeSocietyValidation), controller.update);
router.patch("/:id", validateRequest(updateCooperativeSocietyValidation), controller.update);

// DELETE
router.delete(
  "/:id",
  controller.remove
);

module.exports =
  router;

