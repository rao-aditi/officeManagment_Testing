const firmService = require("./firm.services");
const { firmSchema, updateFirmSchema } = require("./firm.validation");

const createFirm = async (req, res) => {
  try {
    const parsed = firmSchema.safeParse(req.body);
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
    const data = await firmService.createFirm(parsed.data);
    return res.status(201).json({ success: true, message: "Firm created successfully", data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAllFirm = async (req, res) => {
  try {
    const data = await firmService.getAllFirm();
    return res.status(200).json({ success: true, message: "Firms fetched successfully", data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getFirmById = async (req, res) => {
  try {
    const data = await firmService.getFirmById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Firm not found" });
    return res.status(200).json({ success: true, message: "Firm fetched successfully", data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateFirm = async (req, res) => {
  try {
    const parsed = updateFirmSchema.safeParse(req.body);
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
    const data = await firmService.updateFirm(req.params.id, parsed.data);
    return res.status(200).json({ success: true, message: "Firm updated successfully", data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteFirm = async (req, res) => {
  try {
    await firmService.deleteFirm(req.params.id);
    return res.status(200).json({ success: true, message: "Firm deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createFirm, getAllFirm, getFirmById, updateFirm, deleteFirm };