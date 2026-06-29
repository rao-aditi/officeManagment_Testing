const clientsService = require("./clients.services");

const getAll = async (req, res) => {
  try {
    const clients = await clientsService.getAllClients();

    return res.status(200).json(clients);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  getAll,
};