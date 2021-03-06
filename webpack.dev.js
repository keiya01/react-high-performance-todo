const path = require("path");
const common = require("./webpack.common");
const merge = require("webpack-merge");

module.exports = merge(common, {
	mode: "development",
	output: {
		filename: "[name].bundle.js"
	},
	devtool: "inline-source-map",
	devServer: {
		historyApiFallback: true,
		contentBase: path.resolve(__dirname, "dist"),
		compress: true,
		port: 3000
	},
	optimization: {
		usedExports: true
	}
});
