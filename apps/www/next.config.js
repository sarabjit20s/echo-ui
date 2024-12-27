import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: 'i.imghippo.com',
        pathname: '/**',
        port: '',
        protocol: 'https',
        search: '',
      },
    ],
  },
};

export default withMDX(config);
