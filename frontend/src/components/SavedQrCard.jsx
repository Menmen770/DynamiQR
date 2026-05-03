import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaAndroid, FaApple } from "react-icons/fa";
import {
  FiBarChart2,
  FiChevronDown,
  FiClock,
  FiCopy,
  FiCornerUpLeft,
  FiDownload,
  FiEdit2,
  FiExternalLink,
  FiFolder,
  FiLink,
  FiSmartphone,
  FiTrash2,
} from "react-icons/fi";
import { API_BASE } from "../config";
import { QR_TYPES_MAIN, QR_TYPES_MORE } from "../utils/qrConstants";
import { effectiveSavedQrEncodedText, buildEncodedQrText } from "../utils/qrEncodedText";
import {
  downloadSavedQrFromPreviewDataUrl,
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

/** תווית ציר: יום.חודש מספרי בלבד (UTC), למשל 5.11 */
function formatStatsDayNumeric(dayKey) {
  if (!dayKey || typeof dayKey !== "string") return "";
  const m = dayKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return dayKey;
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(mo) || !Number.isFinite(d)) return dayKey;
  return `${d}.${mo}`;
}

/** תמונת דגל (עובד גם ב-Windows; אימוג׳י לעיתים מוצג כ־IL) */
function countryFlagImgSrc(codeRaw) {
  const code = String(codeRaw || "").trim().toLowerCase();
  if (!/^[a-z]{2}$/.test(code) || code === "un") return null;
  /* flagcdn תומך במידות מוגדרות — 18x13 מחזיר 404; 24x18 תקף, הגודל ב-CSS */
  return `https://flagcdn.com/24x18/${code}.png`;
}

/** שם תצוגה בעברית (גיבוי לקוד ISO אם השרת עדיין לא עודכן) */
function statsCountryDisplayName(it) {
  const label = String(it?.label || "").trim();
  if (label && !/^[A-Za-z]{2}$/.test(label)) return label;
  const code = String(it?.code || "UN").toUpperCase();
  if (code === "UN") return label || "לא ידוע";
  try {
    const dn = new Intl.DisplayNames(["he"], { type: "region" });
    const n = dn.of(code);
    if (n && n !== code) return n;
  } catch {
    /* ignore */
  }
  return label || code || "—";
}

