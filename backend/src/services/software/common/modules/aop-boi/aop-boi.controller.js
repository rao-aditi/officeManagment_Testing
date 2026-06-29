const service = require("./aop-boi.service");

const createAopBoi = async (req, res) => {
  try {
    const data = await service.createAopBoi(req.body);
    res.status(201).json({ success: true, message: "AOP/BOI created successfully.", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllAopBoi = async (req, res) => {
  try {
    const result = await service.getAllAopBoi(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAopBoiById = async (req, res) => {
  try {
    const data = await service.getAopBoiById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const updateAopBoi = async (req, res) => {
  try {
    const data = await service.updateAopBoi(req.params.id, req.body);
    res.status(200).json({ success: true, message: "AOP/BOI updated successfully.", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteAopBoi = async (req, res) => {
  try {
    const result = await service.deleteAopBoi(req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const data = await service.addMember(req.params.id, req.body);
    res.status(201).json({ success: true, message: "Member added successfully.", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateMember = async (req, res) => {
  try {
    const data = await service.updateMember(req.params.id, req.params.memberId, req.body);
    res.status(200).json({ success: true, message: "Member updated successfully.", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteMember = async (req, res) => {
  try {
    const result = await service.deleteMember(req.params.id, req.params.memberId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const submitForApproval = async (req, res) => {
  try {
    const data = await service.submitForApproval(req.params.id, req.body.userId);
    res.status(200).json({ success: true, message: "Submitted for approval.", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const approveAopBoi = async (req, res) => {
  try {
    const data = await service.approveAopBoi(req.params.id, req.body.userId, req.body.remarks);
    res.status(200).json({ success: true, message: "Approved successfully.", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const rejectAopBoi = async (req, res) => {
  try {
    const data = await service.rejectAopBoi(req.params.id, req.body.userId, req.body.remarks);
    res.status(200).json({ success: true, message: "Rejected.", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const sendBackAopBoi = async (req, res) => {
  try {
    const data = await service.sendBackAopBoi(req.params.id, req.body.userId, req.body.remarks);
    res.status(200).json({ success: true, message: "Sent back for correction.", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAopBoi, getAllAopBoi, getAopBoiById,
  updateAopBoi, deleteAopBoi,
  addMember, updateMember, deleteMember,
  submitForApproval, approveAopBoi, rejectAopBoi, sendBackAopBoi,
};