// filepath: webpack.config.js
// Remove unsupported "--noColor" flag if present
process.argv = process.argv.filter(arg => arg !== '--noColor');

module.exports = (env, argv) => {
    return {
        mode: 'production', // Set production mode for optimizations
        entry: './UniversalTextbox/index.ts', // adjust path if needed
        output: {
            filename: '[name].bundle.js', // Use chunk name so that each file is unique
            chunkFilename: '[name].chunk.js', // Optionally, set a unique pattern for split chunks
            path: __dirname + '/dist',
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
            ],
        },
        optimization: {
            minimize: true,   // Enables minification
            splitChunks: {
                chunks: 'all',  // Splits vendor and common code into separate bundles
            },
        },
        plugins: [
            // Uncomment the next block to generate a bundle analyzer report
            /*
            new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)({
                analyzerMode: 'static',
                openAnalyzer: false,
            }),
            */
        ],
    };
};