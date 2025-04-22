/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,  // ESLintエラーを無視する設定
  },
  // 静的エクスポートの設定
  images: {
    unoptimized: true // 静的エクスポートに必要
  }
}

module.exports = nextConfig 