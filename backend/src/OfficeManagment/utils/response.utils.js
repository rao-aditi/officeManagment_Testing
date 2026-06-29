/* Send a successful response.*/
const sendSuccess = (res, data = null, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/* Send a paginated list response. */
const sendPaginated = (res, data, total, page, limit, message = "Success") => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  });
};

/* Send an error response.*/
const sendError = (res, message = "An error occurred", statusCode = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  res.status(statusCode).json(body);
};

const successResponse = sendSuccess;
const errorResponse = sendError;

module.exports = {
  sendSuccess,
  sendPaginated,
  sendError,
  successResponse,
  errorResponse,
};