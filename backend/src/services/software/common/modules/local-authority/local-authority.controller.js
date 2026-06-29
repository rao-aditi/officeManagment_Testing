
const localAuthorityService = require(
  "./local-authority.services"
);

// CREATE
const create = async (
  req,
  res
) => {
  try {
    const data =
      await localAuthorityService.createLocalAuthority(
        req.body
      );

    return res
      .status(201)
      .json({
        success: true,
        message:
          "Local Authority created successfully",
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
      await localAuthorityService.getAllLocalAuthorities();

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
      await localAuthorityService.getLocalAuthorityById(
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
      await localAuthorityService.updateLocalAuthority(
        id,
        req.body
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Local Authority updated successfully",
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

    await localAuthorityService.deleteLocalAuthority(
      id
    );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Local Authority deleted successfully",
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