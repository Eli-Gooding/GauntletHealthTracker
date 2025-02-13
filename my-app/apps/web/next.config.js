/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ['@workspace/ui'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/components': './components',
    };
    return config;
  },
}
