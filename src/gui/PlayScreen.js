import React, { PureComponent } from "react";
import { MonoLayout } from "./components/layouts";
import { /*CodeEditor, */ Console /*, TV*/ } from "./components";
import ChatScript from "../chat/ChatScript";
import { connect } from "react-redux";

class PlayScreen extends PureComponent {
	render() {
		return <MonoLayout Component={Console} onReady={this.onReady} />;
	}

	onReady = ({ component, left, top, bottom }) => {
		// this.codeEditor = left;
		// this.tv = top;
		// this.console = bottom;

		console.log("LEVEL", this.props.level);

		fetch("levels/level0.json")
			.then((req) => req.json())
			.then((script) => {
				window.scr = script;
				const chatScript = new ChatScript(script);
				chatScript.validate();
			});
	};
}

const mapStateToProps = ({ savedata }) => ({
	level: savedata.level,
});
const mapDispatchToProps = ({ savedata }) => ({ setLevel: savedata.setLevel });

export default connect(mapStateToProps, mapDispatchToProps)(PlayScreen);
