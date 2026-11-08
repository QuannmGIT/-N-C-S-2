import { Router } from "express";
import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Article from "../models/Article.js";
import { ApiError } from "../handler/error.js";
import { loadBinaryImage } from "../database/seed-mongo.js";
import { PRODUCTS, ARTICLES } from "../database/seed.js";

const catalogRouter = Router();

function toBuffer(data) {
  if (!data) return null;
  if (Buffer.isBuffer(data)) return data;
  if (typeof data.value === "function") {
    const val = data.value(true);
    if (Buffer.isBuffer(val)) return val;
  }
  if (Buffer.isBuffer(data.buffer)) return data.buffer;
  if (data.buffer && (data.buffer instanceof ArrayBuffer || ArrayBuffer.isView(data.buffer))) {
    return Buffer.from(data.buffer);
  }
  try {
    return Buffer.from(data);
  } catch {
    return null;
  }
}

// GET /api/categories
catalogRouter.get("/categories", async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(CATEGORIES.map((c) => ({
        key: c.key,
        name: c.name,
        img: c.img,
        productCount: PRODUCTS.filter((p) => p.category === c.key).length,
      })));
    }

    const categories = await Category.find().sort({ order: 1 }).lean();
    const result = await Promise.all(
      categories.map(async (c) => {
        const count = await Product.countDocuments({
          categoryKey: c.key,
          isDeleted: { $ne: true },
          stock: { $gt: 0 },
        });
        return { key: c.key, name: c.name, img: c.img, productCount: count };
      })
    );
    res.json(result);
  } catch (err) {
    // Fallback seed
    res.json(CATEGORIES.map((c) => ({
      key: c.key,
      name: c.name,
      img: c.img,
      productCount: PRODUCTS.filter((p) => p.category === c.key).length,
    })));
  }
});

// GET /api/products/:slug/image - Phục vụ trực tiếp ảnh nhị phân được lưu trong MongoDB
catalogRouter.get("/products/:slug/image", async (req, res, next) => {
  try {
    const { slug } = req.params;
    let prod = null;

    try {
      if (mongoose.connection.readyState === 1) {
        const query = mongoose.Types.ObjectId.isValid(slug)
          ? { $or: [{ slug }, { _id: slug }] }
          : { slug };
        prod = await Product.findOne(query).select("imageData img").lean();
      }
    } catch {
      // Tiếp tục xuống cơ chế fallback nếu chưa kết nối được DB
    }

    // 1. Phục vụ dữ liệu nhị phân nguyên bản từ MongoDB (BinData)
    if (prod?.imageData?.data) {
      const buf = toBuffer(prod.imageData.data);
      if (buf && buf.length > 0) {
        res.set("Content-Type", prod.imageData.contentType || "image/png");
        res.set("Content-Length", buf.length);
        res.set("Cache-Control", "public, max-age=86400");
        return res.end(buf);
      }
    }

    // 2. Phục vụ ảnh Base64 nếu có
    if (prod?.img && prod.img.startsWith("data:")) {
      const match = prod.img.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        const buf = Buffer.from(match[2], "base64");
        res.set("Content-Type", match[1]);
        res.set("Content-Length", buf.length);
        res.set("Cache-Control", "public, max-age=86400");
        return res.end(buf);
      }
    }

    // 3. Fallback đọc file ảnh vật lý từ đĩa nếu MongoDB chưa sẵn sàng
    const seedProd = PRODUCTS.find((p) => p.slug === slug);
    const candidatePaths = [
      prod?.img && !prod.img.includes("/image") ? prod.img : null,
      seedProd?.img,
      `/assets/products/${slug}.png`,
      `/assets/products/${slug}.jpg`,
    ].filter(Boolean);

    for (const relPath of candidatePaths) {
      const clean = relPath.replace(/^\/+/, "");
      const possibleFilePaths = [
        path.resolve(import.meta.dirname, "../../../electrical-store/public", clean),
        path.resolve(import.meta.dirname, "../../../electrical-store/dist", clean),
      ];
      for (const fullPath of possibleFilePaths) {
        if (fs.existsSync(fullPath)) {
          const fileBuf = fs.readFileSync(fullPath);
          const ext = path.extname(fullPath).toLowerCase();
          const contentType =
            ext === ".jpg" || ext === ".jpeg"
              ? "image/jpeg"
              : ext === ".webp"
              ? "image/webp"
              : "image/png";
          res.set("Content-Type", contentType);
          res.set("Content-Length", fileBuf.length);
          res.set("Cache-Control", "public, max-age=86400");
          return res.end(fileBuf);
        }
      }
    }

    res.status(404).send("Image not found");
  } catch (err) {
    next(err);
  }
});

