const path = require("path");

const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET || "http://host.docker.internal:8003";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_PROXY_TARGET}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
