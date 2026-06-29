const express = require("express");
const router = express.Router();
const controller = require("./public-company.controller");

router.post("/", controller.createPublicCompany);
router.get("/", controller.getAllPublicCompanies);
router.get("/:id", controller.getPublicCompanyById);
router.put("/:id", controller.updatePublicCompany);
router.delete("/:id", controller.deletePublicCompany);

router.post("/:id/kmp", controller.addKmp);
router.put("/:id/kmp/:kmpId", controller.updateKmp);
router.delete("/:id/kmp/:kmpId", controller.deleteKmp);

router.post("/:id/submit", controller.submitForApproval);
router.post("/:id/approve", controller.approveCompany);
router.post("/:id/reject", controller.rejectCompany);
router.post("/:id/send-back", controller.sendBackCompany);

module.exports = router;