// GET /api/products
catalogRouter.get("/products", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(req.query.limit) || 12));
    const { category, q, sort } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let filtered = [...PRODUCTS];
      if (category && category !== "all") {
        filtered = filtered.filter((p) => p.category === category);
      }
      if (q && q.trim()) {
        const regex = new RegExp(q.trim(), "i");
        filtered = filtered.filter((p) => regex.test(p.name) || regex.test(p.brand) || regex.test(p.specs));
      }
      if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
      else if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
      else if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

      const total = filtered.length;
      const items = filtered.slice((page - 1) * limit, page * limit).map((p) => ({
        slug: p.slug,
        name: p.name,
        category: p.category,
        brand: p.brand,
        specs: p.specs,
        img: `/api/products/${p.slug}/image`,
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        badge: p.badge ?? null,
        stock: p.stock ?? 20,
      }));
      return res.json({
        items,
        total,
        page,
        limit,
        pages: Math.max(1, Math.ceil(total / limit)),
      });
    }

    const filter = { isDeleted: { $ne: true }, stock: { $gt: 0 } };
    if (category && category !== "all") {
      filter.categoryKey = category;
    }
    if (q && q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      filter.$or = [{ name: regex }, { brand: regex }, { specs: regex }];
    }

    let sortOption = { _id: 1 };
    if (sort === "price-asc") sortOption = { price: 1, _id: 1 };
    else if (sort === "price-desc") sortOption = { price: -1, _id: 1 };
    else if (sort === "name") sortOption = { name: 1, _id: 1 };

    const total = await Product.countDocuments(filter);
    const rows = await Product.find(filter)
      .select("-imageData.data")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const items = rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      category: r.categoryKey,
      brand: r.brand,
      specs: r.specs,
      img: `/api/products/${r.slug}/image`,
      price: r.price,
      oldPrice: r.oldPrice ?? null,
      badge: r.badge ?? null,
      stock: r.stock,
    }));

    res.json({
      items,
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:slug
catalogRouter.get("/products/:slug", async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const p = PRODUCTS.find((item) => item.slug === req.params.slug);
      if (!p) return next(ApiError.notFound("Product not found"));
      return res.json({
        slug: p.slug,
        name: p.name,
        category: p.category,
        brand: p.brand,
        specs: p.specs,
        img: `/api/products/${p.slug}/image`,
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        badge: p.badge ?? null,
        stock: p.stock ?? 20,
      });
    }

    const r = await Product.findOne({
      slug: req.params.slug,
      isDeleted: { $ne: true },
      stock: { $gt: 0 },
    })
      .select("-imageData.data")
      .lean();
    if (!r) return next(ApiError.notFound("Product not found"));
    res.json({
      slug: r.slug,
      name: r.name,
      category: r.categoryKey,
      brand: r.brand,
      specs: r.specs,
      img: `/api/products/${r.slug}/image`,
      price: r.price,
      oldPrice: r.oldPrice ?? null,
      badge: r.badge ?? null,
      stock: r.stock,
    });
  } catch (err) {
    const p = PRODUCTS.find((item) => item.slug === req.params.slug);
    if (p) {
      return res.json({
        slug: p.slug,
        name: p.name,
        category: p.category,
        brand: p.brand,
        specs: p.specs,
        img: `/api/products/${p.slug}/image`,
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        badge: p.badge ?? null,
        stock: p.stock ?? 20,
      });
    }
    next(err);
  }
});

