import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Optimize for production */
  reactStrictMode: true,
  
  /* Ensure dynamic routes are not cached */
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};

export default nextConfig;
