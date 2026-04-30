const express = require("express");
const mongoose = require("mongoose");
const SavedQr = require("../models/SavedQr");
const { requireAuth } = require("../middleware/requireAuth");
const {
  normalizeTargetUrl,
  normalizeRedirectTarget,
  resolveTargetFromSavedDoc,
  randomSlug,
} = require("../utils/dynamicQr");
const { buildEncodedQrText } = require("../utils/buildEncodedQrText");

const router = express.Router();

const MAX_LOGO_URL_LENGTH = 450_000;

const MAX_DISPLAY_NAME = 120;

function trimBodyForStorage(body) {
  const { qrType, qrValue, qrInputs, style, displayName } = body;
  if (!qrType || typeof qrType !== "string") {
    return null;
  }
  let logoUrl = typeof style?.logoUrl === "string" ? style.logoUrl : "";
  if (logoUrl.length > MAX_LOGO_URL_LENGTH) {
    logoUrl = "";
  }
  const valueTrimmed =
    typeof qrValue === "string" ? qrValue.trim() : "";
  const nameRaw = typeof displayName === "string" ? displayName.trim() : "";
  const displayNameTrimmed = nameRaw.slice(0, MAX_DISPLAY_NAME);
  const linkMode =
    body?.linkMode === "dynamic" ? "dynamic" : "static";
  return {
    qrType: String(qrType).trim(),
    qrValue: valueTrimmed,
    displayName: displayNameTrimmed,
    qrInputs: qrInputs && typeof qrInputs === "object" ? qrInputs : {},
    linkMode,
    style: {
      fgColor: style?.fgColor ?? "#000000",
      bgColor: style?.bgColor ?? "#ffffff",
      bgColorMode: style?.bgColorMode ?? "solid",
      bgEffect: style?.bgEffect ?? "none",
      dotsType: style?.dotsType ?? "square",
      cornersType: style?.cornersType ?? "square",
      logoUrl,
      logoShape: style?.logoShape ?? "square",
      stickerType: style?.stickerType ?? "none",
      pdfInputMode: style?.pdfInputMode ?? "file",
      logoInputMode: style?.logoInputMode ?? "file",
    },
  };
}