const ARTICLE_STATIC_MAP = {
  "esp32-guide": "assets/posts/esp32 getting started.png",
  "arduino-r3-vs-r4": "assets/posts/r3r4.png",
  "i2c-spi-uart": "assets/posts/uartvsi2cvsspi.png",
  "tflite-esp32": "assets/posts/speechrec.png",
  "iot-power-tips": "assets/posts/optimize.png",
  "pwm-guide": "assets/posts/controlling led.png",
  "smart-home-hub": "assets/posts/esp32homeassistant.png",
  "soldering-101": "assets/posts/soldering.png",
  "mqtt-esp32": "assets/posts/mqtt.png",
  "chatgpt-robot-arm": "assets/posts/chatgpt+esp32.png",
};

// GET /api/articles/:slug/image - Phục vụ trực tiếp ảnh nhị phân được lưu trong MongoDB
catalogRouter.get("/articles/:slug/image", async (req, res, next) => {
  try {
    const { slug } = req.params;
    let art = null;

    try {
      if (mongoose.connection.readyState === 1) {
        const query = mongoose.Types.ObjectId.isValid(slug)
          ? { $or: [{ slug }, { _id: slug }] }
          : { slug };
        art = await Article.findOne(query).select("imageData img").lean();
      }
    } catch {
      // Tiếp tục xuống cơ chế fallback nếu chưa kết nối được DB
    }

    // 1. Phục vụ dữ liệu nhị phân từ MongoDB (BinData)
    if (art?.imageData?.data) {
      const buf = toBuffer(art.imageData.data);
      if (buf && buf.length > 0) {
        res.set("Content-Type", art.imageData.contentType || "image/png");
        res.set("Content-Length", buf.length);
        res.set("Cache-Control", "public, max-age=86400");
        return res.end(buf);
      }
    }

    // 2. Phục vụ ảnh Base64 nếu có
    if (art?.img && art.img.startsWith("data:")) {
      const match = art.img.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        const buf = Buffer.from(match[2], "base64");
        res.set("Content-Type", match[1]);
        res.set("Content-Length", buf.length);
        res.set("Cache-Control", "public, max-age=86400");
        return res.end(buf);
      }
    }

    // 3. Fallback đọc file ảnh bài viết từ đĩa nếu MongoDB chưa sẵn sàng hoặc rỗng
    const seedArt = ARTICLES.find((a) => a.slug === slug);
    const candidatePaths = [
      art?.img && !art.img.includes("/image") ? art.img : null,
      seedArt?.img,
      ARTICLE_STATIC_MAP[slug],
      `/assets/posts/${slug}.png`,
      `/assets/posts/${slug}.jpg`,
    ].filter(Boolean);

    for (const relPath of candidatePaths) {
      const clean = relPath.replace(/^\/+/, "");
      const possibleFilePaths = [
        path.resolve(import.meta.dirname, "../../../electrical-store/public", clean),
        path.resolve(import.meta.dirname, "../../../electrical-store/dist", clean),
      ];
      for (const fullPath of possibleFilePaths) {
        if (fs.existsSync(fullPath)) {
          const fileBuf = fs.readFileSync(fullPath);
          const ext = path.extname(fullPath).toLowerCase();
          const contentType =
            ext === ".jpg" || ext === ".jpeg"
              ? "image/jpeg"
              : ext === ".webp"
              ? "image/webp"
              : "image/png";
          res.set("Content-Type", contentType);
          res.set("Content-Length", fileBuf.length);
          res.set("Cache-Control", "public, max-age=86400");
          return res.end(fileBuf);
        }
      }
    }

    res.status(404).send("Image not found");
  } catch (err) {
    next(err);
  }
});

