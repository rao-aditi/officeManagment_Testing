const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate");
const googleDriveController = require("./googleDrive.controller");

router.get("/callback", googleDriveController.oauthCallback);

router.use(authenticate);

router.get("/auth-url", googleDriveController.getAuthUrl);
router.get("/status", googleDriveController.getStatus);
router.delete("/disconnect", googleDriveController.disconnect);

module.exports = router;
