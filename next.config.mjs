/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // This is a workaround for a bug in Next.js where it tries to bundle
    // canvas on the server.
    config.externals = [...config.externals, { canvas: "canvas" }];

    // This is the definitive fix. We are telling webpack to not bundle these
    // packages. They will be available on the server at runtime.
    config.externals.push(
      '@browserbasehq/stagehand',
      'puppeteer',
      'playwright-core',
      'electron'
    );
    
    return config;
  },
}

export default nextConfig