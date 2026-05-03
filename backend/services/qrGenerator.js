const {
  QRCodeStyling,
} = require("qr-code-styling/lib/qr-code-styling.common.js");
const nodeCanvas = require("canvas");
const { JSDOM } = require("jsdom");

/** חור שקוף במרכז בלי תמונת לוגו — למי שרוצה למלא בעצמו */
async function applyCutoutOnly(qrBuffer, logoShape = "square") {
  const qrImage = await nodeCanvas.loadImage(qrBuffer);
  const canvas = nodeCanvas.createCanvas(qrImage.width, qrImage.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(qrImage, 0, 0);

  const centerX = qrImage.width / 2;
  const centerY = qrImage.height / 2;
  const cutoutSize = Math.min(qrImage.width, qrImage.height) * 0.38;

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  if (logoShape === "circle") {
    ctx.arc(centerX, centerY, cutoutSize / 2, 0, Math.PI * 2);
  } else {
    ctx.rect(
      centerX - cutoutSize / 2,
      centerY - cutoutSize / 2,
      cutoutSize,
      cutoutSize,
    );
  }
  ctx.closePath();
  ctx.fill();

  return canvas.toBuffer("image/png");
}

async function addLogoWithCutout(
  qrBuffer,
  imageSource,
  logoShape = "square",
  logoInsetScale = 1,
) {
  const qrImage = await nodeCanvas.loadImage(qrBuffer);
  const canvas = nodeCanvas.createCanvas(qrImage.width, qrImage.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(qrImage, 0, 0);

  const centerX = qrImage.width / 2;
  const centerY = qrImage.height / 2;
  const cutoutSize = Math.min(qrImage.width, qrImage.height) * 0.38;
  const insetMul = Math.min(
    1,
    Math.max(0.1, Number(logoInsetScale) || 1),
  );
  const logoSize = cutoutSize * 0.68 * insetMul;

  try {
    const logoImage = await nodeCanvas.loadImage(imageSource);
    const sourceSize = Math.min(logoImage.width, logoImage.height);
    const sourceX = (logoImage.width - sourceSize) / 2;
    const sourceY = (logoImage.height - sourceSize) / 2;

    if (logoShape === "overlay") {
      const overlaySize = Math.min(qrImage.width, qrImage.height) * 0.22;
      ctx.drawImage(
        logoImage,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        centerX - overlaySize / 2,
        centerY - overlaySize / 2,
        overlaySize,
        overlaySize,
      );
      return canvas.toBuffer("image/png");
    }

    /* חור שקוף — הרקע שמאחורי ה-QR (בתצוגה) ייראה דרך השקיפות */
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    if (logoShape === "circle") {
      ctx.arc(centerX, centerY, cutoutSize / 2, 0, Math.PI * 2);
    } else {
      ctx.rect(
        centerX - cutoutSize / 2,
        centerY - cutoutSize / 2,
        cutoutSize,
        cutoutSize,
      );
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    ctx.drawImage(
      logoImage,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      centerX - logoSize / 2,
      centerY - logoSize / 2,
      logoSize,
      logoSize,
    );
  } catch (logoError) {
    console.warn(
      "Logo image load failed, keeping QR without logo:",
      logoError.message,
    );
  }

  return canvas.toBuffer("image/png");
}

/**
 * מחזיר data URL של PNG לפי גוף הבקשה (כמו ב־POST /api/generate-qr).
 */
async function generateQrDataUrl(body) {
  const {
    text,
    color,
    bgColor,
    dotsType = "square",
    cornersType = "square",
    dotsGradient = null,
    bgGradient = null,
    image = null,
    logoShape = "square",
    errorCorrectionLevel = "Q",
    logoInsetScale = 1,
  } = body;

  if (!text) {
    const err = new Error("Text is required");
    err.statusCode = 400;
    throw err;
  }

  const dotsOptions = {
    color: color || "#000000",
    type: dotsType,
  };
  if (dotsGradient) {
    dotsOptions.gradient = dotsGradient;
  }

  const backgroundOptions = {
    color: bgColor === "transparent" ? "rgba(0,0,0,0)" : bgColor || "#FFFFFF",
  };
  if (bgGradient) {
    backgroundOptions.gradient = bgGradient;
  }

  const options = {
    width: 400,
    height: 400,
    type: "png",
    data: text,
    margin: 10,
    jsdom: JSDOM,
    nodeCanvas: nodeCanvas,
    qrOptions: {
      typeNumber: 0,
      mode: "Byte",
      errorCorrectionLevel: errorCorrectionLevel,
    },
    dotsOptions: dotsOptions,
    backgroundOptions: backgroundOptions,
    cornersSquareOptions: {
      color: color || "#000000",
      type: cornersType,
    },
    cornersDotOptions: {
      color: color || "#000000",
      type: cornersType,
    },
  };

  const qrCode = new QRCodeStyling(options);
  const qrBuffer = await qrCode.getRawData("png");
  let finalBuffer = qrBuffer;

  if (image) {
    finalBuffer = await addLogoWithCutout(
      qrBuffer,
      image,
      logoShape,
      logoInsetScale,
    );
  } else if (logoShape === "square" || logoShape === "circle") {
    finalBuffer = await applyCutoutOnly(qrBuffer, logoShape);
  }

  const base64 = finalBuffer.toString("base64");
  return `data:image/png;base64,${base64}`;
}

module.exports = {
  addLogoWithCutout,
  applyCutoutOnly,
  generateQrDataUrl,
};
