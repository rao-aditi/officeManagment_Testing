
const express = require(
  "express"
);

const controller = require(
  "./local-authority.controller"
);

const validateRequest =
  require(
    "../../../../../middlewares/validateRequest"
  );

const {
  createLocalAuthorityValidation,
  updateLocalAuthorityValidation,
} = require(
  "./validation"
);

const router =
  express.Router();

router.post(
  "/",
  validateRequest(
    createLocalAuthorityValidation
  ),
  controller.create
);

router.get(
  "/",
  controller.getAll
);

router.get(
  "/:id",
  controller.getById
);

router.patch(
  "/:id",
  validateRequest(
    updateLocalAuthorityValidation
  ),
  controller.update
);

router.delete(
  "/:id",
  controller.remove
);

module.exports =
  router;

