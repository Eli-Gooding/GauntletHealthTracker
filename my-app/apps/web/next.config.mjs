/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  webpack: (config, { isServer }) => {
    // Add support for workspace packages
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      include: [/packages[\\/]ui/],
      use: [{ loader: 'babel-loader' }],
    })
    return config
  },
}

export default nextConfig
