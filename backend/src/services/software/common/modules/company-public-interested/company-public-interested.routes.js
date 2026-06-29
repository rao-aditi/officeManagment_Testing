const express = require(
  "express"
);

const controller =
  require(
    "./company-public-interested.controller"
  );

const validateRequest =
  require(
    "../../../../../middlewares/validateRequest"
  );

const {
  createCompanyPublicInterestedValidation,
  updateCompanyPublicInterestedValidation,
} = require(
  "./validation"
);

const router =
  express.Router();

// CREATE
router.post(
  "/",
  validateRequest(
    createCompanyPublicInterestedValidation
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

router.put("/:id", validateRequest(updateCompanyPublicInterestedValidation), controller.update);
router.patch("/:id", validateRequest(updateCompanyPublicInterestedValidation), controller.update);

// DELETE
router.delete(
  "/:id",
  controller.remove
);

module.exports =
  router;