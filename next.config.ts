
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.c',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media-alpha-green.vercel.app',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    allowedDevOrigins: [
      'https://6000-firebase-studio-1750328114377.cluster-fdkw7vjj7bgguspe3fbbc25tra.cloudworkstations.dev',
      'https://9000-firebase-studio-1750328114377.cluster-fdkw7vjj7bgguspe3fbbc25tra.cloudworkstations.dev',
      // You might need to add other origins if you access your dev server from other URLs
    ],
  },
};

export default nextConfig;
