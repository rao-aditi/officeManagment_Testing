const { validationResult } = require("express-validator");
const { successResponse, errorResponse } = require("../utils/response.utils");
const serviceTypesService = require("./serviceTypes.service");

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, "Validation failed.", 422, errors.array());
    return true;
  }
  return false;
};

const createServiceType = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const serviceType = await serviceTypesService.createServiceType(
      req.user,
      req.body
    );
    return successResponse(
      res,
      { serviceType },
      "Service fee created successfully.",
      201
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const listServiceTypes = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const result = await serviceTypesService.listServiceTypes({
      search: req.query.search,
      status: req.query.status,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 50,
    });
    return successResponse(
      res,
      result,
      "Service fees fetched successfully."
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const getServiceTypeById = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const serviceType = await serviceTypesService.getServiceTypeById(
      req.params.id
    );
    return successResponse(
      res,
      { serviceType },
      "Service fee fetched successfully."
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const updateServiceType = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    const serviceType = await serviceTypesService.updateServiceType(
      req.user,
      req.params.id,
      req.body
    );
    return successResponse(
      res,
      { serviceType },
      "Service fee updated successfully."
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const deleteServiceType = async (req, res) => {
  if (handleValidation(req, res)) return;

  try {
    await serviceTypesService.deleteServiceType(req.user, req.params.id);
    return successResponse(res, null, "Service fee deleted successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

module.exports = {
  createServiceType,
  listServiceTypes,
  getServiceTypeById,
  updateServiceType,
  deleteServiceType,
};