// GET /api/articles
catalogRouter.get("/articles", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(req.query.limit) || 10));
    const { category, q, sort } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let filtered = [...ARTICLES];
      if (category && category !== "All") {
        filtered = filtered.filter((a) => a.category === category);
      }
      if (q && q.trim()) {
        const regex = new RegExp(q.trim(), "i");
        filtered = filtered.filter((a) => regex.test(a.title) || regex.test(a.excerpt));
      }
      if (sort === "oldest") filtered.reverse();
      else if (sort === "popular") filtered.sort((a, b) => (b.reads || 0) - (a.reads || 0));
      else if (sort === "shortest") filtered.sort((a, b) => (a.minutes || 5) - (b.minutes || 5));

      const total = filtered.length;
      const items = filtered.slice((page - 1) * limit, page * limit).map((a) => ({
        slug: a.slug,
        title: a.title,
        category: a.category,
        catLabel: a.cat_label ?? a.category,
        catColor: a.cat_color,
        author: a.author,
        avatar: a.avatar || "/assets/icons/userlogo.svg",
        published: a.published,
        minutes: a.minutes ?? 5,
        reads: a.reads || 0,
        img: a.img || ARTICLE_STATIC_MAP[a.slug] ? `/api/articles/${a.slug}/image` : null,
        emoji: a.emoji ?? "🔌",
        gradient: a.gradient,
        excerpt: a.excerpt,
        tags: a.tags ?? [],
        featured: Boolean(a.featured),
      }));
      return res.json({
        items,
        total,
        page,
        limit,
        pages: Math.max(1, Math.ceil(total / limit)),
      });
    }

    const filter = { isDeleted: { $ne: true } };
    if (category && category !== "All") {
      filter.category = category;
    }
    if (q && q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      filter.$or = [{ title: regex }, { excerpt: regex }];
    }

    let sortOption = { featured: -1, _id: 1 };
    if (sort === "oldest") sortOption = { _id: -1 };
    else if (sort === "popular") sortOption = { reads: -1, _id: 1 };
    else if (sort === "shortest") sortOption = { minutes: 1, _id: 1 };

    const total = await Article.countDocuments(filter);
    const rows = await Article.find(filter)
      .select("-imageData.data")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const items = rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      category: r.category,
      catLabel: r.catLabel ?? r.category,
      catColor: r.catColor,
      author: r.authorName,
      avatar: r.avatar,
      published: r.published,
      minutes: r.minutes,
      reads: r.reads,
      img: (r.img && !r.img.includes("null")) || ARTICLE_STATIC_MAP[r.slug] ? `/api/articles/${r.slug}/image` : null,
      emoji: r.emoji,
      gradient: r.gradient,
      excerpt: r.excerpt,
      tags: r.tags ?? [],
      featured: r.featured,
    }));

    res.json({
      items,
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    const page = Math.max(1, parseInt(req.query?.page) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(req.query?.limit) || 10));
    const items = ARTICLES.slice((page - 1) * limit, page * limit).map((a) => ({
      slug: a.slug,
      title: a.title,
      category: a.category,
      catLabel: a.cat_label ?? a.category,
      catColor: a.cat_color,
      author: a.author,
      avatar: a.avatar || "/assets/icons/userlogo.svg",
      published: a.published,
      minutes: a.minutes ?? 5,
      reads: a.reads || 0,
      img: a.img || ARTICLE_STATIC_MAP[a.slug] ? `/api/articles/${a.slug}/image` : null,
      emoji: a.emoji ?? "🔌",
      gradient: a.gradient,
      excerpt: a.excerpt,
      tags: a.tags ?? [],
      featured: Boolean(a.featured),
    }));
    res.json({
      items,
      total: ARTICLES.length,
      page,
      limit,
      pages: Math.max(1, Math.ceil(ARTICLES.length / limit)),
    });
  }
});

