/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Azureデプロイ用に変更
  eslint: {
    ignoreDuringBuilds: true,  // ESLintエラーを無視する設定
  },
  // API接続先の設定
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'https://tech0-gen-8-step4-sakepara-backend-a9e9e5gedfevbtfa.australiasoutheast-01.azurewebsites.net'
  }
}

module.exports = nextConfig 