/** מקביל ל-frontend/src/utils/qrGradients.js */

const DEFAULT_ANGLE_DEG = 135;

function clamp01(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.min(1, Math.max(0, num));
}

export function createLinearGradient(angleDeg = DEFAULT_ANGLE_DEG, colors = []) {
  const safeColors =
    Array.isArray(colors) && colors.length >= 2
      ? colors
      : ["#0a9396", "#005f73"];
  const step = safeColors.length === 1 ? 1 : 1 / (safeColors.length - 1);
  return {
    type: "linear",
    rotation: (Number(angleDeg) || DEFAULT_ANGLE_DEG) * (Math.PI / 180),
    colorStops: safeColors.map((color, index) => ({
      offset: clamp01(index * step),
      color,
    })),
  };
}

export function getGradientAngleDegrees(gradient, fallback = DEFAULT_ANGLE_DEG) {
  const rotation = Number(gradient?.rotation);
  if (Number.isNaN(rotation)) return fallback;
  return Math.round((rotation * 180) / Math.PI);
}

export function getGradientColors(gradient, fallback = ["#0a9396", "#005f73"]) {
  const stops = Array.isArray(gradient?.colorStops) ? gradient.colorStops : [];
  if (stops.length >= 2) {
    return [
      stops[0]?.color || fallback[0],
      stops[stops.length - 1]?.color || fallback[1],
    ];
  }
  return fallback;
}

export function gradientToCss(gradient, fallback = "#ffffff") {
  if (
    !gradient ||
    !Array.isArray(gradient.colorStops) ||
    !gradient.colorStops.length
  ) {
    return fallback;
  }
  const angle = getGradientAngleDegrees(gradient, DEFAULT_ANGLE_DEG);
  const stops = [...gradient.colorStops]
    .sort((a, b) => clamp01(a.offset) - clamp01(b.offset))
    .map(
      (stop) =>
        `${stop.color} ${Math.round(clamp01(stop.offset) * 100)}%`,
    )
    .join(", ");
  return `linear-gradient(${angle}deg, ${stops})`;
}

export function gradientsEqual(a, b) {
  return gradientToCss(a, "") === gradientToCss(b, "");
}

export function getGradientPrimaryColor(gradient, fallback = "#000000") {
  const [startColor] = getGradientColors(gradient, [fallback, fallback]);
  return startColor || fallback;
}

export const DEFAULT_QR_GRADIENT = createLinearGradient(135, [
  "#0a9396",
  "#005f73",
]);

export const DEFAULT_BG_GRADIENT = createLinearGradient(135, [
  "#fff7ed",
  "#fed7aa",
]);

export const QR_GRADIENT_PRESETS = [
  {
    id: "brand-teal",
    name: "טורקיז עמוק",
    gradient: createLinearGradient(135, ["#0a9396", "#005f73"]),
  },
  {
    id: "social-pop",
    name: "ורוד סגול",
    gradient: createLinearGradient(135, ["#7c3aed", "#ec4899"]),
  },
  {
    id: "sunrise",
    name: "שקיעה חמה",
    gradient: createLinearGradient(135, ["#f97316", "#ef4444"]),
  },
  {
    id: "electric",
    name: "כחול חשמלי",
    gradient: createLinearGradient(120, ["#2563eb", "#06b6d4"]),
  },
  {
    id: "lime-night",
    name: "ליים כהה",
    gradient: createLinearGradient(135, ["#65a30d", "#14532d"]),
  },
  {
    id: "royal",
    name: "סגול מלכותי",
    gradient: createLinearGradient(140, ["#4338ca", "#7c3aed"]),
  },
  {
    id: "ruby-fire",
    name: "רובי לוהט",
    gradient: createLinearGradient(135, ["#dc2626", "#fb7185"]),
  },
  {
    id: "matrix",
    name: "ניאון ירוק",
    gradient: createLinearGradient(135, ["#22c55e", "#15803d"]),
  },
  {
    id: "arctic",
    name: "קרח כחול",
    gradient: createLinearGradient(140, ["#38bdf8", "#6366f1"]),
  },
  {
    id: "gold-plum",
    name: "זהב שזיף",
    gradient: createLinearGradient(135, ["#f59e0b", "#7c3aed"]),
  },
  {
    id: "candy-pop",
    name: "קנדי פופ",
    gradient: createLinearGradient(135, ["#fb7185", "#f97316", "#facc15"]),
  },
];

