const { verifyAccessToken } = require("../utils/jwt.utils");
const { errorResponse } = require("../utils/response.utils");
const prisma = require("../../shared/prisma");

/**
 * Middleware: verifies the Bearer access token in the Authorization header.
 * Attaches authenticated user + dynamic permissions to req.user on success.
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Access token is missing or malformed.", 401);
  }

  const token = authHeader.split(/\s+/)[1];

  try {
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        roleRef: {
          select: {
            id: true,
            name: true,
            isActive: true,
            rolePermissions: {
              where: { permission: { isActive: true } },
              select: { permission: { select: { key: true } } },
            },
          },
        },
      },
    });

    if (!user) {
      return errorResponse(res, "User not found.", 401);
    }

    if (!user.roleRef || !user.roleRef.isActive) {
      return errorResponse(res, "Role is missing or inactive.", 403);
    }

    const permissions = user.roleRef.rolePermissions.map((rp) => rp.permission.key);

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.roleRef.name,
      roleId: user.roleRef.id,
      permissions,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    next();
  } catch (err) {
    console.error("AUTHENTICATION MIDDLEWARE ERROR =>", err);
    if (err.name === "TokenExpiredError") {
      return errorResponse(res, "Access token has expired.", 401);
    }
    if (err.name === "JsonWebTokenError") {
      return errorResponse(res, "Invalid access token.", 401);
    }
    // Database, connection, or other server-side exceptions during auth
    return errorResponse(res, "Internal server error during authentication.", 500);
  }
};

module.exports = authenticate;
