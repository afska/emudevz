export default (_code_) => {
	// eslint-disable-next-line
	const _blob_ = URL.createObjectURL(
		new Blob([String.raw({ raw: _code_ })], { type: "text/javascript" })
	);

	// - returns a promise
	// - the eval bypasses webpack's import system
	return eval("import(_blob_)");
};
