import "../dns.js";
import mongoose from "mongoose";

export async function connectDB(uri) {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 6000 });
    console.log("🍃 MongoDB Atlas connected successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);

    // Fallback thông minh: nếu chuỗi direct shard bị lỗi, tự động thử chuỗi SRV (và ngược lại)
    const srvUri =
      "mongodb+srv://thinhemquan_db_user:Quane17012007@voltcore.lwumgsf.mongodb.net/voltcore_db?retryWrites=true&w=majority";

    if (uri !== srvUri) {
      console.log("🔄 Đang thử kết nối lại với chuỗi SRV chuẩn...");
      try {
        await mongoose.connect(srvUri, { serverSelectionTimeoutMS: 6000 });
        console.log("🍃 Kết nối MongoDB Atlas thành công qua SRV!");
        return;
      } catch (err2) {
        console.error("❌ Lỗi kết nối SRV:", err2.message);
      }
    }

    throw err;
  }
}

export default mongoose;