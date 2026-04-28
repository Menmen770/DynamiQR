const express = require("express");
const SavedQr = require("../models/SavedQr");
const {
  resolveTargetFromSavedDoc,
  isValidSlug,
  normalizeSlugParam,
} = require("../utils/dynamicQr");

const router = express.Router();

const PAUSED_HTML = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>קישור לא זמין</title></head>
<body style="font-family:system-ui,sans-serif;padding:2rem;text-align:center;">
<p>הקישור זמנית לא זמין.</p>
</body></html>`;

router.get("/r/:slug", async (req, res) => {
  const slugNorm = normalizeSlugParam(req.params.slug);
  if (!isValidSlug(slugNorm)) {
    return res.status(404).type("text/plain").send("Not found");
  }
  try {
    const doc = await SavedQr.findOne({ publicSlug: slugNorm }).lean();
    if (!doc) {
      return res.status(404).type("text/plain").send("Not found");
    }
    const isDynamic =
      doc.linkMode === "dynamic" ||
      ((!doc.linkMode || doc.linkMode === "") &&
        doc.publicSlug &&
        String(doc.dynamicTargetUrl || "").trim());
    if (!isDynamic) {
      return res.status(404).type("text/plain").send("Not found");
    }
    if (doc.redirectPaused) {
      return res.status(200).type("html").send(PAUSED_HTML);
    }
    const target = resolveTargetFromSavedDoc(doc);
    if (!target) {
      return res.status(404).type("text/plain").send("Not found");
    }
    const inc = await SavedQr.updateOne(
      { _id: doc._id },
      { $inc: { scanCount: 1 } },
    );
    if (!inc.matchedCount) {
      console.warn("QR redirect: scanCount update matched 0 docs", doc._id);
    }
    res.statusCode = 302;
    res.setHeader("Location", target);
    return res.end();
  } catch (err) {
    console.error("QR redirect error:", err);
    return res.status(500).type("text/plain").send("Server error");
  }
});

module.exports = router;