// GET /api/articles/:slug
catalogRouter.get("/articles/:slug", async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const art = ARTICLES.find((a) => a.slug === req.params.slug);
      if (!art) return next(ApiError.notFound("Article not found"));
      return res.json({
        slug: art.slug,
        title: art.title,
        category: art.category,
        catLabel: art.cat_label ?? art.category,
        catColor: art.cat_color,
        author: art.author,
        avatar: art.avatar || "/assets/icons/userlogo.svg",
        published: art.published,
        minutes: art.minutes ?? 5,
        reads: art.reads || 0,
        img: art.img || ARTICLE_STATIC_MAP[art.slug] ? `/api/articles/${art.slug}/image` : null,
        emoji: art.emoji ?? "🔌",
        gradient: art.gradient,
        excerpt: art.excerpt,
        tags: art.tags ?? [],
        toc: art.toc ?? [],
        content: art.content,
        featured: Boolean(art.featured),
      });
    }

    const r = await Article.findOneAndUpdate(
      { slug: req.params.slug, isDeleted: { $ne: true } },
      { $inc: { reads: 1 } },
      { new: true }
    )
      .select("-imageData.data")
      .lean();
    if (!r) return next(ApiError.notFound("Article not found"));

    res.json({
      slug: r.slug,
      title: r.title,
      category: r.category,
      catLabel: r.catLabel ?? r.category,
      catColor: r.catColor,
      author: r.authorName,
      avatar: r.avatar,
      published: r.published,
      minutes: r.minutes,
      reads: r.reads,
      img: (r.img && !r.img.includes("null")) || ARTICLE_STATIC_MAP[r.slug] ? `/api/articles/${r.slug}/image` : null,
      emoji: r.emoji,
      gradient: r.gradient,
      excerpt: r.excerpt,
      tags: r.tags ?? [],
      toc: r.toc ?? [],
      content: r.contentHtml,
      featured: r.featured,
    });
  } catch (err) {
    const art = ARTICLES.find((a) => a.slug === req.params.slug);
    if (art) {
      return res.json({
        slug: art.slug,
        title: art.title,
        category: art.category,
        catLabel: art.cat_label ?? art.category,
        catColor: art.cat_color,
        author: art.author,
        avatar: art.avatar || "/assets/icons/userlogo.svg",
        published: art.published,
        minutes: art.minutes ?? 5,
        reads: art.reads || 0,
        img: art.img || ARTICLE_STATIC_MAP[art.slug] ? `/api/articles/${art.slug}/image` : null,
        emoji: art.emoji ?? "🔌",
        gradient: art.gradient,
        excerpt: art.excerpt,
        tags: art.tags ?? [],
        toc: art.toc ?? [],
        content: art.content,
        featured: Boolean(art.featured),
      });
    }
    next(err);
  }
});

