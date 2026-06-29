const express = require("express");
const router = express.Router();
const multer = require("multer");

const authenticate = require("../middleware/authenticate");
const { checkPermission, checkAnyPermission } = require("../middleware/rbac");
const documentsController = require("./Documents.controller");
const {
  listDocumentsValidator,
  idParamValidator,
  uploadDocumentValidator,
} = require("./documents.validator");

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "text/plain",
  "text/csv",
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

router.use(authenticate);

router.get(
  "/",
  checkAnyPermission("upload_documents", "delete_documents"),
  listDocumentsValidator,
  documentsController.listDocuments
);

router.get(
  "/stats",
  checkAnyPermission("upload_documents", "delete_documents"),
  documentsController.getDocumentStats
);

router.get(
  "/:id",
  checkAnyPermission("upload_documents", "delete_documents"),
  idParamValidator,
  documentsController.getDocumentById
);

router.get(
  "/:id/download",
  checkAnyPermission("upload_documents", "delete_documents"),
  idParamValidator,
  documentsController.downloadDocument
);

router.get(
  "/:id/view",
  checkAnyPermission("upload_documents", "delete_documents"),
  idParamValidator,
  documentsController.viewDocument
);

router.post(
  "/upload",
  checkPermission("upload_documents"),
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      }
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  uploadDocumentValidator,
  documentsController.uploadDocument
);

router.delete(
  "/:id",
  checkPermission("delete_documents"),
  idParamValidator,
  documentsController.deleteDocument
);

module.exports = router;