function savedRowJson(doc) {
  const o = doc && typeof doc.toObject === "function" ? doc.toObject() : doc;
  if (!o) return null;
  return {
    _id: o._id,
    qrType: o.qrType,
    qrValue: o.qrValue || "",
    displayName: o.displayName || "",
    qrInputs: o.qrInputs || {},
    style: o.style,
    isActive: o.isActive !== false,
    linkMode: o.linkMode || "static",
    publicSlug: o.publicSlug || null,
    dynamicTargetUrl: o.dynamicTargetUrl || "",
    redirectPaused: !!o.redirectPaused,
    scanCount: typeof o.scanCount === "number" ? o.scanCount : 0,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

function sanitizeStyleObject(stylePatch, previous = {}) {
  const p = previous && typeof previous === "object" ? previous : {};
  const s = stylePatch && typeof stylePatch === "object" ? stylePatch : {};
  let logoUrl = typeof s.logoUrl === "string" ? s.logoUrl : p.logoUrl ?? "";
  if (logoUrl.length > MAX_LOGO_URL_LENGTH) {
    logoUrl = "";
  }
  return {
    fgColor: s.fgColor ?? p.fgColor ?? "#000000",
    bgColor: s.bgColor ?? p.bgColor ?? "#ffffff",
    bgColorMode: s.bgColorMode ?? p.bgColorMode ?? "solid",
    bgEffect: s.bgEffect ?? p.bgEffect ?? "none",
    dotsType: s.dotsType ?? p.dotsType ?? "square",
    cornersType: s.cornersType ?? p.cornersType ?? "square",
    logoUrl,
    logoShape: s.logoShape ?? p.logoShape ?? "square",
    stickerType: s.stickerType ?? p.stickerType ?? "none",
    pdfInputMode: s.pdfInputMode ?? p.pdfInputMode ?? "file",
    logoInputMode: s.logoInputMode ?? p.logoInputMode ?? "file",
  };
}

function mergeDeep(target, source) {
  if (!source || typeof source !== "object") return target || {};
  const base = target && typeof target === "object" ? { ...target } : {};
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = base[key];
    if (
      sv &&
      typeof sv === "object" &&
      !Array.isArray(sv) &&
      tv &&
      typeof tv === "object" &&
      !Array.isArray(tv)
    ) {
      base[key] = mergeDeep(tv, sv);
    } else if (sv !== undefined) {
      base[key] = sv;
    }
  }
  return base;
}

function escapeRegex(str) {
  return String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const COUNTRY_LABELS = {
  IL: "ישראל",
  US: "ארה\"ב",
  GB: "בריטניה",
  DE: "גרמניה",
  FR: "צרפת",
  ES: "ספרד",
  IT: "איטליה",
  RU: "רוסיה",
  IN: "הודו",
  BR: "ברזיל",
  CN: "סין",
  JP: "יפן",
  CA: "קנדה",
  AU: "אוסטרליה",
  UN: "לא ידוע",
};

function countryNameFromCode(codeRaw) {
  const code = String(codeRaw || "UN").toUpperCase();
  return COUNTRY_LABELS[code] || code;
}

function toDayKey(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function allocateUniqueSlug() {
  for (let i = 0; i < 10; i += 1) {
    const slug = randomSlug();
    const exists = await SavedQr.exists({ publicSlug: slug });
    if (!exists) return slug;
  }
  throw new Error("Could not allocate unique slug");
}

router.get("/saved-qrs", requireAuth, async (req, res) => {
  try {
    const limit = Math.min(
      50,
      Math.max(1, parseInt(String(req.query.limit || "20"), 10) || 20),
    );
    const qRaw =
      typeof req.query.q === "string" ? req.query.q.trim() : "";
    const filter = { userId: req.userId };
    if (qRaw) {
      filter.displayName = {
        $regex: escapeRegex(qRaw),
        $options: "i",
      };
    }
    const items = await SavedQr.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ items });
  } catch (err) {
    console.error("List saved QR error:", err);
    res.status(500).json({ error: "Failed to list saved QR codes" });
  }
});

router.post("/saved-qrs", requireAuth, async (req, res) => {
  const trimmed = trimBodyForStorage(req.body);
  if (!trimmed) {
    return res.status(400).json({ error: "qrType is required" });
  }
  if (!trimmed.displayName) {
    return res
      .status(400)
      .json({ error: "displayName is required to save a QR code" });
  }
  try {
    const userId = req.userId;
    let payload = {
      userId,
      ...trimmed,
    };

    if (trimmed.linkMode === "dynamic") {
      const synthetic = {
        qrType: trimmed.qrType,
        qrInputs: trimmed.qrInputs,
        qrValue: trimmed.qrValue,
        dynamicTargetUrl: "",
      };
      const target = resolveTargetFromSavedDoc(synthetic);
      const built = String(
        buildEncodedQrText(trimmed.qrType, trimmed.qrInputs) || "",
      ).trim();
      if (!target && !built) {
        return res.status(400).json({
          error:
            "נדרש תוכן תקין לקוד דינמי (למשל כתובת https או פרטי הרשת)",
        });
      }
      const publicSlug = await allocateUniqueSlug();
      payload = {
        ...payload,
        linkMode: "dynamic",
        publicSlug,
        dynamicTargetUrl: target || "",
        redirectPaused: false,
        scanCount: 0,
        qrValue: "",
      };
    } else {
      payload.linkMode = "static";
      payload.publicSlug = undefined;
      payload.dynamicTargetUrl = "";
      payload.redirectPaused = false;
      payload.scanCount = 0;
    }

    const doc = await SavedQr.create(payload);
    res.status(201).json({
      updated: false,
      saved: savedRowJson(doc),
    });
  } catch (err) {
    console.error("Save QR error:", err);
    res.status(500).json({ error: "Failed to save QR code" });
  }
});

router.patch("/saved-qrs/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  try {
    const existing = await SavedQr.findOne({
      _id: id,
      userId: req.userId,
    });
    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }

    const updates = {};
    if (typeof req.body?.displayName === "string") {
      const t = req.body.displayName.trim().slice(0, MAX_DISPLAY_NAME);
      if (!t) {
        return res
          .status(400)
          .json({ error: "displayName cannot be empty when provided" });
      }
      updates.displayName = t;
    }
    const prev = existing.toObject ? existing.toObject() : existing;

    if (req.body?.style && typeof req.body.style === "object") {
      updates.style = sanitizeStyleObject(req.body.style, prev.style);
    }
    if (req.body?.qrInputs && typeof req.body.qrInputs === "object") {
      updates.qrInputs = mergeDeep(
        prev.qrInputs && typeof prev.qrInputs === "object" ? prev.qrInputs : {},
        req.body.qrInputs,
      );
    }
    if (typeof req.body?.qrValue === "string") {
      updates.qrValue = req.body.qrValue.trim();
    }
    if (typeof req.body?.qrType === "string" && req.body.qrType.trim()) {
      updates.qrType = req.body.qrType.trim();
    }
    if (typeof req.body?.isActive === "boolean") {
      updates.isActive = req.body.isActive;
    }

    if (typeof req.body?.redirectPaused === "boolean") {
      if (prev.linkMode !== "dynamic") {
        return res
          .status(400)
          .json({ error: "redirectPaused applies only to dynamic QR codes" });
      }
      updates.redirectPaused = req.body.redirectPaused;
    }

    if (typeof req.body?.dynamicTargetUrl === "string") {
      if (prev.linkMode !== "dynamic") {
        return res
          .status(400)
          .json({ error: "dynamicTargetUrl applies only to dynamic QR codes" });
      }
      const raw = req.body.dynamicTargetUrl.trim();
      if (!raw) {
        updates.dynamicTargetUrl = "";
      } else {
        const http = normalizeTargetUrl(raw);
        const redir = http || normalizeRedirectTarget(raw);
        if (!redir) {
          return res.status(400).json({ error: "Invalid destination URL" });
        }
        updates.dynamicTargetUrl = redir;
      }
    }

    const unsetFields = {};

    if (req.body?.linkMode === "static") {
      updates.linkMode = "static";
      unsetFields.publicSlug = "";
      const fallbackTarget =
        normalizeTargetUrl(prev.dynamicTargetUrl) ||
        resolveTargetFromSavedDoc(prev);
      const built = String(
        buildEncodedQrText(prev.qrType, prev.qrInputs || {}) || "",
      ).trim();
      if (fallbackTarget) {
        updates.qrValue = fallbackTarget;
      } else if (built) {
        updates.qrValue = built;
      }
      updates.dynamicTargetUrl = "";
      updates.redirectPaused = false;
    } else if (req.body?.linkMode === "dynamic") {
      if (prev.linkMode !== "dynamic") {
        const mergedInputs =
          updates.qrInputs && typeof updates.qrInputs === "object"
            ? updates.qrInputs
            : prev.qrInputs || {};
        const mergedQrValue =
          typeof updates.qrValue === "string" ? updates.qrValue : prev.qrValue;
        const synthetic = {
          qrType: updates.qrType || prev.qrType,
          qrInputs: mergedInputs,
          qrValue: mergedQrValue,
          dynamicTargetUrl: "",
        };
        const target = resolveTargetFromSavedDoc(synthetic);
        const built = String(
          buildEncodedQrText(synthetic.qrType, mergedInputs) || "",
        ).trim();
        if (!target && !built) {
          return res.status(400).json({
            error:
              "נדרש תוכן תקין כדי להפעיל מצב דינמי (למשל כתובת https או פרטי הרשת)",
          });
        }
        updates.linkMode = "dynamic";
        updates.publicSlug = await allocateUniqueSlug();
        updates.dynamicTargetUrl = target || "";
        updates.redirectPaused = false;
        updates.qrValue = "";
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const updateDoc = { $set: updates };
    if (Object.keys(unsetFields).length > 0) {
      updateDoc.$unset = unsetFields;
    }

    const doc = await SavedQr.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updateDoc,
      { new: true, runValidators: true },
    ).lean();
    res.json({
      saved: savedRowJson(doc),
    });
  } catch (err) {
    console.error("Patch saved QR error:", err);
    res.status(500).json({ error: "Failed to update" });
  }
});

