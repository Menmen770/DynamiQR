import { useState } from "react";
import { FiEdit3, FiFolder, FiLayers, FiPlus, FiTrash2 } from "react-icons/fi";
import { UNFILED_ORDER_KEY } from "../utils/dashboardFoldersStorage";
import SimpleTextModal from "./SimpleTextModal";

const ACTIVITY_FILTERS = [
  { id: "all", label: "הכל" },
  { id: "active", label: "פעילים" },
  { id: "inactive", label: "לא פעילים" },
];

export default function DashboardSidebar({
  folders,
  selectedViewId,
  onSelectView,
  counts,
  onCreateFolderWithName,
  onDeleteFolder,
  onOpenAccountSettings,
  accountSettingsActive = false,
  activityFilter,
  onActivityFilterChange,
}) {
  const [folderModalOpen, setFolderModalOpen] = useState(false);

  return (
    <aside className="dashboard-sidebar card border-0 shadow-sm" dir="rtl">
      <SimpleTextModal
        open={folderModalOpen}
        onClose={() => setFolderModalOpen(false)}
        title="תיקייה חדשה"
        description="הזן שם לתיקייה. אפשר יהיה לשייך אליה קודים מהדף הראשי."
        label="שם התיקייה"
        placeholder="למשל: לקוחות, אירועים…"
        confirmLabel="צור תיקייה"
        maxLength={80}
        minLength={1}
        defaultValue=""
        onConfirm={(name) => onCreateFolderWithName(name)}
      />

      <div className="card-body p-3 d-flex flex-column">
        <div
          className="dashboard-sidebar-activity"
          role="group"
          aria-label="סינון לפי מצב פעיל"
        >
          {ACTIVITY_FILTERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`dashboard-sidebar-activity-btn ${
                activityFilter === id ? "is-active" : ""
              }`}
              aria-pressed={activityFilter === id}
              onClick={() => onActivityFilterChange(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <nav className="dashboard-sidebar-nav d-flex flex-column gap-1 flex-grow-1">
          <button
            type="button"
            className={`dashboard-sidebar-item w-100 text-start rounded-3 ${
              selectedViewId === "all" ? "is-active" : ""
            }`}
            onClick={() => onSelectView("all")}
          >
            <FiLayers
              className="me-2 text-secondary flex-shrink-0"
              aria-hidden
            />
            <span className="fw-semibold">כל הקודים</span>
            <span className="dashboard-sidebar-count">{counts.all}</span>
          </button>

          <button
            type="button"
            className={`dashboard-sidebar-item w-100 text-start rounded-3 ${
              selectedViewId === UNFILED_ORDER_KEY ? "is-active" : ""
            }`}
            onClick={() => onSelectView(UNFILED_ORDER_KEY)}
          >
            <span className="fw-semibold">ללא תיקייה</span>
            <span className="dashboard-sidebar-count">{counts.unfiled}</span>
          </button>

          {folders.map((f) => (
            <div
              key={f.id}
              className="dashboard-sidebar-folder-row position-relative"
            >
              <button
                type="button"
                className={`dashboard-sidebar-item dashboard-sidebar-item-folder w-100 text-start rounded-3 ${
                  selectedViewId === f.id ? "is-active" : ""
                }`}
                onClick={() => onSelectView(f.id)}
              >
                <FiFolder
                  className="me-2 text-secondary flex-shrink-0"
                  aria-hidden
                />
                <span className="fw-semibold text-truncate">{f.name}</span>
                <span className="dashboard-sidebar-count">
                  {counts.perFolder[f.id] ?? 0}
                </span>
              </button>
              <button
                type="button"
                className="btn btn-link btn-sm text-danger dashboard-sidebar-delete-folder p-0"
                title="מחיקת תיקייה (הקודים יעברו ל«ללא תיקייה»)"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFolder(f.id, f.name);
                }}
              >
                <FiTrash2 aria-hidden />
              </button>
            </div>
          ))}
        </nav>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm w-100 mt-1 d-inline-flex align-items-center justify-content-center gap-1 rounded-3 fw-semibold"
          onClick={() => setFolderModalOpen(true)}
        >
          <FiPlus aria-hidden />
          צור תיקייה
        </button>

        <hr className="dashboard-sidebar-elegant-rule" />

        <button
          type="button"
          className={`btn btn-sm w-100 d-inline-flex align-items-center justify-content-center gap-2 rounded-3 fw-semibold ${
            accountSettingsActive
              ? "btn-secondary text-white"
              : "btn-outline-secondary"
          }`}
          onClick={onOpenAccountSettings}
          aria-pressed={accountSettingsActive}
        >
          <FiEdit3 aria-hidden />
          עדכון פרטים
        </button>
      </div>
    </aside>
  );
}
