const WebWorker = require("./WebWorker").default;

// TODO: Build emulator first (EmulatorBuilder)
const webWorker = new WebWorker((msg) => postMessage(msg));

onmessage = function (message) {
	webWorker.$onMessage(message);
};
