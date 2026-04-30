import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiClock,
  FiCopy,
  FiCornerUpLeft,
  FiDownload,
  FiEdit2,
  FiExternalLink,
  FiFolder,
  FiLink,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { API_BASE } from "../config";
import { QR_TYPES_MAIN, QR_TYPES_MORE } from "../utils/qrConstants";
import { effectiveSavedQrEncodedText, buildEncodedQrText } from "../utils/qrEncodedText";
import {
  downloadDataUrlPng,
  getSavedQrPreviewDataUrl,
} from "../utils/savedQrPreview";
import SimpleTextModal from "./SimpleTextModal";
import SavedQrStyleEditModal from "./SavedQrStyleEditModal";
import DynamicQrManageModal from "./DynamicQrManageModal";

const QR_TYPE_LABELS = new Map(
  [...QR_TYPES_MAIN, ...QR_TYPES_MORE].map((t) => [t.value, t.label]),
);

function formatSavedDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function ellipsis96(s) {
  const t = String(s || "").trim();
  if (!t) return "";
  return t.length > 96 ? `${t.slice(0, 96)}…` : t;
}

function destinationSummary(row) {
  if (row?.linkMode === "dynamic") {
    const d = String(row?.dynamicTargetUrl || "").trim();
    if (d) return ellipsis96(d);
    const built = String(
      buildEncodedQrText(row?.qrType, row?.qrInputs) || "",
    ).trim();
    if (built) return ellipsis96(built);
  }
  const v = String(row?.qrValue || "").trim();
  if (v) return ellipsis96(v);
  const inputs = row?.qrInputs;
  if (inputs && typeof inputs === "object") {
    const url = inputs.url || inputs.link;
    if (typeof url === "string" && url.trim()) {
      return ellipsis96(url.trim());
    }
  }
  return "—";
}

function cardTitle(row) {
  const dn = String(row?.displayName || "").trim();
  if (dn) return dn.length > 48 ? `${dn.slice(0, 48)}…` : dn;
  const d = destinationSummary(row);
  if (d && d !== "—") return d.length > 48 ? `${d.slice(0, 48)}…` : d;
  return QR_TYPE_LABELS.get(row.qrType) || row.qrType || "קוד QR";
}

