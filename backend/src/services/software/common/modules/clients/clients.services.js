const prisma = require("../../../../../shared/prisma");

const getAllClients = async () => {
  return await prisma.client.findMany({
    orderBy: {
      id: "desc",
    },
  });
};

module.exports = {
  getAllClients,
};