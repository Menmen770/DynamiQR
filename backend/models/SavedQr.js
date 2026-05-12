const mongoose = require("mongoose");

const styleSchema = new mongoose.Schema(
  {
    fgColor: { type: String, default: "#000000" },
    qrColorMode: { type: String, default: "solid" },
    dotsGradient: { type: mongoose.Schema.Types.Mixed, default: null },
    bgColor: { type: String, default: "#ffffff" },
    bgColorMode: { type: String, default: "solid" },
    bgGradient: { type: mongoose.Schema.Types.Mixed, default: null },
    dotsType: { type: String, default: "square" },
    cornersType: { type: String, default: "square" },
    logoUrl: { type: String, default: "" },
    logoShape: { type: String, default: "square" },
    logoInsetScale: { type: Number, default: 1 },
    stickerType: { type: String, default: "none" },
    errorCorrectionLevel: { type: String, default: "Q" },
    pdfInputMode: { type: String, default: "file" },
    logoInputMode: { type: String, default: "file" },
  },
  { _id: false },
);

const scanEventSchema = new mongoose.Schema(
  {
    scannedAt: { type: Date, default: Date.now },
    os: {
      type: String,
      enum: ["ios", "android", "other"],
      default: "other",
    },
    countryCode: { type: String, default: "UN" },
  },
  { _id: false },
);

const savedQrSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    qrType: { type: String, required: true },
    qrValue: { type: String, default: "" },
    qrInputs: { type: mongoose.Schema.Types.Mixed, default: {} },
    style: { type: styleSchema, default: () => ({}) },
    displayName: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
    linkMode: {
      type: String,
      enum: ["static", "dynamic"],
      default: "static",
    },
    publicSlug: { type: String, default: undefined },
    dynamicTargetUrl: { type: String, default: "" },
    redirectPaused: { type: Boolean, default: false },
    scanCount: { type: Number, default: 0 },
    scanEvents: { type: [scanEventSchema], default: [] },
  },
  { timestamps: true },
);

savedQrSchema.index({ userId: 1, createdAt: -1 });
savedQrSchema.index({ userId: 1, displayName: 1 });
savedQrSchema.index(
  { publicSlug: 1 },
  { unique: true, sparse: true },
);

module.exports = mongoose.model("SavedQr", savedQrSchema);
