const express = require("express");
const router = express.Router();
const controller = require("./aop-boi.controller");

router.post("/", controller.createAopBoi);
router.get("/", controller.getAllAopBoi);
router.get("/:id", controller.getAopBoiById);
router.put("/:id", controller.updateAopBoi);
router.delete("/:id", controller.deleteAopBoi);

router.post("/:id/members", controller.addMember);
router.put("/:id/members/:memberId", controller.updateMember);
router.delete("/:id/members/:memberId", controller.deleteMember);

router.post("/:id/submit", controller.submitForApproval);
router.post("/:id/approve", controller.approveAopBoi);
router.post("/:id/reject", controller.rejectAopBoi);
router.post("/:id/send-back", controller.sendBackAopBoi);

module.exports = router;