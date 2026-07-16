/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Dozvoli slike sa svih https domena (slike dolaze sa raznih shop CDN-ova)
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    unoptimized: true,
  },
  serverExternalPackages: ['@prisma/client'],
}

module.exports = nextConfig
