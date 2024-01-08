const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
    entry: './src/templates/index.html',
    watch: false,
    mode: 'production',
    plugins: [
        new HtmlBundlerPlugin({
            entry: {index: './src/templates/index.html'},
            js: {filename: 'js/demonologist_cheatsheet.[contenthash:8].js'},
            css: {filename: 'css/demonologist_cheatsheet.[contenthash:8].css'},
        })
    ],
    output: {
        path: path.resolve(__dirname, 'build'),
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['css-loader', 'postcss-loader']
            },
            {
                test: /\.js$/i,
                use: ['babel-loader']
            }
        ]
    }
}