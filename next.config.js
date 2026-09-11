/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/roulette-defis",
        destination: "/roulette-questions",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
