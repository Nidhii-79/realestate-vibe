/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // keep the local embedding model out of the webpack bundle
    serverComponentsExternalPackages: ['@xenova/transformers', 'onnxruntime-node', 'sharp'],
  },
};
export default nextConfig;
