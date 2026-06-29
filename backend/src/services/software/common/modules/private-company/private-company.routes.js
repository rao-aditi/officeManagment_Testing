const express = require("express");
const router = express.Router();
const controller = require("./private-company.controller");

router.post("/", controller.createPrivateCompany);
router.get("/", controller.getAllPrivateCompanies);
router.get("/:id", controller.getPrivateCompanyById);
router.put("/:id", controller.updatePrivateCompany);
router.delete("/:id", controller.deletePrivateCompany);

router.post("/:id/directors", controller.addDirector);
router.put("/:id/directors/:directorId", controller.updateDirector);
router.delete("/:id/directors/:directorId", controller.deleteDirector);

router.post("/:id/submit", controller.submitForApproval);
router.post("/:id/approve", controller.approveCompany);
router.post("/:id/reject", controller.rejectCompany);
router.post("/:id/send-back", controller.sendBackCompany);

module.exports = router;