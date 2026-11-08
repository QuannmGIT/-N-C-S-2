import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Article from "../models/Article.js";
import User from "../models/User.js";
import { CATEGORIES, PRODUCTS, ARTICLES } from "./seed.js";

/**
 * Đọc file ảnh từ máy hoặc giải mã Base64 thành dữ liệu nhị phân (Buffer)
 * để lưu trực tiếp vào BSON BinData của MongoDB
 */
export function loadBinaryImage(imagePath) {
  if (!imagePath) return null;
  if (typeof imagePath === "object" && Buffer.isBuffer(imagePath.data)) {
    return imagePath;
  }
  if (typeof imagePath !== "string") return null;

  // Trường hợp ảnh Base64
  if (imagePath.startsWith("data:")) {
    const match = imagePath.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (match) {
      return {
        data: Buffer.from(match[2], "base64"),
        contentType: match[1],
      };
    }
  }

  // Trường hợp đường dẫn file ảnh cục bộ trên đĩa
  try {
    const cleanPath = imagePath.replace(/^\/+/, "");
    const possiblePaths = [
      path.resolve(import.meta.dirname, "../../../electrical-store/public", cleanPath),
      path.resolve(import.meta.dirname, "../../../electrical-store/dist", cleanPath),
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        const data = fs.readFileSync(p);
        const ext = path.extname(p).toLowerCase();
        const contentType =
          ext === ".jpg" || ext === ".jpeg"
            ? "image/jpeg"
            : ext === ".webp"
            ? "image/webp"
            : ext === ".svg"
            ? "image/svg+xml"
            : "image/png";
        return { data, contentType };
      }
    }
  } catch {}

  return null;
}

export async function seedMongoDB({ force = false } = {}) {
  try {
    if (force) {
      console.log("🔄 [Seed] Đang làm mới dữ liệu để tạo mới toàn bộ bản sao chuẩn...");
      await Category.deleteMany({});
      await Product.deleteMany({});
      await Article.deleteMany({});
    }

    // 0. Seed Admin / Dev user 'gay' / 'mafugay'
    const adminPasswordHash = await bcrypt.hash("mafugay", 10);
    const existingAdmin = await User.findOne({ username: "gay" });
    if (!existingAdmin) {
      await User.create({
        username: "gay",
        email: "dev.admin@voltcore.io",
        password: adminPasswordHash,
        role: "admin",
      });
      console.log("👑 [Seed] Đã tạo tài khoản Dev/Admin: gay / mafugay");
    } else {
      existingAdmin.password = adminPasswordHash;
      existingAdmin.role = "admin";
      await existingAdmin.save();
    }

    // 1. Seed Categories
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      const catDocs = CATEGORIES.map((c, index) => ({
        key: c.key,
        name: c.name,
        img: c.img,
        order: index + 1,
      }));
      await Category.insertMany(catDocs);
      console.log(`🌱 [Seed] Đã nạp ${catDocs.length} danh mục vào MongoDB.`);
    }

    // 2. Seed Products
    const prodCount = await Product.countDocuments();
    if (prodCount === 0) {
      const prodDocs = PRODUCTS.map((p) => {
        const bin = loadBinaryImage(p.img);
        return {
          slug: p.slug,
          name: p.name,
          categoryKey: p.category,
          brand: p.brand,
          specs: p.specs ?? "",
          img: `/api/products/${p.slug}/image`,
          imageData: bin || { data: null, contentType: "image/png" },
          price: p.price,
          oldPrice: p.oldPrice ?? null,
          badge: p.badge ?? null,
          stock: p.stock ?? 0,
        };
      });
      await Product.insertMany(prodDocs);
      console.log(`🌱 [Seed] Đã nạp ${prodDocs.length} linh kiện (kèm dữ liệu ảnh nhị phân) vào MongoDB.`);
    }

    // 3. Seed Articles
    const artCount = await Article.countDocuments();
    if (artCount === 0) {
      const artDocs = ARTICLES.map((a) => {
        const bin = loadBinaryImage(a.img);
        return {
          slug: a.slug,
          title: a.title,
          category: a.category,
          catLabel: a.cat_label ?? a.category,
          catColor: a.cat_color ?? null,
          authorName: a.author,
          avatar: a.avatar || "/assets/icons/userlogo.svg",
          published: a.published,
          minutes: a.minutes ?? 5,
          reads: a.reads ?? 0,
          img: a.img ? `/api/articles/${a.slug}/image` : null,
          imageData: bin || { data: null, contentType: "image/png" },
          emoji: a.emoji ?? "🔌",
          gradient: a.gradient ?? null,
          excerpt: a.excerpt ?? "",
          tags: a.tags ?? [],
          toc: a.toc ?? [],
          contentHtml: a.content ?? "",
          featured: Boolean(a.featured),
        };
      });
      await Article.insertMany(artDocs);
      console.log(`🌱 [Seed] Đã nạp ${artDocs.length} bài viết (kèm dữ liệu ảnh nhị phân) vào MongoDB.`);
    }

    // 4. Migration tự động: đồng bộ dữ liệu ảnh nhị phân trực tiếp vào MongoDB cho các document cũ
    const prodsWithoutBinary = await Product.find({
      $or: [
        { "imageData.data": null },
        { imageData: { $exists: false } },
      ],
    });
    if (prodsWithoutBinary.length > 0) {
      let updatedCount = 0;
      for (const p of prodsWithoutBinary) {
        const seedProd = PRODUCTS.find((sp) => sp.slug === p.slug);
        const bin = loadBinaryImage(p.img) || (seedProd ? loadBinaryImage(seedProd.img) : null);
        if (bin) {
          p.imageData = bin;
          p.img = `/api/products/${p.slug}/image`;
          await p.save();
          updatedCount++;
        }
      }
      if (updatedCount > 0) {
        console.log(`📸 [Sync Image] Đã lưu nhị phân trực tiếp ${updatedCount} ảnh sản phẩm vào MongoDB.`);
      }
    }

    const artsWithoutBinary = await Article.find({
      $or: [
        { "imageData.data": null },
        { imageData: { $exists: false } },
      ],
      img: { $ne: null },
    });
    if (artsWithoutBinary.length > 0) {
      let updatedArtCount = 0;
      for (const a of artsWithoutBinary) {
        const seedArt = ARTICLES.find((sa) => sa.slug === a.slug);
        const bin = loadBinaryImage(a.img) || (seedArt ? loadBinaryImage(seedArt.img) : null);
        if (bin) {
          a.imageData = bin;
          a.img = `/api/articles/${a.slug}/image`;
          await a.save();
          updatedArtCount++;
        }
      }
      if (updatedArtCount > 0) {
        console.log(`📸 [Sync Image] Đã lưu nhị phân trực tiếp ${updatedArtCount} ảnh bài viết vào MongoDB.`);
      }
    }
  } catch (err) {
    console.error("⚠️ [Seed] Lỗi khi nạp seed data vào MongoDB:", err.message);
  }
}
