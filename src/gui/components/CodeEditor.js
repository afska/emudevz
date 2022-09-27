import React, { PureComponent } from "react";
import { oneDark } from "@codemirror/theme-one-dark";
import { langs } from "@uiw/codemirror-extensions-langs";
import CodeMirror from "@uiw/react-codemirror";
import { FaStepForward } from "react-icons/fa";
import { FaFastBackward } from "react-icons/fa";
import _ from "lodash";
import Level from "../../level/Level";
import locales from "../../locales";
import { bus } from "../../utils";
import { asm6502, errorMarker, lineHighlighter } from "../../utils/codemirror";
import IconButton from "./widgets/IconButton";
import styles from "./CodeEditor.module.css";

const COMPILE_DEBOUNCE_MS = 500;
const LANGUAGES = {
	javascript: () => langs.javascript(),
	asm: () => asm6502(),
};

export default class CodeEditor extends PureComponent {
	state = {
		_isInitialized: false,
		language: "javascript",
		code: "",
		highlightedLine: -1,
		errorStart: -1,
		errorEnd: -1,
		isReadOnly: false,
		isDisabled: false,
		onlyShowPlayWhen: null,
		onlyEnablePlayWhen: null,
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
			_isInitialized: true,
			isReadOnly: !!args.readOnly,
			onlyShowPlayWhen: args.onlyShowPlayWhen || null,
			onlyEnablePlayWhen: args.onlyEnablePlayWhen || null,
		});
	}

	render() {
		const {
			_isInitialized,
			language,
			code,
			isReadOnly,
			isDisabled,
			onlyShowPlayWhen,
			onlyEnablePlayWhen,
		} = this.state;
		if (!_isInitialized) return false;

		const action = this._getAction();
		const isPlayShown =
			onlyShowPlayWhen == null || Level.current.getMemory(onlyShowPlayWhen);
		const isPlayEnabled =
			!isDisabled &&
			(onlyEnablePlayWhen == null ||
				Level.current.getMemory(onlyEnablePlayWhen));

		return (
			<div className={styles.container}>
				{isPlayShown && (
					<div className={styles.debugger}>
						<IconButton
							Icon={action.icon}
							tooltip={action.tooltip}
							onClick={action.run}
							disabled={!isPlayEnabled}
							kind="rounded"
						/>
					</div>
				)}

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
		this._subscriber = bus.subscribe({
			end: this._onEnd,
			"run-enabled": this._onRunEnabled,
			highlight: this._onHighlight,
			"level-memory-changed": this._onLevelMemoryChanged,
		});
	}

	componentWillUnmount() {
		this._subscriber.release();
	}

	componentDidUpdate() {
		const { highlightedLine, errorStart, errorEnd } = this.state;
		this._highlight(highlightedLine);
		this._markError(errorStart, errorEnd);
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
		this._compile(code);
	};

	_compile = _.debounce((code) => {
		try {
			bus.emit("code", code);
			this.setState({ errorStart: -1, errorEnd: -1 });
		} catch (e) {
			if (e.err?.name === "SyntaxError") {
				this.setState({
					errorStart: e.err.location.start.offset,
					errorEnd: e.err.location.end.offset,
				});
			} else if (!e.handled) {
				// (throwing errors inside `onChange` can mess up updates)
				console.error(e, code);
			}
		}
	}, COMPILE_DEBOUNCE_MS);

	_getAction() {
		const { actionName } = this.state;

		return this.actions[actionName] || this.actions.unknown;
	}

	_markError(start, end) {
		if (!this.ref) return;

		setTimeout(() => {
			errorMarker.markError(this.ref, this.state.code, start, end);
		});
	}

	_highlight(line) {
		if (!this.ref) return;

		setTimeout(() => {
			lineHighlighter.highlightLine(this.ref, this.state.code, line);
		});
	}
}
