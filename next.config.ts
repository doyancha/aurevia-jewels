import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com', port: '', pathname: '/rbilnol2/image/upload/**', search: '' }],
  },
};

export default nextConfig;
