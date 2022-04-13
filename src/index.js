import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./gui/theme/crt.css";
import "./index.css";

// Render the React app
ReactDOM.render(<App />, document.getElementById("root"));

// Make the page visible once everything loaded
window.addEventListener(
	"load",
	() => {
		document.body.style.display = "block";
	},
	false
);
