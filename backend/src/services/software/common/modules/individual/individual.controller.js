const individualService = require("./individual.services");
const { individualSchema, updateIndividualSchema } = require("./individual.validation");

const create = async (req, res) => {
  try {
    const parsed = individualSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.errors });
    }

    const client = await individualService.createIndividual(parsed.data);
    return res.status(201).json(client);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const clients = await individualService.getAllIndividuals();
    return res.status(200).json(clients);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const client = await individualService.getIndividualById(req.params.id);
    if (!client) return res.status(404).json({ message: "Individual not found" });
    return res.status(200).json(client);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const parsed = updateIndividualSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.errors });
    }

    const client = await individualService.updateIndividual(req.params.id, parsed.data);
    return res.status(200).json(client);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await individualService.deleteIndividual(req.params.id);
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { create, getAll, getById, update, remove };