const common = require("./webpack.common");
const merge = require("webpack-merge");

module.exports = merge(common, {
	mode: "production",
	output: {
		filename: "[name].[contenthash].js"
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
	}
});
