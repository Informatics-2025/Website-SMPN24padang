/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      }
    ],
  },
  // Other Next.js configuration ...
};
 
module.exports = nextConfig;
