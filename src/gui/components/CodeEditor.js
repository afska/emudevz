import React, { PureComponent } from "react";
import { oneDark } from "@codemirror/theme-one-dark";
import { langs } from "@uiw/codemirror-extensions-langs";
import CodeMirror from "@uiw/react-codemirror";
import { FaStepForward } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa";
import { FaFastBackward } from "react-icons/fa";
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

class CodeEditor extends PureComponent {
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
	};

	actions = {
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

	async initialize(args, level) {
		this._level = level;

		const { language, initialCodeFile } = args;
		if (LANGUAGES[language]) this.setState({ language });

		const initialCode = this._level?.code[initialCodeFile];
		if (initialCode != null) this._setCode(initialCode || "");
		else this._compile(this.props.code);

		this.setState({
			_isInitialized: true,
			isReadOnly: !!args.readOnly,
			actionName: args.action || NULL_ACTION,
			onlyShowActionWhen: args.onlyShowActionWhen || null,
			onlyEnableActionWhen: args.onlyEnableActionWhen || null,
		});
	}

	render() {
		const { code } = this.props;
		const {
			_isInitialized,
			language,
			isReady,
			isReadOnly,
			isDisabled,
			isCompiling,
			actionName,
			onlyShowActionWhen,
			onlyEnableActionWhen,
		} = this.state;
		if (!_isInitialized) return false;

		const action = this._getAction();
		const isNullAction = actionName === NULL_ACTION;
		const isPlayShown =
			!isNullAction &&
			!isCompiling &&
			(onlyShowActionWhen == null || codeEval.eval(onlyShowActionWhen));
		const isPlayEnabled =
			!isDisabled &&
			isReady &&
			(onlyEnableActionWhen == null || codeEval.eval(onlyEnableActionWhen));
		const isCompilingSpinnerShown = !isNullAction && isCompiling;

		return (
			<div className={styles.container}>
				{isCompilingSpinnerShown && (
					<div className={styles.spinner}>
						<FaSpinner size={24} />
					</div>
				)}
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

	_markError(start, end) {
		if (!this.ref) return;

		setTimeout(() => {
			errorMarker.markError(this.ref, this.props.code, start, end);
		});
	}

	_highlight(line) {
		if (!this.ref) return;

		setTimeout(() => {
			window.yata = true;
			lineHighlighter.highlightLine(this.ref, this.props.code, line);
		});
	}
}

const mapStateToProps = ({ files, level }) => {
	return { code: files.levels[level.instance.id] || "" };
};
const mapDispatchToProps = ({ files }) => ({
	setCode: files.setCurrentLevelContent,
});

export default connect(mapStateToProps, mapDispatchToProps, null, {
	forwardRef: true,
})(CodeEditor);
