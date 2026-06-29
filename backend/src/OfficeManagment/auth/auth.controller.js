const { validationResult } = require("express-validator");
const authService = require("./auth.service");
const { successResponse, errorResponse } = require("../utils/response.utils");

// ─── Login 
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, "Validation failed.", 422, errors.array());
  }
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);;
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    return successResponse(
      res,
      {
        token: { accessToken, refreshToken },
        user,
      },
      "Login successfully."
    );
  } catch (err) {
    console.log("LOGIN ERROR =>", err);
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

// ─── Refresh Token 
const refresh = async (req, res) => {
  // Accept from cookie or body (mobile apps)
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    return errorResponse(res, "Refresh token is required.", 400);
  }

  try {
    const { accessToken, refreshToken } = await authService.refreshTokens(token);

    // Rotate cookie as well
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, { accessToken }, "Token refreshed.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

// ─── Logout

const logout = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  try {
    if (token) await authService.logout(token);
    res.clearCookie("refreshToken");
    return successResponse(res, null, "Logged out successfully.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

const logoutAll = async (req, res) => {
  try {
    await authService.logoutAll(req.user.id);
    res.clearCookie("refreshToken");
    return successResponse(res, null, "Logged out from all devices.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

// ─── Profile
const getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return successResponse(res, { user });
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

// ─── Change Password 

const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, "Validation failed.", 422, errors.array());
  }

  try {
    await authService.changePassword(req.user.id, req.body);
    return successResponse(res, null, "Password changed. Please log in again.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

// ─── Forgot Password
const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, "Validation failed.", 422, errors.array());
  }

  try {
    await authService.requestPasswordReset(req.body);
    // Never reveal whether the user exists.
    return successResponse(
      res,
      null,
      "If an account exists for this email, a reset token has been generated."
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

// ─── Reset Password
const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, "Validation failed.", 422, errors.array());
  }

  try {
    await authService.resetPassword(req.body);
    return successResponse(res, null, "Password has been reset. Please log in.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

module.exports = {
  login,
  refresh,
  logout,
  logoutAll,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
