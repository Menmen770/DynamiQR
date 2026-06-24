import {
  apiFetchWithTimeout,
  getApiBaseUrl,
  parseJsonResponse,
} from "./api";
import { createEmptyFolderState } from "./dashboardFoldersStorageMobile";

function normalizeFolderState(data) {
  const empty = createEmptyFolderState();
  if (!data || typeof data !== "object") return empty;
  const folders = Array.isArray(data.folders)
    ? data.folders.filter(
        (f) =>
          f &&
          typeof f === "object" &&
          typeof f.id === "string" &&
          typeof f.name === "string",
      )
    : [];
  const assignments =
    data.assignments && typeof data.assignments === "object"
      ? { ...data.assignments }
      : {};
  const globalOrder = Array.isArray(data.globalOrder)
    ? data.globalOrder.map(String)
    : [];
  const folderOrders =
    data.folderOrders && typeof data.folderOrders === "object"
      ? { ...data.folderOrders }
      : {};
  return { ...empty, folders, assignments, globalOrder, folderOrders };
}

export async function fetchDashboardFoldersState() {
  try {
    const response = await apiFetchWithTimeout(
      `${getApiBaseUrl()}/api/dashboard/folders`,
      { method: "GET" },
      20000,
    );
    if (response.status === 401) {
      return { ok: false, unauthorized: true };
    }
    const data = await parseJsonResponse(response);
    if (!response.ok) {
      return {
        ok: false,
        error: typeof data?.error === "string" ? data.error : "טעינה נכשלה",
      };
    }
    return { ok: true, state: normalizeFolderState(data) };
  } catch {
    return { ok: false, error: "רשת או שרת לא זמינים" };
  }
}

export async function putDashboardFoldersState(state) {
  try {
    const response = await apiFetchWithTimeout(
      `${getApiBaseUrl()}/api/dashboard/folders`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      },
      20000,
    );
    const data = await parseJsonResponse(response);
    if (!response.ok) {
      return {
        ok: false,
        error: typeof data?.error === "string" ? data.error : "שמירה נכשלה",
      };
    }
    return { ok: true, state: normalizeFolderState(data) };
  } catch {
    return { ok: false, error: "רשת או שרת לא זמינים" };
  }
}
