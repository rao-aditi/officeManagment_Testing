export const isInlinePreviewable = (mimeType) =>
  mimeType === "application/pdf" ||
  mimeType?.startsWith("image/") ||
  mimeType === "text/plain" ||
  mimeType === "text/csv";

export const toPreviewBlob = (blob, mimeType) => {
  const headerType =
    typeof mimeType === "string" ? mimeType.split(";")[0].trim() : "";
  const resolvedType =
    blob?.type && blob.type !== "application/octet-stream"
      ? blob.type
      : headerType || "application/pdf";

  if (blob instanceof Blob && blob.type === resolvedType) {
    return blob;
  }

  return new Blob([blob], { type: resolvedType });
};

export const createPreviewObjectUrl = (blob, mimeType) =>
  URL.createObjectURL(toPreviewBlob(blob, mimeType));
