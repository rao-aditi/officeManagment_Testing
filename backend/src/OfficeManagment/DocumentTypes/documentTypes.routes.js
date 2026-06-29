const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate");
const { checkPermission, checkAnyPermission } = require("../middleware/rbac");
const documentTypesController = require("./documentTypes.controller");
const {
  idParamValidator,
  listQueryValidator,
  createDocumentTypeValidator,
  updateDocumentTypeValidator,
} = require("./documentTypes.validator");

router.use(authenticate);

router.post(
  "/create_DocumentType",
  checkPermission("create_document_type"),
  createDocumentTypeValidator,
  documentTypesController.createDocumentType
);

router.get(
  "/getAllDocumentTypes",
  checkAnyPermission(
    "upload_documents",
    "delete_documents",
    "create_document_type",
    "update_document_type",
    "delete_document_type"
  ),
  listQueryValidator,
  documentTypesController.listDocumentTypes
);

router.get(
  "/get-documentTypeById/:id",
  checkAnyPermission(
    "upload_documents",
    "delete_documents",
    "create_document_type",
    "update_document_type",
    "delete_document_type"
  ),
  idParamValidator,
  documentTypesController.getDocumentTypeById
);

router.put(
  "/update_documentType/:id",
  checkPermission("update_document_type"),
  updateDocumentTypeValidator,
  documentTypesController.updateDocumentType
);

router.delete(
  "/delete_documentType/:id",
  checkPermission("delete_document_type"),
  idParamValidator,
  documentTypesController.deleteDocumentType
);

module.exports = router;
