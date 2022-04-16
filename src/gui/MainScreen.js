import React, { PureComponent } from "react";
import { ThreePaneLayout } from "./components/layouts";
import { CodeEditor, Terminal, TV } from "./components";

export default class MainScreen extends PureComponent {
	render() {
		return (
			<ThreePaneLayout
				Left={CodeEditor}
				Top={TV}
				Bottom={Terminal}
				onReady={this.onReady}
			/>
		);
	}

	onReady = ({ left, top, bottom }) => {
		this.codeEditor = left;
		this.tv = top;
		this.terminal = bottom;
	};
}
