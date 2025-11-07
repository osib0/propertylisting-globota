import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "royalrajasthantravel.s3.amazonaws.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname:"royalrajasthantravel.s3.amazonaws.com",
        pathname: "**",
      }
    ],
  }
};

export default nextConfig;
