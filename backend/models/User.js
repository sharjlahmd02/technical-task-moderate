import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  totpSecretEncrypted: { type: String },
  totpSalt: { type: String },
  totpLastStep: { type: Number, default: 0 },
  isEnrolled: { type: Boolean, default: false },
});

export const User = mongoose.model("User", userSchema);