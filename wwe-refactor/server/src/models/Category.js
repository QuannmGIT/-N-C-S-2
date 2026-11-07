import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true }, // 'iot', 'robotics', 'displays', 'tools'
  name:  { type: String, required: true },
  img:   { type: String, default: "" },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Category", categorySchema);