const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
    entry: "./src/gymial.js",
    output: {
        path: path.resolve(__dirname, "static/"),
        filename: "[name].js",
        clean: true
    },
    target: "web",
    module: {
        rules: [
            {
                test: /\.svg$/,
                type: "asset/source"
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            },
            {
                test: /\.(png|svg|ico|webmanifest)$/,
                include: [ path.resolve(__dirname, "src/static/") ],
                type: "asset/resource"
            },
            {
                test: /\.ttf$/,
                type: "asset/resource"
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "./src/index.html",
            favicon: "./src/static/favicon.ico",
            minify: {
                removeRedundantAttributes: false
            }
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/static/goodbye', to: 'goodbye' }
            ]
        }),
        new MiniCssExtractPlugin()
    ]
};