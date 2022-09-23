import React, { PureComponent } from "react";
import { oneDark } from "@codemirror/theme-one-dark";
import { langs } from "@uiw/codemirror-extensions-langs";
import CodeMirror from "@uiw/react-codemirror";
import asm6502 from "../../utils/codemirror/asm6502";
import styles from "./CodeEditor.module.css";

const LANGUAGES = {
	javascript: () => langs.javascript(),
	asm: () => asm6502(),
};

export default class CodeEditor extends PureComponent {
	async initialize(args, level) {
		this._level = level;
	}

	render() {
		return (
			<CodeMirror
				className={styles.editor}
				value={`// Describes a CPU
return function() {
	return {
		cycle: 0,
		memory: new Array(1024),
		registers: {
			A: 0,
			Z: 0,
			N: 0
		}
	}
}`}
				width="100%"
				height="100%"
				theme={oneDark}
				extensions={[LANGUAGES["javascript"]()]}
				onChange={(value, viewUpdate) => {
					console.log("value:", value);
				}}
				autoFocus
				ref={(ref) => {
					this.ref = ref;
				}}
			/>
		);
	}

	focus = () => {
		this.ref.view.focus();
	};
}
