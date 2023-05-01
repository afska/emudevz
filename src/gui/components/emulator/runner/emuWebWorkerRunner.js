const EmuWebWorker = require("./EmuWebWorker").default;
const NEEES = require("nes-emu").default;

const webWorker = new EmuWebWorker(NEEES, (msg) => postMessage(msg));

onmessage = function (message) {
	webWorker.$onMessage(message);
};
