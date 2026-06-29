const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../../shared/prisma");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshTokenExpiresAt,
} = require("../utils/jwt.utils");
const { USER_STATUS } = require("../utils/enums");

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

// ─── Login
const login = async ({ email, password, userRole }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roleRef: {
        include: {
          rolePermissions: {
            where: { permission: { isActive: true } },
            select: { permission: { select: { key: true } } },
          },
        },
      },
    },
  });

  const isActive =
    user && (typeof user.isActive === "boolean" ? user.isActive : user.status === USER_STATUS.ACTIVE);

  if (!user || !isActive) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  if (userRole && user.roleRef?.name !== userRole) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const tokenPayload = { id: user.id, email: user.email };
  const accessToken  = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ id: user.id });

  // Persist refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  // Update last login timestamp
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const { password: _pwd, roleRef, ...safeUser } = user;
  safeUser.role = roleRef?.name || null;
  safeUser.permissions =
    roleRef?.rolePermissions?.map((rp) => rp.permission.key) || [];
  return { accessToken, refreshToken, user: safeUser };
};

// ─── Refresh Token
// Rotate refresh token: revoke old one, issue new pair.
const refreshTokens = async (oldRefreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch {
    const error = new Error("Invalid or expired refresh token.");
    error.statusCode = 401;
    throw error;
  }

  // Check DB record
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
    include: { user: { include: { roleRef: true } } },
  });

  if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
    const error = new Error("Refresh token is revoked or expired.");
    error.statusCode = 401;
    throw error;
  }

  const { user } = storedToken;
  const isActive =
    typeof user.isActive === "boolean" ? user.isActive : user.status === USER_STATUS.ACTIVE;

  if (!isActive) {
    const error = new Error("Account is deactivated.");
    error.statusCode = 403;
    throw error;
  }

  // Revoke old token (rotation)
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  // Issue new pair
  const tokenPayload  = { id: user.id, email: user.email };
  const accessToken   = signAccessToken(tokenPayload);
  const newRefreshToken = signRefreshToken({ id: user.id });

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: user.id,
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  return { accessToken, refreshToken: newRefreshToken };
};

// ─── Logout 
//  Revoke a single refresh token (logout current device).
const logout = async (refreshToken) => {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!stored || stored.revoked) return; 

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  });
};

// Revoke ALL refresh tokens for a user (logout from all devices).
const logoutAll = async (userId) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
};

// ─── Get My Profile 
const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true,
      lastLoginAt: true,
      googleDriveConnected: true,
      googleDriveEmail: true,
      roleRef: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const { roleRef, ...safeUser } = user;
  safeUser.role = roleRef?.name || null;
  return safeUser;
};

// ─── Change Password 
const changePassword = async (userId, { oldPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    const error = new Error("Current password is incorrect.");
    error.statusCode = 400;
    throw error;
  }

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  // Revoke all refresh tokens so user must re-login on other devices
  await logoutAll(userId);
};

// ─── Forgot / Reset Password
const requestPasswordReset = async ({ email }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  const isActive =
    user && (typeof user.isActive === "boolean" ? user.isActive : user.status === USER_STATUS.ACTIVE);

  // Never reveal whether the user exists (or is active).
  if (!user || !isActive) return;

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  // Email/SMS delivery is intentionally not implemented here.
  // Integrate a provider later and send `token` securely.
};

const resetPassword = async ({ token, newPassword }) => {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    const error = new Error("Invalid or expired reset token.");
    error.statusCode = 401;
    throw error;
  }

  const isActive =
    typeof record.user.isActive === "boolean"
      ? record.user.isActive
      : record.user.status === USER_STATUS.ACTIVE;

  if (!isActive) {
    const error = new Error("Account is deactivated.");
    error.statusCode = 403;
    throw error;
  }

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hashed },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revoked: false },
      data: { revoked: true },
    }),
  ]);
};

module.exports = {
  login,
  refreshTokens,
  logout,
  logoutAll,
  getProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
};
