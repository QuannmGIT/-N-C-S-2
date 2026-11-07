import { Router } from "express";
import bcrypt from "bcryptjs";
const { hash, compare } = bcrypt;
import User from "../models/User.js";
import { ApiError } from "../handler/error.js";
import fixedWindowLimiter from "../handler/rate-limit.js";

const authRouter = Router();

// 10 login attempts per IP per 15 min window.
const loginLimiter = fixedWindowLimiter({
  max: 10,
  message: "Quá nhiều lần thử đăng nhập, vui lòng thử lại sau.",
});

const USERNAME_MIN = 3;
const USERNAME_MAX = 30;
const EMAIL_MAX = 254;
const PASSWORD_MIN = 6;
// bcrypt silently truncates input past this length
const PASSWORD_MAX = 72;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9._-]+$/;

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return next(ApiError.unauthorized("Vui lòng đăng nhập"));
  }
  next();
}

/*
 * Login can be a username or an email. Trim always; lowercase only the
 * email-like inputs so email storage stays normalized (usernames stay
 * case-sensitive by design).
 */
function normalizeIdentity(raw) {
  const value = String(raw ?? "").trim();
  return value.includes("@") ? value.toLowerCase() : value;
}

/**
 * Prevent session fixation: rotate the session ID before storing auth data.
 * The store's destroy() handles the "fresh request, no cookie yet" case.
 */
function regenerateSession(req) {
  return new Promise((resolve, reject) =>
    req.session.regenerate((err) => (err ? reject(err) : resolve())),
  );
}

/**
 * Kiểm tra lỗi trùng lặp dữ liệu từ MongoDB (Mongoose duplicate key error code 11000).
 */
function isUniqueViolation(err) {
  return err?.code === 11000;
}

function validatePassword(password, { label = "Mật khẩu" } = {}) {
  if (password.length < PASSWORD_MIN) {
    return ApiError.badRequest(`${label} phải có ít nhất ${PASSWORD_MIN} ký tự`);
  }
  if (password.length > PASSWORD_MAX) {
    return ApiError.badRequest(`${label} dài tối đa ${PASSWORD_MAX} ký tự`);
  }
  return null;
}

authRouter.post("/signup", async (req, res, next) => {
  try {
    const username = String(req.body?.username ?? "").trim();
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");
    const confirmPassword = req.body?.confirmPassword;

    if (!username || !email || !password) {
      return next(ApiError.badRequest("Vui lòng nhập đầy đủ thông tin"));
    }
    if (
      username.length < USERNAME_MIN ||
      username.length > USERNAME_MAX ||
      !USERNAME_RE.test(username)
    ) {
      return next(
        ApiError.badRequest(
          `Tên đăng nhập phải từ ${USERNAME_MIN}-${USERNAME_MAX} ký tự, chỉ gồm chữ, số và dấu . _ -`,
        ),
      );
    }
    if (email.length > EMAIL_MAX || !EMAIL_RE.test(email)) {
      return next(ApiError.badRequest("Email không hợp lệ"));
    }
    const passwordError = validatePassword(password);
    if (passwordError) return next(passwordError);
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return next(ApiError.badRequest("Mật khẩu xác nhận không khớp"));
    }

    // Kiểm tra xem username hoặc email đã tồn tại hay chưa bằng Mongoose
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      return next(ApiError.conflict("Tên đăng nhập hoặc email đã tồn tại"));
    }

    const hashPass = await hash(password, 10);
    const user = await User.create({ username, email, password: hashPass });

    await regenerateSession(req);
    // Lưu ý: MongoDB sử dụng ObjectId dạng chuỗi (hoặc lưu trực tiếp string)
    req.session.userId = user._id.toString();
    req.session.username = user.username;
    res.json({ success: true, username: user.username });
  } catch (err) {
    next(isUniqueViolation(err)
      ? ApiError.conflict("Tên đăng nhập hoặc email đã tồn tại")
      : err);
  }
});

