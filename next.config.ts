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
  }
};

export default nextConfig;
