const service = require("./public-company.service");

const createPublicCompany = async (req, res) => {
  try {
    const data = await service.createPublicCompany(req.body);
    res.status(201).json({ success: true, message: "Public company created successfully.", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllPublicCompanies = async (req, res) => {
  try {
    const result = await service.getAllPublicCompanies(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getPublicCompanyById = async (req, res) => {
  try {
    const data = await service.getPublicCompanyById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const updatePublicCompany = async (req, res) => {
  try {
    const data = await service.updatePublicCompany(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Public company updated successfully.", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deletePublicCompany = async (req, res) => {
  try {
    const result = await service.deletePublicCompany(req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const addKmp = async (req, res) => {
  try {
    const data = await service.addKmp(req.params.id, req.body);
    res.status(201).json({ success: true, message: "KMP added successfully.", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateKmp = async (req, res) => {
  try {
    const data = await service.updateKmp(req.params.id, req.params.kmpId, req.body);
    res.status(200).json({ success: true, message: "KMP updated successfully.", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteKmp = async (req, res) => {
  try {
    const result = await service.deleteKmp(req.params.id, req.params.kmpId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const submitForApproval = async (req, res) => {
  try {
    const data = await service.submitForApproval(req.params.id, req.body.userId);
    res.status(200).json({ success: true, message: "Company submitted for approval.", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const approveCompany = async (req, res) => {
  try {
    const data = await service.approveCompany(req.params.id, req.body.userId, req.body.remarks);
    res.status(200).json({ success: true, message: "Company approved successfully.", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const rejectCompany = async (req, res) => {
  try {
    const data = await service.rejectCompany(req.params.id, req.body.userId, req.body.remarks);
    res.status(200).json({ success: true, message: "Company rejected.", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const sendBackCompany = async (req, res) => {
  try {
    const data = await service.sendBackCompany(req.params.id, req.body.userId, req.body.remarks);
    res.status(200).json({ success: true, message: "Company sent back for correction.", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPublicCompany, getAllPublicCompanies, getPublicCompanyById,
  updatePublicCompany, deletePublicCompany,
  addKmp, updateKmp, deleteKmp,
  submitForApproval, approveCompany, rejectCompany, sendBackCompany,
};