/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    server: {
        host: '0.0.0.0',
        port: 5000
    },
    webpack: (config, { isServer }) => {
        config.cache = false;
        // if (isServer) {
        //     config.externals.push({ pkcs11js: 'commonjs pkcs11js' });
        //     config.resolve.fallback = {
        //         fs: false,
        //         dgram: false,
        //         net: false,
        //         tls: false,
        //         child_process: false,
        //     };
        // }
        // config.module.rules.push({
        //     test: /\.node$/,
        //     use: 'node-loader',
        // });

        return config;
    },
}

module.exports = nextConfig
