const path = require("path");

module.exports = (api) => {
	api.cache(true);
	return {
		presets: [ "@babel/env", "@babel/preset-react", "@babel/preset-typescript" ],
		plugins: [
			"@babel/plugin-proposal-class-properties",
			"@babel/plugin-proposal-object-rest-spread",
			"babel-plugin-syntax-dynamic-import",
			[
				require.resolve("babel-plugin-module-resolver"),
				{
					root: [ path.resolve("./") ],
					alias: {
						src: "./src"
					}
				}
			]
		]
	};
};
