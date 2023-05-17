import mixpanel from "mixpanel-browser";

mixpanel.init("e08d1345f64cc5e93e02e9cd0175bace", {
	api_host: "https://reports.r-labs.io",
});

export default {
	requestFeedback(type, message) {
		const feedback = prompt(message);
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
