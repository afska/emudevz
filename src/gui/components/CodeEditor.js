import React, { PureComponent } from "react";
import { oneDark } from "@codemirror/theme-one-dark";
import { langs } from "@uiw/codemirror-extensions-langs";
import CodeMirror from "@uiw/react-codemirror";
import { FaStepForward } from "react-icons/fa";
import { FaFastBackward } from "react-icons/fa";
import Level from "../../level/Level";
import locales from "../../locales";
import { bus } from "../../utils";
import { asm6502, highlighter } from "../../utils/codemirror";
import IconButton from "./widgets/IconButton";
import styles from "./CodeEditor.module.css";

const LANGUAGES = {
	javascript: () => langs.javascript(),
	asm: () => asm6502(),
};

export default class CodeEditor extends PureComponent {
	state = {
		language: "javascript",
		code: "",
		highlightedLine: -1,
		isReadOnly: false,
		isDisabled: false,
		onlyPlayIf: null,
		actionName: "step",
	};

	actions = {
		step: {
			icon: FaStepForward,
			tooltip: locales.get("stepForward"),
			run: () => bus.emit("play"),
		},
		reset: {
			icon: FaFastBackward,
			tooltip: locales.get("stepReset"),
			run: () => {
				bus.emit("reset");
				this.setState({ actionName: "step" });
			},
		},
		unknown: {
			icon: () => false,
			tooltip: "?",
			run: () => {},
		},
	};

	async initialize(args, level) {
		this._level = level;

		const { language, initialCodeFile } = args;
		if (LANGUAGES[language]) this.setState({ language });

		const initialCode = this._level?.code[initialCodeFile];
		if (initialCode) this._setCode(initialCode);

		this.setState({
			isReadOnly: !!args.readOnly,
			onlyPlayIf: args.onlyPlayIf || null,
		});
	}

	render() {
		const { language, code, isReadOnly, isDisabled, onlyPlayIf } = this.state;

		const action = this._getAction();
		const canRun =
			!isDisabled &&
			(onlyPlayIf == null || Level.current.getMemory(onlyPlayIf));

		return (
			<div className={styles.container}>
				<div className={styles.debugger}>
					<IconButton
						Icon={action.icon}
						tooltip={action.tooltip}
						onClick={action.run}
						disabled={!canRun}
						kind="rounded"
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
					onChange={this._setCode}
					autoFocus
					ref={(ref) => {
						this.ref = ref;
					}}
				/>
			</div>
		);
	}

	componentDidMount() {
		bus.on("end", this._onEnd);
		bus.on("run-enabled", this._onRunEnabled);
		bus.on("highlight", this._onHighlight);
		bus.on("level-memory-changed", this._onLevelMemoryChanged);
	}

	componentWillUnmount() {
		bus.removeListener("end", this._onEnd);
		bus.removeListener("run-enabled", this._onRunEnabled);
		bus.removeListener("highlight", this._onHighlight);
		bus.removeListener("level-memory-changed", this._onLevelMemoryChanged);
	}

	componentDidUpdate() {
		const { highlightedLine } = this.state;
		this._highlight(highlightedLine);
	}

	focus = () => {
		this.ref.view.focus();
	};

	_onEnd = () => {
		this.setState({ actionName: "reset" });
	};

	_onRunEnabled = (isEnabled) => {
		this.setState({ isDisabled: !isEnabled });
	};

	_onHighlight = (line) => {
		this.setState({ highlightedLine: line });
	};

	_onLevelMemoryChanged = () => {
		this.forceUpdate();
	};

	_setCode = (code) => {
		this.setState({ code });
		bus.emit("code", code);
	};

	_getAction() {
		const { actionName } = this.state;

		return this.actions[actionName] || this.actions.unknown;
	}

	_highlight(line) {
		if (!this.ref) return;

		setTimeout(() => {
			highlighter.highlightLine(this.ref, this.state.code, line);
		});
	}
}
