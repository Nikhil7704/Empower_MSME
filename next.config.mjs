/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow LangChain + Gemini packages to run in Next.js server components
  serverExternalPackages: [
    "@langchain/google-genai",
    "@langchain/core",
    "langchain",
  ],
  // Empty turbopack config to satisfy Next.js 16 requirement when using serverExternalPackages
  turbopack: {},
}

export default nextConfig