router.get("/saved-qrs/:id/stats", requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  try {
    const doc = await SavedQr.findOne({ _id: id, userId: req.userId }).lean();
    if (!doc) {
      return res.status(404).json({ error: "Not found" });
    }
    const events = Array.isArray(doc.scanEvents) ? doc.scanEvents : [];
    const osCounts = { ios: 0, android: 0, other: 0 };
    const countryCounts = new Map();
    const daily = new Map();

    const now = new Date();
    const last30Keys = [];
    for (let i = 29; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setUTCDate(now.getUTCDate() - i);
      const key = toDayKey(d);
      if (key) {
        last30Keys.push(key);
        daily.set(key, 0);
      }
    }

    for (const ev of events) {
      const os = ev?.os === "ios" || ev?.os === "android" ? ev.os : "other";
      osCounts[os] += 1;

      const cc = String(ev?.countryCode || "UN").toUpperCase();
      countryCounts.set(cc, (countryCounts.get(cc) || 0) + 1);

      const dayKey = toDayKey(ev?.scannedAt);
      if (dayKey && daily.has(dayKey)) {
        daily.set(dayKey, (daily.get(dayKey) || 0) + 1);
      }
    }

    const totalScans =
      typeof doc.scanCount === "number"
        ? doc.scanCount
        : osCounts.ios + osCounts.android + osCounts.other;

    const osBreakdown = [
      { key: "ios", label: "iPhone (iOS)", count: osCounts.ios },
      { key: "android", label: "Android", count: osCounts.android },
      { key: "other", label: "אחר", count: osCounts.other },
    ];

    const countryBreakdown = Array.from(countryCounts.entries())
      .map(([code, count]) => ({
        code,
        label: countryNameFromCode(code),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const dailySeries = last30Keys.map((date) => ({
      date,
      count: daily.get(date) || 0,
    }));

    return res.json({
      totalScans,
      osBreakdown,
      countryBreakdown,
      dailySeries,
    });
  } catch (err) {
    console.error("Saved QR stats error:", err);
    return res.status(500).json({ error: "Failed to load stats" });
  }
});

router.delete("/saved-qrs/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  try {
    const result = await SavedQr.deleteOne({
      _id: id,
      userId: req.userId,
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("Delete saved QR error:", err);
    res.status(500).json({ error: "Failed to delete" });
  }
});

module.exports = router;
