import mixpanel from "mixpanel-browser";

mixpanel.init("e08d1345f64cc5e93e02e9cd0175bace", { debug: true });

export default {
	track(eventName, args) {
		mixpanel.track(eventName, args);
	},
};
