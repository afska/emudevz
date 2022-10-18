export default (code) => {
	const blob = createModule(code);
	return evaluateModule(blob);
};

export const createModule = (code) => {
	return URL.createObjectURL(
		new Blob([String.raw({ raw: code })], { type: "text/javascript" })
	);
};

export const evaluateModule = (_url_) => {
	// - returns a promise
	// - the eval bypasses webpack's import system
	return eval("import(_url_)");
};
