window.EmuDevz = {
	log: (...args) => console.log(...args),
};

try {
	const { default: App } = await import("./App.js");
	new App();
} catch (err) {
	console.error(err);
	alert("Something went wrong! Check the developer tools.");
}

window.addEventListener("keydown", (e) => {
	if (
		["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
			e.code
		)
	)
		e.preventDefault();
});
