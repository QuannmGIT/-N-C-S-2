import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Article from "../models/Article.js";
import { CATEGORIES, PRODUCTS, ARTICLES } from "./seed.js";

export async function seedMongoDB() {
  try {
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
      const prodDocs = PRODUCTS.map((p) => ({
        slug: p.slug,
        name: p.name,
        categoryKey: p.category,
        brand: p.brand,
        specs: p.specs ?? "",
        img: p.img,
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        badge: p.badge ?? null,
        stock: p.stock ?? 0,
      }));
      await Product.insertMany(prodDocs);
      console.log(`🌱 [Seed] Đã nạp ${prodDocs.length} linh kiện vào MongoDB.`);
    }

    // 3. Seed Articles
    const artCount = await Article.countDocuments();
    if (artCount === 0) {
      const artDocs = ARTICLES.map((a) => ({
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
        img: a.img ?? null,
        emoji: a.emoji ?? "🔌",
        gradient: a.gradient ?? null,
        excerpt: a.excerpt ?? "",
        tags: a.tags ?? [],
        toc: a.toc ?? [],
        contentHtml: a.content ?? "",
        featured: Boolean(a.featured),
      }));
      await Article.insertMany(artDocs);
      console.log(`🌱 [Seed] Đã nạp ${artDocs.length} bài viết vào MongoDB.`);
    }
  } catch (err) {
    console.error("⚠️ [Seed] Lỗi khi nạp seed data vào MongoDB:", err.message);
  }
}
