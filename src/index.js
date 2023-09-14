import React from "react";
import { getPersistor } from "@rematch/persist";
import { ConnectedRouter } from "connected-react-router";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { PersistGate } from "redux-persist/lib/integration/react";
import HomeScreen from "./gui/HomeScreen";
import PlayScreen from "./gui/PlayScreen";
import music from "./gui/sound/music";
import store, { history } from "./store";
import { bus } from "./utils";
import "bootstrap/dist/css/bootstrap.min.css";
import "./gui/theme/crt.css";
import "./gui/theme/theme.css";
import "xterm/css/xterm.css";

// Set up store and navigation
const persistor = getPersistor();
const app = (
	<PersistGate persistor={persistor}>
		<Provider store={store}>
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
ReactDOM.render(app, document.getElementById("root"));

// On "keydown" events
document.onkeydown = (e) => {
	music.start(); // run music!

	// Disable Print shortcut
	const isCtrlP = (e.ctrlKey || e.metaKey) && e.code === "KeyP";
	if (isCtrlP) {
		bus.emit("file-search");
		e.preventDefault();
	}

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

// Make the page visible once everything loaded
window.addEventListener(
	"load",
	() => {
		document.body.style.display = "block";
	},
	false
);
