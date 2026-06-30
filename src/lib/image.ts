export interface CompressedImage {
  data: string;
  mediaType: "image/jpeg";
}

// Larger batches take longer to upload and for Claude to process, so compress more
// aggressively as the batch grows to keep total request time within the server/client
// timeout budget (see TOOL_RETRY_BUDGET_MS in src/lib/anthropic.ts).
function getCompressionSettings(imageCount: number): { maxDimension: number; quality: number } {
  if (imageCount <= 3) return { maxDimension: 1600, quality: 0.8 };
  if (imageCount <= 6) return { maxDimension: 1280, quality: 0.72 };
  return { maxDimension: 1100, quality: 0.65 };
}

export async function compressImageToBase64(file: File, imageCount: number): Promise<CompressedImage> {
  const { maxDimension, quality } = getCompressionSettings(imageCount);
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas context unavailable");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  const data = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return { data, mediaType: "image/jpeg" };
}
