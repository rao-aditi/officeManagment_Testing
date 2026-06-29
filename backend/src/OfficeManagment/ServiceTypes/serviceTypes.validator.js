const { body, param, query } = require("express-validator");

const serviceNameRules = (required = true) => {
  const chain = body(["serviceTypeName", "serviceName"])
    .custom((_, { req }) => {
      const name = req.body.serviceTypeName ?? req.body.serviceName;
      if (required && (!name || !String(name).trim())) {
        throw new Error("Service name is required.");
      }
      if (name && String(name).trim().length < 2) {
        throw new Error("Service name must be at least 2 characters.");
      }
      if (name && String(name).trim().length > 100) {
        throw new Error("Service name must not exceed 100 characters.");
      }
      return true;
    });

  return required ? chain : chain.optional();
};

const baseAmountRules = (required = true) => {
  const chain = body(["baseAmount", "serviceCharges"]).custom((_, { req }) => {
    const value = req.body.baseAmount ?? req.body.serviceCharges;

    if ((value === undefined || value === null || value === "") && required) {
      throw new Error("Base amount is required.");
    }

    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      (isNaN(Number(value)) || Number(value) < 0)
    ) {
      throw new Error("Base amount must be a non-negative number.");
    }

    return true;
  });

  return chain;
};

const taxRateRules = (required = false) => {
  const chain = body("taxRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tax rate must be a non-negative number.");

  return required
    ? body("taxRate")
        .notEmpty()
        .withMessage("Tax rate is required.")
        .isFloat({ min: 0 })
        .withMessage("Tax rate must be a non-negative number.")
    : chain;
};

const couponCodeRules = () =>
  body("couponCode")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage("Coupon code must not exceed 50 characters.");

const discountCouponRules = () =>
  body().custom((_, { req }) => {
    const discountAllowed =
      req.body.discountAllowed === true || req.body.discountAllowed === "true";

    if (discountAllowed && !req.body.couponCode?.trim()) {
      throw new Error("Coupon code is required when discount is allowed.");
    }

    return true;
  });

const idParamValidator = [
  param("id")
    .notEmpty()
    .withMessage("Service type id is required.")
    .isInt({ min: 1 })
    .withMessage("Service type id must be a positive integer.")
    .toInt(),
];

const listQueryValidator = [
  query("search").optional().isString(),
  query("status").optional().isIn(["ACTIVE", "INACTIVE"]),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

const createServiceTypeValidator = [
  serviceNameRules(true),
  baseAmountRules(true),
  taxRateRules(true),
  couponCodeRules(),
  discountCouponRules(),

  body("discountAllowed")
    .notEmpty()
    .withMessage("Discount allowed is required.")
    .isBoolean()
    .withMessage("Discount allowed must be true or false."),

  body("status")
    .notEmpty()
    .withMessage("Status is required.")
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Invalid status."),
];

const updateServiceTypeValidator = [
  ...idParamValidator,

  serviceNameRules(false),
  baseAmountRules(false),
  taxRateRules(false),
  couponCodeRules(),
  discountCouponRules(),

  body("discountAllowed")
    .optional()
    .isBoolean()
    .withMessage("Discount allowed must be true or false."),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Invalid status."),

  body().custom((_, { req }) => {
    const fields = [
      "serviceTypeName",
      "serviceName",
      "baseAmount",
      "serviceCharges",
      "taxRate",
      "discountAllowed",
      "couponCode",
      "status",
    ];

    if (!fields.some((field) => req.body[field] !== undefined)) {
      throw new Error("At least one field is required to update.");
    }

    return true;
  }),
];

module.exports = {
  idParamValidator,
  listQueryValidator,
  createServiceTypeValidator,
  updateServiceTypeValidator,
};
