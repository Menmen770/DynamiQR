/**
 * Sticker frame assets: full overlays (SVG with transparent QR hole) + button thumbnails.
 * All frames share the same normalized QR placement (see STICKER_QR_NORMALIZED_RECT).
 */

import thumb01 from "./sticker-thumbnails/thumb-01.png";
import thumb02 from "./sticker-thumbnails/thumb-02.png";
import thumb03 from "./sticker-thumbnails/thumb-03.png";
import thumb04 from "./sticker-thumbnails/thumb-04.png";
import thumb05 from "./sticker-thumbnails/thumb-05.png";
import thumb06 from "./sticker-thumbnails/thumb-06.png";
import thumb07 from "./sticker-thumbnails/thumb-07.png";
import thumb08 from "./sticker-thumbnails/thumb-08.png";
import thumb09 from "./sticker-thumbnails/thumb-09.png";

import overlay01 from "./sticker-overlays/frame-01.svg";
import overlay02 from "./sticker-overlays/frame-02.svg";
import overlay03 from "./sticker-overlays/frame-03.svg";
import overlay04 from "./sticker-overlays/frame-04.svg";
import overlay05 from "./sticker-overlays/frame-05.svg";
import overlay06 from "./sticker-overlays/frame-06.svg";
import overlay07 from "./sticker-overlays/frame-07.svg";
import overlay08 from "./sticker-overlays/frame-08.svg";
import overlay09 from "./sticker-overlays/frame-09.png";

/** Where the QR sits inside the overlay (0–1), same for every frame export. Calibrate if design changes. */
export const STICKER_QR_NORMALIZED_RECT = {
  x: 202 / 1125,
  y: 200 / 1125,
  width: (915.730469 - 202) / 1125,
  height: (920.261719 - 200) / 1125,
};

export const STICKER_IMAGE_FRAMES = [
  { id: "frame-01", name: "מסגרה 1", thumbnail: thumb01, overlay: overlay01 },
  { id: "frame-02", name: "מסגרה 2", thumbnail: thumb02, overlay: overlay02 },
  { id: "frame-03", name: "מסגרה 3", thumbnail: thumb03, overlay: overlay03 },
  { id: "frame-04", name: "מסגרה 4", thumbnail: thumb04, overlay: overlay04 },
  { id: "frame-05", name: "מסגרה 5", thumbnail: thumb05, overlay: overlay05 },
  { id: "frame-06", name: "מסגרה 6", thumbnail: thumb06, overlay: overlay06 },
  { id: "frame-07", name: "מסגרה 7", thumbnail: thumb07, overlay: overlay07 },
  { id: "frame-08", name: "מסגרה 8", thumbnail: thumb08, overlay: overlay08 },
  { id: "frame-09", name: "מסגרת 9", thumbnail: thumb09, overlay: overlay09 },
];

const OVERLAY_BY_ID = Object.fromEntries(
  STICKER_IMAGE_FRAMES.map((f) => [f.id, f.overlay]),
);

export function getStickerOverlayUrl(stickerId) {
  return OVERLAY_BY_ID[stickerId] ?? null;
}

export function isImageStickerId(stickerId) {
  return Boolean(OVERLAY_BY_ID[stickerId]);
}
