import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPlus, FiSearch } from "react-icons/fi";
import { API_BASE } from "../config";
import { BRAND_NAME } from "../constants/brand";
import SavedQrCard from "../components/SavedQrCard";
import DashboardAccountPanel from "../components/DashboardAccountPanel";
import DashboardSidebar from "../components/DashboardSidebar";
import {
  UNFILED_ORDER_KEY,
  assignQrToFolder,
  createFolder,
  deleteFolder,
  folderCounts,
  getOrderedQrIds,
  isFolderStateMeaningful,
  loadFolderState,
  pruneQrFromFolderState,
  saveFolderState,
  syncFolderStateWithItems,
} from "../utils/dashboardFoldersStorage";
import {
  fetchDashboardFoldersState,
  putDashboardFoldersState,
} from "../utils/dashboardFoldersApi";

function DashboardPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const noticeTimerRef = useRef(null);
  const remoteFolderTimerRef = useRef(null);
  const pendingFolderStateRef = useRef(null);

  const persistFolderState = useCallback((next) => {
    saveFolderState(next);
    pendingFolderStateRef.current = next;
    if (remoteFolderTimerRef.current) {
      window.clearTimeout(remoteFolderTimerRef.current);
    }
    remoteFolderTimerRef.current = window.setTimeout(() => {
      remoteFolderTimerRef.current = null;
      const payload = pendingFolderStateRef.current;
      pendingFolderStateRef.current = null;
      if (payload) {
        void putDashboardFoldersState(payload).catch(() => {});
      }
    }, 550);
  }, []);

  useEffect(
    () => () => {
      if (remoteFolderTimerRef.current) {
        window.clearTimeout(remoteFolderTimerRef.current);
        remoteFolderTimerRef.current = null;
      }
      const payload = pendingFolderStateRef.current;
      pendingFolderStateRef.current = null;
      if (payload) {
        void putDashboardFoldersState(payload).catch(() => {});
      }
    },
    [],
  );
  const [folderState, setFolderState] = useState(() => loadFolderState());
  /** מסנכרן מחדש אחרי טעינת תיקיות מהשרת */
  const [folderSyncEpoch, setFolderSyncEpoch] = useState(0);
  const [selectedViewId, setSelectedViewId] = useState("all");
  /** סינון רשימה: הכל | פעילים | לא פעילים */
  const [activityFilter, setActivityFilter] = useState("all");
  /** true = מסך עדכון פרטים במקום רשימת הקודים */
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const [nameSearch, setNameSearch] = useState("");
  const [debouncedNameSearch, setDebouncedNameSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedNameSearch(nameSearch.trim()), 350);
    return () => clearTimeout(t);
  }, [nameSearch]);

  const showNotice = useCallback((message) => {
    setNotice(message);
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimerRef.current = null;
    }, 4500);
  }, []);

  const fetchSavedQrList = useCallback(async () => {
    const qs = new URLSearchParams();
    qs.set("limit", "50");
    if (debouncedNameSearch) {
      qs.set("q", debouncedNameSearch);
    }
    const res = await fetch(`${API_BASE}/api/saved-qrs?${qs.toString()}`, {
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || "טעינה נכשלה");
    }
    return Array.isArray(data.items) ? data.items : [];
  }, [debouncedNameSearch]);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchSavedQrList();
      setItems(list);
    } catch (e) {
      setError(e.message || "טעינה נכשלה");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [fetchSavedQrList]);

  const refreshListQuiet = useCallback(async () => {
    try {
      const list = await fetchSavedQrList();
      setItems(list);
    } catch {
      /* ignore — רק רענון שקט אחרי סריקה / מודל */
    }
  }, [fetchSavedQrList]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    const onSaved = () => {
      void refreshListQuiet();
    };
    window.addEventListener("qr-saved-updated", onSaved);
    return () => window.removeEventListener("qr-saved-updated", onSaved);
  }, [refreshListQuiet]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const remote = await fetchDashboardFoldersState();
      if (cancelled) return;
      if (!remote.ok) {
        if (!remote.unauthorized && remote.error) {
          showNotice(remote.error);
        }
        setFolderSyncEpoch((e) => e + 1);
        return;
      }
      const serverState = remote.state;
      const localState = loadFolderState();
      if (isFolderStateMeaningful(serverState)) {
        setFolderState(serverState);
        saveFolderState(serverState);
      } else if (isFolderStateMeaningful(localState)) {
        setFolderState(localState);
        saveFolderState(localState);
        const put = await putDashboardFoldersState(localState);
        if (!put.ok && put.error) {
          showNotice(put.error);
        }
      }
      setFolderSyncEpoch((e) => e + 1);
    })();
    return () => {
      cancelled = true;
    };
  }, [showNotice]);

  useEffect(() => {
    if (loading) return;
    setFolderState((prev) => {
      const synced = syncFolderStateWithItems(items, prev);
      persistFolderState(synced);
      return synced;
    });
  }, [items, loading, folderSyncEpoch, persistFolderState]);

  const filteredItems = useMemo(() => {
    if (activityFilter === "all") return items;
    return items.filter((r) => {
      const active = r.isActive !== false;
      return activityFilter === "active" ? active : !active;
    });
  }, [items, activityFilter]);

  const counts = useMemo(
    () => folderCounts(filteredItems, folderState),
    [filteredItems, folderState],
  );

  const displayItems = useMemo(() => {
    const ids = getOrderedQrIds(
      filteredItems,
      selectedViewId,
      folderState,
    );
    const byId = Object.fromEntries(
      filteredItems.map((r) => [String(r._id), r]),
    );
    return ids.map((id) => byId[id]).filter(Boolean);
  }, [filteredItems, selectedViewId, folderState]);

  const openInEditor = useCallback(
    (row) => {
      navigate("/create", {
        state: {
          loadSavedQr: {
            qrType: row.qrType,
            qrValue: row.qrValue || "",
            qrInputs: row.qrInputs || {},
            style: row.style || {},
            linkMode: row.linkMode,
            publicSlug: row.publicSlug,
            dynamicTargetUrl: row.dynamicTargetUrl,
            redirectPaused: row.redirectPaused,
            scanCount: row.scanCount,
          },
        },
      });
    },
    [navigate],
  );

  const handleSavedQrFromApi = useCallback((saved) => {
    if (!saved?._id) return;
    setItems((prev) =>
      prev.map((r) =>
        String(r._id) === String(saved._id) ? { ...r, ...saved } : r,
      ),
    );
  }, []);

  const handleAssignFolder = useCallback(
    (qrId, folderIdOrNull) => {
      setFolderState((prev) => {
        const next = assignQrToFolder(prev, qrId, folderIdOrNull);
        persistFolderState(next);
        return next;
      });
    },
    [persistFolderState],
  );

  const handleDelete = useCallback(
    (id) => {
      setItems((prev) => prev.filter((r) => r._id !== id));
      setFolderState((prev) => {
        const next = pruneQrFromFolderState(prev, id);
        persistFolderState(next);
        return next;
      });
    },
    [persistFolderState],
  );

  const handleCreateFolderWithName = useCallback(
    (name) => {
      const trimmed = String(name || "").trim();
      if (!trimmed) {
        showNotice("שם התיקייה לא יכול להיות ריק.");
        return false;
      }
      setFolderState((prev) => {
        const next = createFolder(prev, trimmed);
        persistFolderState(next);
        return next;
      });
    },
    [showNotice, persistFolderState],
  );

  const handleDeleteFolder = useCallback(
    (folderId, folderName) => {
      if (
        !window.confirm(
          `למחוק את התיקייה "${folderName}"? הקודים שבה יעברו ל«ללא תיקייה».`,
        )
      ) {
        return;
      }
      setFolderState((prev) => {
        const next = deleteFolder(prev, folderId);
        persistFolderState(next);
        return next;
      });
      setSelectedViewId((v) => (v === folderId ? "all" : v));
    },
    [persistFolderState],
  );

  const handleDuplicateStub = useCallback(() => {
    showNotice("שכפול קוד לרשומה חדשה — אחרי הרחבת ה-API והמודל ב-MongoDB.");
  }, [showNotice]);

  const folderNameForRow = useCallback(
    (row) => {
      const fid = folderState.assignments[String(row._id)];
      if (!fid) return "ללא תיקייה";
      const f = folderState.folders.find((x) => x.id === fid);
      return f?.name || "תיקייה";
    },
    [folderState.assignments, folderState.folders],
  );

  const listSection = loading ? (
    <div className="dashboard-loading text-center text-muted py-5">
      טוען את הרשימה…
    </div>
  ) : items.length === 0 ? (
    <div className="card shadow-sm border-0 dashboard-empty-card">
      <div className="card-body text-center py-5 px-4">
        {debouncedNameSearch ? (
          <>
            <h2 className="h5 fw-bold mb-2">לא נמצאו קודים בשם הזה</h2>
            <p className="text-muted mb-4">
              נסו מילה אחרת או נקו את החיפוש כדי לראות את כל הקודים.
            </p>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setNameSearch("")}
            >
              נקה חיפוש
            </button>
          </>
        ) : (
          <>
            <h2 className="h5 fw-bold mb-2">עדיין אין קודים שמורים</h2>
            <p className="text-muted mb-4">
              כשתשמור קוד מ{BRAND_NAME}, הוא יופיע כאן. תוכל לחזור אליו לעריכה בכל עת.
            </p>
            <Link to="/create" className="btn btn-teal">
              <FiPlus className="me-2" aria-hidden />
              ליצירת QR ראשון
            </Link>
          </>
        )}
      </div>
    </div>
  ) : filteredItems.length === 0 ? (
    <div className="card shadow-sm border-0 dashboard-empty-card">
      <div className="card-body text-center py-5 px-4">
        <h2 className="h5 fw-bold mb-2">אין קודים בסינון הזה</h2>
        <p className="text-muted mb-4">
          {activityFilter === "active"
            ? "אין כרגע קודים מסומנים כפעילים."
            : "אין כרגע קודים מסומנים כלא פעילים."}
        </p>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm me-2"
          onClick={() => setActivityFilter("all")}
        >
          הצג הכל
        </button>
      </div>
    </div>
  ) : displayItems.length === 0 ? (
    <div className="card shadow-sm border-0 dashboard-empty-card">
      <div className="card-body text-center py-5 px-4">
        <p className="text-muted mb-3">אין קודים בתצוגה הזו.</p>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setSelectedViewId("all")}
        >
          חזרה להכל
        </button>
      </div>
    </div>
  ) : (
    <ul className="list-unstyled dashboard-list mb-0">
      {displayItems.map((row) => (
        <li key={row._id}>
          <SavedQrCard
            row={row}
            onOpenEditor={openInEditor}
            onDuplicateStub={handleDuplicateStub}
            onDelete={handleDelete}
            onStubNotice={showNotice}
            onSavedQrFromApi={handleSavedQrFromApi}
            onListRefresh={refreshListQuiet}
            folderDisplayName={folderNameForRow(row)}
            foldersForSelect={folderState.folders}
            assignedFolderId={folderState.assignments[String(row._id)] ?? null}
            onAssignFolder={handleAssignFolder}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className="dashboard-page dashboard-page--scroll-split py-4 py-md-5"
      dir="rtl"
    >
      <div className="container-fluid dashboard-layout px-3 px-md-4">
        <header className="dashboard-toolbar-strip mb-3 mb-md-4">
          <div className="dashboard-toolbar-hero">
            <div className="dashboard-toolbar-col dashboard-toolbar-col--title">
              <h1 className="dashboard-title mb-1">קודים שמורים</h1>
              <p className="dashboard-subtitle mb-0 mb-lg-0">
                קודים שמורים — חיפוש, שמירה ועריכה.
              </p>
            </div>
            <div className="dashboard-toolbar-col dashboard-toolbar-col--search">
              <label
                className="visually-hidden"
                htmlFor="dashboard-saved-qr-search"
              >
                חיפוש לפי שם הקוד
              </label>
              <div className="dashboard-search-shell">
                <FiSearch className="dashboard-search-icon" aria-hidden />
                <input
                  id="dashboard-saved-qr-search"
                  type="search"
                  className="form-control dashboard-search-input"
                  placeholder="חיפוש לפי שם הקוד…"
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  autoComplete="off"
                  aria-label="חיפוש לפי שם הקוד"
                  disabled={accountSettingsOpen}
                />
              </div>
            </div>
            <div className="dashboard-toolbar-col dashboard-toolbar-col--action">
              <Link
                to="/create"
                className="dashboard-create-layered text-decoration-none d-inline-flex align-items-center gap-2"
              >
                <FiPlus className="flex-shrink-0" aria-hidden />
                יצירת QR חדש
              </Link>
            </div>
          </div>
        </header>

        {notice && (
          <div
            className="alert alert-info py-2 px-3 mb-3"
            role="status"
            dir="rtl"
          >
            {notice}
          </div>
        )}

        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            {error}
          </div>
        )}

        <div className="row g-4 g-lg-5 justify-content-center dashboard-body-row">
          <div className="col-12 col-sm-10 col-md-8 col-lg-4 col-xl-3 dashboard-sidebar-col">
            <DashboardSidebar
              folders={folderState.folders}
              selectedViewId={selectedViewId}
              onSelectView={(id) => {
                setAccountSettingsOpen(false);
                setSelectedViewId(id);
              }}
              counts={counts}
              onCreateFolderWithName={handleCreateFolderWithName}
              onDeleteFolder={handleDeleteFolder}
              onOpenAccountSettings={() => setAccountSettingsOpen(true)}
              accountSettingsActive={accountSettingsOpen}
              activityFilter={activityFilter}
              onActivityFilterChange={(id) => {
                setAccountSettingsOpen(false);
                setActivityFilter(id);
              }}
            />
          </div>
          <div className="col-12 col-lg col-xl-9 col-xxl-8 dashboard-main-col">
            {accountSettingsOpen ? (
              <DashboardAccountPanel
                onClose={() => setAccountSettingsOpen(false)}
              />
            ) : (
              listSection
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
