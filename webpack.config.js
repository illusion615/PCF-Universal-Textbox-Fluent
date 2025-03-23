// filepath: webpack.config.js
// Filter out unsupported flags and their values
const unsupportedFlags = ['--noColor', '--buildMode', '--outDir', '--buildSource'];
const filteredArgs = [];

for (let i = 0; i < process.argv.length; i++) {
    if (unsupportedFlags.includes(process.argv[i])) {
        i++; // Skip the next value as well
    } else {
        filteredArgs.push(process.argv[i]);
    }
}
process.argv = filteredArgs;

module.exports = () => ({
    mode: 'production',
    entry: './UniversalTextbox/index.ts',
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[name].chunk.js',
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
        minimize: true,
        splitChunks: {
            chunks: 'all',
        },
    },
});