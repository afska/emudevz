import React, { PureComponent } from "react";
import { oneDark } from "@codemirror/theme-one-dark";
import { langs } from "@uiw/codemirror-extensions-langs";
import CodeMirror from "@uiw/react-codemirror";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import {
	FaFastBackward,
	FaPlay,
	FaSpinner,
	FaStepForward,
	FaTimes,
} from "react-icons/fa";
import { connect } from "react-redux";
import _ from "lodash";
import codeEval from "../../level/codeEval";
import locales from "../../locales";
import { bus } from "../../utils";
import { asm6502, errorMarker, lineHighlighter } from "../../utils/codemirror";
import IconButton from "./widgets/IconButton";
import styles from "./CodeEditor.module.css";

const NULL_ACTION = "none";
const COMPILE_DEBOUNCE_MS = 500;
const LANGUAGES = {
	javascript: () => langs.javascript(),
	asm: () => asm6502(),
};

class MultiFileCodeEditor extends PureComponent {
	state = {
		_isInitialized: false,
		language: "javascript",
		highlightedLine: -1,
		isReady: false,
		errorStart: -1,
		errorEnd: -1,
		isReadOnly: false,
		isDisabled: false,
		isCompiling: false,
		actionName: NULL_ACTION,
		onlyShowActionWhen: null,
		onlyEnableActionWhen: null,
		onlyEnableEditionWhen: null,
	};

	actions = {
		run: {
			icon: FaPlay,
			tooltip: locales.get("run"),
			run: () => {
				bus.emit("run", "test");
				const { onRunFocus } = this._args;
				if (onRunFocus != null) this._layout.focus(onRunFocus);
			},
		},
		step: {
			icon: FaStepForward,
			tooltip: locales.get("stepForward"),
			run: () => bus.emit("step"),
		},
		reset: {
			icon: FaFastBackward,
			tooltip: locales.get("stepReset"),
			run: () => {
				bus.emit("reset");
				this.setState({ actionName: "step" });
			},
		},
		[NULL_ACTION]: {
			icon: () => false,
			tooltip: "?",
			run: () => {},
		},
	};

	async initialize(args, level, layout) {
		this._args = args;
		this._level = level;
		this._layout = layout;

		const { language, initialCodeFile } = args;
		if (LANGUAGES[language]) this.setState({ language });

		const initialCode = this._level?.code[initialCodeFile];
		if (initialCode != null) this._setCode(initialCode || "");
		else this._compile(this.props.getCode());

		this.setState({
			_isInitialized: true,
			isReadOnly: !!args.readOnly,
			actionName: args.action || NULL_ACTION,
			onlyShowActionWhen: args.onlyShowActionWhen || null,
			onlyEnableActionWhen: args.onlyEnableActionWhen || null,
			onlyEnableEditionWhen: args.onlyEnableEditionWhen || null,
		});
	}

	render() {
		if (!this.state._isInitialized) return false;

		return (
			<div className={styles.container}>
				<Tabs defaultActiveKey="index" transition={false} tabIndex={-1}>
					<Tab
						eventKey="index"
						title={
							<span>
								index.js{" "}
								<IconButton Icon={FaTimes} onClick={() => alert("hello")} />
							</span>
						}
					>
						{this._renderEditor()}
					</Tab>
					<Tab
						eventKey="profile"
						title={
							<span>
								CPU.js{" "}
								<IconButton Icon={FaTimes} onClick={() => alert("hello")} />
							</span>
						}
					>
						{this._renderEditor()}
					</Tab>
					<Tab
						eventKey="contact"
						title={
							<span>
								Cartridge.js{" "}
								<IconButton Icon={FaTimes} onClick={() => alert("hello")} />
							</span>
						}
					>
						{this._renderEditor()}
					</Tab>
				</Tabs>
			</div>
		);
	}

