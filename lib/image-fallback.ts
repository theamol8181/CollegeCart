export type ImageDataUrlOptions = {
  maxDataUrlLength?: number;
  maxSide?: number;
  minQuality?: number;
};

const DEFAULT_MAX_DATA_URL_LENGTH = 140_000;
const DEFAULT_MAX_SIDE = 900;
const DEFAULT_MIN_QUALITY = 0.38;

export async function fileToCompressedDataUrl(file: File, options: ImageDataUrlOptions = {}) {
  const maxDataUrlLength = options.maxDataUrlLength ?? DEFAULT_MAX_DATA_URL_LENGTH;
  const maxSide = options.maxSide ?? DEFAULT_MAX_SIDE;
  const minQuality = options.minQuality ?? DEFAULT_MIN_QUALITY;

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be stored as fallback uploads.");
  }

  if (typeof document === "undefined" || typeof createImageBitmap === "undefined" || file.type.includes("svg")) {
    const dataUrl = await fileToDataUrl(file);
    if (dataUrl.length <= maxDataUrlLength) return dataUrl;
    throw new Error("This image is too large for fallback storage. Please choose a smaller photo.");
  }

  let bitmap: ImageBitmap | null = null;

  try {
    bitmap = await createImageBitmap(file);
    let sideLimit = maxSide;
    let lastDataUrl = "";

    while (sideLimit >= 120) {
      const scale = Math.min(1, sideLimit / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));

      const context = canvas.getContext("2d");
      if (!context) break;

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (let quality = 0.82; quality >= minQuality; quality -= 0.08) {
        lastDataUrl = canvas.toDataURL("image/jpeg", quality);
        if (lastDataUrl.length <= maxDataUrlLength) return lastDataUrl;
      }

      sideLimit = Math.round(sideLimit * 0.72);
    }

    if (lastDataUrl && lastDataUrl.length <= maxDataUrlLength) return lastDataUrl;
    return fileToDataUrl(file);
  } catch {
    const dataUrl = await fileToDataUrl(file);
    if (dataUrl.length <= maxDataUrlLength) return dataUrl;
    throw new Error("This image is too large for fallback storage. Please choose a smaller photo.");
  } finally {
    bitmap?.close();
  }
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}
