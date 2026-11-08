import "./dns.js";
import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });
import MongoStore from "connect-mongo";

const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/voltcore_db";

const sessionStore = MongoStore.create({
  mongoUrl: mongoUri,
  collectionName: "sessions",
  ttl: 24 * 60 * 60, // 1 ngày
});

// Bắt lỗi connection event từ MongoStore để không gây sập process
sessionStore.on("error", (err) => {
  console.warn("⚠️ MongoStore session warning:", err.message);
});

export const config = {
  port: Number(process.env.PORT) || 3000,
  mongoUri,
  store: sessionStore,
  secret: process.env.SESSION_SECRET || "voltcore-default-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    sameSite: "lax",
    secure: "auto",
  },
};
