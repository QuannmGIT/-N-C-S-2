import { Router } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Article from "../models/Article.js";
import Order from "../models/Order.js";
import { ApiError } from "../handler/error.js";
import { seedMongoDB, loadBinaryImage } from "../database/seed-mongo.js";

const adminRouter = Router();

function requireAdmin(req, res, next) {
  if (req.session?.role !== "admin") {
    return next(ApiError.forbidden("Yêu cầu quyền Dev/Admin"));
  }
  next();
}

/**
 * 1. Đăng nhập dành riêng cho Dev / Admin
 * Tài khoản: gay | Mật khẩu: mafugay
 */
adminRouter.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return next(ApiError.badRequest("Vui lòng nhập tài khoản và mật khẩu"));
    }

    const admin = await User.findOne({ username: String(username).trim() });
    if (!admin || admin.role !== "admin") {
      return next(ApiError.unauthorized("Tài khoản không có quyền Admin"));
    }

    const isMatch = await bcrypt.compare(String(password), admin.password);
    if (!isMatch) {
      return next(ApiError.unauthorized("Mật khẩu không chính xác"));
    }

    // Khởi tạo phiên đăng nhập Admin
    req.session.userId = admin._id.toString();
    req.session.username = admin.username;
    req.session.role = "admin";

    res.json({
      success: true,
      username: admin.username,
      role: admin.role,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 2. Đăng xuất Admin
 */
adminRouter.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

/**
 * 3. Kiểm tra phiên đăng nhập Admin hiện tại
 */
adminRouter.get("/me", async (req, res) => {
  if (req.session?.role !== "admin") {
    return res.json({ loggedIn: false });
  }
  res.json({
    loggedIn: true,
    username: req.session.username,
    role: req.session.role,
  });
});

/**
 * 4. Thống kê hệ thống dành cho Dev Dashboard
 */
adminRouter.get("/stats", requireAdmin, async (req, res, next) => {
  try {
    const [userCount, googleUserCount, productCount, catCount, articleCount] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ googleId: { $ne: null } }),
        Product.countDocuments(),
        Category.countDocuments(),
        Article.countDocuments(),
      ]);

    const memUsage = process.memoryUsage();

    res.json({
      database: {
        status:
          mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
        name: mongoose.connection.name || "voltcore_db",
        host: mongoose.connection.host || "Atlas Cluster",
      },
      counts: {
        users: userCount,
        googleUsers: googleUserCount,
        products: productCount,
        categories: catCount,
        articles: articleCount,
      },
      system: {
        nodeVersion: process.version,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryRssMb: (memUsage.rss / 1024 / 1024).toFixed(1),
        memoryHeapMb: (memUsage.heapUsed / 1024 / 1024).toFixed(1),
        platform: process.platform,
        googleOauthConfigured: Boolean(process.env.GOOGLE_CLIENT_ID),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 5. Danh sách toàn bộ người dùng
 */
adminRouter.get("/users", requireAdmin, async (req, res, next) => {
  try {
    const users = await User.find()
      .select("username email role googleId avatar createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      users.map((u) => ({
        id: u._id.toString(),
        username: u.username,
        email: u.email,
        role: u.role,
        isGoogleUser: Boolean(u.googleId),
        avatar: u.avatar || null,
        createdAt: u.createdAt,
      })),
    );
  } catch (err) {
    next(err);
  }
});

/**
 * 6. Xóa người dùng (Không cho phép xóa admin 'gay')
 */
adminRouter.delete("/users/:id", requireAdmin, async (req, res, next) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return next(ApiError.notFound("Không tìm thấy người dùng"));
    if (target.username === "gay") {
      return next(ApiError.badRequest("Không được phép xóa tài khoản Dev/Admin gốc"));
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: `Đã xóa người dùng @${target.username}` });
  } catch (err) {
    next(err);
  }
});

/**
 * 7. Danh sách toàn bộ linh kiện trong kho (Bao gồm cả linh kiện đã ẩn)
 */
