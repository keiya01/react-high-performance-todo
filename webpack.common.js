const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
	entry: "./src/index.tsx",
	output: {
		path: path.resolve(__dirname, "dist")
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "ts-loader"
					}
				]
			},
			{
				test: /\.css$/,
				use: [ "style-loader", "css-loader" ]
			}
		]
	},
	resolve: {
		alias: {
			src: path.resolve(__dirname, "src")
		},
		extensions: [ ".ts", ".tsx", ".js", ".jsx", ".css" ]
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HTMLWebpackPlugin({
			template: "./public/index.html"
		})
	]
};
