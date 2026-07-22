import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
  async redirects() {
    return [
      // Landing route: send "/" straight to the default category tab.
      { source: "/", destination: "/home/trending", permanent: false },
    ];
  },
};

export default nextConfig;
