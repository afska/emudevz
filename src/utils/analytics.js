import store from "../store";

const URL = "https://emudevz.r-labs.io/event";

export default {
	track(eventName, args = {}) {
		const state = store.getState();
		const distinctId = state.savedata.saveId;
		const eventData = { ...args, distinct_id: distinctId };

		fetch(URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ eventName, eventData }),
		})
			.then((res) => {
				if (!res.ok) throw new Error("failed");
			})
			.catch(() => {
				console.warn("Analytics track failed", eventName, args);
			});
	},
};