authRouter.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const identity = normalizeIdentity(req.body?.username);
    const password = String(req.body?.password ?? "");

    if (!identity || !password) {
      return next(
        ApiError.badRequest("Vui lòng nhập tên đăng nhập và mật khẩu"),
      );
    }

    // Tìm kiếm user bằng username hoặc email
    const user = await User.findOne({
      $or: [{ username: identity }, { email: identity }],
    });
    if (!user) {
      return next(ApiError.unauthorized("Sai tên đăng nhập hoặc mật khẩu"));
    }

    const match = await compare(password, user.password);
    if (!match) {
      return next(ApiError.unauthorized("Sai tên đăng nhập hoặc mật khẩu"));
    }

    await regenerateSession(req);
    req.session.userId = user._id.toString();
    req.session.username = user.username;
    res.json({ success: true, username: user.username });
  } catch (err) {
    next(err);
  }
});

/**
 * Hàm tìm kiếm hoặc tự động đăng ký tài khoản từ Google vào MongoDB
 */
async function findOrCreateGoogleUser(profile) {
  const queryConditions = [{ email: profile.email }];
  if (profile.googleId) queryConditions.push({ googleId: profile.googleId });

  let user = await User.findOne({ $or: queryConditions });
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    let baseUsername = (profile.name || profile.email.split("@")[0])
      .toLowerCase()
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 24);

    if (baseUsername.length < USERNAME_MIN) {
      baseUsername = "user_" + baseUsername;
    }

    let finalUsername = baseUsername;
    let counter = 1;
    while (await User.findOne({ username: finalUsername })) {
      finalUsername = `${baseUsername.slice(0, 18)}_${counter++}`;
    }

    const randomPassword = await hash(Math.random().toString(36) + Date.now(), 10);
    user = await User.create({
      username: finalUsername,
      email: profile.email,
      password: randomPassword,
      googleId: profile.googleId || null,
      avatar: profile.avatar || "",
      role: "customer",
    });
  } else {
    let changed = false;
    if (profile.googleId && !user.googleId) {
      user.googleId = profile.googleId;
      changed = true;
    }
    if (profile.avatar && !user.avatar) {
      user.avatar = profile.avatar;
      changed = true;
    }
    if (changed) await user.save();
  }

  return { user, isNewUser };
}

// 1. Endpoint trả về cấu hình Google Client ID cho Frontend
authRouter.get("/google/config", (req, res) => {
  res.json({
    configured: Boolean(process.env.GOOGLE_CLIENT_ID),
    clientId: process.env.GOOGLE_CLIENT_ID || "",
  });
});

// 2. Endpoint khởi động luồng Google OAuth 2.0 (Chuyển hướng đến accounts.google.com)
authRouter.get("/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  if (!clientId) {
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent(
        "Chưa cấu hình GOOGLE_CLIENT_ID trong file server/.env",
      )}`,
    );
  }

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `http://localhost:${process.env.PORT || 3000}/api/auth/google/callback`;
  const scope = encodeURIComponent("openid email profile");
  const state = Math.random().toString(36).substring(2);
  req.session.oauthState = state;

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&response_type=code&scope=${scope}&state=${state}&prompt=select_account`;

  res.redirect(googleAuthUrl);
});

// 3. Endpoint tiếp nhận Authorization Code từ Google sau khi người dùng đăng nhập
authRouter.get("/google/callback", async (req, res, next) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  try {
    const { code, error } = req.query;

    if (error) {
      console.warn("[Google OAuth Callback Error]:", error);
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(
          "Người dùng đã hủy xác thực Google",
        )}`,
      );
    }

    if (!code) {
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(
          "Không nhận được mã ủy quyền từ Google",
        )}`,
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `http://localhost:${process.env.PORT || 3000}/api/auth/google/callback`;

    // Gọi API Google để đổi Authorization Code lấy Access Token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error("[Google OAuth Token Exchange Failed]:", errBody);
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(
          "Không thể xác thực mã token từ Google",
        )}`,
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Gọi API UserInfo của Google để lấy thông tin tài khoản thật
    const userInfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!userInfoRes.ok) {
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(
          "Không thể lấy thông tin người dùng từ Google API",
        )}`,
      );
    }

    const gUser = await userInfoRes.json();
    const email = String(gUser.email || "").toLowerCase().trim();
    const name = gUser.name || email.split("@")[0];
    const avatar = gUser.picture || "";
    const googleId = gUser.sub;

    if (!email) {
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(
          "Tài khoản Google không trả về email",
        )}`,
      );
    }

    // Tự động tìm hoặc tạo tài khoản trong MongoDB
    const { user } = await findOrCreateGoogleUser({
      email,
      name,
      avatar,
      googleId,
    });

    // Tạo phiên đăng nhập
    await regenerateSession(req);
    req.session.userId = user._id.toString();
    req.session.username = user.username;

    // Điều hướng về trang đăng nhập với thông báo thành công
    res.redirect(`${frontendUrl}/login?google_login=success`);
  } catch (err) {
    console.error("[Google OAuth Exception]:", err);
    res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent(
        "Lỗi kết nối khi liên kết với Google API",
      )}`,
    );
  }
});