function OsStatsIcon({ osKey }) {
  const cls = "dashboard-qr-stat-os-icon";
  if (osKey === "ios") return <FaApple className={cls} aria-hidden />;
  if (osKey === "android") return <FaAndroid className={cls} aria-hidden />;
  return <FiSmartphone className={cls} aria-hidden />;
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
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("png");
  const downloadSplitRef = useRef(null);

  const downloadFormatLabels = {
    png: "PNG",
    svg: "SVG",
    jpg: "JPG",
    pdf: "PDF",
  };

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
    setDownloadMenuOpen(false);
  }, [row._id]);

  useEffect(() => {
    if (!downloadMenuOpen) return;
    const close = (e) => {
      if (
        downloadSplitRef.current &&
        !downloadSplitRef.current.contains(e.target)
      ) {
        setDownloadMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [downloadMenuOpen]);

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

  const downloadFilenameBase = useMemo(
    () => `qr-${String(row._id || "saved").replace(/[^\w-]/g, "")}`,
    [row._id],
  );

  const handleDownload = useCallback(
    (format) => {
      if (!previewUrl) return;
      downloadSavedQrFromPreviewDataUrl(
        previewUrl,
        format || downloadFormat,
        downloadFilenameBase,
      );
    },
    [previewUrl, downloadFormat, downloadFilenameBase],
  );

  const selectDownloadFormat = useCallback((format) => {
    setDownloadFormat(format);
    setDownloadMenuOpen(false);
  }, []);

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
  const osItems = useMemo(() => {
    const items = [
      {
        key: "ios",
        label: "iPhone (iOS)",
        count: Number(
          statsData?.osBreakdown?.find((x) => x.key === "ios")?.count || 0,
        ),
      },
      {
        key: "android",
        label: "Android",
        count: Number(
          statsData?.osBreakdown?.find((x) => x.key === "android")?.count || 0,
        ),
      },
      {
        key: "other",
        label: "אחר",
        count: Number(
          statsData?.osBreakdown?.find((x) => x.key === "other")?.count || 0,
        ),
      },
    ];
    return [...items].sort((a, b) => b.count - a.count);
  }, [statsData]);
  const countryItems = statsData?.countryBreakdown || [];
  const dailySeries = Array.isArray(statsData?.dailySeries)
    ? statsData.dailySeries
    : [];
  const dailyCounts = dailySeries.map((d) => Number(d.count || 0));
  const maxDailyCount =
    dailyCounts.length > 0 ? Math.max(0, ...dailyCounts) : 0;

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
            className="modal-dialog modal-dialog-centered dashboard-qr-stats-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow dashboard-qr-stats-modal-content">
              <div className="modal-header border-0 dashboard-float-modal-header dashboard-qr-stats-modal-header">
                <div className="d-flex align-items-start gap-2 flex-grow-1 min-w-0 me-2">
                  <FiBarChart2
                    className="dashboard-qr-stats-header-icon flex-shrink-0"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <h2
                      className="modal-title h5 fw-bold mb-0"
                      id={`saved-qr-stats-modal-title-${row._id}`}
                    >
                      סטטיסטיקות לקוד
                    </h2>
                    <p
                      className="dashboard-qr-stats-subtitle text-truncate mb-0"
                      title={cardTitle(row)}
                    >
                      {cardTitle(row)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close flex-shrink-0"
                  aria-label="סגירה"
                  onClick={() => setStatsModalOpen(false)}
                />
              </div>
              <div className="modal-body pt-0 dashboard-qr-stats-modal-body">
                {statsLoading ? (
                  <div className="dashboard-qr-stats-loading text-center py-5">
                    <span
                      className="spinner-border spinner-border-sm text-secondary"
                      role="status"
                    />
                    <p className="small text-muted mb-0 mt-3">טוען נתונים…</p>
                  </div>
                ) : statsError ? (
                  <div
                    className="alert alert-danger small mb-0 dashboard-qr-stats-alert"
                    role="alert"
                  >
                    {statsError}
                  </div>
                ) : (
                  <>
                    <div className="dashboard-qr-stats-hero">
                      <div className="dashboard-qr-stats-hero-row">
                        <span className="dashboard-qr-stats-hero-label-inline">
                          סה״כ סרקו את האתר שלך:
                        </span>
                        <strong
                          className="dashboard-qr-stats-hero-value"
                          dir="ltr"
                        >
                          {totalScans.toLocaleString("he-IL")}
                        </strong>
                        <span className="dashboard-qr-stats-hero-unit">
                          פעמים
                        </span>
                      </div>
                    </div>

                    {totalScans === 0 ? (
                      <p className="dashboard-qr-stats-hint small mb-0">
                        אין עדיין סריקות. אחרי שמישהו יסרוק את הקוד יופיעו כאן
                        פילוח מערכות הפעלה, מדינות וגרף לפי ימים.
                      </p>
                    ) : (
                      <>
                        <div className="dashboard-qr-stats-stack">
                          <div className="dashboard-qr-stat-item dashboard-qr-stat-item--rows">
                            <span className="dashboard-qr-stat-label dashboard-qr-stat-label--section">
                              סריקות לפי מערכת הפעלה
                            </span>
                            <div
                              className="dashboard-qr-stat-hbar-list dashboard-qr-stat-hbar-list--fill"
                              dir="ltr"
                            >
                              {osItems.map((it) => {
                                const pct = percentOf(it.count, totalScans);
                                return (
                                  <div
                                    key={it.key}
                                    className="dashboard-qr-stat-hbar-row"
                                  >
                                    <OsStatsIcon osKey={it.key} />
                                    <span
                                      className="dashboard-qr-stat-hbar-name text-truncate"
                                      title={it.label}
                                    >
                                      {it.label}
                                    </span>
                                    <div
                                      className="dashboard-qr-stat-hbar-track"
                                      role="presentation"
                                    >
                                      <div
                                        className="dashboard-qr-stat-hbar-fill"
                                        style={{
                                          width: `${Math.max(pct, it.count > 0 ? 2 : 0)}%`,
                                        }}
                                      />
                                    </div>
                                    <span
                                      className="dashboard-qr-stat-hbar-metric"
                                      dir="ltr"
                                    >
                                      {it.count.toLocaleString("he-IL")} (
                                      {pct}%)
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="dashboard-qr-stat-item dashboard-qr-stat-item--rows">
                            <span className="dashboard-qr-stat-label dashboard-qr-stat-label--section">
                              סריקות לפי מדינות מובילות
                            </span>
                            {countryItems.length === 0 ? (
                              <p className="dashboard-qr-stat-rows-empty mb-0">
                                עדיין אין נתוני מדינה
                              </p>
                            ) : (
                              <div
                                className="dashboard-qr-stat-hbar-list dashboard-qr-stat-hbar-list--country"
                                dir="ltr"
                              >
                                <div
                                  className="dashboard-qr-stat-hbar-thead dashboard-qr-stat-hbar-thead--country"
                                  aria-hidden
                                >
                                  <span className="dashboard-qr-stat-hbar-th-rank">
                                    #
                                  </span>
                                  <span className="dashboard-qr-stat-hbar-th-country">
                                    מדינה
                                  </span>
                                  <span className="dashboard-qr-stat-hbar-th-flag" />
                                  <span className="dashboard-qr-stat-hbar-th-bar" />
                                  <span className="dashboard-qr-stat-hbar-th-metric">
                                    סריקות (%)
                                  </span>
                                </div>
                                <div className="dashboard-qr-stat-country-rows-scroll">
                                  {countryItems.map((it, idx) => {
                                    const pct = percentOf(
                                      it.count,
                                      totalScans,
                                    );
                                    const countryName =
                                      statsCountryDisplayName(it);
                                    const flagSrc = countryFlagImgSrc(it.code);
                                    return (
                                      <div
                                        key={`${it.code}-${idx}`}
                                        className="dashboard-qr-stat-hbar-row dashboard-qr-stat-hbar-row--country"
                                      >
                                        <span className="dashboard-qr-stat-hbar-rank">
                                          {idx + 1}
                                        </span>
                                        <span
                                          className="dashboard-qr-stat-hbar-country-name-cell text-truncate"
                                          dir="rtl"
                                          title={countryName}
                                        >
                                          <strong className="dashboard-qr-stat-hbar-country-name">
                                            {countryName}
                                          </strong>
                                        </span>
                                        <span className="dashboard-qr-stat-hbar-flag-cell">
                                          {flagSrc ? (
                                            <img
                                              src={flagSrc}
                                              alt=""
                                              width={24}
                                              height={18}
                                              className="dashboard-qr-stat-country-flag-img"
                                              loading="lazy"
                                              decoding="async"
                                            />
                                          ) : (
                                            <span
                                              className="dashboard-qr-stat-country-flag-fallback"
                                              aria-hidden
                                            >
                                              🌍
                                            </span>
                                          )}
                                        </span>
                                        <div
                                          className="dashboard-qr-stat-hbar-track"
                                          role="presentation"
                                        >
                                          <div
                                            className="dashboard-qr-stat-hbar-fill"
                                            style={{
                                              width: `${Math.max(pct, it.count > 0 ? 2 : 0)}%`,
                                            }}
                                          />
                                        </div>
                                        <span
                                          className="dashboard-qr-stat-hbar-metric"
                                          dir="ltr"
                                        >
                                          {Number(it.count).toLocaleString(
                                            "he-IL",
                                          )}{" "}
                                          ({pct}%)
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="dashboard-qr-stat-item dashboard-qr-stat-item--chart">
                          <div className="dashboard-qr-stat-chart-head">
                            <span className="dashboard-qr-stat-label mb-0">
                              צפיות לפי יום
                            </span>
                            <span className="dashboard-qr-stat-chart-caption">
                              30 הימים האחרונים
                            </span>
                          </div>
                          <div className="dashboard-qr-bars-panel" dir="ltr">
                            <div className="dashboard-qr-bars-scroll">
                              <div className="dashboard-qr-bars">
                                {dailySeries.map((d) => {
                                  const c = Number(d.count || 0);
                                  const h =
                                    maxDailyCount === 0
                                      ? 3
                                      : Math.max(
                                          5,
                                          (c / maxDailyCount) * 82,
                                        );
                                  const dayLabel = formatStatsDayNumeric(d.date);
                                  return (
                                    <div
                                      key={d.date}
                                      className="dashboard-qr-bar-col"
                                    >
                                      <div
                                        className="dashboard-qr-bar-track"
                                        title={`${dayLabel} (${d.date}): ${c}`}
                                      >
                                        <div
                                          className="dashboard-qr-bar"
                                          style={{ height: `${h}px` }}
                                        />
                                      </div>
                                      <span
                                        className="dashboard-qr-bar-label"
                                        dir="ltr"
                                        translate="no"
                                      >
                                        {dayLabel}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
              <div className="modal-footer border-0 dashboard-qr-stats-modal-footer">
                <button
                  type="button"
                  className="btn btn-teal"
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
            <div className="modal-content border-0 shadow-lg dashboard-qr-zoom-modal-shell rounded-4 overflow-hidden">
              <div className="modal-header border-0 dashboard-float-modal-header dashboard-qr-zoom-modal-header py-3 px-3">
                <h5
                  className="modal-title fs-6 fw-semibold mb-0 text-truncate flex-grow-1 min-w-0"
                  id={`dashboard-qr-zoom-title-${row._id}`}
                >
                  {cardTitle(row)}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="סגור"
                  onClick={() => setQrZoomOpen(false)}
                />
              </div>
              <div className="modal-body text-center pt-2 pb-4 px-3 dashboard-qr-zoom-modal-body">
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
          <div
            className="qr-download-split-wrap dashboard-qr-download-split position-relative w-100"
            ref={downloadSplitRef}
          >
            <div className="qr-download-split dashboard-qr-download-split-inner">
              <button
                type="button"
                className="qr-download-split-main btn btn-teal btn-sm"
                onClick={() => handleDownload(downloadFormat)}
                disabled={!previewUrl || previewLoading}
                aria-label={`הורד כקובץ ${downloadFormatLabels[downloadFormat]}`}
              >
                <span className="dashboard-qr-download-main-inner">
                  <FiDownload size={18} aria-hidden />
                  <span>
                    הורד {downloadFormatLabels[downloadFormat]}
                  </span>
                </span>
              </button>
              <button
                type="button"
                className="qr-download-split-toggle btn btn-teal btn-sm"
                onClick={() => setDownloadMenuOpen((o) => !o)}
                disabled={!previewUrl || previewLoading}
                aria-expanded={downloadMenuOpen}
                aria-haspopup="menu"
                aria-label="עוד פורמטים להורדה"
              >
                <FiChevronDown
                  size={18}
                  style={{
                    transform: downloadMenuOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s ease",
                  }}
                  aria-hidden
                />
              </button>
            </div>
            {downloadMenuOpen ? (
              <div
                className="qr-download-split-menu"
                role="menu"
                aria-label="בחירת פורמט להורדה"
              >
                <button
                  type="button"
                  className="qr-download-split-option"
                  role="menuitem"
                  onClick={() => {
                    selectDownloadFormat("png");
                  }}
                >
                  PNG
                </button>
                <button
                  type="button"
                  className="qr-download-split-option"
                  role="menuitem"
                  onClick={() => {
                    selectDownloadFormat("svg");
                  }}
                >
                  SVG
                </button>
                <button
                  type="button"
                  className="qr-download-split-option"
                  role="menuitem"
                  onClick={() => {
                    selectDownloadFormat("jpg");
                  }}
                >
                  JPG
                </button>
                <button
                  type="button"
                  className="qr-download-split-option"
                  role="menuitem"
                  onClick={() => {
                    selectDownloadFormat("pdf");
                  }}
                >
                  PDF
                </button>
              </div>
            ) : null}
          </div>
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
