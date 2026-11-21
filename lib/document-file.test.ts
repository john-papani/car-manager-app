import { describe, expect, it } from "vitest";
import {
  isSupportedDocumentFile,
  MAX_DOCUMENT_FILE_BYTES,
  safeDocumentFileName,
} from "@/lib/document-file";

describe("document file validation", () => {
  it("accepts PDFs and images up to 10 MB", () => {
    expect(isSupportedDocumentFile({ type: "application/pdf", size: 1000 })).toBe(true);
    expect(isSupportedDocumentFile({ type: "image/jpeg", size: MAX_DOCUMENT_FILE_BYTES })).toBe(true);
  });

  it("rejects other formats and oversized files", () => {
    expect(isSupportedDocumentFile({ type: "text/plain", size: 1000 })).toBe(false);
    expect(
      isSupportedDocumentFile({
        type: "application/pdf",
        size: MAX_DOCUMENT_FILE_BYTES + 1,
      }),
    ).toBe(false);
  });

  it("removes unsafe path characters from names", () => {
    expect(safeDocumentFileName("ασφάλεια 2027/τελικό.pdf")).toBe(
      "_________2027_______.pdf",
    );
  });
});
