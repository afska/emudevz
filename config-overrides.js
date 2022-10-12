const webpack = require("webpack");

module.exports = function override(config) {
	const fallback = config.resolve.fallback || {};
	Object.assign(fallback, {
		globalProcess: require.resolve("./src/utils/polyfills/globalProcess"),
		path: require.resolve("path-browserify"),
	});
	config.resolve.fallback = fallback;

	config.plugins = (config.plugins || []).concat([
		new webpack.ProvidePlugin({
			process: "globalProcess",
		}),
	]);

	config.ignoreWarnings = [/Failed to parse source map/];
	return config;
};
