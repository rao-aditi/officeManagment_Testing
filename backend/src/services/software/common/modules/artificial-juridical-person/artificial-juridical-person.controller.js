
const artificialJuridicalPersonService =
  require(
    "./artificial-juridical-person.services"
  );

// CREATE
const create = async (
  req,
  res
) => {
  try {
    const data =

      await artificialJuridicalPersonService.createArtificialJuridicalPerson(
        req.body
      );


    return res
      .status(201)
      .json({
        success: true,
        message:
          "Artificial Juridical Person created successfully",
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
      await artificialJuridicalPersonService.getAllArtificialJuridicalPersons();

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
      await artificialJuridicalPersonService.getArtificialJuridicalPersonById(
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
      await artificialJuridicalPersonService.updateArtificialJuridicalPerson(
        id,
        req.body
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Artificial Juridical Person updated successfully",
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

    await artificialJuridicalPersonService.deleteArtificialJuridicalPerson(
      id
    );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Artificial Juridical Person deleted successfully",
      });
  } catch (error) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          error.message,
      });
  };
  };

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};