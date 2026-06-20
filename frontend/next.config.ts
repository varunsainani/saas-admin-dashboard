import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Proxy "/api/*" to the backend so the whole product lives behind one URL.
// Override the target for local dev with API_PROXY_TARGET (e.g. http://localhost:4000).
const API_TARGET = process.env.API_PROXY_TARGET || "https://vantage-api-zeta.vercel.app";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_TARGET}/api/:path*` },
      { source: "/health", destination: `${API_TARGET}/health` },
    ];
  },
};

export default withNextIntl(nextConfig);
