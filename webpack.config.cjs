const path = require("path");

module.exports = {
    entry: "./static/gymial.js",
    output: {
        path: path.resolve(__dirname, "static/dist"),
        filename: "bundle.js"
    },
    target: "web"
};