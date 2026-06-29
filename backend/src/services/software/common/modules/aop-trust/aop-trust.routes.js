const express = require("express");
const router = express.Router();
const aopTrustController = require("./aop-trust.controller");

router.post(  "/",    aopTrustController.createAopTrust);
router.get(   "/",    aopTrustController.getAllAopTrust);
router.get(   "/:id", aopTrustController.getAopTrustById);
router.put("/:id", aopTrustController.updateAopTrust);
router.patch("/:id", aopTrustController.updateAopTrust);  // ADD THIS
router.delete("/:id", aopTrustController.deleteAopTrust);

module.exports = router;