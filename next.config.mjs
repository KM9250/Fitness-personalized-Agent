/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable server-side usage of better-sqlite3
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
  },
  images: {
    remotePatterns: [],
    // Allow SVG avatars
    dangerouslyAllowSVG: true,
  },
  // Webpack config for better-sqlite3 native module
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("better-sqlite3");
    }
    return config;
  },
};

export default nextConfig;
