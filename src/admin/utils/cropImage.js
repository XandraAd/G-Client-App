// utils/cropImage.js
export default async function getCroppedImg(imageSrc, croppedAreaPixels, quality = 0.6) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob); // ✅ Compressed Blob
      },
      "image/jpeg",
      quality // 👈 JPEG compression: 0.6 = 60% quality
    );
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) =>
      reject(new Error(err?.message || "Image failed to load"))
    );
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}
