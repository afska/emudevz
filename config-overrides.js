module.exports = function override(config) {
	const fallback = config.resolve.fallback || {};
	Object.assign(fallback, {
		fs: require.resolve("./polyfills/fs"),
		process: require.resolve("process/browser"),
	});
	config.resolve.fallback = fallback;

	return config;
};
