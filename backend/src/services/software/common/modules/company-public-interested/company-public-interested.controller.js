const companyPublicInterestedService =
  require(
    "./company-public-interested.services"
  );

// CREATE
const create = async (
  req,
  res
) => {
  try {
    const data =
      await companyPublicInterestedService.createCompanyPublicInterested(
        req.body
      );

    return res
      .status(201)
      .json({
        success: true,
        message:
          "Company Public Interested created successfully",
        data,
      });
  } catch (error) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          error.message,
      });
  }
};

// GET ALL
const getAll = async (
  req,
  res
) => {
  try {
    const data =
      await companyPublicInterestedService.getAllCompanyPublicInterested();

    return res
      .status(200)
      .json({
        success: true,
        data,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message:
          error.message,
      });
  }
};

// GET BY ID
const getById = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const data =
      await companyPublicInterestedService.getCompanyPublicInterestedById(
        id
      );

    return res
      .status(200)
      .json({
        success: true,
        data,
      });
  } catch (error) {
    return res
      .status(404)
      .json({
        success: false,
        message:
          error.message,
      });
  }
};

// UPDATE
const update = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const data =
      await companyPublicInterestedService.updateCompanyPublicInterested(
        id,
        req.body
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Company Public Interested updated successfully",
        data,
      });
  } catch (error) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          error.message,
      });
  }
};

// DELETE
const remove = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    await companyPublicInterestedService.deleteCompanyPublicInterested(
      id
    );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Company Public Interested deleted successfully",
      });
  } catch (error) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          error.message,
      });
  }
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};