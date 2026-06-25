const MAX_WIDTH = 1600;
const JPEG_QUALITY = 0.82;
const SKIP_IF_UNDER_BYTES = 400_000;

export async function compressReceiptImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= SKIP_IF_UNDER_BYTES) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });

  if (!blob || blob.size >= file.size) {
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "receipt";

  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}
