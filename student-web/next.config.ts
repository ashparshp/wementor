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
  // @ts-ignore - Some NextConfig types haven't updated for this yet
  allowedDevOrigins: ['soberly-subvermiform-wava.ngrok-free.dev'],
};

export default nextConfig;
