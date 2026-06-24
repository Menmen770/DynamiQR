import { captureRef } from "react-native-view-shot";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

/** מצלם את תצוגת QrPreviewComposite (רקע + QR + סטיקר) לקובץ PNG זמני. */
export async function captureQrPreviewToFile(
  previewRef,
  { stickerType, bgColorMode } = {},
) {
  if (!previewRef?.current) {
    throw new Error("אין תצוגה לייצוא");
  }

  await waitForPaint();
  if (stickerType && stickerType !== "none") {
    await wait(400);
  } else if (bgColorMode === "gradient") {
    await wait(250);
  } else {
    await wait(100);
  }

  const uri = await captureRef(previewRef, {
    format: "png",
    quality: 1,
    result: "tmpfile",
  });

  if (!uri) {
    throw new Error("יצירת תמונה לייצוא נכשלה");
  }

  return uri;
}
