import React, { PureComponent } from "react";
import { oneDark } from "@codemirror/theme-one-dark";
import { langs } from "@uiw/codemirror-extensions-langs";
import CodeMirror from "@uiw/react-codemirror";
import { FaStepForward } from "react-icons/fa";
import locales from "../../locales";
import { asm6502, highlighter } from "../../utils/codemirror";
import IconButton from "./widgets/IconButton";
import styles from "./CodeEditor.module.css";

const LANGUAGES = {
	javascript: () => langs.javascript(),
	asm: () => asm6502(),
};

export default class CodeEditor extends PureComponent {
	state = { language: "javascript", code: "", isReadOnly: false };

	async initialize(args, level) {
		this._level = level;

		const { language, initialCodeFile } = args;
		if (LANGUAGES[language]) this.setState({ language });

		const initialCode = this._level?.code[initialCodeFile];
		if (initialCode) this.setState({ code: initialCode });

		this.setState({ isReadOnly: !!args.readOnly });
		window.a = this;
	}

	test(from, to) {
		highlighter.highlight(this.ref, from, to);
	}

	testo(from, to) {
		highlighter.unhighlight(this.ref, from, to);
	}

	render() {
		const { language, code, isReadOnly } = this.state;

		return (
			<div className={styles.container}>
				<div className={styles.debugger}>
					<IconButton
						Icon={FaStepForward}
						tooltip={locales.get("stepForward")}
						kind="rounded"
						onClick={(e) => {
							// TODO: IMPLEMENT
						}}
					/>
				</div>

				<CodeMirror
					className={styles.editor}
					value={code}
					width="100%"
					height="100%"
					theme={oneDark}
					readOnly={isReadOnly}
					extensions={[LANGUAGES[language]()]}
					onChange={(value, viewUpdate) => {
						this.setState({ code: value });
					}}
					autoFocus
					ref={(ref) => {
						this.ref = ref;
					}}
				/>
			</div>
		);
	}

	focus = () => {
		this.ref.view.focus();
	};
}
