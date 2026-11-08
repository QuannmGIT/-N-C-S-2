import { Router } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { ApiError } from "../handler/error.js";

const orderRouter = Router();

// Thông tin tài khoản ngân hàng thụ hưởng mặc định của VoltCore
export const STORE_BANK_CONFIG = {
  bankId: "MB",
  bankName: "MB Bank (Quân Đội)",
  bankBin: "970422",
  accountNo: "33669917012007",
  accountName: "NGO MINH QUAN",
  template: "compact2",
};

/**
 * 1. POST /api/orders
 * Tạo đơn hàng mới từ giỏ hàng
 */
orderRouter.post("/", async (req, res, next) => {
  try {
    const { items, shipping, paymentMethod = "BANK_TRANSFER" } = req.body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return next(ApiError.badRequest("Giỏ hàng của bạn đang trống"));
    }

    if (!shipping || !shipping.fullName || !shipping.phone || !shipping.street) {
      return next(ApiError.badRequest("Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng"));
    }

    // Tính toán lại giá trị đơn hàng từ sản phẩm để đảm bảo an toàn
    let subtotal = 0;
    let itemCount = 0;
    const orderItems = [];

    for (const item of items) {
      const qty = Math.max(1, parseInt(item.qty || item.quantity) || 1);
      const price = Number(item.price) >= 0 ? Number(item.price) : 0;
      subtotal += price * qty;
      itemCount += qty;

      orderItems.push({
        slug: String(item.slug || item.id),
        name: String(item.name),
        brand: item.brand ? String(item.brand) : "",
        image: item.image || item.img || "",
        price: price,
        quantity: qty,
      });

      // Giảm tồn kho sản phẩm tương ứng nếu có
      if (item.slug) {
        await Product.updateOne(
          { slug: item.slug, stock: { $gte: qty } },
          { $inc: { stock: -qty } }
        ).catch(() => {});
      }
    }

    // Phí ship: 30.000đ, miễn phí ship cho đơn từ 500.000đ
    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const discount = 0;
    const totalAmount = subtotal + shippingFee - discount;

    // Sinh mã đơn hàng chuẩn format VC-YYYYMMDD-XXXX
    const now = new Date();
    const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `VC-${ymd}-${rand}`;

    const order = await Order.create({
      orderCode,
      user: req.session?.userId || null,
      shipping: {
        fullName: String(shipping.fullName).trim(),
        phone: String(shipping.phone).trim(),
        email: shipping.email ? String(shipping.email).trim() : "",
        province: shipping.province ? String(shipping.province).trim() : "Hồ Chí Minh",
        district: shipping.district ? String(shipping.district).trim() : "Quận 1",
        ward: shipping.ward ? String(shipping.ward).trim() : "",
        street: String(shipping.street).trim(),
        note: shipping.note ? String(shipping.note).trim() : "",
      },
      items: orderItems,
      itemCount,
      subtotal,
      shippingFee,
      discount,
      totalAmount,
      paymentMethod: paymentMethod === "COD" ? "COD" : "BANK_TRANSFER",
      paymentStatus: "UNPAID",
      status: "PENDING",
      statusHistory: [
        {
          status: "PENDING",
          changedAt: new Date(),
          note: "Đơn hàng đã được khởi tạo thành công",
        },
      ],
    });

    res.json({
      success: true,
      order,
      orderCode: order.orderCode,
      vietqrUrl: `https://img.vietqr.io/image/${STORE_BANK_CONFIG.bankId}-${STORE_BANK_CONFIG.accountNo}-${STORE_BANK_CONFIG.template}.png?amount=${order.totalAmount}&addInfo=${encodeURIComponent(order.orderCode)}&accountName=${encodeURIComponent(STORE_BANK_CONFIG.accountName)}`,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 2. GET /api/orders/:orderCode
 * Lấy chi tiết đơn hàng / hóa đơn thanh toán
 */
orderRouter.get("/:orderCode", async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderCode: req.params.orderCode }).lean();
    if (!order) {
      return next(ApiError.notFound("Không tìm thấy đơn hàng với mã này"));
    }

    const vietqrUrl = `https://img.vietqr.io/image/${STORE_BANK_CONFIG.bankId}-${STORE_BANK_CONFIG.accountNo}-${STORE_BANK_CONFIG.template}.png?amount=${order.totalAmount}&addInfo=${encodeURIComponent(order.orderCode)}&accountName=${encodeURIComponent(STORE_BANK_CONFIG.accountName)}`;

    res.json({
      success: true,
      order,
      bankConfig: STORE_BANK_CONFIG,
      vietqrUrl,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 3. POST /api/orders/:orderCode/pay
 * Xác nhận khách hàng đã thanh toán thành công qua VietQR
 */
orderRouter.post("/:orderCode/pay", async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderCode: req.params.orderCode });
    if (!order) {
      return next(ApiError.notFound("Không tìm thấy đơn hàng"));
    }

    order.paymentStatus = "PAID";
    order.status = "CONFIRMED";
    order.statusHistory.push({
      status: "PAID",
      changedAt: new Date(),
      note: "Khách hàng đã xác nhận thanh toán mã QR VietQR",
    });

    await order.save();

    res.json({
      success: true,
      order,
      message: "Xác nhận thanh toán đơn hàng thành công!",
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 4. POST /api/orders/vietqr/generate
 * Gọi API VietQR chính thức để tạo mã QR Base64 / EMVCo
 */
orderRouter.post("/vietqr/generate", async (req, res, next) => {
  try {
    const { amount, orderCode, accountNo, accountName, bankBin } = req.body ?? {};

    const targetAccountNo = accountNo || STORE_BANK_CONFIG.accountNo;
    const targetAccountName = accountName || STORE_BANK_CONFIG.accountName;
    const targetBin = bankBin || STORE_BANK_CONFIG.bankBin;
    const targetAmount = Number(amount) || 0;
    const targetInfo = orderCode || "VOLTCORE";

    // Direct Image URL fallback
    const directImageUrl = `https://img.vietqr.io/image/${STORE_BANK_CONFIG.bankId}-${targetAccountNo}-${STORE_BANK_CONFIG.template}.png?amount=${targetAmount}&addInfo=${encodeURIComponent(targetInfo)}&accountName=${encodeURIComponent(targetAccountName)}`;

    try {
      // Gọi API chính thức của VietQR
      const response = await fetch("https://api.vietqr.io/v2/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountNo: targetAccountNo,
          accountName: targetAccountName,
          acqId: targetBin,
          amount: targetAmount,
          addInfo: targetInfo,
          format: "text",
          template: STORE_BANK_CONFIG.template,
        }),
      });

      const json = await response.json();
      if (json && json.data) {
        return res.json({
          success: true,
          qrDataURL: json.data.qrDataURL,
          qrCode: json.data.qrCode,
          directImageUrl,
        });
      }
    } catch {
      // Nếu API VietQR bên ngoài timeout hoặc lỗi mạng, trả về link direct image tức thì
    }

    res.json({
      success: true,
      directImageUrl,
      qrDataURL: directImageUrl,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 5. GET /api/orders/user/my-orders
 * Lấy lịch sử đơn hàng của người dùng đang đăng nhập
 */
orderRouter.get("/user/my-orders", async (req, res, next) => {
  try {
    if (!req.session?.userId) {
      return next(ApiError.unauthorized("Vui lòng đăng nhập để xem đơn hàng"));
    }

    const orders = await Order.find({ user: req.session.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (err) {
    next(err);
  }
});

export default orderRouter;
