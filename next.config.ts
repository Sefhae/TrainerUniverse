import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Keep pg out of the bundle so its dynamic requires resolve at runtime.
  serverExternalPackages: ['pg'],
  // Pin the tracing root to this project (there's a stray lockfile in the home dir).
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