adminRouter.get("/products", requireAdmin, async (req, res, next) => {
  try {
    const products = await Product.find()
      .select("-imageData.data")
      .sort({ createdAt: -1 })
      .lean();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

/**
 * 8. Thêm linh kiện mới vào MongoDB
 */
adminRouter.post("/products", requireAdmin, async (req, res, next) => {
  try {
    const { name, categoryKey, brand, price, oldPrice, stock, specs, img, badge } =
      req.body ?? {};

    if (!name || !categoryKey || price === undefined || price === "") {
      return next(ApiError.badRequest("Vui lòng điền tên, danh mục và giá sản phẩm"));
    }

    const numPrice = Number(price);
    const numStock = stock !== undefined && stock !== "" ? Number(stock) : 0;

    if (numPrice < 0) {
      return next(ApiError.badRequest("Giá sản phẩm không thể âm (phải >= 0)"));
    }
    if (numStock < 0) {
      return next(ApiError.badRequest("Số lượng tồn kho không thể âm (phải >= 0)"));
    }

    if (!img || !String(img).trim()) {
      return next(ApiError.badRequest("Vui lòng tải lên ảnh sản phẩm từ máy tính"));
    }

    const baseSlug = String(name)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const slug = `${baseSlug || "item"}-${Date.now().toString().slice(-4)}`;

    // Khi số lượng về 0 thì sản phẩm phải bị ẩn đi khỏi cửa hàng
    const shouldHide = numStock <= 0;

    const bin = loadBinaryImage(img);

    const product = await Product.create({
      slug,
      name: String(name).trim(),
      categoryKey: String(categoryKey).trim(),
      brand: brand ? String(brand).trim() : "VoltCore",
      specs: specs ? String(specs).trim() : "",
      img: `/api/products/${slug}/image`,
      imageData: bin || { data: null, contentType: "image/png" },
      price: numPrice,
      oldPrice: oldPrice ? Number(oldPrice) : null,
      stock: numStock,
      badge: badge || null,
      isDeleted: shouldHide,
    });

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

/**
 * 9. Cập nhật thông tin linh kiện (Tên, danh mục, giá bán, tồn kho, ảnh, specs)
 */
adminRouter.put("/products/:id", requireAdmin, async (req, res, next) => {
  try {
    const { name, categoryKey, brand, price, oldPrice, stock, specs, img } = req.body ?? {};
    if (!name || !categoryKey || price === undefined || price === "") {
      return next(ApiError.badRequest("Vui lòng điền đủ tên, danh mục và giá sản phẩm"));
    }

    const numPrice = Number(price);
    const numStock = stock !== undefined && stock !== "" ? Number(stock) : 0;

    if (numPrice < 0) {
      return next(ApiError.badRequest("Giá sản phẩm không thể âm (phải >= 0)"));
    }
    if (numStock < 0) {
      return next(ApiError.badRequest("Số lượng tồn kho không thể âm (phải >= 0)"));
    }

    const updateData = {
      name: String(name).trim(),
      categoryKey: String(categoryKey).trim(),
      price: numPrice,
      stock: numStock,
    };
    if (brand !== undefined) updateData.brand = String(brand).trim();
    if (specs !== undefined) updateData.specs = String(specs).trim();
    if (img !== undefined && String(img).trim()) {
      const rawImg = String(img).trim();
      const bin = loadBinaryImage(rawImg);
      if (bin) {
        updateData.imageData = bin;
        const existing = await Product.findById(req.params.id).select("slug");
        if (existing) {
          updateData.img = `/api/products/${existing.slug}/image`;
        } else {
          updateData.img = rawImg;
        }
      } else {
        updateData.img = rawImg;
      }
    }
    if (oldPrice !== undefined) updateData.oldPrice = oldPrice ? Number(oldPrice) : null;

    // Khi số lượng về 0 thì sản phẩm phải bị ẩn đi khỏi cửa hàng
    if (numStock <= 0) {
      updateData.isDeleted = true;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return next(ApiError.notFound("Không tìm thấy sản phẩm"));
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

/**
 * 10. Bật/Tắt ẩn linh kiện (Xóa mềm - Ẩn khỏi cửa hàng, trang quản lý vẫn thấy)
 */
adminRouter.patch("/products/:id/toggle-hide", requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(ApiError.notFound("Không tìm thấy sản phẩm"));
    product.isDeleted = !product.isDeleted;
    await product.save();
    res.json({
      success: true,
      isDeleted: product.isDeleted,
      message: product.isDeleted
        ? `Đã ẩn "${product.name}" khỏi cửa hàng (Admin vẫn thấy)`
        : `Đã khôi phục "${product.name}" hiển thị trên cửa hàng`,
      product,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 11. Xóa vĩnh viễn linh kiện khỏi MongoDB
 */
adminRouter.delete("/products/:id", requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return next(ApiError.notFound("Không tìm thấy sản phẩm"));
    res.json({ success: true, message: `Đã xóa vĩnh viễn ${product.name}` });
  } catch (err) {
    next(err);
  }
});

/**
 * 12. Reset hoặc Nạp lại dữ liệu mẫu (Seed Data)
 */
adminRouter.post("/reset-seed", requireAdmin, async (req, res, next) => {
  try {
    await seedMongoDB();
    res.json({ success: true, message: "Đã nạp lại dữ liệu MongoDB thành công" });
  } catch (err) {
    next(err);
  }
});

/**
 * 13. Danh sách toàn bộ bài viết Blog (Bao gồm cả bài viết đã ẩn)
 */
adminRouter.get("/articles", requireAdmin, async (req, res, next) => {
  try {
    const articles = await Article.find()
      .select("-imageData.data")
      .sort({ createdAt: -1 })
      .lean();
    res.json(articles);
  } catch (err) {
    next(err);
  }
});

function extractTocFromHtml(html) {
  if (!html) return [];
  const matches = [...String(html).matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
  return matches.map((m) => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean);
}

/**
 * 14. Tạo bài viết mới lên Blog
 */
adminRouter.post("/articles", requireAdmin, async (req, res, next) => {
  try {
    const {
      title,
      category,
      authorName,
      minutes,
      excerpt,
      contentHtml,
      img,
      featured,
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

    const finalContentHtml = contentHtml && String(contentHtml).trim() ? String(contentHtml).trim() : `<p>${String(excerpt || title).trim()}</p>`;

    const bin = loadBinaryImage(img);

    const article = await Article.create({
      slug,
      title: String(title).trim(),
      category: String(category).trim(),
      catLabel: String(category).trim(),
      authorName: authorName ? String(authorName).trim() : req.session.username || "VoltCore Dev Team",
      published: dateFormatted,
      minutes: Number(minutes) > 0 ? Number(minutes) : 5,
      reads: 0,
      img: bin ? `/api/articles/${slug}/image` : (img && String(img).trim() ? String(img).trim() : null),
      imageData: bin || { data: null, contentType: "image/png" },
      emoji: "🔌",
      excerpt: excerpt ? String(excerpt).trim() : "",
      contentHtml: finalContentHtml,
      tags: parsedTags,
      toc: extractTocFromHtml(finalContentHtml),
      featured: Boolean(featured),
      isDeleted: false,
    });

    res.json({ success: true, article });
  } catch (err) {
    next(err);
  }
});

/**
 * 15. Cập nhật bài viết Blog
 */
adminRouter.put("/articles/:id", requireAdmin, async (req, res, next) => {
  try {
    const {
      title,
      category,
      authorName,
      minutes,
      excerpt,
      contentHtml,
      img,
      featured,
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
          const existing = await Article.findById(req.params.id).select("slug");
          if (existing) {
            updateData.img = `/api/articles/${existing.slug}/image`;
          } else {
            updateData.img = rawImg;
          }
        } else {
          updateData.img = rawImg;
        }
      } else {
        updateData.img = null;
        updateData.imageData = { data: null, contentType: "image/png" };
      }
    }
    if (featured !== undefined) updateData.featured = Boolean(featured);
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags)
        ? tags
        : typeof tags === "string"
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
    }

    const article = await Article.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!article) return next(ApiError.notFound("Không tìm thấy bài viết"));
    res.json({ success: true, article });
  } catch (err) {
    next(err);
  }
});

/**
 * 16. Bật/Tắt ẩn bài viết Blog (Xóa mềm - Ẩn khỏi Blog, admin vẫn thấy)
 */
adminRouter.patch("/articles/:id/toggle-hide", requireAdmin, async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return next(ApiError.notFound("Không tìm thấy bài viết"));
    article.isDeleted = !article.isDeleted;
    await article.save();
    res.json({
      success: true,
      isDeleted: article.isDeleted,
      message: article.isDeleted
        ? `Đã ẩn bài viết "${article.title}" khỏi Blog (Admin vẫn thấy)`
        : `Đã khôi phục hiển thị "${article.title}" trên Blog`,
      article,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 17. Xóa vĩnh viễn bài viết khỏi MongoDB
 */
adminRouter.delete("/articles/:id", requireAdmin, async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return next(ApiError.notFound("Không tìm thấy bài viết"));
    res.json({ success: true, message: `Đã xóa bài viết ${article.title}` });
  } catch (err) {
    next(err);
  }
});

/**
 * 18. Quản lý doanh thu & danh sách đơn hàng cho Dev
 */
adminRouter.get("/revenue", requireAdmin, async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    let totalRevenue = 0;
    let pendingRevenue = 0;
    let paidOrdersCount = 0;
    let unpaidOrdersCount = 0;
    let cancelledOrdersCount = 0;
    let vietqrRevenue = 0;
    let codRevenue = 0;

    const productSalesMap = {};

    for (const ord of orders) {
      if (ord.paymentStatus === "PAID") {
        totalRevenue += ord.totalAmount || 0;
        paidOrdersCount += 1;
        if (ord.paymentMethod === "BANK_TRANSFER") {
          vietqrRevenue += ord.totalAmount || 0;
        } else if (ord.paymentMethod === "COD") {
          codRevenue += ord.totalAmount || 0;
        }

        // Tích lũy doanh số sản phẩm đã thanh toán
        if (Array.isArray(ord.items)) {
          for (const item of ord.items) {
            const key = item.slug || item.name;
            if (!productSalesMap[key]) {
              productSalesMap[key] = {
                name: item.name,
                slug: item.slug,
                image: item.image,
                quantity: 0,
                revenue: 0,
              };
            }
            productSalesMap[key].quantity += item.quantity || 1;
            productSalesMap[key].revenue += (item.price || 0) * (item.quantity || 1);
          }
        }
      } else if (ord.status === "CANCELLED") {
        cancelledOrdersCount += 1;
      } else {
        pendingRevenue += ord.totalAmount || 0;
        unpaidOrdersCount += 1;
      }
    }

    const topProducts = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue).slice(0, 8);

    res.json({
      summary: {
        totalRevenue,
        pendingRevenue,
        totalOrders: orders.length,
        paidOrdersCount,
        unpaidOrdersCount,
        cancelledOrdersCount,
        vietqrRevenue,
        codRevenue,
        aov: paidOrdersCount > 0 ? Math.round(totalRevenue / paidOrdersCount) : 0,
      },
      orders,
      topProducts,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 19. Cập nhật trạng thái đơn hàng & gạch nợ thanh toán
 */
adminRouter.patch("/orders/:id/status", requireAdmin, async (req, res, next) => {
  try {
    const { status, paymentStatus, note } = req.body ?? {};
    const order = await Order.findById(req.params.id);
    if (!order) return next(ApiError.notFound("Không tìm thấy đơn hàng"));

    if (status && ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"].includes(status)) {
      order.status = status;
    }
    if (paymentStatus && ["UNPAID", "PAID"].includes(paymentStatus)) {
      order.paymentStatus = paymentStatus;
    }

    order.statusHistory.push({
      status: order.status,
      changedAt: new Date(),
      note: note || `Admin cập nhật: Trạng thái ${order.status}, Thanh toán ${order.paymentStatus}`,
    });

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

/**
 * 20. Xóa đơn hàng
 */
adminRouter.delete("/orders/:id", requireAdmin, async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return next(ApiError.notFound("Không tìm thấy đơn hàng"));
    res.json({ success: true, message: `Đã xóa đơn hàng ${order.orderCode}` });
  } catch (err) {
    next(err);
  }
});

export default adminRouter;
