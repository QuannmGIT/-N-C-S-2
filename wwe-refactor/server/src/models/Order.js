import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    code:     { type: String },
    slug:     { type: String, required: true },
    name:     { type: String, required: true },
    brand:    { type: String },
    image:    { type: String },
    price:    { type: Number, required: true }, // Snapshot giá tại thời điểm mua
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status:    { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    note:      { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      // Format: VC-YYYYMMDD-XXXX
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    shipping: {
      fullName: { type: String, required: true },
      phone:    { type: String, required: true },
      email:    { type: String },
      province: { type: String, required: true },
      district: { type: String, required: true },
      ward:     { type: String },
      street:   { type: String, required: true },
      note:     { type: String, default: "" },
    },
    items: {
      type: [orderItemSchema],
      validate: [
        (arr) => arr.length >= 1,
        "Đơn hàng phải có ít nhất 1 sản phẩm",
      ],
    },
    itemCount:   { type: Number, required: true, min: 1 },
    subtotal:    { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 30000 },
    discount:    { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["COD", "BANK_TRANSFER", "MOMO"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID"],
      default: "UNPAID",
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    statusHistory: [statusHistorySchema],
    cancelReason:  { type: String, default: "" },
  },
  { timestamps: true }
);

orderSchema.index({ orderCode: 1 }, { unique: true });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
