import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, default: "" },
  googleId:     { type: String, default: null },
  avatar:       { type: String, default: "" },
  role:         { type: String, enum: ["customer", "admin"], default: "customer" }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
