import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  outputFileTracingRoot: path.join(__dirname),
  outputFileTracingIncludes: {
    '/**': ['./server/db/fitconnect.db'],
  },
};

export default nextConfig;
