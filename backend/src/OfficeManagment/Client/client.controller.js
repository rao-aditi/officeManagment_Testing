const { validationResult } = require("express-validator");

const clientService = require("./client.service");
const { sanitizeClientForRole } = require("../permissions/client.access");

const {
  successResponse,
  errorResponse,
} = require("../utils/response.utils");

// GET ALL CLIENTS
const getAllClients = async (req, res) => {
  try {
    const { search, isActive, page, limit } = req.query;

    const result = await clientService.getAllClients(req.user, {
      search: search || "",
      isActive:
        isActive !== undefined
          ? isActive === "true"
          : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });

    return successResponse(
      res,
      result,
      "Clients fetched successfully."
    );
  } catch (err) {
    return errorResponse(
      res,
      err.message,
      err.statusCode || 500
    );
  }
};


const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await clientService.getClientById(
      req.user,
      id
    );

    return successResponse(
      res,
      client,
      "Client fetched successfully."
    );
  } catch (err) {
    return errorResponse(
      res,
      err.message,
      err.statusCode || 500
    );
  }
};


module.exports = {
  getAllClients,
  getClientById,
};