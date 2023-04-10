import EventEmitter from "eventemitter3";
import _ from "lodash";

const bus = new EventEmitter();

bus.isListeningTo = (eventName) => bus.listenerCount(eventName) > 0;

bus.subscribe = (events) => {
	const listeners = {};

	const subscriber = {
		release() {
			_.forEach(listeners, (listener, event) => {
				bus.removeListener(event, listener);
			});
		},
	};

	_.forEach(events, (listener, event) => {
		listeners[event] = listener;
		bus.on(event, listener);
	});

	bus.emit("new-listeners");

	return subscriber;
};

export default bus;
