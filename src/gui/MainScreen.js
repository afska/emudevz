import React, { PureComponent } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import classNames from "classnames";
import styles from "./MainScreen.module.css";

export default class MainScreen extends PureComponent {
	render() {
		return (
			<div className={styles.container}>
				<CodeMirror
					className={styles.pane}
					value="console.log('hello world!');"
					width="100%"
					height="50vh"
					theme={oneDark}
					extensions={[javascript({})]}
					onChange={(value, viewUpdate) => {
						console.log("value:", value);
					}}
				/>
				<div className={classNames(styles.pane, styles.preview)}>holis</div>
			</div>
		);
	}
}
