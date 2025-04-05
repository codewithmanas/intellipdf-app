import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactStrictMode: false,
  /* config options here */
  // experimental: {
  //    turbo: {
  //       resolveAlias: {
  //        canvas: './empty-module.ts',
  //       },
  //     },
  //  },
  // swcMinify: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },

  // serverExternalPackages: ["pdf-parse"],
  // typescript: {
  //   ignoreBuildErrors: true,
  // },

  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack(config) {
    // Disable CSS minimizer plugin for easier debugging
    config.optimization.minimize = false;
    return config;
  },
};

export default nextConfig;
