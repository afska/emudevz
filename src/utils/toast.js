import toast from "react-hot-toast";

const STYLE = {
	userSelect: "none",
	background: "#333",
	color: "#fff",
};

export default {
	normal(message, options = {}) {
		toast(message, {
			style: STYLE,
			...options,
		});
	},
	success(message, options = {}) {
		toast.success(message, {
			style: STYLE,
			...options,
		});
	},
	error(message, options = {}) {
		toast.error(message, {
			style: STYLE,
			...options,
		});
	},
};
