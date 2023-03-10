import mixpanel from "mixpanel-browser";

mixpanel.init("e08d1345f64cc5e93e02e9cd0175bace", { debug: true });

export default {
	requestFeedback(type, message) {
		const feedback = prompt(
			message +
				"\nPut your feedback here - it will be sent to Mixpanel, so please disable your adblocker first (:"
		);
		if (feedback) {
			this.track("feedback", {
				type,
				data: feedback,
			});
		}
	},
	track(eventName, args) {
		mixpanel.track(eventName, args);
	},
};
