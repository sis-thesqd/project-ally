import { NextFederationPlugin } from '@module-federation/nextjs-mf';

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ["@untitledui/icons"],
    },
    webpack(config, options) {
        const { isServer } = options;

        config.plugins.push(
            new NextFederationPlugin({
                name: 'projectAlly',
                remotes: {
                    mmq: `mmq@${process.env.NEXT_PUBLIC_MMQ_REMOTE_URL || 'https://mmq-modular.vercel.app'}/_next/static/chunks/remoteEntry.js`,
                },
                filename: 'static/chunks/remoteEntry.js',
                exposes: {},
                shared: {
                    react: {
                        singleton: true,
                        requiredVersion: false,
                    },
                    'react-dom': {
                        singleton: true,
                        requiredVersion: false,
                    },
                },
            })
        );

        return config;
    },
};

export default nextConfig;
