import { useState, useEffect } from "react";

const MONO = "'JetBrains Mono', monospace";

export const BLOCK_TYPES = [
  { key: "h2", label: "Tiêu đề phụ (H2)", icon: "📑", desc: '<h2 id="s0">...</h2> (Tự động tạo id mục lục s0, s1...)' },
  { key: "h3", label: "Tiêu đề nhỏ (H3)", icon: "📌", desc: "<h3>...</h3> (Tiêu đề phân đoạn nhỏ hơn)" },
  { key: "p", label: "Đoạn văn (P)", icon: "📝", desc: "<p>...</p> (Nội dung văn bản thông thường)" },
  { key: "code", label: "Mã nguồn (Code)", icon: "💻", desc: "<pre><code>...</code></pre> (Khối mã lập trình C++, JS, Python...)" },
  { key: "info", label: "Hộp ghi chú (Info)", icon: "💡", desc: '<div class="info-box">...</div> (Hộp lưu ý nổi bật với icon bóng đèn)' },
  { key: "quote", label: "Trích dẫn (Quote)", icon: "💬", desc: "<blockquote><p>...</p></blockquote> (Khối trích dẫn / lưu ý)" },
  { key: "list", label: "Danh sách (List)", icon: "📋", desc: "<ul><li>...</li></ul> (Danh sách gạch đầu dòng từ mỗi dòng nhập)" },
  { key: "image", label: "Hình ảnh (Image)", icon: "🖼️", desc: "Chèn ảnh minh họa hiển thị vào bài viết" },
  { key: "raw", label: "Mã HTML tùy chỉnh", icon: "⚡", desc: "Mã HTML tự do do bạn tự viết" },
];

/**
 * Sinh mã HTML cho một khối nội dung cụ thể
 */
