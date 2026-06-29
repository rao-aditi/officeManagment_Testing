const companyPrivateService =
  require(
    "./company-private.services"
  );

// CREATE
const create = async (
  req,
  res
) => {
  try {
    const data =
      await companyPrivateService.createCompanyPrivate(
        req.body
      );

    return res
      .status(201)
      .json({
        success: true,
        message:
          "Company Private created successfully",
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
      await companyPrivateService.getAllCompanyPrivate();

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
      await companyPrivateService.getCompanyPrivateById(
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
      await companyPrivateService.updateCompanyPrivate(
        id,
        req.body
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Company Private updated successfully",
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

    await companyPrivateService.deleteCompanyPrivate(
      id
    );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Company Private deleted successfully",
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