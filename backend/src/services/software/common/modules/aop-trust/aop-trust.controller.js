const aopTrustService = require("./aop-trust.services");
const { aopTrustSchema, updateAopTrustSchema } = require("./aop-trust.validation");

const createAopTrust = async (req, res) => {
  try {
    const parsed = aopTrustSchema.safeParse(req.body);
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
    const data = await aopTrustService.createAopTrust(parsed.data);
    return res.status(201).json({ success: true, message: "AOP Trust created successfully", data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAllAopTrust = async (req, res) => {
  try {
    const data = await aopTrustService.getAllAopTrust();
    return res.status(200).json({ success: true, message: "AOP Trusts fetched successfully", data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAopTrustById = async (req, res) => {
  try {
    const data = await aopTrustService.getAopTrustById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "AOP Trust not found" });
    return res.status(200).json({ success: true, message: "AOP Trust fetched successfully", data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateAopTrust = async (req, res) => {
  try {
    const parsed = updateAopTrustSchema.safeParse(req.body);
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
    const data = await aopTrustService.updateAopTrust(req.params.id, parsed.data);
    return res.status(200).json({ success: true, message: "AOP Trust updated successfully", data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteAopTrust = async (req, res) => {
  try {
    await aopTrustService.deleteAopTrust(req.params.id);
    return res.status(200).json({ success: true, message: "AOP Trust deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createAopTrust, getAllAopTrust, getAopTrustById, updateAopTrust, deleteAopTrust };