// 4. Endpoint nhận ID Token từ Google Identity Services (GSI)
authRouter.post("/google", async (req, res, next) => {
  try {
    const { credential, email, name, avatar, googleId } = req.body ?? {};
    let profile = {
      email: email ? String(email).trim().toLowerCase() : "",
      name: name ? String(name).trim() : "",
      avatar: avatar || "",
      googleId: googleId || "",
    };

    // Nếu có Google ID token (credential từ Google Identity Services)
    if (credential) {
      try {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`,
        );
        if (verifyRes.ok) {
          const gInfo = await verifyRes.json();
          profile = {
            email: String(gInfo.email || "").toLowerCase().trim(),
            name: gInfo.name || gInfo.email.split("@")[0],
            avatar: gInfo.picture || "",
            googleId: gInfo.sub,
          };
        }
      } catch (e) {
        console.warn("[Google Auth] tokeninfo request failed:", e.message);
      }
    }

    if (!profile.email || !EMAIL_RE.test(profile.email)) {
      return next(ApiError.badRequest("Email Google không hợp lệ"));
    }

    const { user, isNewUser } = await findOrCreateGoogleUser(profile);

    await regenerateSession(req);
    req.session.userId = user._id.toString();
    req.session.username = user.username;

    res.json({
      success: true,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      isNew: isNewUser,
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/change-password", requireAuth, async (req, res, next) => {
  try {
    const currentPassword = String(req.body?.currentPassword ?? "");
    const newPassword = String(req.body?.newPassword ?? "");
    const confirmPassword = req.body?.confirmPassword;

    if (!currentPassword || !newPassword) {
      return next(ApiError.badRequest("Vui lòng nhập đầy đủ mật khẩu"));
    }
    const passwordError = validatePassword(newPassword, {
      label: "Mật khẩu mới",
    });
    if (passwordError) return next(passwordError);
    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return next(ApiError.badRequest("Mật khẩu xác nhận không khớp"));
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return next(ApiError.notFound("Không tìm thấy tài khoản"));
    }

    const match = await compare(currentPassword, user.password);
    if (!match) {
      return next(ApiError.unauthorized("Mật khẩu hiện tại không đúng"));
    }

    const hashPass = await hash(newPassword, 10);
    user.password = hashPass;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.json({ success: true });
  });
});

authRouter.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.json({ loggedIn: false });
  }
  try {
    const user = await User.findById(req.session.userId).select("username email createdAt");
    if (!user) {
      return res.json({ loggedIn: false });
    }
    res.json({
      loggedIn: true,
      username: user.username,
      email: user.email,
      created_at: user.createdAt,
    });
  } catch {
    res.json({ loggedIn: false });
  }
});

/*
 * Directory of registered accounts for logged-in users. Deliberately no
 * email here: only /me exposes the caller's own address.
 */
authRouter.get("/users", requireAuth, async (req, res, next) => {
  try {
    const users = await User.find()
      .select("username createdAt")
      .sort({ _id: -1 })
      .lean();
    res.json(
      users.map((u) => ({
        id: u._id.toString(),
        username: u.username,
        created_at: u.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
});

export default authRouter;