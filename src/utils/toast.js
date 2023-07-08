import toast from "react-hot-toast";

const STYLE = {
	userSelect: "none",
	background: "#333",
	color: "#fff",
};

export default {
	normal(message, options = { duration: 1000 }) {
		toast(message, {
			style: STYLE,
			...options,
		});
	},
	success(message, options = { duration: 1000 }) {
		toast.success(message, {
			style: STYLE,
			...options,
		});
	},
	error(message, options = { duration: 1000 }) {
		toast.error(message, {
			style: STYLE,
			...options,
		});
	},
};
