const { validationResult } = require("express-validator");
const { successResponse, errorResponse } = require("../utils/response.utils");
const usersService = require("./users.service");
const { USER_STATUS } = require("../utils/enums");

const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, "Validation failed.", 422, errors.array());
  }

  try {
    const user = await usersService.createUser(req.user.id, req.body);
    return successResponse(res, { user }, "User created successfully.", 201);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const listUsers = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, "Validation failed.", 422, errors.array());
  }

  try {
    const { status, q, page, limit } = req.query;
    const result = await usersService.listUsers({
      status: status || null,
      q: q || "",
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
    return successResponse(res, result, "Users fetched successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const getUserById = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return errorResponse(res, "Validation failed.", 422, errors.array());
  }

  try {
    const { id } = req.body;

    const user = await usersService.getUserById(id);

    return successResponse(
      res,
      { user },
      "User details fetched successfully."
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, "Validation failed.", 422, errors.array());
  }

  try {
    const user = await usersService.updateUser(req.user.id, req.params.id, req.body);
    return successResponse(res, { user }, "User updated successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const deactivateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, "Validation failed.", 422, errors.array());
  }

  try {
    const user = await usersService.setUserStatus({
      actorUserId: req.user.id,
      userId: req.params.id,
      status: USER_STATUS.INACTIVE,
    });
    return successResponse(res, { user }, "User deactivated successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const activateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, "Validation failed.", 422, errors.array());
  }

  try {
    const user = await usersService.setUserStatus({
      actorUserId: req.user.id,
      userId: req.params.id,
      status: USER_STATUS.ACTIVE,
    });
    return successResponse(res, { user }, "User activated successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
};

