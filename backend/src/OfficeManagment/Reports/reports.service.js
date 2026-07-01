const prisma = require("../../shared/prisma");
const {
  canViewAllReports,
  canViewOperationalReports,
} = require("./report.permissions");

const buildTaskWhere = (actor) => {
  if (canViewAllReports(actor) || actor.role === "ADMIN") {
    return {};
  }

  if (canViewOperationalReports(actor) || actor.role === "TEAM_LEADER") {
    return {
      OR: [
        { assignedById: actor.id },
        { assignedToId: actor.id },
        {
          assignedTo: {
            teamLeaderId: actor.id,
          },
        },
      ],
    };
  }

  return {
    assignedToId: actor.id,
  };
};

const buildStaffWhere = (actor) => {
  if (canViewAllReports(actor) || actor.role === "ADMIN") {
    return {
      roleRef: { name: { not: "ADMIN" } },
    };
  }

  if (canViewOperationalReports(actor) || actor.role === "TEAM_LEADER") {
    return {
      OR: [{ id: actor.id }, { teamLeaderId: actor.id }],
    };
  }

  return { id: actor.id };
};

module.exports = {
  buildTaskWhere,
  buildStaffWhere,
};
