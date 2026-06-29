import React from "react";
import Modal from "../ui/Modal";

const DocumentPreviewModal = ({
  isOpen,
  onClose,
  previewUrl,
  mimeType,
  fileName,
}) => {
  const isPdf = mimeType === "application/pdf";
  const isImage = mimeType?.startsWith("image/");
  const isText = mimeType === "text/plain" || mimeType === "text/csv";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fileName || "Document Preview"}
      size="full"
    >
      <div className="w-full">
        {isPdf && (
          <iframe
            title={fileName || "Document preview"}
            src={previewUrl}
            className="w-full h-[75vh] border-0 rounded-lg bg-gray-100"
          />
        )}

        {isImage && (
          <div className="flex justify-center">
            <img
              src={previewUrl}
              alt={fileName || "Document preview"}
              className="max-h-[75vh] max-w-full object-contain"
            />
          </div>
        )}

        {isText && (
          <iframe
            title={fileName || "Document preview"}
            src={previewUrl}
            className="w-full h-[75vh] border border-gray-200 rounded-lg bg-white"
          />
        )}

        {!isPdf && !isImage && !isText && (
          <p className="text-sm text-gray-600">
            Inline preview is not available for this file type. Please use
            Download or open the Google Drive link.
          </p>
        )}
      </div>
    </Modal>
  );
};

export default DocumentPreviewModal;
