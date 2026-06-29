const express = require("express");
const router = express.Router();
const aopController = require("./aop.controller");

router.post(  "/",    aopController.createAop);
router.get(   "/",    aopController.getAllAop);
router.get(   "/:id", aopController.getAopById);
router.put("/:id", aopController.updateAop);
router.patch("/:id", aopController.updateAop);  // ADD THIS
router.delete("/:id", aopController.deleteAop);

module.exports = router;