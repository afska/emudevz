import React, { PureComponent } from "react";
import { MonoLayout } from "./components/layouts";
import { /*CodeEditor, */ Console /*, TV*/ } from "./components";

export default class MainScreen extends PureComponent {
	render() {
		return <MonoLayout Component={Console} onReady={this.onReady} />;
	}

	onReady = ({ left, top, bottom }) => {
		// this.codeEditor = left;
		// this.tv = top;
		// this.console = bottom;
	};
}
