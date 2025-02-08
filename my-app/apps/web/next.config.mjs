/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  webpack: (config, { isServer }) => {
    // Add support for workspace packages
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      include: [/packages[\\/]ui/, /components/],
      use: [{ loader: 'babel-loader' }],
    })
    return config
  },
  experimental: {
    // This will allow Next.js to resolve packages from the monorepo
    outputFileTracingRoot: "../../",
    serverActions: true,
  }
}

export default nextConfig
