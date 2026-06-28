import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "שם מלא הוא שדה חובה"],
      trim: true,
      minlength: [2, "שם מלא חייב להכיל לפחות 2 תווים"],
      maxlength: [80, "שם מלא ארוך מדי"],
    },
    email: {
      type: String,
      required: [true, "אימייל הוא שדה חובה"],
      lowercase: true,
      trim: true,
      unique: true,
      validate: {
        validator: (v) => EMAIL_RE.test(String(v || "").trim()),
        message: "אימייל לא תקין",
      },
    },
    passwordHash: {
      type: String,
      default: null,
    },
    oauthProvider: {
      type: String,
      enum: {
        values: ["google", "facebook", ""],
        message: "ספק OAuth לא נתמך",
      },
      default: "",
    },
    oauthId: {
      type: String,
      sparse: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCodeHash: {
      type: String,
      default: null,
      select: false,
    },
    emailVerificationExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  { timestamps: true },
);

/** Pre-save: OAuth מאומת + הצפנת סיסמה (bcrypt) */
userSchema.pre("save", async function preSaveUser() {
  if (this.oauthProvider && this.oauthProvider !== "") {
    this.emailVerified = true;
    this.emailVerificationCodeHash = undefined;
    this.emailVerificationExpiresAt = undefined;
  }

  const plain = this.$locals?.plainPassword;
  if (plain) {
    this.passwordHash = await bcrypt.hash(String(plain), 10);
    delete this.$locals.plainPassword;
  }
});

export default mongoose.model("User", userSchema);
