import express from "express";
import DashboardFolderState from "../models/DashboardFolderState.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

const MAX_FOLDERS = 80;
const MAX_ASSIGN_KEYS = 500;
const MAX_ORDER_IDS = 500;
const MAX_FOLDER_ORDER_KEYS = 120;
const MAX_IDS_PER_FOLDER_ORDER = 250;
const FOLDER_ID_MAX = 64;
const FOLDER_NAME_MAX = 100;

function isHexObjectId(s) {
  return typeof s === "string" && /^[a-f\d]{24}$/i.test(s);
}

function isFolderMetaId(s) {
  if (typeof s !== "string" || !s.length || s.length > FOLDER_ID_MAX) {
    return false;
  }
  return /^[\w-]+$/.test(s);
}

function emptyState() {
  return {
    folders: [],
    assignments: {},
    globalOrder: [],
    folderOrders: {},
  };
}

function sanitizeFolderState(body) {
  if (!body || typeof body !== "object") {
    return null;
  }

  const folders = [];
  const seenFolderIds = new Set();
  const rawFolders = Array.isArray(body.folders) ? body.folders : [];
  for (const f of rawFolders.slice(0, MAX_FOLDERS)) {
    if (!f || typeof f !== "object") continue;
    const id = String(f.id || "").trim().slice(0, FOLDER_ID_MAX);
    const name = String(f.name || "").trim().slice(0, FOLDER_NAME_MAX);
    if (!id || !name || !isFolderMetaId(id)) continue;
    if (seenFolderIds.has(id)) continue;
    seenFolderIds.add(id);
    folders.push({ id, name });
  }

  const assignments = {};
  let assignCount = 0;
  const rawAssign =
    body.assignments && typeof body.assignments === "object"
      ? body.assignments
      : {};
  for (const [k, v] of Object.entries(rawAssign)) {
    if (assignCount >= MAX_ASSIGN_KEYS) break;
    const qrId = String(k || "").trim();
    if (!isHexObjectId(qrId)) continue;
    const folderId = String(v || "").trim().slice(0, FOLDER_ID_MAX);
    if (!folderId || !isFolderMetaId(folderId)) continue;
    if (!seenFolderIds.has(folderId)) continue;
    assignments[qrId] = folderId;
    assignCount += 1;
  }

  const globalOrder = [];
  const seenOrder = new Set();
  const rawGlobal = Array.isArray(body.globalOrder) ? body.globalOrder : [];
  for (const id of rawGlobal.slice(0, MAX_ORDER_IDS)) {
    const sid = String(id || "").trim();
    if (!isHexObjectId(sid) || seenOrder.has(sid)) continue;
    seenOrder.add(sid);
    globalOrder.push(sid);
  }

  const folderOrders = {};
  const rawFo =
    body.folderOrders && typeof body.folderOrders === "object"
      ? body.folderOrders
      : {};
  let foKeyCount = 0;
  for (const [key, arr] of Object.entries(rawFo)) {
    if (foKeyCount >= MAX_FOLDER_ORDER_KEYS) break;
    const k = String(key || "").trim().slice(0, FOLDER_ID_MAX);
    if (!k || !isFolderMetaId(k)) continue;
    if (k !== "__unfiled" && !seenFolderIds.has(k)) continue;
    if (!Array.isArray(arr)) continue;
    const list = [];
    const seen = new Set();
    for (const id of arr.slice(0, MAX_IDS_PER_FOLDER_ORDER)) {
      const sid = String(id || "").trim();
      if (!isHexObjectId(sid) || seen.has(sid)) continue;
      seen.add(sid);
      list.push(sid);
    }
    folderOrders[k] = list;
    foKeyCount += 1;
  }

  return { folders, assignments, globalOrder, folderOrders };
}

router.get("/dashboard/folders", requireAuth, async (req, res) => {
  try {
    const doc = await DashboardFolderState.findOne({
      userId: req.userId,
    }).lean();
    if (!doc) {
      return res.json(emptyState());
    }
    return res.json({
      folders: Array.isArray(doc.folders) ? doc.folders : [],
      assignments:
        doc.assignments && typeof doc.assignments === "object"
          ? doc.assignments
          : {},
      globalOrder: Array.isArray(doc.globalOrder) ? doc.globalOrder : [],
      folderOrders:
        doc.folderOrders && typeof doc.folderOrders === "object"
          ? doc.folderOrders
          : {},
    });
  } catch (err) {
    console.error("GET dashboard folders error:", err);
    res.status(500).json({ error: "Failed to load folder layout" });
  }
});

router.put("/dashboard/folders", requireAuth, async (req, res) => {
  const sanitized = sanitizeFolderState(req.body);
  if (!sanitized) {
    return res.status(400).json({ error: "Invalid folder state payload" });
  }
  try {
    const doc = await DashboardFolderState.findOneAndUpdate(
      { userId: req.userId },
      { $set: sanitized },
      { new: true, upsert: true, runValidators: true },
    ).lean();
    return res.json({
      folders: doc.folders || [],
      assignments: doc.assignments || {},
      globalOrder: doc.globalOrder || [],
      folderOrders: doc.folderOrders || {},
    });
  } catch (err) {
    console.error("PUT dashboard folders error:", err);
    res.status(500).json({ error: "Failed to save folder layout" });
  }
});

export default router;
