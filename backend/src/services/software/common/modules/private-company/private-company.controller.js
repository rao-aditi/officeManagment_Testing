const privateCompanyService = require("././private-company.service");

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────
const createPrivateCompany = async (req, res) => {
  try {
    const company = await privateCompanyService.createPrivateCompany(req.body);
    return res.status(201).json({
      success: true,
      message: "Private company created successfully.",
      data: company,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// GET ALL
// ─────────────────────────────────────────────
const getAllPrivateCompanies = async (req, res) => {
  try {
    const result = await privateCompanyService.getAllPrivateCompanies(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// GET BY ID
// ─────────────────────────────────────────────
const getPrivateCompanyById = async (req, res) => {
  try {
    const company = await privateCompanyService.getPrivateCompanyById(req.params.id);
    return res.status(200).json({ success: true, data: company });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────
const updatePrivateCompany = async (req, res) => {
  try {
    const company = await privateCompanyService.updatePrivateCompany(
      req.params.id,
      req.body
    );
    return res.status(200).json({
      success: true,
      message: "Private company updated successfully.",
      data: company,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────
const deletePrivateCompany = async (req, res) => {
  try {
    const result = await privateCompanyService.deletePrivateCompany(req.params.id);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// DIRECTOR OPERATIONS
// ─────────────────────────────────────────────
const addDirector = async (req, res) => {
  try {
    const director = await privateCompanyService.addDirector(
      req.params.id,
      req.body
    );
    return res.status(201).json({
      success: true,
      message: "Director added successfully.",
      data: director,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateDirector = async (req, res) => {
  try {
    const director = await privateCompanyService.updateDirector(
      req.params.id,
      req.params.directorId,
      req.body
    );
    return res.status(200).json({
      success: true,
      message: "Director updated successfully.",
      data: director,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteDirector = async (req, res) => {
  try {
    const result = await privateCompanyService.deleteDirector(
      req.params.id,
      req.params.directorId
    );
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// APPROVAL FLOW
// ─────────────────────────────────────────────
const submitForApproval = async (req, res) => {
  try {
    const result = await privateCompanyService.submitForApproval(
      req.params.id,
      req.body.userId
    );
    return res.status(200).json({
      success: true,
      message: "Company submitted for approval.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const approveCompany = async (req, res) => {
  try {
    const result = await privateCompanyService.approveCompany(
      req.params.id,
      req.body.userId,
      req.body.remarks
    );
    return res.status(200).json({
      success: true,
      message: "Company approved successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const rejectCompany = async (req, res) => {
  try {
    const result = await privateCompanyService.rejectCompany(
      req.params.id,
      req.body.userId,
      req.body.remarks
    );
    return res.status(200).json({
      success: true,
      message: "Company rejected.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const sendBackCompany = async (req, res) => {
  try {
    const result = await privateCompanyService.sendBackCompany(
      req.params.id,
      req.body.userId,
      req.body.remarks
    );
    return res.status(200).json({
      success: true,
      message: "Company sent back for correction.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPrivateCompany,
  getAllPrivateCompanies,
  getPrivateCompanyById,
  updatePrivateCompany,
  deletePrivateCompany,
  addDirector,
  updateDirector,
  deleteDirector,
  submitForApproval,
  approveCompany,
  rejectCompany,
  sendBackCompany,
};