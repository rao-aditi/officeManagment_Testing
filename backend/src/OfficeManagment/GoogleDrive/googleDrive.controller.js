const googleDriveService = require("./googleDrive.service");
const { sendSuccess, sendError } = require("../utils/response.utils");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const getAuthUrl = async (req, res) => {
  try {
    const url = googleDriveService.getAuthUrl(req.user.id);
    return sendSuccess(res, { url }, "Google Drive auth URL generated.");
  } catch (err) {
    console.error("GOOGLE DRIVE AUTH URL ERROR =>", err);
    return sendError(res, err.message, err.statusCode || 500);
  }
};

const oauthCallback = async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(
      `${FRONTEND_URL}/profile?driveError=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return res.redirect(
      `${FRONTEND_URL}/profile?driveError=${encodeURIComponent("Missing authorization code.")}`
    );
  }

  try {
    await googleDriveService.handleOAuthCallback(code, state);
    return res.redirect(`${FRONTEND_URL}/profile?driveConnected=true`);
  } catch (err) {
    console.error("GOOGLE DRIVE CALLBACK ERROR =>", err);
    return res.redirect(
      `${FRONTEND_URL}/profile?driveError=${encodeURIComponent(err.message || "Connection failed.")}`
    );
  }
};

const getStatus = async (req, res) => {
  try {
    const status = await googleDriveService.getDriveStatus(req.user.id);
    return sendSuccess(res, status, "Google Drive status fetched.");
  } catch (err) {
    console.error("GOOGLE DRIVE STATUS ERROR =>", err);
    return sendError(res, err.message, err.statusCode || 500);
  }
};

const disconnect = async (req, res) => {
  try {
    await googleDriveService.disconnectDrive(req.user.id);
    return sendSuccess(res, null, "Google Drive disconnected successfully.");
  } catch (err) {
    console.error("GOOGLE DRIVE DISCONNECT ERROR =>", err);
    return sendError(res, err.message, err.statusCode || 500);
  }
};

const uploadDocument = async (req, res) => {
  try {
    const { taskId, invoiceId, clientId } = req.body;
    const folderType = googleDriveService.resolveFolderType({
      taskId,
      invoiceId,
      clientId,
    });

    const result = await googleDriveService.uploadFileToDrive(
      req.user.id,
      {
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        folderType,
      }
    );

    return sendSuccess(
      res,
      result,
      "File uploaded to Google Drive successfully"
    );
  } catch (err) {
    console.error("GOOGLE DRIVE UPLOAD ERROR =>", err);
    return sendError(res, err.message, err.statusCode || 500);
  }
};

module.exports = {
  getAuthUrl,
  oauthCallback,
  getStatus,
  disconnect,
  uploadDocument,
};
