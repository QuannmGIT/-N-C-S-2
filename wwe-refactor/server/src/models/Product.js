import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  slug:        { type: String, required: true, unique: true, lowercase: true },
  name:        { type: String, required: true },
  categoryKey: { type: String, required: true, index: true },
  brand:       { type: String, required: true },
  specs:       { type: String, default: "" },       // Chuỗi tóm tắt hiển thị trên card
  detailSpecs: { type: mongoose.Schema.Types.Mixed, default: {} }, // Thông số kỹ thuật chi tiết
  img:         { type: String, required: true },
  imageData: {
    data:        { type: Buffer, default: null }, // Lưu dữ liệu nhị phân nguyên bản của ảnh (BSON BinData)
    contentType: { type: String, default: "image/png" }
  },
  price:       { type: Number, required: true, min: 0 },
  oldPrice:    { type: Number, default: null },
  badge:       { type: String, enum: ["sale", "hot", "new", null], default: null },
  stock:       { type: Number, required: true, default: 0, min: 0 },
  isDeleted:   { type: Boolean, default: false } // Xóa mềm (ẩn sản phẩm khỏi cửa hàng, admin vẫn thấy)
}, { timestamps: true });

productSchema.index({ name: "text", brand: "text", specs: "text" });

export default mongoose.model("Product", productSchema);