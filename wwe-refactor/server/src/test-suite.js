import "./dns.js";
import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });
import mongoose from "mongoose";
import createApp from "./app.js";
import { connectDB } from "./database/mongoose.js";
import { config } from "./config.js";

async function runTests() {
  console.log("=== BẮT ĐẦU KIỂM TRA HỆ THỐNG VOLTCORE ===");
  
  // 1. Kết nối MongoDB
  console.log("\n[1/7] Kết nối MongoDB Atlas...");
  await connectDB(config.mongoUri);
  console.log("✅ MongoDB Atlas kết nối thành công!");

  // 2. Khởi động Express test server
  console.log("\n[2/7] Khởi động Express server kiểm thử...");
  const app = createApp();
  const testPort = 3008;
  const server = app.listen(testPort);
  await new Promise((r) => setTimeout(r, 1000));
  const baseUrl = `http://localhost:${testPort}`;
  console.log(`✅ Server lắng nghe tại ${baseUrl}`);

  try {
    // 3. Test /health
    console.log("\n[3/7] Kiểm tra GET /health...");
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    console.log("Health check:", healthRes.status, healthData);
    if (healthRes.status !== 200 || healthData.status !== "ok") {
      throw new Error("Endpoint /health không hợp lệ");
    }

    // 4. Test /api/categories & /api/products
    console.log("\n[4/7] Kiểm tra API Danh mục & Linh kiện...");
    const catRes = await fetch(`${baseUrl}/api/categories`);
    const categories = await catRes.json();
    console.log(`✅ Tìm thấy ${categories.length} danh mục:`, categories.map((c) => c.name).join(", "));

    const prodRes = await fetch(`${baseUrl}/api/products?limit=20`);
    const prodData = await prodRes.json();
    console.log(`✅ Tìm thấy ${prodData.total} sản phẩm trong kho. Trang 1 trả về ${prodData.items.length} mục.`);
    if (prodData.total === 0) throw new Error("Chưa có sản phẩm nào trong database");

    const firstProd = prodData.items[0];
    console.log(`Kiểm tra sản phẩm mẫu: "${firstProd.name}", Slug: "${firstProd.slug}", Image URL: "${firstProd.img}"`);

    // 5. Test Streaming Ảnh Linh Kiện từ MongoDB
    console.log("\n[5/7] Kiểm tra Stream Ảnh Linh Kiện trực tiếp từ MongoDB (Binary BinData)...");
    const imgUrl = `${baseUrl}${firstProd.img}`;
    const imgRes = await fetch(imgUrl);
    const imgContentType = imgRes.headers.get("content-type");
    const imgBuffer = await imgRes.arrayBuffer();
    console.log(`Ảnh "${firstProd.slug}": HTTP ${imgRes.status}, Content-Type: ${imgContentType}, Dung lượng binary: ${imgBuffer.byteLength} bytes`);
    if (imgRes.status !== 200 || imgBuffer.byteLength < 1000) {
      throw new Error(`Ảnh sản phẩm trả về không hợp lệ (size: ${imgBuffer.byteLength})`);
    }
    console.log("✅ Dữ liệu nhị phân của ảnh được lưu và tải thành công trực tiếp từ MongoDB!");

    // 6. Test /api/articles & Stream Ảnh Bài Viết
    console.log("\n[6/7] Kiểm tra API Blog & Stream Ảnh Bài Viết...");
    const artRes = await fetch(`${baseUrl}/api/articles`);
    const artData = await artRes.json();
    console.log(`✅ Tìm thấy ${artData.total} bài viết Blog.`);
    if (artData.items.length > 0) {
      const firstArt = artData.items[0];
      console.log(`Bài viết mẫu: "${firstArt.title}", Slug: "${firstArt.slug}"`);
      if (firstArt.img) {
        const artImgRes = await fetch(`${baseUrl}${firstArt.img}`);
        const artImgBuf = await artImgRes.arrayBuffer();
        console.log(`Ảnh bìa bài viết: HTTP ${artImgRes.status}, Size: ${artImgBuf.byteLength} bytes`);
      }
    }

    // 7. Test Tạo đơn hàng & VietQR
    console.log("\n[7/7] Kiểm tra tạo đơn hàng VietQR...");
    const orderPayload = {
      customer: {
        fullName: "Nguyễn Văn Test",
        email: "test@voltcore.io",
        phone: "0901234567",
        address: "123 Đường Điện Tử, Q1, TP.HCM",
        note: "Đơn hàng thử nghiệm hệ thống",
      },
      items: [
        {
          slug: firstProd.slug,
          name: firstProd.name,
          price: firstProd.price,
          qty: 2,
          img: firstProd.img,
        },
      ],
      paymentMethod: "vietqr",
    };

    const orderRes = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const orderData = await orderRes.json();
    console.log(`HTTP ${orderRes.status} Đơn hàng:`, orderData.success ? `Mã ĐH: ${orderData.order?.orderCode}, QR Code URL: ${orderData.order?.qrCodeUrl?.slice(0, 60)}...` : orderData);
    if (!orderData.success || !orderData.order?.qrCodeUrl) {
      throw new Error("Tạo đơn hàng VietQR thất bại");
    }
    console.log("✅ API VietQR và đơn hàng hoạt động hoàn hảo!");

    console.log("\n=========================================");
    console.log("🎉 TẤT CẢ CÁC BÀI KIỂM THỬ ĐÃ THÀNH CÔNG RỰC RỠ! 🎉");
    console.log("=========================================\n");
  } finally {
    server.close();
    await mongoose.connection.close();
  }
}

runTests().catch((err) => {
  console.error("\n❌ LỖI TRONG QUÁ TRÌNH KIỂM THỬ:", err.message);
  process.exit(1);
});
