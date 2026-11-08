import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  slug:        { type: String, required: true, unique: true, lowercase: true },
  title:       { type: String, required: true },
  category:    { type: String, required: true, index: true },
  catLabel:    { type: String },
  catColor:    { type: String, default: null },
  authorName:  { type: String, required: true },
  authorId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  avatar:      { type: String, default: "/assets/icons/userlogo.svg" },
  published:   { type: String },
  minutes:     { type: Number, default: 5 },
  reads:       { type: Number, default: 0 },
  img:         { type: String, default: null },
  imageData: {
    data:        { type: Buffer, default: null }, // Lưu dữ liệu nhị phân nguyên bản của ảnh (BSON BinData)
    contentType: { type: String, default: "image/png" }
  },
  emoji:       { type: String, default: "🔌" },
  gradient:    { type: String, default: null },
  excerpt:     { type: String, default: "" },
  tags:        [{ type: String }],
  toc:         [{ type: String }],
  contentHtml: { type: String, required: true },
  featured:    { type: Boolean, default: false },
  isDeleted:   { type: Boolean, default: false } // Xóa mềm (ẩn khỏi Blog, admin vẫn thấy)
}, { timestamps: true });

articleSchema.index({ title: "text", excerpt: "text" });

export default mongoose.model("Article", articleSchema);