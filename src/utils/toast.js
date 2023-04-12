import toast from "react-hot-toast";

const STYLE = {
	userSelect: "none",
	background: "#333",
	color: "#fff",
};

export default {
	success(message) {
		toast.success(message, {
			style: STYLE,
		});
	},
	error(message) {
		toast.error(message, {
			style: STYLE,
		});
	},
};
