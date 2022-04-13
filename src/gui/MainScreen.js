import React, { PureComponent } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import styles from "./MainScreen.module.css";

export default class MainScreen extends PureComponent {
	render() {
		return (
			<div className={styles.message}>
				<CodeMirror
					value="console.log('hello world!');"
					height="200px"
					extensions={[javascript({ jsx: true })]}
					onChange={(value, viewUpdate) => {
						console.log("value:", value);
					}}
				/>
			</div>
		);
	}
}
