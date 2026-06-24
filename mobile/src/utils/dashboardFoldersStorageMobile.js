import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "qr-dashboard-folders-v1";

export const UNFILED_ORDER_KEY = "__unfiled";

export function createEmptyFolderState() {
  return {
    folders: [],
    assignments: {},
    globalOrder: [],
    folderOrders: {},
  };
}

export async function loadFolderState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyFolderState();
    const p = JSON.parse(raw);
    if (!p || typeof p !== "object") return createEmptyFolderState();
    return {
      folders: Array.isArray(p.folders) ? p.folders : [],
      assignments:
        p.assignments && typeof p.assignments === "object"
          ? p.assignments
          : {},
      globalOrder: Array.isArray(p.globalOrder) ? p.globalOrder : [],
      folderOrders:
        p.folderOrders && typeof p.folderOrders === "object"
          ? p.folderOrders
          : {},
    };
  } catch {
    return createEmptyFolderState();
  }
}

export async function saveFolderState(state) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function sortIdsByPreferredOrder(ids, preferred, getCreatedTs) {
  const set = new Set(ids);
  const primary = preferred.filter((id) => set.has(id));
  const seen = new Set(primary);
  const rest = ids.filter((id) => !seen.has(id));
  rest.sort((a, b) => (getCreatedTs(b) || 0) - (getCreatedTs(a) || 0));
  return [...primary, ...rest];
}

export function getOrderedQrIds(items, viewId, state) {
  const ids = items.map((i) => String(i._id));
  const getTs = (id) => {
    const row = items.find((r) => String(r._id) === id);
    return row?.createdAt ? new Date(row.createdAt).getTime() : 0;
  };

  if (viewId === "all") {
    return sortIdsByPreferredOrder(ids, state.globalOrder, getTs);
  }

  if (viewId === UNFILED_ORDER_KEY) {
    const sub = ids.filter((id) => !state.assignments[id]);
    const pref = state.folderOrders[UNFILED_ORDER_KEY] || [];
    return sortIdsByPreferredOrder(sub, pref, getTs);
  }

  const sub = ids.filter((id) => state.assignments[id] === viewId);
  const pref = state.folderOrders[viewId] || [];
  return sortIdsByPreferredOrder(sub, pref, getTs);
}

export function syncFolderStateWithItems(items, state) {
  const ids = items.map((i) => String(i._id));
  const idSet = new Set(ids);

  const globalOrder = [...state.globalOrder].filter((id) => idSet.has(id));
  for (const id of ids) {
    if (!globalOrder.includes(id)) globalOrder.push(id);
  }

  const assignments = { ...state.assignments };
  for (const k of Object.keys(assignments)) {
    if (!idSet.has(k)) delete assignments[k];
  }

  const folderOrders = { ...state.folderOrders };
  for (const key of Object.keys(folderOrders)) {
    folderOrders[key] = (folderOrders[key] || []).filter((id) =>
      idSet.has(id),
    );
  }

  const folders = state.folders.filter((f) => f && f.id);

  return { ...state, folders, assignments, globalOrder, folderOrders };
}

function ensureInOrderList(list, id) {
  const next = [...list];
  if (!next.includes(id)) next.push(id);
  return next;
}

function removeIdFromAllFolderOrders(folderOrders, id) {
  const out = { ...folderOrders };
  for (const key of Object.keys(out)) {
    out[key] = (out[key] || []).filter((x) => x !== id);
  }
  return out;
}

export function assignQrToFolder(state, qrId, folderIdOrNull) {
  const id = String(qrId);
  const assignments = { ...state.assignments };
  let folderOrders = removeIdFromAllFolderOrders(state.folderOrders, id);

  if (!folderIdOrNull) {
    delete assignments[id];
    const un = [...(folderOrders[UNFILED_ORDER_KEY] || [])];
    if (!un.includes(id)) un.push(id);
    folderOrders = { ...folderOrders, [UNFILED_ORDER_KEY]: un };
  } else {
    const fid = String(folderIdOrNull);
    assignments[id] = fid;
    const fo = ensureInOrderList(folderOrders[fid] || [], id);
    folderOrders = { ...folderOrders, [fid]: fo };
  }

  const globalOrder = ensureInOrderList([...state.globalOrder], id);
  return { ...state, assignments, folderOrders, globalOrder };
}

export function pruneQrFromFolderState(state, qrId) {
  const id = String(qrId);
  const assignments = { ...state.assignments };
  delete assignments[id];
  const folderOrders = removeIdFromAllFolderOrders(state.folderOrders, id);
  const globalOrder = state.globalOrder.filter((x) => x !== id);
  return { ...state, assignments, folderOrders, globalOrder };
}

export function createFolder(state, name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return state;
  const id = `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const folders = [...state.folders, { id, name: trimmed }];
  const folderOrders = { ...state.folderOrders, [id]: [] };
  return { ...state, folders, folderOrders };
}

export function deleteFolder(state, folderId) {
  const fid = String(folderId);
  const assignments = { ...state.assignments };
  const folderOrders = { ...state.folderOrders };
  const prevOrder = folderOrders[fid] || [];
  const affectedIds = Object.keys(assignments).filter(
    (qid) => assignments[qid] === fid,
  );
  const unfiledList = [...(folderOrders[UNFILED_ORDER_KEY] || [])];
  const unSet = new Set(unfiledList);

  for (const qid of affectedIds) {
    delete assignments[qid];
  }
  const addToUnfiled = (qid) => {
    if (!unSet.has(qid)) {
      unfiledList.push(qid);
      unSet.add(qid);
    }
  };
  for (const qid of prevOrder) {
    if (affectedIds.includes(qid)) addToUnfiled(qid);
  }
  for (const qid of affectedIds) {
    addToUnfiled(qid);
  }

  delete folderOrders[fid];
  folderOrders[UNFILED_ORDER_KEY] = unfiledList;

  const folders = state.folders.filter((f) => f.id !== fid);
  return { ...state, folders, assignments, folderOrders };
}

export function isFolderStateMeaningful(state) {
  if (!state || typeof state !== "object") return false;
  if (Array.isArray(state.folders) && state.folders.length > 0) return true;
  if (
    state.assignments &&
    typeof state.assignments === "object" &&
    Object.keys(state.assignments).length > 0
  ) {
    return true;
  }
  if (Array.isArray(state.globalOrder) && state.globalOrder.length > 0) {
    return true;
  }
  const fo = state.folderOrders;
  if (fo && typeof fo === "object") {
    return Object.keys(fo).some(
      (k) => Array.isArray(fo[k]) && fo[k].length > 0,
    );
  }
  return false;
}

export function folderCounts(items, state) {
  const ids = items.map((i) => String(i._id));
  let unfiled = 0;
  const perFolder = {};
  for (const id of ids) {
    const f = state.assignments[id];
    if (!f) unfiled += 1;
    else perFolder[f] = (perFolder[f] || 0) + 1;
  }
  return { all: ids.length, unfiled, perFolder };
}
