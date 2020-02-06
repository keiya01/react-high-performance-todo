const path = require("path");
const webpack = require("webpack");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

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
	devServer: {
		contentBase: path.resolve(__dirname, "dist"),
		compress: true,
		port: 3000
	},
	optimization: {
		runtimeChunk: "single",
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /node_modules/,
					name: "vendors",
					chunks: "all"
				}
			}
		}
	},
	plugins: [
		new webpack.ProgressPlugin(),
		new CleanWebpackPlugin(),
		new HTMLWebpackPlugin({
			template: "./src/assets/index.html"
		})
	]
};
