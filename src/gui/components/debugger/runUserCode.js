const SECOND = 1000;

let lastWarning = -Infinity;

export default function runUserCode(action, fallback = 0) {
	try {
		return action() ?? fallback;
	} catch (error) {
		const now = Date.now();

		if (now - lastWarning >= SECOND) {
			console.warn("⚠️ Debugger user code failed", error);
			lastWarning = now;
		}

		return fallback;
	}
}
