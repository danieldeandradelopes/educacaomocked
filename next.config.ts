/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Optional: when NEXT_PUBLIC_API_URL is unset, the app uses Next /api routes.
    // When json-server is running, you can point the client to it via NEXT_PUBLIC_API_URL.
    return [];
  },
};

export default nextConfig;
