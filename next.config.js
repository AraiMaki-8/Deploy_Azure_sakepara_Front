/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,  // ESLintエラーを無視する設定
  }
}

module.exports = nextConfig 