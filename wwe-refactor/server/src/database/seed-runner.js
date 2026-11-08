import "../dns.js";
import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(import.meta.dirname, "../../.env") });
import mongoose from "mongoose";
import { connectDB } from "./mongoose.js";
import { seedMongoDB } from "./seed-mongo.js";
import { config } from "../config.js";

async function run() {
  const maskedUri = config.mongoUri.replace(/:([^:@]+)@/, ":****@");
  console.log(`Connecting to MongoDB (${maskedUri})...`);
  await connectDB(config.mongoUri);
  console.log("🌱 Executing complete database recreation & seeding...");
  await seedMongoDB({ force: true });
  console.log("✅ Database recreated and populated successfully with binary images!");
  await mongoose.connection.close();
  console.log("🍃 MongoDB connection closed.");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Seeding failed:", err.message);
  process.exit(1);
});