	componentDidMount() {
		this._subscriber = bus.subscribe({
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

	_renderEditor() {
		const { getCode } = this.props;
		const {
			language,
			isReadOnly,
			isCompiling,
			actionName,
			onlyEnableEditionWhen,
		} = this.state;

		const action = this._getAction();
		const isNullAction = actionName === NULL_ACTION;
		const isActionShown = this._isActionShown();
		const isActionEnabled = this._isActionEnabled();
		const isEditionEnabled =
			!isReadOnly &&
			(onlyEnableEditionWhen == null || codeEval.eval(onlyEnableEditionWhen));
		const isCompilingSpinnerShown = !isNullAction && isCompiling;

		return (
			<div className={styles.editorContainer}>
				{isCompilingSpinnerShown && (
					<div className={styles.spinner}>
						<FaSpinner size={24} />
					</div>
				)}
				{isActionShown && (
					<div className={styles.debugger}>
						<IconButton
							Icon={action.icon}
							tooltip={action.tooltip}
							onClick={action.run}
							disabled={!isActionEnabled}
							kind="rounded"
						/>
					</div>
				)}

				<CodeMirror
					className={styles.editor}
					value={getCode()}
					width="100%"
					height="100%"
					theme={oneDark}
					readOnly={!isEditionEnabled}
					extensions={[LANGUAGES[language]()]}
					onChange={this._setCode}
					autoFocus
					ref={(ref) => {
						this.ref = ref;
					}}
					onKeyDown={this._onKeyDown}
				/>
			</div>
		);
	}

	_onKeyDown = (e) => {
		const isKeyDown = e.type === "keydown";
		const isAltEnter = e.altKey && e.code === "Enter";

		if (isKeyDown && isAltEnter) {
			if (!this._isActionEnabled()) return;
			const action = this._getAction();
			action.run();
			return;
		}
	};

	_onRunEnabled = (isEnabled) => {
		this.setState({ isDisabled: !isEnabled });
	};

	_onHighlight = (line) => {
		this.setState({
			highlightedLine: line,
			actionName: line == null ? "reset" : "step",
		});
	};

	_onLevelMemoryChanged = () => {
		this.forceUpdate();
	};

	_setCode = (code) => {
		this.props.setCode(code);

		this.setState({ isCompiling: true, highlightedLine: -1 });
		this._compile(code);
	};

	_compile = _.debounce((code) => {
		try {
			this.setState({ isCompiling: false });
			bus.emit("code", code);
			this.setState({ isReady: true, errorStart: -1, errorEnd: -1 });
		} catch (e) {
			this.setState({ isReady: false });

			if (e.err?.name === "SyntaxError") {
				const lineNumber = e.lineNumber - 1;
				const { index: lineStart } = errorMarker.findLine(code, lineNumber);

				this.setState({
					errorStart: lineStart + e.err.location.start.offset,
					errorEnd: lineStart + e.err.location.end.offset,
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

	_isActionShown() {
		const { actionName, isCompiling, onlyShowActionWhen } = this.state;

		const isNullAction = actionName === NULL_ACTION;

		return (
			!isNullAction &&
			!isCompiling &&
			(onlyShowActionWhen == null || codeEval.eval(onlyShowActionWhen))
		);
	}

	_isActionEnabled() {
		const { isDisabled, isReady, onlyEnableActionWhen } = this.state;

		return (
			this._isActionShown() &&
			!isDisabled &&
			isReady &&
			(onlyEnableActionWhen == null || codeEval.eval(onlyEnableActionWhen))
		);
	}

	_markError(start, end) {
		if (!this.ref) return;

		setTimeout(() => {
			errorMarker.markError(this.ref, this.props.getCode(), start, end);
		});
	}

	_highlight(line) {
		if (!this.ref) return;

		setTimeout(() => {
			lineHighlighter.highlightLine(this.ref, this.props.getCode(), line);
		});
	}
}

const mapStateToProps = ({ level }) => {
	return {
		getCode: () => level.instance.content,
		setCode: (code) => {
			level.instance.content = code;
		},
	};
};

export default connect(mapStateToProps, null, null, {
	forwardRef: true,
})(MultiFileCodeEditor);
