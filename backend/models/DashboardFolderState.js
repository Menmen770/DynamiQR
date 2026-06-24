import mongoose from "mongoose";

const folderEntrySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false },
);

const dashboardFolderStateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    folders: { type: [folderEntrySchema], default: [] },
    assignments: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    globalOrder: { type: [String], default: [] },
    folderOrders: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
  },
  { timestamps: true },
);

export default mongoose.model(
  "DashboardFolderState",
  dashboardFolderStateSchema,
);
