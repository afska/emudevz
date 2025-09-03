const CODE_HASH_TO_URL_CACHE = new Map();

const hashCode = (str) => {
	let hash = 0x811c9dc5;
	for (let index = 0; index < str.length; index++) {
		hash ^= str.charCodeAt(index);
		hash =
			(hash +
				(hash << 1) +
				(hash << 4) +
				(hash << 7) +
				(hash << 8) +
				(hash << 24)) >>>
			0;
	}
	return hash.toString(16).padStart(8, "0");
};

export default (code) => {
	const blob = createModule(code);
	return evaluateModule(blob);
};

export const createModule = (code) => {
	const key = hashCode(code);
	const existingUrl = CODE_HASH_TO_URL_CACHE.get(key);
	if (existingUrl) return existingUrl;

	const url = URL.createObjectURL(
		new Blob([String.raw({ raw: code })], { type: "text/javascript" })
	);

	CODE_HASH_TO_URL_CACHE.set(key, url);
	return url;
};

export const evaluateModule = (_url_) => {
	// - returns a promise
	// - the eval bypasses webpack's import system
	return eval("import(_url_)");
};
