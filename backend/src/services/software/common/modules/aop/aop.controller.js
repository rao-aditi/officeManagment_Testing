const aopService = require("./aop.service");
const { createAopValidation, updateAopValidation } = require("./aop.validation");

// CREATE
const createAop = async (req, res) => {
  try {

    const result = createAopValidation(req.body);

    // VALIDATION ERROR
    if (!result.success) {

      return res.status(400).json({
        success: false,
        message: "Validation failed",

        errors: result.error.issues.map((d) => ({
          field: d.path.join("."),
          message: d.message,
        })),
      });
    }

    // VALIDATED DATA
    const value = result.data;

    // CREATE DATA
    const data = await aopService.createAop(value);

    return res.status(201).json({
      success: true,
      message: "AOP created successfully",
      data,
    });

  } catch (err) {

    console.error("CREATE AOP ERROR =>", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// GET ALL
const getAllAop = async (req, res) => {
  try {

    const data = await aopService.getAllAop();

    return res.status(200).json({
      success: true,
      message: "AOPs fetched successfully",
      data,
    });

  } catch (err) {

    console.error("GET ALL AOP ERROR =>", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET BY ID
const getAopById = async (req, res) => {
  try {

    const data = await aopService.getAopById(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "AOP not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "AOP fetched successfully",
      data,
    });

  } catch (err) {

    console.error("GET AOP BY ID ERROR =>", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// UPDATE
const updateAop = async (req, res) => {
  try {

    const result = updateAopValidation(req.body);

    // VALIDATION ERROR
    if (!result.success) {

      return res.status(400).json({
        success: false,
        message: "Validation failed",

        errors: result.error.issues.map((d) => ({
          field: d.path.join("."),
          message: d.message,
        })),
      });
    }

    // VALIDATED DATA
    const value = result.data;

    // UPDATE
    const data = await aopService.updateAop(req.params.id, value);

    return res.status(200).json({
      success: true,
      message: "AOP updated successfully",
      data,
    });

  } catch (err) {

    console.error("UPDATE AOP ERROR =>", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE
const deleteAop = async (req, res) => {
  try {

    await aopService.deleteAop(req.params.id);

    return res.status(200).json({
      success: true,
      message: "AOP deleted successfully",
    });

  } catch (err) {

    console.error("DELETE AOP ERROR =>", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createAop,
  getAllAop,
  getAopById,
  updateAop,
  deleteAop,
};