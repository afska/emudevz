const WebWorker = require("./WebWorker").default;

// DISABLED
// WebWorkers are not supported.

const webWorker = new WebWorker(/* Console, */ (msg) => postMessage(msg));

onmessage = function (message) {
	webWorker.$onMessage(message);
};
