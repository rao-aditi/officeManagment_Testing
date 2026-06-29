const express = require(
  "express"
);

const controller =
  require(
    "./artificial-juridical-person.controller"
  );

const validateRequest =
  require(
    "../../../../../middlewares/validateRequest"
  );

const {
  createArtificialJuridicalPersonValidation,
  updateArtificialJuridicalPersonValidation,
} = require(
  "./artificial-juridical-person.validation"
);

const router =
  express.Router();

// CREATE
router.post(
  "/",
  validateRequest(
    createArtificialJuridicalPersonValidation
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
router.put("/:id", validateRequest(updateArtificialJuridicalPersonValidation), controller.update);
router.patch("/:id", validateRequest(updateArtificialJuridicalPersonValidation), controller.update);

// DELETE
router.delete(
  "/:id",
  controller.remove
);

module.exports =
  router;
