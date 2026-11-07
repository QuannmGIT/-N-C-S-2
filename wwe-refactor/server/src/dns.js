import dns from "node:dns";

// Thiết lập Google DNS 8.8.8.8 / Cloudflare DNS 1.1.1.1 toàn cục
// để giải quyết triệt để lỗi querySrv ENOTFOUND trên mạng VN / Windows
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch (e) {
  // Bỏ qua nếu môi trường không cho phép
}
