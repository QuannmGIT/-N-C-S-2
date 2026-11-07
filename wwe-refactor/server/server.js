import "./src/dns.js";
import "dotenv/config";

import createApp from "./src/app.js";
import { config } from "./src/config.js";
import { connectDB } from "./src/database/mongoose.js";
import { seedMongoDB } from "./src/database/seed-mongo.js";
import mongoose from "mongoose";

async function startServer() {
  const app = createApp();

  const server = app.listen(config.port, "0.0.0.0", () => {
    console.log(`🚀 VoltCore Server running at http://localhost:${config.port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `❌ Port ${config.port} is already in use. Stop the other process or set PORT.`,
      );
      process.exit(1);
    }
    throw err;
  });

  // Kết nối MongoDB và nạp dữ liệu ban đầu
  try {
    await connectDB(config.mongoUri);
    await seedMongoDB();
  } catch (err) {
    console.warn("\n⚠️  [LƯU Ý TỪ MONGODB ATLAS]:");
    console.warn("MongoDB Atlas đang chặn địa chỉ IP hiện tại của bạn.");
    console.warn("👉 Cách mở khóa nhanh trong 30 giây:");
    console.warn("   1. Mở trang MongoDB Atlas (cloud.mongodb.com)");
    console.warn("   2. Vào mục 'Network Access' (menu bên trái)");
    console.warn("   3. Bấm '+ Add IP Address' -> chọn 'Allow Access from Anywhere' (0.0.0.0/0) -> Confirm.");
    console.warn("   Server vẫn đang chạy để phục vụ giao diện!\n");
  }

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      console.log(`\n${signal} received — shutting down server...`);
      server.close(async () => {
        try {
          await mongoose.connection.close();
          console.log("🍃 MongoDB connection closed.");
        } catch (err) {
          console.error("Error closing MongoDB connection:", err);
        }
        process.exit(0);
      });
    });
  }
}

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
