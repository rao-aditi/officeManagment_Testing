const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev_access_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev_refresh_secret";
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || "2d";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

const durationToMs = (value, fallbackMs) => {
  if (!value || typeof value !== "string") return fallbackMs;
  const match = value.trim().match(/^(\d+)\s*([smhd])?$/i);
  if (!match) return fallbackMs;

  const amount = parseInt(match[1], 10);
  const unit = (match[2] || "d").toLowerCase();

  switch (unit) {
    case "s":
      return amount * 1000;
    case "m":
      return amount * 60 * 1000;
    case "h":
      return amount * 60 * 60 * 1000;
    case "d":
    default:
      return amount * 24 * 60 * 60 * 1000;
  }
};


// ─── Sign 
// Generate a short-lived access token (payload: id, email, role).
const signAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
};

// Generate a long-lived refresh token (payload: id only).
const signRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });
};

// ─── Verify 
const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

// ─── Helpers
const refreshTokenExpiresAt = () => {
  const ms = durationToMs(REFRESH_EXPIRES, 7 * 24 * 60 * 60 * 1000);
  return new Date(Date.now() + ms);
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  refreshTokenExpiresAt,
};
