import { getPersistor } from "@rematch/persist";
import { ConnectedRouter } from "connected-react-router";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { PersistGate } from "redux-persist/lib/integration/react";
import GlobalThemeProvider from "./gui/GlobalThemeProvider";
import HomeScreen from "./gui/HomeScreen";
import PlayScreen from "./gui/PlayScreen";
import { music, sfx } from "./gui/sound";
import { DEFAULT_KEY_BINDINGS } from "./models/savedata";
import store, { history } from "./store";
import { achievements, bus, dlc } from "./utils";
import { checkKeyBinding } from "./utils/keyBindings";
import "bootstrap/dist/css/bootstrap.min.css";
import "./gui/theme/crt.css";
import "./gui/theme/theme.css";
import "highlight.js/styles/base16/onedark.css";
import "xterm/css/xterm.css";

// Set up EmuDevz global object
window.EmuDevz = {
	emulation: null,
	achievements,
	log(value) {
		const neees = this.emulation?.neees;
		if (neees == null) return;

		neees.cpu.logger?.(value);
	},
	isRunningEmulator() {
		return this.emulation != null;
	},
	isDebugging() {
		return this.state.isRunningDebugger;
	},
	isDesktop() {
		return window.electronAPI?.isElectron;
	},
	resetState() {
		this.state.isRunningEmulatorTest = false;
		this.state.isRunningDebugger = false;
	},
	state: {
		isRunningEmulatorTest: false,
		isRunningDebugger: false,
		isClearingSavefile: false,
		didRunEmulator: false,
		lastOpenNewTabTime: 0,
	},
};

// Set up store and navigation
const persistor = getPersistor();
const app = (
	<PersistGate persistor={persistor}>
		<Provider store={store}>
			<GlobalThemeProvider />
			<ConnectedRouter history={history}>
				<Switch>
					<Route exact path="/" render={() => <HomeScreen />} />
					<Route path="/levels/:levelId" render={() => <PlayScreen />} />
					<Route path="*" render={() => <div>Page not found.</div>} />
				</Switch>
			</ConnectedRouter>
		</Provider>
	</PersistGate>
);

// Render the React app
dlc.check().then(() => {
	if (window.EmuDevz.isDesktop()) {
		// on desktop, start music and set sfx volume
		music.start();

		const sfxVolume = store.getState().savedata?.sfxVolume;
		if (sfxVolume != null) sfx.setVolume(sfxVolume);
	}

	ReactDOM.render(app, document.getElementById("root"));
});

// On "keydown" events
document.onkeydown = (e) => {
	music.start(); // run music!

	// Prevent default for all configured shortcuts
	for (const bindingName of Object.keys(DEFAULT_KEY_BINDINGS)) {
		if (checkKeyBinding(e, bindingName)) {
			e.preventDefault();

			// Emit file search from anywhere!
			if (bindingName === "fileSearch" && !document.fullscreenElement)
				bus.emit("file-search");
			break;
		}
	}

	// Disable Print shortcut
	const isCtrlP = (e.ctrlKey || e.metaKey) && e.code === "KeyP";
	if (isCtrlP) e.preventDefault();

	// Disable Save shortcut
	const isCtrlS = (e.ctrlKey || e.metaKey) && e.code === "KeyS";
	if (isCtrlS) e.preventDefault();

	// Disable Back/Forward shortcuts
	const isBackOrForward =
		e.altKey && (e.code === "ArrowLeft" || e.code === "ArrowRight");
	if (isBackOrForward) e.preventDefault();
};

// On "click" events
document.onclick = () => music.start(); // run music!

// On "fullscreenchange" events
document.onfullscreenchange = (e) => {
	const isFullscreen = document.fullscreenElement?.id === "screen";
	document.body.style.filter = isFullscreen ? "blur(4px)" : "none";
	if (!isFullscreen) document.getElementById("emulator")?.focus();

	const screen = document.getElementById("screen");
	if (screen != null) screen.style.border = isFullscreen ? "none" : "";
};

// Make the page visible once everything loaded
window.addEventListener(
	"load",
	() => {
		document.body.style.display = "block";
	},
	false
);

// Register service worker for PWA installability
if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register("sw.js").catch(() => {});
	});
}

// Update CRT class when the store changes
const updateCrtClass = () => {
	const root = document.getElementById("root");
	if (!root) return;

	const enabled = store.getState().savedata.crtFilter;
	if (enabled) root.classList.add("crt");
	else root.classList.remove("crt");
};
updateCrtClass();
store.subscribe(updateCrtClass);

// Persist current music second on page unload
window.addEventListener("beforeunload", () => {
	music.saveSecond();
});

// Show overlay if window is too small
const MIN_W = 650;
const MIN_H = 350;
const overlay = document.getElementById("too-small-overlay");
function updateTooSmallOverlay() {
	if (!overlay) return;
	const tooSmall = innerWidth < MIN_W || innerHeight < MIN_H;
	overlay.style.display = tooSmall ? "flex" : "none";
}
addEventListener("resize", updateTooSmallOverlay, { passive: true });
addEventListener("orientationchange", updateTooSmallOverlay, { passive: true });
updateTooSmallOverlay();
