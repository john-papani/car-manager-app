export const MAX_DOCUMENT_FILE_BYTES = 10 * 1024 * 1024;

export function isSupportedDocumentFile(file: Pick<File, "type" | "size">) {
  return (
    file.size <= MAX_DOCUMENT_FILE_BYTES &&
    (file.type === "application/pdf" || file.type.startsWith("image/"))
  );
}

export function safeDocumentFileName(name: string) {
  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return safeName || "document";
}
