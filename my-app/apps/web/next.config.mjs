/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  experimental: {
    // This will allow Next.js to resolve packages from the monorepo
    outputFileTracingRoot: "../../",
    serverActions: true,
  }
}

export default nextConfig
