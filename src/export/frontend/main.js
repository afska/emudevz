window.EmuDevz = {
	log: (...args) => console.log(...args),
};

const { default: App } = await import("./App.js");

new App();

window.addEventListener("keydown", (e) => {
	if (
		["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
			e.code
		)
	)
		e.preventDefault();
});