export const BG_GRADIENT_PRESETS = [
  {
    id: "peach-cream",
    name: "אפרסק רך",
    gradient: createLinearGradient(135, ["#fff7ed", "#fdba74"]),
  },
  {
    id: "sky-mint",
    name: "שמיים מנטה",
    gradient: createLinearGradient(135, ["#dbeafe", "#a7f3d0"]),
  },
  {
    id: "lavender-blush",
    name: "לבנדר ורוד",
    gradient: createLinearGradient(135, ["#ede9fe", "#fbcfe8"]),
  },
  {
    id: "sunset-soft",
    name: "שקיעה עדינה",
    gradient: createLinearGradient(135, ["#fde68a", "#fca5a5"]),
  },
  {
    id: "ocean-silk",
    name: "ים משיי",
    gradient: createLinearGradient(135, ["#bfdbfe", "#93c5fd", "#c4b5fd"]),
  },
  {
    id: "stone-glow",
    name: "ניטרלי מודרני",
    gradient: createLinearGradient(140, ["#f5f5f4", "#d6d3d1"]),
  },
  {
    id: "berry-ice",
    name: "ברי קפוא",
    gradient: createLinearGradient(135, ["#d8b4fe", "#93c5fd", "#fbcfe8"]),
  },
  {
    id: "citrus-fresh",
    name: "הדרים רענן",
    gradient: createLinearGradient(135, ["#fef08a", "#86efac"]),
  },
  {
    id: "aqua-sand",
    name: "אקווה חול",
    gradient: createLinearGradient(135, ["#bae6fd", "#f5d0a9"]),
  },
  {
    id: "rose-cloud",
    name: "ענן ורוד",
    gradient: createLinearGradient(135, ["#ffe4e6", "#fbcfe8", "#ddd6fe"]),
  },
  {
    id: "seafoam",
    name: "קצף ים",
    gradient: createLinearGradient(135, ["#ccfbf1", "#99f6e4", "#bfdbfe"]),
  },
];

/** נקודות start/end ל-LinearGradient */
export function gradientRotationToPoints(rotationRad) {
  const angleDeg = (Number(rotationRad) * 180) / Math.PI - 90;
  const rad = (angleDeg * Math.PI) / 180;
  return {
    start: {
      x: 0.5 - Math.cos(rad) * 0.5,
      y: 0.5 - Math.sin(rad) * 0.5,
    },
    end: {
      x: 0.5 + Math.cos(rad) * 0.5,
      y: 0.5 + Math.sin(rad) * 0.5,
    },
  };
}

/** מילוי gradient ל-LinearGradient */
export function gradientToLinearFill(gradient, fallback = "#ffffff") {
  const grad = gradient || DEFAULT_QR_GRADIENT;
  const stops = Array.isArray(grad?.colorStops) ? [...grad.colorStops] : [];
  if (stops.length >= 2) {
    stops.sort((a, b) => (a.offset ?? 0) - (b.offset ?? 0));
    const { start, end } = gradientRotationToPoints(grad.rotation);
    return {
      colors: stops.map((s) => s.color || fallback),
      locations: stops.map((s) =>
        Math.min(1, Math.max(0, Number(s.offset) || 0)),
      ),
      start,
      end,
    };
  }
  const [a, b] = getGradientColors(grad, [fallback, fallback]);
  const { start, end } = gradientRotationToPoints(grad?.rotation);
  return { colors: [a, b], locations: [0, 1], start, end };
}

export function getBgGradientFill(bgGradient, fallback = "#ffffff") {
  const fill = gradientToLinearFill(bgGradient || DEFAULT_BG_GRADIENT, fallback);
  return { type: "gradient", ...fill };
}

export function getStickerTintFill(qrColorMode, fgColor, dotsGradient) {
  const mode = qrColorMode === "gradient" ? "gradient" : "solid";
  const fg = fgColor || "#000000";

  if (mode === "gradient") {
    const fill = gradientToLinearFill(dotsGradient || DEFAULT_QR_GRADIENT, fg);
    return { type: "gradient", ...fill };
  }

  return { type: "solid", color: fg };
}

export function overlayXmlForMask(overlayXml) {
  if (!overlayXml || typeof overlayXml !== "string") return overlayXml;
  return overlayXml
    .replace(/fill="#000000"/gi, 'fill="#ffffff"')
    .replace(/fill="#000"/gi, 'fill="#ffffff"')
    .replace(/fill="black"/gi, 'fill="white"');
}
