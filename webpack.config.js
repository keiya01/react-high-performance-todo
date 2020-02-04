const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: "./src/index.tsx",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "[name].[contenthash].js"
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "babel-loader"
					}
				]
			}
		]
	},
	resolve: {
		alias: {
			src: path.resolve(__dirname, "/src/")
		},
		extensions: [ ".ts", ".tsx", ".js", ".jsx" ]
	},
	plugins: [
		new HTMLWebpackPlugin({
			template: "./src/assets/index.html"
		})
	],
	devServer: {
		contentBase: path.resolve(__dirname, "dist"),
		compress: true,
		port: 3000
	}
};