function extractTocFromHtml(html) {
  if (!html) return [];
  const matches = [...String(html).matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
  return matches.map((m) => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean);
}

// POST /api/articles (Đăng bài viết mới của người dùng)
catalogRouter.post("/articles", async (req, res, next) => {
  try {
    if (!req.session?.userId && !req.session?.username) {
      return next(ApiError.unauthorized("Vui lòng đăng nhập tài khoản để đăng bài viết"));
    }

    const {
      title,
      category,
      authorName,
      minutes,
      excerpt,
      contentHtml,
      img,
      tags,
    } = req.body ?? {};

    if (!title || !String(title).trim()) {
      return next(ApiError.badRequest("Vui lòng nhập tiêu đề bài viết"));
    }
    if (!category || !String(category).trim()) {
      return next(ApiError.badRequest("Vui lòng chọn chuyên mục bài viết"));
    }

    const baseSlug = String(title)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const slug = `${baseSlug || "post"}-${Date.now().toString().slice(-4)}`;

    const now = new Date();
    const dateFormatted = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string" && tags.trim()
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const finalContentHtml =
      contentHtml && String(contentHtml).trim()
        ? String(contentHtml).trim()
        : `<p>${String(excerpt || title).trim()}</p>`;

    const calculatedMinutes =
      Number(minutes) > 0
        ? Number(minutes)
        : Math.max(2, Math.ceil(finalContentHtml.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length / 160));

    const bin = loadBinaryImage(img);

    const article = await Article.create({
      slug,
      title: String(title).trim(),
      category: String(category).trim(),
      catLabel: String(category).trim(),
      authorName: authorName ? String(authorName).trim() : req.session.username || "Thành viên VoltCore",
      authorId: req.session.userId || null,
      avatar: req.session.avatar || "/assets/icons/userlogo.svg",
      published: dateFormatted,
      minutes: calculatedMinutes,
      reads: 0,
      img: bin ? `/api/articles/${slug}/image` : (img && !img.startsWith("data:") ? img : null),
      imageData: bin || { data: null, contentType: "image/png" },
      emoji: "🔌",
      excerpt: excerpt ? String(excerpt).trim() : "",
      contentHtml: finalContentHtml,
      tags: parsedTags,
      toc: extractTocFromHtml(finalContentHtml),
      featured: false,
      isDeleted: false,
    });

    res.json({ success: true, article, slug: article.slug });
  } catch (err) {
    next(err);
  }
});

// GET /api/user/articles (Danh sách bài viết của người dùng hiện tại)
catalogRouter.get("/user/articles", async (req, res, next) => {
  try {
    if (!req.session?.userId && !req.session?.username) {
      return next(ApiError.unauthorized("Vui lòng đăng nhập tài khoản"));
    }

    const query = {
      $or: [
        ...(req.session.userId ? [{ authorId: req.session.userId }] : []),
        ...(req.session.username ? [{ authorName: req.session.username }] : []),
      ],
      isDeleted: { $ne: true },
    };

    const articles = await Article.find(query)
      .select("-imageData.data")
      .sort({ createdAt: -1 })
      .lean();
    res.json(articles);
  } catch (err) {
    next(err);
  }
});

// PUT /api/user/articles/:id (Cập nhật bài viết của người dùng)
catalogRouter.put("/user/articles/:id", async (req, res, next) => {
  try {
    if (!req.session?.userId && !req.session?.username) {
      return next(ApiError.unauthorized("Vui lòng đăng nhập tài khoản"));
    }

    const article = await Article.findById(req.params.id);
    if (!article) return next(ApiError.notFound("Không tìm thấy bài viết"));

    const isAuthor =
      (article.authorId && req.session.userId && article.authorId.toString() === req.session.userId) ||
      article.authorName === req.session.username ||
      req.session.role === "admin";

    if (!isAuthor) {
      return next(ApiError.forbidden("Bạn không có quyền chỉnh sửa bài viết này"));
    }

    const {
      title,
      category,
      authorName,
      minutes,
      excerpt,
      contentHtml,
      img,
      tags,
    } = req.body ?? {};

    if (!title || !String(title).trim()) {
      return next(ApiError.badRequest("Vui lòng nhập tiêu đề bài viết"));
    }
    if (!category || !String(category).trim()) {
      return next(ApiError.badRequest("Vui lòng chọn chuyên mục bài viết"));
    }

    const updateData = {
      title: String(title).trim(),
      category: String(category).trim(),
      catLabel: String(category).trim(),
    };
    if (authorName !== undefined) updateData.authorName = String(authorName).trim();
    if (minutes !== undefined) updateData.minutes = Number(minutes) > 0 ? Number(minutes) : 5;
    if (excerpt !== undefined) updateData.excerpt = String(excerpt).trim();
    if (contentHtml !== undefined) {
      updateData.contentHtml = String(contentHtml).trim();
      updateData.toc = extractTocFromHtml(updateData.contentHtml);
    }
    if (img !== undefined) {
      const rawImg = String(img).trim();
      if (rawImg) {
        const bin = loadBinaryImage(rawImg);
        if (bin) {
          updateData.imageData = bin;
          updateData.img = `/api/articles/${article.slug}/image`;
        } else {
          updateData.img = rawImg;
        }
      } else {
        updateData.img = null;
        updateData.imageData = { data: null, contentType: "image/png" };
      }
    }
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags)
        ? tags
        : typeof tags === "string"
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
    }

    const updated = await Article.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, article: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/user/articles/:id (Xóa hoặc ẩn bài viết của người dùng)
catalogRouter.delete("/user/articles/:id", async (req, res, next) => {
  try {
    if (!req.session?.userId && !req.session?.username) {
      return next(ApiError.unauthorized("Vui lòng đăng nhập tài khoản"));
    }

    const article = await Article.findById(req.params.id);
    if (!article) return next(ApiError.notFound("Không tìm thấy bài viết"));

    const isAuthor =
      (article.authorId && req.session.userId && article.authorId.toString() === req.session.userId) ||
      article.authorName === req.session.username ||
      req.session.role === "admin";

    if (!isAuthor) {
      return next(ApiError.forbidden("Bạn không có quyền xóa bài viết này"));
    }

    article.isDeleted = true;
    await article.save();
    res.json({ success: true, message: `Đã xóa bài viết ${article.title}` });
  } catch (err) {
    next(err);
  }
});

export default catalogRouter;
