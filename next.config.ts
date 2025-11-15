import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // imagekit integration can be added here in the future
images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
        pathname: "**", // allows all image paths from ImageKit
      },
    ],
  },

};

export default nextConfig;
