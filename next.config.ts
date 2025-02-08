import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "img.icons8.com",
      "images.unsplash.com",
      "zolostays.com",
      "www.issuewire.com",
      "www.aimsindia.com",
      "www.kauveryhospital.com",
      "www.apollohospitals.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", 
      },
    ],
  },
};

export default nextConfig;
