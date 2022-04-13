const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

module.exports = {
    entry: {
        "bundle": "./src/gymial.js",
        "service-worker": "./src/service-worker.js"
    },
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
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "./src/index.html"
        }),
        new MiniCssExtractPlugin()
    ]
};