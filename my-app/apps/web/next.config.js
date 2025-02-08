/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ["@workspace/ui"],
  experimental: {
    // This will allow Next.js to resolve packages from the monorepo
    outputFileTracingRoot: "../../",
    serverActions: true,
  }
}
