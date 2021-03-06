const common = require("./webpack.common");
const merge = require("webpack-merge");

module.exports = merge(common, {
	mode: "production",
	output: {
		filename: "[name].[contenthash].js",
		chunkFilename: "[id].[contenthash].chunk.js"
	},
	optimization: {
		runtimeChunk: "single",
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /react|react-dom|styled-components/,
					name: "vendors",
					chunks: "all"
				}
			}
		},
		runtimeChunk: {
			name: "runtime"
		}
	}
});
