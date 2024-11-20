import toast from "react-hot-toast";

const STYLE = {
	userSelect: "none",
	background: "#333",
	color: "#fff",
};

const DEFAULT_DURATION = 3000;

export default {
	normal(message, options = { duration: DEFAULT_DURATION }) {
		toast(message, {
			style: STYLE,
			...options,
		});
	},
	success(message, options = { duration: DEFAULT_DURATION }) {
		toast.success(message, {
			style: STYLE,
			...options,
		});
	},
	error(message, options = { duration: DEFAULT_DURATION }) {
		toast.error(message, {
			style: STYLE,
			...options,
		});
	},
};
