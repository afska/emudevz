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
	state = { language: "javascript", code: "" };

	async initialize(args, level) {
		this._level = level;

		const { language, initialCodeFile } = args;
		if (LANGUAGES[language]) this.setState({ language });

		const initialCode = this._level?.code[initialCodeFile];
		if (initialCode) this.setState({ code: initialCode });
	}

	render() {
		const { language, code } = this.state;

		return (
			<CodeMirror
				className={styles.editor}
				value={code}
				width="100%"
				height="100%"
				theme={oneDark}
				extensions={[LANGUAGES[language]()]}
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