export function generateBlockHtml(block, allBlocks) {
  const text = block.content || "";
  switch (block.type) {
    case "h2": {
      const h2List = allBlocks.filter((b) => b.type === "h2");
      const h2Idx = h2List.findIndex((b) => b.id === block.id);
      const sId = `s${h2Idx >= 0 ? h2Idx : 0}`;
      return `<h2 id="${sId}">${text || "Why ESP32?"}</h2>`;
    }
    case "h3":
      return `<h3>${text || "Tiêu đề mục nhỏ"}</h3>`;
    case "p": {
      const formatted = text ? text.replace(/\n/g, "<br/>") : "Nội dung đoạn văn...";
      return `<p>${formatted}</p>`;
    }
    case "code": {
      const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<pre><code>${escaped || "// Viết mã code tại đây..."}</code></pre>`;
    }
    case "info": {
      const formatted = text ? text.replace(/\n/g, "<br/>") : "Nội dung ghi chú lưu ý...";
      return `<div class="info-box">\n  <span class="icon">💡</span>\n  <p>${formatted}</p>\n</div>`;
    }
    case "quote": {
      const formatted = text ? text.replace(/\n/g, "<br/>") : "Nội dung trích dẫn...";
      return `<blockquote>\n  <p>${formatted}</p>\n</blockquote>`;
    }
    case "list": {
      const lines = (text || "Mục 1\nMục 2\nMục 3")
        .split("\n")
        .map((l) => l.trim().replace(/^[•\-\*]\s*/, ""))
        .filter(Boolean);
      return `<ul>\n${lines.map((li) => `  <li>${li}</li>`).join("\n")}\n</ul>`;
    }
    case "image": {
      const src = text.trim() || "/assets/img/esp32 getting started.png";
      return `<figure style="margin: 16px 0; text-align: center;"><img src="${src}" alt="Hình ảnh minh họa" style="max-width: 100%; max-height: 380px; object-fit: contain; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);" /></figure>`;
    }
    case "raw":
    default:
      return text || "<!-- Mã HTML tùy chỉnh -->";
  }
}

/**
 * Ghép toàn bộ các khối thành chuỗi mã HTML hoàn chỉnh
 */
export function compileBlocksToHtml(blocks) {
  let h2Count = 0;
  return blocks
    .map((b) => {
      const text = b.content || "";
      if (!text.trim() && b.type !== "raw") return "";
      switch (b.type) {
        case "h2": {
          const sId = `s${h2Count++}`;
          return `<h2 id="${sId}">${text.trim()}</h2>`;
        }
        case "h3":
          return `<h3>${text.trim()}</h3>`;
        case "p":
          return `<p>${text.trim().replace(/\n/g, "<br/>")}</p>`;
        case "code": {
          const escaped = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          return `<pre><code>${escaped.trim()}</code></pre>`;
        }
        case "info":
          return `<div class="info-box">\n  <span class="icon">💡</span>\n  <p>${text.trim().replace(/\n/g, "<br/>")}</p>\n</div>`;
        case "quote":
          return `<blockquote>\n  <p>${text.trim().replace(/\n/g, "<br/>")}</p>\n</blockquote>`;
        case "list": {
          const lines = text
            .split("\n")
            .map((l) => l.trim().replace(/^[•\-\*]\s*/, ""))
            .filter(Boolean);
          if (lines.length === 0) return "";
          return `<ul>\n${lines.map((li) => `  <li>${li}</li>`).join("\n")}\n</ul>`;
        }
        case "image": {
          const src = text.trim() || "/assets/img/esp32 getting started.png";
          return `<figure style="margin: 20px 0; text-align: center;">\n  <img src="${src}" alt="Hình ảnh minh họa" style="max-width: 100%; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);" />\n</figure>`;
        }
        case "raw":
        default:
          return text;
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Phân tích chuỗi HTML có sẵn thành danh sách khối
 */
export function parseHtmlToBlocks(htmlString) {
  if (!htmlString || !htmlString.trim()) {
    return [
      {
        id: "b_" + Date.now() + "_1",
        type: "h2",
        content: "Why ESP32?",
      },
      {
        id: "b_" + Date.now() + "_2",
        type: "p",
        content: "ESP32 là vi điều khiển mạnh mẽ giá rẻ tích hợp WiFi và Bluetooth dành cho các dự án IoT...",
      },
    ];
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const bodyChildren = Array.from(doc.body.children);

    if (bodyChildren.length === 0) {
      return [
        {
          id: "b_" + Date.now(),
          type: "p",
          content: htmlString.trim(),
        },
      ];
    }

    const blocks = [];
    bodyChildren.forEach((el, idx) => {
      const tagName = el.tagName.toLowerCase();
      const id = "b_" + Date.now() + "_" + idx;

      if (tagName === "h2") {
        blocks.push({
          id,
          type: "h2",
          content: el.textContent.trim(),
        });
      } else if (tagName === "h3") {
        blocks.push({
          id,
          type: "h3",
          content: el.textContent.trim(),
        });
      } else if (tagName === "p") {
        blocks.push({
          id,
          type: "p",
          content: el.innerHTML.trim().replace(/<br\s*\/?>/gi, "\n"),
        });
      } else if (tagName === "pre") {
        const codeEl = el.querySelector("code");
        blocks.push({
          id,
          type: "code",
          content: codeEl ? codeEl.textContent : el.textContent,
        });
      } else if (el.classList.contains("info-box")) {
        const pEl = el.querySelector("p");
        blocks.push({
          id,
          type: "info",
          content: pEl ? pEl.innerHTML.trim() : el.innerHTML.trim(),
        });
      } else if (tagName === "blockquote") {
        const pEl = el.querySelector("p");
        blocks.push({
          id,
          type: "quote",
          content: pEl ? pEl.innerHTML.trim() : el.innerHTML.trim(),
        });
      } else if (tagName === "ul" || tagName === "ol") {
        const lis = Array.from(el.querySelectorAll("li")).map((li) => li.textContent.trim());
        blocks.push({
          id,
          type: "list",
          content: lis.join("\n"),
        });
      } else if (tagName === "figure" || tagName === "img") {
        const imgEl = tagName === "img" ? el : el.querySelector("img");
        blocks.push({
          id,
          type: "image",
          content: imgEl ? imgEl.getAttribute("src") : "",
        });
      } else {
        blocks.push({
          id,
          type: "raw",
          content: el.outerHTML,
        });
      }
    });

    return blocks.length > 0
      ? blocks
      : [
          {
            id: "b_" + Date.now(),
            type: "raw",
            content: htmlString,
          },
        ];
  } catch {
    return [
      {
        id: "b_" + Date.now(),
        type: "raw",
        content: htmlString,
      },
    ];
  }
}

/**
 * Component Trình Dựng Nội Dung Chi Tiết Bài Viết Theo Khối
 * - Bên trái: Ô nhập nội dung & Khung xem trước mã code HTML sinh ra
 * - Bên phải: Các nút tính năng (Tiêu đề phụ, Tiêu đề nhỏ, Đoạn văn, Mã nguồn...)
 * - Dưới cùng: Nút "+" lớn để thêm khối nội dung mới
 */
export default function ArticleContentBuilder({ value, onChange }) {
  // Chế độ xem: "builder" (Dựng khối) | "code" (Mã HTML tổng) | "preview" (Xem trước bài viết)
  const [editorMode, setEditorMode] = useState("builder");
  const [blocks, setBlocks] = useState(() => parseHtmlToBlocks(value));
  const [blockViewModes, setBlockViewModes] = useState({}); // id -> "content" | "code"
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Đồng bộ ra ngoài onChange khi blocks thay đổi
  useEffect(() => {
    const compiled = compileBlocksToHtml(blocks);
    if (compiled !== value) {
      onChange(compiled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  // Cập nhật nội dung một khối
  const handleUpdateBlockContent = (id, newContent) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content: newContent } : b))
    );
  };

  // Thay đổi loại tính năng của khối (bấm nút bên phải)
  const handleChangeBlockType = (id, newType) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, type: newType } : b))
    );
  };

  // Thêm khối mới ở dưới cùng
  const handleAddBlock = (defaultType = "p") => {
    const newBlock = {
      id: "b_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      type: defaultType,
      content: defaultType === "h2" ? "Tiêu đề mới" : "",
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  // Xóa một khối
  const handleDeleteBlock = (id) => {
    if (blocks.length <= 1) {
      // Giữ lại ít nhất 1 khối rỗng
      setBlocks([
        {
          id: "b_" + Date.now(),
          type: "p",
          content: "",
        },
      ]);
      return;
    }
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  // Di chuyển khối lên / xuống
  const handleMoveBlock = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    setBlocks((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  // Đổi chế độ xem riêng của một khối (Nhập nội dung vs Xem code)
  const toggleBlockViewMode = (id) => {
    setBlockViewModes((prev) => ({
      ...prev,
      [id]: prev[id] === "code" ? "content" : "code",
    }));
  };

  // Sao chép toàn bộ HTML
  const handleCopyHtml = () => {
    const compiled = compileBlocksToHtml(blocks);
    navigator.clipboard.writeText(compiled);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const h2Count = blocks.filter((b) => b.type === "h2").length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        background: "#080c10",
        border: "1px solid rgba(0, 229, 255, 0.25)",
        borderRadius: "10px",
        padding: "16px",
        fontFamily: MONO,
        width: "100%",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {/* 1. THANH ĐIỀU HƯỚNG CHẾ ĐỘ XEM TRÊN CÙNG */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          paddingBottom: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setEditorMode("builder")}
            style={{
              background: editorMode === "builder" ? "#00e5ff" : "rgba(255, 255, 255, 0.05)",
              color: editorMode === "builder" ? "#080c10" : "#7a8fa6",
              border: editorMode === "builder" ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
              padding: "7px 14px",
              borderRadius: "6px",
              fontFamily: "inherit",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s",
            }}
          >
            🧱 Trình dựng khối (Nội dung &amp; Nút tính năng)
          </button>

          <button
            type="button"
            onClick={() => setEditorMode("code")}
            style={{
              background: editorMode === "code" ? "#00e5ff" : "rgba(255, 255, 255, 0.05)",
              color: editorMode === "code" ? "#080c10" : "#7a8fa6",
              border: editorMode === "code" ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
              padding: "7px 14px",
              borderRadius: "6px",
              fontFamily: "inherit",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s",
            }}
          >
            💻 Xem toàn bộ mã HTML tổng
          </button>

          <button
            type="button"
            onClick={() => setEditorMode("preview")}
            style={{
              background: editorMode === "preview" ? "#00ff88" : "rgba(255, 255, 255, 0.05)",
              color: editorMode === "preview" ? "#080c10" : "#7a8fa6",
              border: editorMode === "preview" ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
              padding: "7px 14px",
              borderRadius: "6px",
              fontFamily: "inherit",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s",
            }}
          >
            👁️ Xem trước bài viết
          </button>
        </div>

        <div style={{ fontSize: "0.74rem", color: "#7a8fa6", display: "flex", alignItems: "center", gap: "10px" }}>
          <span>
            Tổng: <strong style={{ color: "#00e5ff" }}>{blocks.length}</strong> khối
          </span>
          <span>•</span>
          <span>
            Mục lục (H2): <strong style={{ color: "#00ff88" }}>{h2Count}</strong> mục
          </span>
        </div>
      </div>

      {/* 2. CHẾ ĐỘ 1: TRÌNH DỰNG KHỐI (BUILDER VIEW) */}
      {editorMode === "builder" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {blocks.map((block, index) => {
            const currentTypeObj = BLOCK_TYPES.find((t) => t.key === block.type) || BLOCK_TYPES[2];
            const isCodeMode = blockViewModes[block.id] === "code";
            const generatedHtml = generateBlockHtml(block, blocks);

            return (
              <div
                key={block.id}
                style={{
                  background: "#0d141e",
                  border:
                    block.type === "h2"
                      ? "1px solid rgba(0, 229, 255, 0.4)"
                      : block.type === "code"
                      ? "1px solid rgba(0, 255, 136, 0.35)"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  padding: "16px",
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) 210px",
                  gap: "18px",
                  width: "100%",
                  boxSizing: "border-box",
                  overflowX: "hidden",
                  boxShadow:
                    block.type === "h2"
                      ? "0 0 12px rgba(0, 229, 255, 0.08)"
                      : "none",
                }}
              >
                {/* CỘT TRÁI: KHUNG NHẬP NỘI DUNG VÀ MÃ CODE SINH RA */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
                  {/* Thanh tiêu đề khối */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: "0.74rem",
                          background: "rgba(255, 255, 255, 0.08)",
                          color: "#fff",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          fontWeight: 700,
                        }}
                      >
                        #{index + 1}
                      </span>

                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: block.type === "h2" ? "#00e5ff" : "#00ff88",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {currentTypeObj.icon} {currentTypeObj.label}
                      </span>
                    </div>

                    {/* Nút thao tác nhanh của khối */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {/* Nút chuyển đổi giữa Nhập Nội dung & Xem Code */}
                      <button
                        type="button"
                        onClick={() => toggleBlockViewMode(block.id)}
                        style={{
                          background: isCodeMode ? "rgba(0, 229, 255, 0.2)" : "rgba(255, 255, 255, 0.06)",
                          border: isCodeMode ? "1px solid #00e5ff" : "1px solid rgba(255, 255, 255, 0.15)",
                          color: isCodeMode ? "#00e5ff" : "#7a8fa6",
                          padding: "3px 9px",
                          borderRadius: "4px",
                          fontFamily: "inherit",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {isCodeMode ? "✏️ Sửa nội dung" : "💻 Xem code riêng"}
                      </button>

                      {/* Di chuyển lên */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveBlock(index, -1)}
                        title="Di chuyển lên trên"
                        style={{
                          background: "transparent",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          color: index === 0 ? "#4a5568" : "#e8edf2",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          cursor: index === 0 ? "not-allowed" : "pointer",
                          fontSize: "0.72rem",
                        }}
                      >
                        ⬆️
                      </button>

                      {/* Di chuyển xuống */}
                      <button
                        type="button"
                        disabled={index === blocks.length - 1}
                        onClick={() => handleMoveBlock(index, 1)}
                        title="Di chuyển xuống dưới"
                        style={{
                          background: "transparent",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          color: index === blocks.length - 1 ? "#4a5568" : "#e8edf2",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          cursor: index === blocks.length - 1 ? "not-allowed" : "pointer",
                          fontSize: "0.72rem",
                        }}
                      >
                        ⬇️
                      </button>

                      {/* Xóa khối */}
                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(block.id)}
                        title="Xóa đoạn này"
                        style={{
                          background: "rgba(255, 75, 75, 0.1)",
                          border: "1px solid rgba(255, 75, 75, 0.3)",
                          color: "#ff4b4b",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.72rem",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* VÙNG NHẬP NỘI DUNG (HOẶC XEM CODE RIÊNG) */}
                  {!isCodeMode ? (
                    <div>
                      <textarea
                        rows={
                          block.type === "h2" || block.type === "h3"
                            ? 2
                            : block.type === "code"
                            ? 6
                            : block.type === "list"
                            ? 4
                            : 3
                        }
                        value={block.content}
                        onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                        placeholder={
                          block.type === "h2"
                            ? "vd: Why ESP32?"
                            : block.type === "h3"
                            ? "vd: 1. Cài đặt Driver CH340 và nạp board"
                            : block.type === "p"
                            ? "vd: Nhập nội dung đoạn văn bài viết..."
                            : block.type === "code"
                            ? "vd: #include <WiFi.h>\nvoid setup() {\n  Serial.begin(115200);\n}"
                            : block.type === "info"
                            ? "vd: So với Arduino Uno, ESP32 nhanh gấp 10 lần và có sẵn WiFi..."
                            : block.type === "quote"
                            ? "vd: Lời khuyên: Luôn dùng nguồn 5V/2A ổn định khi bật WiFi ESP32..."
                            : block.type === "list"
                            ? "vd: Mỗi dòng là một mục:\nBước 1: Chuẩn bị linh kiện\nBước 2: Nối dây sơ đồ\nBước 3: Nạp code"
                            : "Nhập mã HTML tùy chỉnh..."
                        }
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "10px 12px",
                          background: "#05080c",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: "6px",
                          color:
                            block.type === "h2"
                              ? "#00e5ff"
                              : block.type === "code"
                              ? "#00ff88"
                              : "#fff",
                          fontFamily: MONO,
                          fontSize: block.type === "h2" ? "0.92rem" : "0.82rem",
                          fontWeight: block.type === "h2" ? 700 : 400,
                          resize: "vertical",
                          lineHeight: "1.5",
                        }}
                      />
                    </div>
                  ) : (
                    /* Chế độ xem mã code riêng của khối */
                    <div>
                      <textarea
                        rows={4}
                        readOnly
                        value={generatedHtml}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "10px 12px",
                          background: "#030609",
                          border: "1px solid #00e5ff",
                          borderRadius: "6px",
                          color: "#00e5ff",
                          fontFamily: MONO,
                          fontSize: "0.8rem",
                          resize: "vertical",
                          lineHeight: "1.4",
                        }}
                      />
                    </div>
                  )}

                  {/* GIAO DIỆN HIỂN THỊ THỰC TẾ TRÊN TRANG BÀI BÁO */}
                  <div
                    style={{
                      background: "#f5f2ec",
                      border: "1px solid rgba(26, 22, 18, 0.15)",
                      borderRadius: "10px",
                      padding: "16px 20px",
                      minWidth: 0,
                      width: "100%",
                      boxSizing: "border-box",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.12)",
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#1a1612",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "#7a7068",
                        marginBottom: "12px",
                        paddingBottom: "8px",
                        borderBottom: "1px solid rgba(26, 22, 18, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>👁️</span>
                      <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#c8410f" }}>
                        Xem trước giao diện hiển thị trên Blog:
                      </span>
                    </div>

                    {/* Vùng hiển thị trực quan */}
                    <div
                      className="block-preview-box"
                      dangerouslySetInnerHTML={{ __html: generatedHtml }}
                      style={{
                        minHeight: "24px",
                      }}
                    />
                  </div>
                </div>

                {/* CỘT PHẢI: CÁC NÚT TÍNH NĂNG ĐỂ CHỌN KIỂU ĐỊNH DẠNG */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
                    paddingLeft: "14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "#7a8fa6",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      marginBottom: "4px",
                    }}
                  >
                    Tính năng định dạng:
                  </div>

                  {BLOCK_TYPES.map((typeObj) => {
                    const isSelected = block.type === typeObj.key;
                    return (
                      <button
                        key={typeObj.key}
                        type="button"
                        onClick={() => handleChangeBlockType(block.id, typeObj.key)}
                        title={typeObj.desc}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          fontFamily: "inherit",
                          fontSize: "0.75rem",
                          fontWeight: isSelected ? 800 : 500,
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.15s ease",
                          background: isSelected
                            ? typeObj.key === "h2"
                              ? "#00e5ff"
                              : typeObj.key === "code"
                              ? "#00ff88"
                              : "#1e3a5f"
                            : "rgba(255, 255, 255, 0.03)",
                          color: isSelected
                            ? typeObj.key === "h2" || typeObj.key === "code"
                              ? "#080c10"
                              : "#fff"
                            : "#94a3b8",
                          border: isSelected
                            ? typeObj.key === "h2"
                              ? "1px solid #00e5ff"
                              : typeObj.key === "code"
                              ? "1px solid #00ff88"
                              : "1px solid #00e5ff"
                            : "1px solid rgba(255, 255, 255, 0.07)",
                          boxShadow: isSelected
                            ? typeObj.key === "h2"
                              ? "0 0 10px rgba(0, 229, 255, 0.4)"
                              : typeObj.key === "code"
                              ? "0 0 10px rgba(0, 255, 136, 0.4)"
                              : "none"
                            : "none",
                        }}
                      >
                        <span style={{ fontSize: "0.9rem" }}>{typeObj.icon}</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {typeObj.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* DẤU "+" Ở DƯỚI ĐỂ THÊM NỘI DUNG MỚI */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              padding: "16px",
              background: "#0d141e",
              border: "2px dashed rgba(0, 229, 255, 0.3)",
              borderRadius: "8px",
            }}
          >
            <button
              type="button"
              onClick={() => handleAddBlock("p")}
              style={{
                background: "linear-gradient(135deg, #00e5ff 0%, #00ff88 100%)",
                border: "none",
                color: "#080c10",
                fontWeight: 800,
                fontSize: "0.86rem",
                padding: "10px 24px",
                borderRadius: "8px",
                fontFamily: "inherit",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 0 16px rgba(0, 229, 255, 0.35)",
                transition: "transform 0.1s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <span style={{ fontSize: "1.2rem", fontWeight: 900 }}>+</span> Thêm khối nội dung mới
            </button>

            {/* Các nút bấm tắt để thêm nhanh theo loại */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
              <span style={{ fontSize: "0.72rem", color: "#7a8fa6", alignSelf: "center" }}>
                Thêm nhanh:
              </span>
              <button
                type="button"
                onClick={() => handleAddBlock("h2")}
                style={{
                  background: "rgba(0, 229, 255, 0.1)",
                  border: "1px solid rgba(0, 229, 255, 0.3)",
                  color: "#00e5ff",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "0.72rem",
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                + 📑 Tiêu đề phụ (H2)
              </button>
              <button
                type="button"
                onClick={() => handleAddBlock("p")}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#e8edf2",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "0.72rem",
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                + 📝 Đoạn văn (P)
              </button>
              <button
                type="button"
                onClick={() => handleAddBlock("code")}
                style={{
                  background: "rgba(0, 255, 136, 0.1)",
                  border: "1px solid rgba(0, 255, 136, 0.3)",
                  color: "#00ff88",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "0.72rem",
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                + 💻 Mã nguồn (Code)
              </button>
              <button
                type="button"
                onClick={() => handleAddBlock("info")}
                style={{
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  color: "#f59e0b",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "0.72rem",
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                + 💡 Hộp ghi chú
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CHẾ ĐỘ 2: TOÀN BỘ MÃ HTML TỔNG (CODE VIEW) */}
      {editorMode === "code" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.76rem", color: "#7a8fa6" }}>
              Đây là toàn bộ mã HTML được tự động sinh ra từ các khối nội dung:
            </span>
            <button
              type="button"
              onClick={handleCopyHtml}
              style={{
                background: copiedNotification ? "#00ff88" : "rgba(0, 229, 255, 0.15)",
                border: "1px solid #00e5ff",
                color: copiedNotification ? "#080c10" : "#00e5ff",
                fontWeight: 700,
                fontSize: "0.75rem",
                padding: "5px 12px",
                borderRadius: "4px",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              {copiedNotification ? "✓ Đã sao chép!" : "📋 Sao chép toàn bộ HTML"}
            </button>
          </div>

          <textarea
            rows={12}
            value={compileBlocksToHtml(blocks)}
            onChange={(e) => {
              // Khi sửa trực tiếp trên mã HTML tổng, cập nhật đồng thời vào chuỗi value
              onChange(e.target.value);
            }}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              background: "#05080c",
              border: "1px solid rgba(0, 229, 255, 0.3)",
              borderRadius: "6px",
              color: "#00e5ff",
              fontFamily: MONO,
              fontSize: "0.82rem",
              lineHeight: "1.5",
              resize: "vertical",
            }}
          />

          <div style={{ fontSize: "0.72rem", color: "#7a8fa6" }}>
            * Mẹo: Bạn có thể chuyển lại sang tab <strong>&quot;Trình dựng khối&quot;</strong> bất cứ lúc nào để tiếp tục chỉnh sửa từng đoạn trực quan.
          </div>
        </div>
      )}

      {/* 4. CHẾ ĐỘ 3: XEM TRƯỚC BÀI VIẾT (LIVE PREVIEW) */}
      {editorMode === "preview" && (
        <div
          style={{
            background: "#f5f2ec",
            border: "1px solid rgba(26, 22, 18, 0.18)",
            borderRadius: "12px",
            padding: "36px 42px",
            minHeight: "300px",
            color: "#1a1612",
            lineHeight: "1.7",
            fontFamily: "'JetBrains Mono', monospace",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.14)",
          }}
        >
          <div
            style={{
              fontSize: "0.76rem",
              color: "#c8410f",
              fontWeight: 700,
              marginBottom: "24px",
              paddingBottom: "12px",
              borderBottom: "1px solid rgba(26, 22, 18, 0.12)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>👁️</span>
            <span>Xem trước giao diện hiển thị trên Blog (/blog/:slug):</span>
          </div>

          {/* Render HTML Content với style mô phỏng bài viết thực */}
          <div
            className="post-content-preview"
            dangerouslySetInnerHTML={{ __html: compileBlocksToHtml(blocks) }}
            style={{
              fontSize: "0.92rem",
            }}
          />
        </div>
      )}

      {/* STYLES MÔ PHỎNG CHUẨN XÁC 100% GIAO DIỆN BÀI VIẾT BLOG (/blog/:slug & post-page.css) */}
      <style>{`
        .block-preview-box, .post-content-preview {
          color: #3d3630 !important;
          font-family: 'JetBrains Mono', monospace !important;
        }

        .block-preview-box h2, .post-content-preview h2 {
          font-family: 'JetBrains Mono', monospace !important;
          font-weight: 700 !important;
          font-size: 1.5rem !important;
          letter-spacing: -0.02em !important;
          color: #1a1612 !important;
          margin: 18px 0 12px !important;
          padding-left: 16px !important;
          border-left: 3px solid #c8410f !important;
        }

        .block-preview-box h3, .post-content-preview h3 {
          font-family: 'JetBrains Mono', monospace !important;
          font-weight: 700 !important;
          font-size: 1.1rem !important;
          color: #1a1612 !important;
          margin: 16px 0 10px !important;
        }

        .block-preview-box p, .post-content-preview p {
          font-family: 'JetBrains Mono', monospace !important;
          font-size: 0.92rem !important;
          color: #3d3630 !important;
          line-height: 1.85 !important;
          margin-bottom: 14px !important;
        }

        .block-preview-box ul, .post-content-preview ul,
        .block-preview-box ol, .post-content-preview ol {
          padding-left: 24px !important;
          margin-bottom: 16px !important;
        }

        .block-preview-box li, .post-content-preview li {
          font-family: 'JetBrains Mono', monospace !important;
          font-size: 0.92rem !important;
          color: #3d3630 !important;
          line-height: 1.75 !important;
          margin-bottom: 6px !important;
        }

        /* Inline code */
        .block-preview-box code, .post-content-preview code {
          font-family: 'JetBrains Mono', monospace !important;
          background: #ede9e0 !important;
          border: 1px solid rgba(26, 22, 18, 0.1) !important;
          border-radius: 5px !important;
          padding: 2px 8px !important;
          font-size: 0.84rem !important;
          color: #c8410f !important;
        }

        /* Preformatted Code Block */
        .block-preview-box pre, .post-content-preview pre {
          background: #1a1612 !important;
          border-radius: 14px !important;
          padding: 20px 24px !important;
          margin: 18px 0 !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          overflow-x: auto !important;
        }

        .block-preview-box pre code, .post-content-preview pre code {
          background: none !important;
          border: none !important;
          padding: 0 !important;
          color: #e8e0d5 !important;
          font-size: 0.85rem !important;
          line-height: 1.7 !important;
        }

        /* Blockquote */
        .block-preview-box blockquote, .post-content-preview blockquote {
          border-left: 3px solid #1a6b4a !important;
          padding: 14px 18px !important;
          margin: 18px 0 !important;
          background: rgba(26, 107, 74, 0.06) !important;
          border-radius: 0 10px 10px 0 !important;
        }

        .block-preview-box blockquote p, .post-content-preview blockquote p {
          color: #3d3630 !important;
          font-style: italic !important;
          margin: 0 !important;
        }

        /* Info box */
        .block-preview-box .info-box, .post-content-preview .info-box {
          background: rgba(37, 99, 168, 0.06) !important;
          border: 1px solid rgba(37, 99, 168, 0.2) !important;
          border-left: 4px solid #2563a8 !important;
          border-radius: 14px !important;
          padding: 16px 20px !important;
          margin: 18px 0 !important;
          display: flex !important;
          gap: 14px !important;
          align-items: flex-start !important;
        }

        .block-preview-box .info-box .icon, .post-content-preview .info-box .icon {
          font-size: 1.3rem !important;
          flex-shrink: 0 !important;
          margin-top: 2px !important;
        }

        .block-preview-box .info-box p, .post-content-preview .info-box p {
          margin: 0 !important;
          font-size: 0.88rem !important;
          color: #3d3630 !important;
          line-height: 1.7 !important;
          display: block !important;
        }

        /* Figures & Images */
        .block-preview-box figure, .post-content-preview figure {
          margin: 18px 0 !important;
          text-align: center !important;
        }

        .block-preview-box figure img, .post-content-preview figure img {
          max-width: 100% !important;
          max-height: 420px !important;
          border-radius: 12px !important;
          border: 1px solid rgba(26, 22, 18, 0.1) !important;
          object-fit: contain !important;
          background: #ede9e0 !important;
        }

        .block-preview-box figcaption, .post-content-preview figcaption {
          font-size: 0.78rem !important;
          color: #7a7068 !important;
          margin-top: 6px !important;
          font-style: italic !important;
        }
      `}</style>
    </div>
  );
}
