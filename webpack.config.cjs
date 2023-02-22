const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

module.exports = {
    entry: "./src/gymial.js",
    output: {
        path: path.resolve(__dirname, "static/"),
        filename: "[name].js"
    },
    target: "web",
    module: {
        rules: [
            {
                test: /\.svg$/,
                include: /inline/,
                type: "asset/source"
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            },
            {
                test: /\.(png|svg)$/,
                exclude: /inline/,
                type: "asset/resource"
            },
            {
                test: /\.webmanifest$|apple-touch-icon\.png$/,
                type: "asset/resource",
                generator: {
                    filename: "[name][ext]"
                }
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
            favicon: "./src/resources/favicon.ico"
        }),
        new MiniCssExtractPlugin()
    ]
};