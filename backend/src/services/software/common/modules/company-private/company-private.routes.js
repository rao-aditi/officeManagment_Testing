const express = require(
  "express"
);

const controller =
  require(
    "./company-private.controller"
  );

const validateRequest =
  require(
    "../../../../../middlewares/validateRequest"
  );

const {
  createCompanyPrivateValidation,
  updateCompanyPrivateValidation,
} = require(
  "./validation"
);

const router =
  express.Router();

// CREATE
router.post(
  "/",
  validateRequest(
    createCompanyPrivateValidation
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

router.put("/:id", validateRequest(updateCompanyPrivateValidation), controller.update);
router.patch("/:id", validateRequest(updateCompanyPrivateValidation), controller.update);

// DELETE
router.delete(
  "/:id",
  controller.remove
);

module.exports =
  router;