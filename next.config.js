/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [new URL('https://s3.amazonaws.com/**'), new URL('https://chain-icons.s3.amazonaws.com/**'), new URL('https://chains.s3.amazonaws.com/**')],
      },
};

module.exports = nextConfig;
