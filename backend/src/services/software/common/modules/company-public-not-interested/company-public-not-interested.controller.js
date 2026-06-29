const {
  createCompanyPublicNotInterested,
  getAllCompanyPublicNotInterested,
  getCompanyPublicNotInterestedById,
  updateCompanyPublicNotInterested,
  deleteCompanyPublicNotInterested,
} = require("./company-public-not-interested.services");

const {
  companyPublicNotInterestedSchema,
} = require("./company-public-not-interested.validation");

// CREATE
const createController = async (req, res) => {
  try {
    const validatedData =
      companyPublicNotInterestedSchema.parse(req.body);

    const result =
      await createCompanyPublicNotInterested(validatedData);

    res.status(201).json({
      success: true,
      message: "Company Public Not Interested created successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL
const getAllController = async (req, res) => {
  try {
    const result =
      await getAllCompanyPublicNotInterested();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE
const getSingleController = async (req, res) => {
  try {
    const result =
      await getCompanyPublicNotInterestedById(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
const updateController = async (req, res) => {
  try {
    const result =
      await updateCompanyPublicNotInterested(
        req.params.id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE
const deleteController = async (req, res) => {
  try {
    const result =
      await deleteCompanyPublicNotInterested(
        req.params.id
      );

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createController,
  getAllController,
  getSingleController,
  updateController,
  deleteController,
};