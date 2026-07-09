import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
  experimental: {
    allowedDevOrigins: ['soberly-subvermiform-wava.ngrok-free.dev'],
  },
};

export default nextConfig;
