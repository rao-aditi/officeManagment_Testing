const enumsService = require("./enums.service");
const {
  successResponse,
  errorResponse,
} = require("../utils/response.utils");

const listEnums = async (req, res) => {
  try {
    const enums = await enumsService.getEnumsByPayload(req.body);

    return successResponse(
      res,
      { enums },
      "Enums fetched successfully."
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

module.exports = { listEnums };