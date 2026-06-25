/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: '*.polo-motorrad.com' },
      { protocol: 'https', hostname: '*.louis.de' },
      { protocol: 'https', hostname: '*.fc-moto.de' },
      { protocol: 'https', hostname: '*.probikeshop.com' },
      { protocol: 'https', hostname: '*.hein-gericke.com' },
      { protocol: 'https', hostname: '*.motoin.de' },
      { protocol: 'https', hostname: '*.xlmoto.com' },
    ],
    unoptimized: true,
  },
  serverExternalPackages: ['@prisma/client'],
}

module.exports = nextConfig
