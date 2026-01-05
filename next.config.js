/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
  // Add this to silence the warning and prepare for future versions
  allowedDevOrigins: [
    "10.27.4.16",  // Your network IP
    "*.10.27.4.16", // For any subdomains if needed
  ],
};

export default nextConfig;