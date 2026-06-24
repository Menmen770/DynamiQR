import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    oauthProvider: {
      type: String,
      enum: ["google", "facebook", ""],
      default: "",
    },
    oauthId: {
      type: String,
      sparse: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
