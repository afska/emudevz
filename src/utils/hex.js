export default {
	format(number, digits) {
		return number.toString(16).toUpperCase().padStart(digits, 0);
	},
};
