import { Router } from "express";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Article from "../models/Article.js";
import { ApiError } from "../handler/error.js";

const catalogRouter = Router();

// GET /api/categories
catalogRouter.get("/categories", async (req, res, next) => {
  try {
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
    next(err);
  }
});

// GET /api/products
catalogRouter.get("/products", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(req.query.limit) || 12));
    const { category, q, sort } = req.query;

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
      img: r.img,
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
    const r = await Product.findOne({
      slug: req.params.slug,
      isDeleted: { $ne: true },
      stock: { $gt: 0 },
    }).lean();
    if (!r) return next(ApiError.notFound("Product not found"));
    res.json({
      slug: r.slug,
      name: r.name,
      category: r.categoryKey,
      brand: r.brand,
      specs: r.specs,
      img: r.img,
      price: r.price,
      oldPrice: r.oldPrice ?? null,
      badge: r.badge ?? null,
      stock: r.stock,
    });
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

    const filter = { isDeleted: { $ne: true } };
    if (category && category !== "All") {
      filter.category = category;
    }
    if (q && q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      filter.$or = [{ title: regex }, { excerpt: regex }];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1, _id: 1 };
    else if (sort === "popular") sortOption = { reads: -1, _id: 1 };
    else if (sort === "shortest") sortOption = { minutes: 1, _id: 1 };

    const total = await Article.countDocuments(filter);
    const rows = await Article.find(filter)
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
      img: r.img,
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
    next(err);
  }
});

// GET /api/articles/:slug
catalogRouter.get("/articles/:slug", async (req, res, next) => {
  try {
    const r = await Article.findOneAndUpdate(
      { slug: req.params.slug, isDeleted: { $ne: true } },
      { $inc: { reads: 1 } },
      { new: true }
    ).lean();
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
      img: r.img,
      emoji: r.emoji,
      gradient: r.gradient,
      excerpt: r.excerpt,
      tags: r.tags ?? [],
      toc: r.toc ?? [],
      content: r.contentHtml,
      featured: r.featured,
    });
  } catch (err) {
    next(err);
  }
});

export default catalogRouter;
