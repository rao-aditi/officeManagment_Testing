const boiService = require("./body-of-individual.services");
const { boiSchema, updateBoiSchema } = require("./body-of-individual.validation");

const createBoi = async (req, res) => {
  try {
    const parsed = boiSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    const data = await boiService.createBoi(parsed.data);
    return res.status(201).json({ success: true, message: "Body of Individual created successfully", data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAllBoi = async (req, res) => {
  try {
    const data = await boiService.getAllBoi();
    return res.status(200).json({ success: true, message: "Body of Individuals fetched successfully", data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getBoiById = async (req, res) => {
  try {
    const data = await boiService.getBoiById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Body of Individual not found" });
    return res.status(200).json({ success: true, message: "Body of Individual fetched successfully", data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateBoi = async (req, res) => {
  try {
    const parsed = updateBoiSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    const data = await boiService.updateBoi(req.params.id, parsed.data);
    return res.status(200).json({ success: true, message: "Body of Individual updated successfully", data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteBoi = async (req, res) => {
  try {
    await boiService.deleteBoi(req.params.id);
    return res.status(200).json({ success: true, message: "Body of Individual deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createBoi, getAllBoi, getBoiById, updateBoi, deleteBoi };