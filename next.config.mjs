/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@sis-thesqd/mmq-component'],
    experimental: {
        optimizePackageImports: ["@untitledui/icons"],
    },
};

export default nextConfig;
