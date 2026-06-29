
const hufService = require("../huf/huf.service");
const { hufSchema, updateHufSchema } = require("./huf.validation");

const create = async (req, res) => {
  try {
    console.log("BODY =>", req.body);

    const parsed = hufSchema.safeParse(req.body);

    if (!parsed.success) {
      console.log(parsed.error.format());

      return res.status(400).json({
        success: false,
        errors: parsed.error.format(),
      });
    }

    const huf = await hufService.createHuf(parsed.data);

    return res.status(201).json({
      success: true,
      data: huf,
    });

  } catch (err) {
    console.log("SERVER ERROR =>", err);

    return res.status(500).json({
      success: false,
      message: err.message,

    })
  }
};


const getAll = async (req, res) => {
  try {
    const hufs = await hufService.getAllHuf();
    return res.status(200).json(hufs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const huf = await hufService.getHufById(req.params.id);
    if (!huf) return res.status(404).json({ message: "HUF not found" });
    return res.status(200).json(huf);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }    
};

const update = async (req, res) => {
  try {
    const parsed = updateHufSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.errors });
    }

    const huf = await hufService.updateHuf(req.params.id, parsed.data);
    return res.status(200).json(huf);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await hufService.deleteHuf(req.params.id);
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { create, getAll, getById, update, remove };

