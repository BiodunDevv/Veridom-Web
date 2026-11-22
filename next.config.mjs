/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      { source: "/auth/login", destination: "/?auth=login", permanent: false },
      {
        source: "/auth/register",
        destination: "/?auth=register",
        permanent: false,
      },
    ]
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "")

    return backendUrl
      ? [{ source: "/backend/:path*", destination: `${backendUrl}/:path*` }]
      : []
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
}

export default nextConfig
