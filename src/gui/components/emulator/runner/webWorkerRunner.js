const WebWorker = require("./WebWorker").default;
const webWorker = new WebWorker((msg) => postMessage(msg));

onmessage = function (message) {
	webWorker.$onMessage(message);
};