function percentOf(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function countryCodeToFlag(codeRaw) {
  const code = String(codeRaw || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(code) || code === "UN") return "🌍";
  return String.fromCodePoint(
    code.charCodeAt(0) + 127397,
    code.charCodeAt(1) + 127397,
  );
}

function pieStyleFromBreakdown(items) {
  const total = items.reduce((s, it) => s + (it.count || 0), 0);
  if (!total) {
    return { background: "conic-gradient(#e2e8f0 0 100%)" };
  }
  let cursor = 0;
  const segments = items
    .filter((it) => it.count > 0)
    .map((it) => {
      const span = (it.count / total) * 360;
      const start = cursor;
      const end = cursor + span;
      cursor = end;
      return `${it.color} ${start}deg ${end}deg`;
    });
  return { background: `conic-gradient(${segments.join(", ")})` };
}

export default function SavedQrCard({
  row,
  onOpenEditor,
  onDuplicateStub,
  onDelete,
  onStubNotice,
  onSavedQrFromApi,
  onListRefresh,
  folderDisplayName,
  foldersForSelect,
  assignedFolderId,
  onAssignFolder,
}) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const moveWrapRef = useRef(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameBusy, setRenameBusy] = useState(false);
  const [styleEditOpen, setStyleEditOpen] = useState(false);
  const [activeBusy, setActiveBusy] = useState(false);
  const [dynamicModalOpen, setDynamicModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [statsData, setStatsData] = useState(null);
  const [qrZoomOpen, setQrZoomOpen] = useState(false);

  const encodedInQr = useMemo(
    () => String(effectiveSavedQrEncodedText(row, API_BASE) || "").trim(),
    [row],
  );

  useEffect(() => {
    if (!moveOpen) return;
    const close = (e) => {
      if (!moveWrapRef.current?.contains(e.target)) setMoveOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [moveOpen]);

  useEffect(() => {
    setMoveOpen(false);
    setStatsModalOpen(false);
    setStatsData(null);
    setStatsError("");
    setStatsLoading(false);
    setQrZoomOpen(false);
  }, [row._id]);

  useEffect(() => {
    if (!qrZoomOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setQrZoomOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [qrZoomOpen]);

  useEffect(() => {
    if (!statsModalOpen || row.linkMode !== "dynamic") return;
    let cancelled = false;
    const loadStats = async () => {
      setStatsLoading(true);
      setStatsError("");
      try {
        const res = await fetch(`${API_BASE}/api/saved-qrs/${row._id}/stats`, {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || "טעינת סטטיסטיקות נכשלה");
        }
        if (!cancelled) setStatsData(data || null);
      } catch (err) {
        if (!cancelled) {
          setStatsError(err.message || "טעינת סטטיסטיקות נכשלה");
          setStatsData(null);
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    };
    void loadStats();
    return () => {
      cancelled = true;
    };
  }, [statsModalOpen, row._id, row.linkMode]);

  useEffect(() => {
    if (dynamicModalOpen && typeof onListRefresh === "function") {
      void onListRefresh();
    }
  }, [dynamicModalOpen, onListRefresh]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setPreviewLoading(true);
      setPreviewUrl("");
      try {
        const url = await getSavedQrPreviewDataUrl(row, API_BASE);
        if (!cancelled) setPreviewUrl(url || "");
      } catch {
        if (!cancelled) setPreviewUrl("");
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [row]);

  const handleDownload = useCallback(() => {
    if (!previewUrl) return;
    const safeName = String(row._id || "qr").replace(/[^\w-]/g, "");
    downloadDataUrlPng(previewUrl, `qr-${safeName}.png`);
  }, [previewUrl, row._id]);

  const handleDelete = useCallback(async () => {
    if (
      !window.confirm(
        "למחוק את הקוד השמור? לא ניתן לשחזר את העיצוב מהשרת.",
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/saved-qrs/${row._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "מחיקה נכשלה");
      }
      onDelete(row._id);
      window.dispatchEvent(new Event("qr-saved-updated"));
    } catch (e) {
      onStubNotice(e.message || "מחיקה נכשלה");
    } finally {
      setDeleting(false);
    }
  }, [row._id, onDelete, onStubNotice]);

  const openEditor = () => onOpenEditor(row);

  const handleOpenDestination = useCallback(() => {
    if (row?.linkMode === "dynamic") {
      const dest = String(row.dynamicTargetUrl || "").trim();
      if (/^https?:\/\//i.test(dest)) {
        window.open(dest, "_blank", "noopener,noreferrer");
        return;
      }
      if (/^(mailto:|tel:|sms:)/i.test(dest)) {
        window.location.href = dest;
        return;
      }
    }
    const t = effectiveSavedQrEncodedText(row, API_BASE);
    if (/^https?:\/\//i.test(t)) {
      window.open(t, "_blank", "noopener,noreferrer");
      return;
    }
    if (/^(mailto:|tel:|sms:)/i.test(t)) {
      window.location.href = t;
      return;
    }
    onOpenEditor(row);
  }, [row, onOpenEditor]);

  const handleEditDestination = useCallback(() => {
    if (row?.linkMode !== "dynamic") return;
    setDynamicModalOpen(true);
  }, [row?.linkMode]);

  const handleRenameConfirm = useCallback(
    async (name) => {
      const trimmed = String(name || "").trim();
      if (!trimmed) {
        onStubNotice("נא להזין שם.");
        return false;
      }
      setRenameBusy(true);
      try {
        const res = await fetch(`${API_BASE}/api/saved-qrs/${row._id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName: trimmed }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || "עדכון השם נכשל");
        }
        const saved = data?.saved;
        if (saved) {
          onSavedQrFromApi(saved);
        }
        window.dispatchEvent(new Event("qr-saved-updated"));
        return true;
      } catch (e) {
        onStubNotice(e.message || "עדכון השם נכשל");
        return false;
      } finally {
        setRenameBusy(false);
      }
    },
    [row._id, onSavedQrFromApi, onStubNotice],
  );

  const typeLabel = QR_TYPE_LABELS.get(row.qrType) || row.qrType;
  const currentFolderId =
    assignedFolderId == null || assignedFolderId === ""
      ? null
      : String(assignedFolderId);

  const pickFolder = (folderIdOrNull) => {
    onAssignFolder(row._id, folderIdOrNull);
    setMoveOpen(false);
  };

  const renameDefault = String(row?.displayName || "").trim();
  const isActive = row.isActive !== false;
  const totalScans = Number(statsData?.totalScans || 0);
  const osItems = [
    {
      key: "ios",
      label: "iPhone (iOS)",
      count: Number(
        statsData?.osBreakdown?.find((x) => x.key === "ios")?.count || 0,
      ),
      color: "#06b6d4",
    },
    {
      key: "android",
      label: "Android",
      count: Number(
        statsData?.osBreakdown?.find((x) => x.key === "android")?.count || 0,
      ),
      color: "#22c55e",
    },
    {
      key: "other",
      label: "אחר",
      count: Number(
        statsData?.osBreakdown?.find((x) => x.key === "other")?.count || 0,
      ),
      color: "#94a3b8",
    },
  ];
  const countryItems = (statsData?.countryBreakdown || []).map((x, idx) => ({
    ...x,
    color: ["#0ea5e9", "#22c55e", "#eab308", "#f97316", "#a855f7", "#ef4444"][
      idx % 6
    ],
  }));
  const dailySeries = Array.isArray(statsData?.dailySeries)
    ? statsData.dailySeries
    : [];
  const maxDaily = Math.max(1, ...dailySeries.map((d) => Number(d.count || 0)));

  const handleActiveChange = useCallback(
    async (e) => {
      const next = e.target.checked;
      setActiveBusy(true);
      try {
        const res = await fetch(`${API_BASE}/api/saved-qrs/${row._id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: next }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || "עדכון מצב פעיל נכשל");
        }
        if (data?.saved) {
          onSavedQrFromApi(data.saved);
        }
        window.dispatchEvent(new Event("qr-saved-updated"));
      } catch (err) {
        onStubNotice(err.message || "עדכון נכשל");
      } finally {
        setActiveBusy(false);
      }
    },
    [row._id, onSavedQrFromApi, onStubNotice],
  );

  return (
    <article className="card shadow-sm border-0 dashboard-qr-card mb-3">
      <SavedQrStyleEditModal
        open={styleEditOpen}
        onClose={() => setStyleEditOpen(false)}
        row={row}
        onSaved={onSavedQrFromApi}
        onError={onStubNotice}
      />

      <DynamicQrManageModal
        open={dynamicModalOpen}
        onClose={() => setDynamicModalOpen(false)}
        row={row}
        onSaved={onSavedQrFromApi}
        onError={onStubNotice}
      />
      {row.linkMode === "dynamic" && statsModalOpen ? (
        <div
          className="modal fade show d-block saved-qr-style-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`saved-qr-stats-modal-title-${row._id}`}
          dir="rtl"
          onClick={() => setStatsModalOpen(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0">
                <h2
                  className="modal-title h5 fw-bold"
                  id={`saved-qr-stats-modal-title-${row._id}`}
                >
                  סטטיסטיקות לקוד
                </h2>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="סגירה"
                  onClick={() => setStatsModalOpen(false)}
                />
              </div>
              <div className="modal-body pt-0">
                {statsLoading ? (
                  <div className="text-center py-4">
                    <span className="spinner-border spinner-border-sm text-secondary" role="status" />
                  </div>
                ) : statsError ? (
                  <p className="small text-danger mb-0">{statsError}</p>
                ) : (
                  <>
                    <div className="dashboard-qr-stats-counter mb-3">
                      <span>פתחו את הקוד</span>
                      <strong>{totalScans}</strong>
                      <span>פעמים</span>
                    </div>

                    <div className="dashboard-qr-stats-grid">
                      <div className="dashboard-qr-stat-item dashboard-qr-stat-item--pie">
                        <span className="dashboard-qr-stat-label mb-2">iOS / Android</span>
                        <div className="dashboard-qr-pie-wrap">
                          <div
                            className="dashboard-qr-pie"
                            style={pieStyleFromBreakdown(osItems)}
                          />
                          <div className="dashboard-qr-pie-legend">
                            {osItems.map((it) => (
                              <div key={it.key} className="dashboard-qr-legend-row">
                                <span
                                  className="dashboard-qr-legend-dot"
                                  style={{ background: it.color }}
                                />
                                <span>{it.label}</span>
                                <strong>{percentOf(it.count, totalScans)}%</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="dashboard-qr-stat-item dashboard-qr-stat-item--pie">
                        <span className="dashboard-qr-stat-label mb-2">מדינות מובילות</span>
                        <div className="dashboard-qr-pie-wrap">
                          <div
                            className="dashboard-qr-pie"
                            style={pieStyleFromBreakdown(countryItems)}
                          />
                          <div className="dashboard-qr-pie-legend">
                            {countryItems.length ? (
                              countryItems.map((it) => (
                                <div key={it.code} className="dashboard-qr-legend-row">
                                  <span
                                    className="dashboard-qr-legend-dot"
                                    style={{ background: it.color }}
                                  />
                                  <span>{countryCodeToFlag(it.code)} {it.label}</span>
                                  <strong>{percentOf(it.count, totalScans)}%</strong>
                                </div>
                              ))
                            ) : (
                              <span className="small text-muted">עדיין אין נתוני מדינה</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-qr-stat-item mt-3">
                      <span className="dashboard-qr-stat-label mb-2">צפיות יומיות (30 יום)</span>
                      <div className="dashboard-qr-bars">
                        {dailySeries.map((d) => (
                          <div key={d.date} className="dashboard-qr-bar-col">
                            <div
                              className="dashboard-qr-bar"
                              style={{ height: `${Math.max(6, (Number(d.count || 0) / maxDaily) * 64)}px` }}
                              title={`${d.date}: ${d.count}`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="small text-muted mt-2">
                        30 הימים האחרונים
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setStatsModalOpen(false)}
                >
                  סגירה
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <SimpleTextModal
        open={renameOpen}
        onClose={() => !renameBusy && setRenameOpen(false)}
        title="שינוי שם הקוד"
        description="השם מופיע בדף «הקודים שלי» ובחיפוש."
        label="שם לקוד"
        placeholder="למשל: קמפיין אביב"
        confirmLabel="שמור שם"
        busy={renameBusy}
        defaultValue={renameDefault}
        maxLength={120}
        minLength={1}
        onConfirm={handleRenameConfirm}
      />

      {qrZoomOpen && previewUrl ? (
        <div
          className="modal fade show d-block saved-qr-style-modal-backdrop dashboard-qr-zoom-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`dashboard-qr-zoom-title-${row._id}`}
          dir="rtl"
          onClick={() => setQrZoomOpen(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered dashboard-qr-zoom-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 py-2 px-3 align-items-center">
                <h5
                  className="modal-title fs-6 mb-0 text-truncate pe-2"
                  id={`dashboard-qr-zoom-title-${row._id}`}
                >
                  {cardTitle(row)}
                </h5>
                <button
                  type="button"
                  className="btn btn-link text-secondary p-1 ms-auto flex-shrink-0"
                  aria-label="סגור"
                  onClick={() => setQrZoomOpen(false)}
                >
                  <FiX size={22} aria-hidden />
                </button>
              </div>
              <div className="modal-body text-center pt-0 pb-4 px-3">
                <img
                  src={previewUrl}
                  alt=""
                  className="dashboard-qr-zoom-img"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className="card-body dashboard-qr-card-body d-flex flex-column flex-lg-row gap-3 gap-lg-4 align-items-lg-stretch"
        dir="rtl"
      >
        <div className="dashboard-qr-col-preview d-flex flex-column align-items-center gap-2 flex-shrink-0">
          {previewLoading ? (
            <div className="dashboard-qr-thumb d-flex align-items-center justify-content-center bg-light rounded-3 overflow-hidden">
              <span
                className="spinner-border spinner-border-sm text-secondary"
                role="status"
              />
            </div>
          ) : previewUrl ? (
            <button
              type="button"
              className="dashboard-qr-thumb dashboard-qr-thumb--zoom d-flex align-items-center justify-content-center bg-light rounded-3 overflow-hidden"
              onClick={() => setQrZoomOpen(true)}
              aria-label={`הגדלת QR — ${cardTitle(row)}`}
            >
              <img
                src={previewUrl}
                alt=""
                className="dashboard-qr-thumb-img"
              />
            </button>
          ) : (
            <div className="dashboard-qr-thumb d-flex align-items-center justify-content-center bg-light rounded-3 overflow-hidden">
              <span className="small text-muted px-2 text-center">
                אין תצוגה מקדימה
              </span>
            </div>
          )}
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm dashboard-qr-download w-100"
            onClick={handleDownload}
            disabled={!previewUrl}
          >
            <FiDownload className="me-1" aria-hidden />
            הורדה
          </button>
          {row.linkMode === "dynamic" ? (
            <button
              type="button"
              className="btn btn-teal btn-sm dashboard-qr-download w-100"
              onClick={() => setStatsModalOpen(true)}
            >
              סטטיסטיקות
            </button>
          ) : null}
        </div>

        <div className="dashboard-qr-col-meta flex-grow-1 min-w-0" dir="rtl">
          <div className="dashboard-qr-meta-with-actions d-flex gap-2 w-100 align-items-start min-w-0">
            <div className="dashboard-qr-meta-text-col flex-grow-1 min-w-0 d-flex flex-column">
          <div className="d-flex align-items-center gap-2 text-muted small mb-1">
            <FiLink aria-hidden />
            <span>{typeLabel}</span>
          </div>
          <div className="dashboard-qr-title-group d-inline-flex align-items-center gap-2 flex-wrap mb-2">
            <h2 className="h6 fw-bold mb-0 dashboard-qr-card-title">
              {cardTitle(row)}
            </h2>
            <button
              type="button"
              className="btn btn-link btn-sm p-0 text-secondary dashboard-qr-title-edit-btn"
              title="שנה שם"
              aria-label="שנה שם"
              onClick={() => setRenameOpen(true)}
            >
              <FiEdit2 size={18} aria-hidden />
            </button>
          </div>
          <div className="small mb-1 d-flex align-items-start gap-1 flex-wrap">
            <FiLink className="flex-shrink-0 mt-1 text-muted" aria-hidden />
            {row.linkMode === "dynamic" ? (
              <>
                <span className="badge text-bg-secondary align-self-center">
                  דינמי
                </span>
                {row.redirectPaused ? (
                  <span className="badge bg-warning text-dark align-self-center">
                    הפניה מושהית
                  </span>
                ) : null}
                <span className="text-muted">
                  סריקות:{" "}
                  <strong className="text-body">
                    {typeof row.scanCount === "number" ? row.scanCount : 0}
                  </strong>
                </span>
              </>
            ) : (
              <span className="text-muted">סטטי — הכתובת מוטמעת ב־QR</span>
            )}
          </div>
          <div
            className="small mb-1 w-100 d-flex align-items-start gap-1 justify-content-start text-break"
            dir="rtl"
          >
            <FiCornerUpLeft className="flex-shrink-0 mt-1" aria-hidden />
            <div
              className="d-flex flex-nowrap align-items-start gap-1 min-w-0 mw-100"
              dir="ltr"
            >
              {row.linkMode === "dynamic" ? (
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 m-0 text-secondary flex-shrink-0 dashboard-qr-destination-edit-btn"
                  title="עריכת יעד הפניה"
                  aria-label="עריכת יעד הפניה"
                  onClick={handleEditDestination}
                >
                  <FiEdit2 size={16} aria-hidden />
                </button>
              ) : null}
              <span
                className="min-w-0 text-break"
                title={destinationSummary(row)}
              >
                {destinationSummary(row)}
              </span>
            </div>
          </div>
          <div className="small text-muted mb-2 d-flex align-items-center gap-1">
            <FiClock aria-hidden />
            {formatSavedDate(row.createdAt)}
          </div>

          {row.linkMode === "dynamic" && encodedInQr ? (
            <div
              className="w-100 d-flex justify-content-start mb-2"
              dir="rtl"
            >
              <p
                className="small text-muted mb-0 text-break font-monospace text-end d-inline-block max-w-100"
                dir="ltr"
                title={encodedInQr}
              >
                {encodedInQr}
              </p>
            </div>
          ) : null}

          {row.linkMode === "dynamic" ? (
            <div className="dashboard-qr-active-row d-flex align-items-center gap-2 flex-wrap mb-3">
              <span className="dashboard-qr-active-label">פעיל</span>
              <span dir="ltr" className="d-inline-flex align-items-center">
                <label className="dashboard-qr-toggle-mini mb-0">
                  <span className="visually-hidden">
                    הפעלה או השבתה של הקוד השמור
                  </span>
                  <input
                    type="checkbox"
                    className="dashboard-qr-toggle-mini-input"
                    checked={isActive}
                    disabled={activeBusy}
                    onChange={handleActiveChange}
                  />
                  <span
                    className="dashboard-qr-toggle-mini-track"
                    aria-hidden="true"
                  />
                </label>
              </span>
            </div>
          ) : null}

          <div
            className="dashboard-qr-folder-row position-relative mb-3 w-100"
            ref={moveWrapRef}
          >
            <div className="dashboard-qr-folder-trigger d-inline-flex align-items-center gap-2 flex-wrap">
              <FiFolder className="text-muted flex-shrink-0" aria-hidden />
              <span className="small text-muted">
                {folderDisplayName || "ללא תיקייה"}
              </span>
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-secondary dashboard-qr-folder-edit-btn"
                title="בחירת תיקייה"
                aria-label="בחירת תיקייה"
                aria-expanded={moveOpen}
                onClick={() => setMoveOpen((o) => !o)}
              >
                <FiEdit2 size={16} aria-hidden />
              </button>
            </div>
            {moveOpen ? (
              <div className="dashboard-qr-move-panel" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className={`dashboard-qr-move-panel-item ${
                    currentFolderId == null ? "is-current" : ""
                  }`}
                  onClick={() => pickFolder(null)}
                >
                  ללא תיקייה
                </button>
                {(foldersForSelect || []).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="menuitem"
                    className={`dashboard-qr-move-panel-item ${
                      currentFolderId === f.id ? "is-current" : ""
                    }`}
                    onClick={() => pickFolder(f.id)}
                  >
                    {f.name}
                  </button>
                ))}
                {!foldersForSelect?.length ? (
                  <div className="small text-muted px-3 py-2 text-center">
                    אין תיקיות — צור תיקייה בסרגל הצד
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

            </div>

            <div className="dashboard-qr-card-actions-col">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm dashboard-qr-action-labeled dashboard-qr-card-action-btn w-100"
                onClick={handleOpenDestination}
              >
                <FiExternalLink size={16} aria-hidden />
                פתח
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm dashboard-qr-action-labeled dashboard-qr-card-action-btn w-100"
                onClick={() => setStyleEditOpen(true)}
              >
                <FiEdit2 size={16} aria-hidden />
                שינוי
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm dashboard-qr-action-labeled dashboard-qr-card-action-btn w-100"
                onClick={() => onDuplicateStub()}
              >
                <FiCopy size={16} aria-hidden />
                שכפל
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm dashboard-qr-action-labeled dashboard-qr-card-action-btn w-100"
                onClick={handleDelete}
                disabled={deleting}
              >
                <FiTrash2 size={16} aria-hidden />
                מחק
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
